import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

type CohortRow = {
  id: string;
  name: string;
  courses: { code: string; title: string; track: string; duration: string } | null;
};

// Cohort start threshold. 1 for testing — a cohort goes "live" as soon as it has
// one student. Raise this (or wire it to cohorts.min_students_to_start) for real cohorts.
const MIN_STUDENTS_TO_START = 1;

// GET /api/student/my-courses?student_id=xxx
// Returns the student's assigned courses, each with whether its cohort has started
// (enrolled students >= MIN_STUDENTS_TO_START).
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

  // Count members per cohort to decide if it has started
  const cohortIds = (data ?? [])
    .map((r) => (r.cohorts as unknown as CohortRow)?.id)
    .filter(Boolean) as string[];

  const counts: Record<string, number> = {};
  if (cohortIds.length) {
    const { data: members } = await supabase
      .from("student_cohorts")
      .select("cohort_id")
      .in("cohort_id", cohortIds);
    for (const m of members ?? []) {
      counts[m.cohort_id] = (counts[m.cohort_id] ?? 0) + 1;
    }
  }

  const courses = (data ?? []).map((r) => {
    const cohort = r.cohorts as unknown as CohortRow;
    const course = cohort?.courses ?? null;
    const memberCount = counts[cohort?.id] ?? 0;
    return {
      enrollment_id: r.id,
      enrolled_at: r.enrolled_at,
      cohort_id: cohort?.id ?? null,
      cohort_name: cohort?.name ?? null,
      code: course?.code ?? null,
      title: course?.title ?? null,
      track: course?.track ?? null,
      duration: course?.duration ?? null,
      member_count: memberCount,
      started: memberCount >= MIN_STUDENTS_TO_START,
    };
  });

  return NextResponse.json({ courses });
}
