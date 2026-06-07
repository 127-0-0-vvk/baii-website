import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// GET /api/admin/lesson-responses?student_id=xxx
// Returns all lesson responses for a student so admin can review them
export async function GET(req: NextRequest) {
  const student_id = req.nextUrl.searchParams.get("student_id");
  if (!student_id) return NextResponse.json({ error: "Missing student_id" }, { status: 400 });

  const supabase = sb();
  const { data, error } = await supabase
    .from("lesson_responses")
    .select("course_code, year_id, module_id, week_num, day_num, response, submitted_at, score, level, strength, tip")
    .eq("student_id", student_id)
    .order("course_code")
    .order("week_num")
    .order("day_num");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ responses: data ?? [] });
}
