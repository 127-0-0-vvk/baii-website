import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// Haiku is fast + cheap and plenty capable for grading short answers; override with
// ANTHROPIC_MODEL (e.g. claude-opus-4-8) for stronger judgement.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

type Grade = {
  score: number;      // 0-100 overall
  level: string;      // Developing | Proficient | Excellent
  strength: string;   // one specific thing done well
  tip: string;        // one concrete improvement
};

// AI grader — replaces the teacher. Returns null if no API key (caller falls back to a plain accept).
async function gradeWithClaude(opts: {
  prompt: string; criteria: string; response: string; dayTitle: string;
}): Promise<Grade | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic();

  const system =
    "You are a warm, encouraging tutor for BAII grading a Class 6 (≈11-year-old) student's submission " +
    "in a 'Critical Thinking' course. Grade THREE dimensions, then give an overall score 0-100:\n" +
    "1. Completion — did they do all parts of the task (e.g. list the requested number of items, answer every question)?\n" +
    "2. Skill quality — did they demonstrate the specific skill the task targets (per the grading guidance)?\n" +
    "3. Effort & specificity — concrete, detailed answers vs vague or one-word answers.\n\n" +
    "Be generous and kind — the goal is to keep a young student motivated. A genuine, complete attempt should " +
    "score 70+. Reserve 85+ for genuinely strong work. A weak/partial but real attempt should still score in the " +
    "30-65 range with a clear tip — never 0 for a real try. level: 0-49='Developing', 50-84='Proficient', 85-100='Excellent'. " +
    "strength = one specific thing they did well (quote a detail from their answer when possible). " +
    "tip = one concrete, friendly suggestion to improve. Address the student directly as 'you'. Keep strength and tip to one short sentence each.";

  const user =
    `TASK GIVEN TO STUDENT:\n${opts.prompt}\n\n` +
    `GRADING GUIDANCE (what a good answer looks like):\n${opts.criteria}\n\n` +
    `STUDENT'S SUBMISSION (lesson: ${opts.dayTitle}):\n${opts.response}\n\nGrade it.`;

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system,
      messages: [{ role: "user", content: user }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              score: { type: "integer" },
              level: { type: "string", enum: ["Developing", "Proficient", "Excellent"] },
              strength: { type: "string" },
              tip: { type: "string" },
            },
            required: ["score", "level", "strength", "tip"],
          },
        },
      },
    });
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return null;
    return JSON.parse(text.text) as Grade;
  } catch (e) {
    console.error("Claude grading failed:", e);
    return null;
  }
}

// POST /api/student/lesson-submit
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    student_id, course_code, year_id, module_id, week_num, day_num,
    response, prompt, criteria, min_words, day_title,
  } = body;

  if (!student_id || !course_code || !year_id || !module_id || !week_num || !day_num || !response?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const minWords = typeof min_words === "number" ? min_words : 30;

  // 1. Rule-based gate (free) — too short → bounce before spending tokens.
  if (wordCount < minWords) {
    return NextResponse.json({
      accepted: false,
      feedback: `Your answer is a bit short (${wordCount} words). This task needs at least ${minWords} words — add more detail and try again.`,
    });
  }

  // 2. AI grade. We never block on quality (your choice) — a real attempt is always accepted
  //    and graded; the word-count gate above is the only bounce. Redo lets them improve.
  const ai = await gradeWithClaude({
    prompt: prompt ?? "", criteria: criteria ?? "", response, dayTitle: day_title ?? `Day ${day_num}`,
  });

  // 3. Build the saved grade (null score when no AI key configured).
  const grade = ai
    ? { score: ai.score, level: ai.level, strength: ai.strength, tip: ai.tip }
    : { score: null as number | null, level: null as string | null, strength: null as string | null, tip: null as string | null };

  const supabase = sb();

  // 4. Attempt cap (max 3). First submit = attempt 1; each redo +1.
  const MAX_ATTEMPTS = 3;
  const { data: existing } = await supabase
    .from("lesson_responses")
    .select("attempts")
    .eq("student_id", student_id).eq("course_code", course_code)
    .eq("year_id", year_id).eq("module_id", module_id)
    .eq("week_num", week_num).eq("day_num", day_num)
    .maybeSingle();

  const prevAttempts = existing?.attempts ?? 0;
  if (prevAttempts >= MAX_ATTEMPTS) {
    return NextResponse.json({
      accepted: false,
      feedback: `You've used all ${MAX_ATTEMPTS} attempts for this day. Your last submission stands.`,
      attempts: prevAttempts, maxAttempts: MAX_ATTEMPTS,
    });
  }
  const attempts = prevAttempts + 1;

  // 5. Save (latest attempt replaces the previous one).
  const { error } = await supabase
    .from("lesson_responses")
    .upsert({
      student_id, course_code, year_id, module_id, week_num, day_num,
      response: response.trim(),
      score: grade.score, level: grade.level, strength: grade.strength, tip: grade.tip,
      attempts, submitted_at: new Date().toISOString(),
    }, { onConflict: "student_id,course_code,year_id,module_id,week_num,day_num" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accepted: true, grade, attempts, maxAttempts: MAX_ATTEMPTS });
}
