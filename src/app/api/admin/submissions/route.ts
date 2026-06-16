import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

// GET ?cohort_id&sem&week — every pod in the cohort with its submission + defense for that week.
export async function GET(req: NextRequest) {
  const cohortId = req.nextUrl.searchParams.get("cohort_id");
  const sem = Number(req.nextUrl.searchParams.get("sem"));
  const week = Number(req.nextUrl.searchParams.get("week"));
  if (!cohortId || !sem || !week) return NextResponse.json({ error: "Missing cohort_id, sem or week" }, { status: 400 });
  const supabase = sb();
  const { data: pods } = await supabase.from("pods").select("id, name").eq("cohort_id", cohortId).order("name");
  const podIds = (pods ?? []).map((p) => p.id);
  const { data: subs } = podIds.length ? await supabase.from("submissions").select("id, pod_id, deliverable_url, notes, submitted_at").eq("sem", sem).eq("week", week).in("pod_id", podIds) : { data: [] };
  const subByPod: Record<string, { id: string; deliverable_url: string; notes: string | null; submitted_at: string }> = {};
  for (const s of subs ?? []) subByPod[s.pod_id] = s;
  const subIds = (subs ?? []).map((s) => s.id);
  const { data: defs } = subIds.length ? await supabase.from("defenses").select("submission_id, outcome, feedback").in("submission_id", subIds) : { data: [] };
  const defBySub: Record<string, { outcome: string; feedback: string | null }> = {};
  for (const d of defs ?? []) defBySub[d.submission_id] = { outcome: d.outcome, feedback: d.feedback };
  return NextResponse.json({
    rows: (pods ?? []).map((p) => {
      const sub = subByPod[p.id] ?? null;
      return { pod_id: p.id, pod_name: p.name, submission: sub, defense: sub ? defBySub[sub.id] ?? null : null };
    }),
  });
}
