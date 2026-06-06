import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// POST /api/student/lesson-submit
// Body: { student_id, course_code, year_id, module_id, week_num, day_num, response }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { student_id, course_code, year_id, module_id, week_num, day_num, response } = body;

  if (!student_id || !course_code || !year_id || !module_id || !week_num || !day_num || !response?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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
  return NextResponse.json({ success: true });
}
