import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rotateRoles } from "@/lib/ctc";

const sb = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

// GET /api/student/ctc?student_id=xxx
// Returns the student's pod, cohort position (sem/week), this-week roles, submission + defense.
export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("student_id");
  if (!studentId) return NextResponse.json({ error: "Missing student_id" }, { status: 400 });
  const supabase = sb();

  // Find the pod (if assigned) and/or the cohort (cohort membership grants access).
  const { data: mem } = await supabase.from("pod_members").select("pod_id").eq("student_id", studentId).maybeSingle();
  let pod: { id: string; name: string; cohort_id: string; discord_url: string | null; charter: string | null } | null = null;
  let cohortId: string | null = null;
  if (mem) {
    const { data: p } = await supabase.from("pods").select("id, name, cohort_id, discord_url, charter").eq("id", mem.pod_id).single();
    if (p) { pod = p; cohortId = p.cohort_id; }
  }
  if (!cohortId) {
    const { data: sc } = await supabase.from("student_cohorts").select("cohort_id").eq("student_id", studentId).limit(1).maybeSingle();
    if (sc) cohortId = sc.cohort_id;
  }
  if (!cohortId) return NextResponse.json({ enrolled: false });

  const { data: cohort } = await supabase
    .from("cohorts").select("current_sem, current_week, program").eq("id", cohortId).single();
  const sem = cohort?.current_sem ?? 1;
  const week = cohort?.current_week ?? 1;

  let roles: Record<string, string> = {};
  let podPayload = null;
  let submission = null;
  let defense = null;

  if (pod) {
    const { data: members } = await supabase.from("pod_members").select("student_id").eq("pod_id", pod.id);
    const ids = (members ?? []).map((m) => m.student_id).sort();
    const { data: profs } = ids.length ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] as { id: string; full_name: string }[] };
    const nameById: Record<string, string> = {};
    for (const p of profs ?? []) nameById[p.id] = p.full_name;
    roles = rotateRoles(ids, week);
    podPayload = { id: pod.id, name: pod.name, discord_url: pod.discord_url, charter: pod.charter, members: ids.map((id) => ({ id, name: nameById[id] ?? "Student", role: roles[id] ?? null, you: id === studentId })) };

    const { data: sub } = await supabase.from("submissions").select("id, deliverable_url, notes, submitted_at").eq("pod_id", pod.id).eq("sem", sem).eq("week", week).maybeSingle();
    submission = sub ?? null;
    if (sub) { const { data: d } = await supabase.from("defenses").select("outcome, feedback").eq("submission_id", sub.id).maybeSingle(); defense = d ?? null; }
  }

  const { data: cs } = await supabase.from("cohort_semesters").select("start_date").eq("cohort_id", cohortId).eq("sem", sem).maybeSingle();

  return NextResponse.json({
    enrolled: true,
    pod: podPayload,
    sem, week,
    yourRole: roles[studentId] ?? null,
    submission,
    defense,
    semStart: cs?.start_date ?? null,
  });
}
