import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// GET /api/student/lesson-progress?student_id=xxx&course_code=P5-C6
// Returns completedDays: string[] — array of keys like "W1-D1", "W1-D2" …
export async function GET(req: NextRequest) {
  const student_id = req.nextUrl.searchParams.get("student_id");
  const course_code = req.nextUrl.searchParams.get("course_code");

  if (!student_id || !course_code) {
    return NextResponse.json({ error: "Missing student_id or course_code" }, { status: 400 });
  }

  const supabase = sb();
  const { data, error } = await supabase
    .from("lesson_responses")
    .select("week_num, day_num")
    .eq("student_id", student_id)
    .eq("course_code", course_code);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const completedDays = (data ?? []).map(r => `${r.week_num}-D${r.day_num}`);
  return NextResponse.json({ completedDays });
}
