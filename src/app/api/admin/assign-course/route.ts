import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: NextRequest) {
  const supabase = sb();
  const { student_id, course_code } = await req.json();

  if (!student_id || !course_code)
    return NextResponse.json({ error: "Missing student_id or course_code" }, { status: 400 });

  // Get or create a cohort for this course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("code", course_code)
    .single();

  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Find active cohort or create one
  let cohortId: string;
  const { data: existingCohort } = await supabase
    .from("cohorts")
    .select("id")
    .eq("course_id", course.id)
    .eq("is_active", true)
    .single();

  if (existingCohort) {
    cohortId = existingCohort.id;
  } else {
    const { data: newCohort, error: cohortErr } = await supabase
      .from("cohorts")
      .insert({ course_id: course.id, name: `${course_code} — Batch 1`, is_active: true })
      .select("id")
      .single();
    if (cohortErr || !newCohort)
      return NextResponse.json({ error: "Failed to create cohort" }, { status: 500 });
    cohortId = newCohort.id;
  }

  // Assign student to cohort
  const { error } = await supabase
    .from("student_cohorts")
    .upsert({ student_id, cohort_id: cohortId }, { onConflict: "student_id,cohort_id" });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, course: course.title });
}
