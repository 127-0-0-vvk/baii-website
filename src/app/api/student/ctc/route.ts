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

  // Which pod is the student in?
  const { data: mem } = await supabase.from("pod_members").select("pod_id").eq("student_id", studentId).maybeSingle();
  if (!mem) return NextResponse.json({ enrolled: false });

  const { data: pod } = await supabase
    .from("pods").select("id, name, cohort_id, discord_url, charter").eq("id", mem.pod_id).single();
  if (!pod) return NextResponse.json({ enrolled: false });

  const { data: cohort } = await supabase
    .from("cohorts").select("current_sem, current_week, program").eq("id", pod.cohort_id).single();
  const sem = cohort?.current_sem ?? 1;
  const week = cohort?.current_week ?? 1;

  // Pod members + names
  const { data: members } = await supabase.from("pod_members").select("student_id").eq("pod_id", pod.id);
  const ids = (members ?? []).map((m) => m.student_id).sort();
  const { data: profs } = ids.length
    ? await supabase.from("profiles").select("id, full_name").in("id", ids)
    : { data: [] as { id: string; full_name: string }[] };
  const nameById: Record<string, string> = {};
  for (const p of profs ?? []) nameById[p.id] = p.full_name;

  const roles = rotateRoles(ids, week);
  const podMembers = ids.map((id) => ({ id, name: nameById[id] ?? "Student", role: roles[id] ?? null, you: id === studentId }));

  // This week's submission + defense
  const { data: submission } = await supabase
    .from("submissions").select("id, deliverable_url, notes, submitted_at").eq("pod_id", pod.id).eq("sem", sem).eq("week", week).maybeSingle();
  let defense = null;
  if (submission) {
    const { data: d } = await supabase.from("defenses").select("outcome, feedback").eq("submission_id", submission.id).maybeSingle();
    defense = d ?? null;
  }

  // Calendar start (Monday of week 1 this semester)
  const { data: cs } = await supabase.from("cohort_semesters").select("start_date").eq("cohort_id", pod.cohort_id).eq("sem", sem).maybeSingle();

  return NextResponse.json({
    enrolled: true,
    pod: { id: pod.id, name: pod.name, discord_url: pod.discord_url, charter: pod.charter, members: podMembers },
    sem, week,
    yourRole: roles[studentId] ?? null,
    submission: submission ?? null,
    defense,
    semStart: cs?.start_date ?? null,
  });
}
