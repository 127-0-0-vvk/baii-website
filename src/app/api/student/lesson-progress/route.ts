import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// IST calendar date (YYYY-MM-DD) for a timestamp — day boundaries follow India time.
function istDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

// GET /api/student/lesson-progress?student_id=xxx&course_code=P5-C6
// Returns completed days with the calendar date each was submitted (IST), plus the server's "today".
// The client uses these to gate one lesson per calendar day.
export async function GET(req: NextRequest) {
  const student_id = req.nextUrl.searchParams.get("student_id");
  const course_code = req.nextUrl.searchParams.get("course_code");

  if (!student_id || !course_code) {
    return NextResponse.json({ error: "Missing student_id or course_code" }, { status: 400 });
  }

  const supabase = sb();
  const { data, error } = await supabase
    .from("lesson_responses")
    .select("week_num, day_num, submitted_at")
    .eq("student_id", student_id)
    .eq("course_code", course_code);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map of "W1-D1" -> submitted IST date string
  const completed: Record<string, string> = {};
  for (const r of data ?? []) {
    completed[`${r.week_num}-D${r.day_num}`] = istDate(new Date(r.submitted_at));
  }

  return NextResponse.json({ completed, today: istDate(new Date()) });
}
