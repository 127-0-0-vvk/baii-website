import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// IST calendar date (YYYY-MM-DD) — day boundaries follow India time.
function istDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

// GET /api/student/lesson-progress?student_id=xxx&course_code=P5-C6
// Returns each completed day with its submission date (IST) and grade, plus the server's "today".
export async function GET(req: NextRequest) {
  const student_id = req.nextUrl.searchParams.get("student_id");
  const course_code = req.nextUrl.searchParams.get("course_code");
  if (!student_id || !course_code) {
    return NextResponse.json({ error: "Missing student_id or course_code" }, { status: 400 });
  }

  const supabase = sb();
  const { data, error } = await supabase
    .from("lesson_responses")
    .select("week_num, day_num, submitted_at, score, level, strength, tip")
    .eq("student_id", student_id)
    .eq("course_code", course_code);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const completed: Record<string, {
    date: string; score: number | null; level: string | null; strength: string | null; tip: string | null;
  }> = {};
  for (const r of data ?? []) {
    completed[`${r.week_num}-D${r.day_num}`] = {
      date: istDate(new Date(r.submitted_at)),
      score: r.score, level: r.level, strength: r.strength, tip: r.tip,
    };
  }

  return NextResponse.json({ completed, today: istDate(new Date()) });
}
