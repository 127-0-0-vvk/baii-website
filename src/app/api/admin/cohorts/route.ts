import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

// GET — list cohorts with position, pod count, and semester start dates.
export async function GET() {
  const supabase = sb();
  const { data: cohorts, error } = await supabase.from("cohorts").select("id, name, program, current_sem, current_week, created_at").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (cohorts ?? []).map((c) => c.id);
  const { data: pods } = ids.length ? await supabase.from("pods").select("id, cohort_id").in("cohort_id", ids) : { data: [] };
  const { data: sems } = ids.length ? await supabase.from("cohort_semesters").select("cohort_id, sem, start_date").in("cohort_id", ids) : { data: [] };
  const podCount: Record<string, number> = {};
  for (const p of pods ?? []) podCount[p.cohort_id] = (podCount[p.cohort_id] ?? 0) + 1;
  const semStarts: Record<string, Record<number, string>> = {};
  for (const s of sems ?? []) (semStarts[s.cohort_id] ??= {})[s.sem] = s.start_date;
  return NextResponse.json({ cohorts: (cohorts ?? []).map((c) => ({ ...c, podCount: podCount[c.id] ?? 0, semStarts: semStarts[c.id] ?? {} })) });
}

// POST — create a cohort
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const supabase = sb();
  const { data, error } = await supabase.from("cohorts").insert({ name: name.trim(), program: "CTC", current_sem: 1, current_week: 1, is_active: true }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

// DELETE ?id= — remove a cohort (cascades pods/members/semesters)
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = sb();
  const { error } = await supabase.from("cohorts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH — set current sem/week and/or a semester start date
export async function PATCH(req: NextRequest) {
  const { id, current_sem, current_week, sem, start_date } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing cohort id" }, { status: 400 });
  const supabase = sb();
  const patch: Record<string, number> = {};
  if (typeof current_sem === "number") patch.current_sem = current_sem;
  if (typeof current_week === "number") patch.current_week = current_week;
  if (Object.keys(patch).length) {
    const { error } = await supabase.from("cohorts").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (typeof sem === "number" && start_date) {
    const { error } = await supabase.from("cohort_semesters").upsert({ cohort_id: id, sem, start_date }, { onConflict: "cohort_id,sem" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
