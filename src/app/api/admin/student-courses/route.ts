import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// GET /api/admin/student-courses?student_id=xxx
export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("student_id");
  if (!studentId) return NextResponse.json({ error: "Missing student_id" }, { status: 400 });

  const supabase = sb();
  const { data, error } = await supabase
    .from("student_cohorts")
    .select(`
      id,
      enrolled_at,
      cohorts (
        id, name,
        courses ( code, title, track, duration )
      )
    `)
    .eq("student_id", studentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ enrollments: data });
}
