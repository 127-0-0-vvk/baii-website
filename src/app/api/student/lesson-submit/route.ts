import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// Default to the most capable model; override with ANTHROPIC_MODEL (e.g. claude-haiku-4-5) to cut cost.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

type Grade = { pass: boolean; score: number; feedback: string };

// AI grader — replaces the teacher. Returns null if no API key is configured (caller falls back to rule-based).
async function gradeWithClaude(opts: {
  prompt: string;
  criteria: string;
  response: string;
  dayTitle: string;
}): Promise<Grade | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const client = new Anthropic();

  const system =
    "You are a warm, encouraging tutor for BAII, grading a Class 6 student's lesson submission " +
    "in the 'Critical Thinking' course. Judge whether the student genuinely attempted the task and met its intent. " +
    "Be generous and kind — the goal is to keep a young student motivated, not to catch them out. " +
    "Only mark pass=false if the answer is empty, off-topic, low-effort (e.g. 'asdf', one word), or clearly ignores the task. " +
    "Keep feedback to 1-3 short sentences, addressed directly to the student ('you'), and always include one specific encouraging observation.";

  const user =
    `TASK GIVEN TO STUDENT:\n${opts.prompt}\n\n` +
    `WHAT A GOOD ANSWER LOOKS LIKE (grading guidance):\n${opts.criteria}\n\n` +
    `STUDENT'S SUBMISSION (lesson: ${opts.dayTitle}):\n${opts.response}\n\n` +
    `Grade it. score is 0-100. pass=true unless it's empty/off-topic/low-effort.`;

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
              pass: { type: "boolean" },
              score: { type: "integer" },
              feedback: { type: "string" },
            },
            required: ["pass", "score", "feedback"],
          },
        },
      },
    });
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return null;
    const parsed = JSON.parse(text.text) as Grade;
    return parsed;
  } catch (e) {
    console.error("Claude grading failed:", e);
    return null; // fall back to rule-based
  }
}

// POST /api/student/lesson-submit
// Body: { student_id, course_code, year_id, module_id, week_num, day_num, response, prompt, criteria, min_words, day_title }
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

  // 1. Rule-based gate (always runs, free). Too short → reject before spending any tokens.
  if (wordCount < minWords) {
    return NextResponse.json({
      accepted: false,
      grade: {
        pass: false,
        score: 0,
        feedback: `Your answer is a bit short (${wordCount} words). This task needs at least ${minWords} words — add more detail and try again.`,
      },
    });
  }

  // 2. AI grade (Claude). Null when no API key → rule-based pass.
  const aiGrade = await gradeWithClaude({
    prompt: prompt ?? "",
    criteria: criteria ?? "",
    response,
    dayTitle: day_title ?? `Day ${day_num}`,
  });

  const grade: Grade = aiGrade ?? {
    pass: true,
    score: 100,
    feedback: "Nice work — submission received! 🎉",
  };

  // If the AI says it needs work, don't save — let the student revise and resubmit.
  if (!grade.pass) {
    return NextResponse.json({ accepted: false, grade });
  }

  // 3. Save the accepted submission.
  const supabase = sb();
  const { error } = await supabase
    .from("lesson_responses")
    .upsert({
      student_id,
      course_code,
      year_id,
      module_id,
      week_num,
      day_num,
      response: response.trim(),
    }, { onConflict: "student_id,course_code,year_id,module_id,week_num,day_num" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accepted: true, grade });
}
