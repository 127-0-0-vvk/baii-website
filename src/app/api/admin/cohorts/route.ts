import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { semesterStartDates } from "@/lib/ctc";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

// GET — cohorts with pod count, student count, course codes, semester starts.
export async function GET() {
  const supabase = sb();
  const { data: cohorts, error } = await supabase.from("cohorts").select("id, name, program, current_sem, current_week, start_date, created_at").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (cohorts ?? []).map((c) => c.id);
  const [{ data: pods }, { data: sems }, { data: cc }, { data: sc }] = await Promise.all([
    ids.length ? supabase.from("pods").select("id, cohort_id").in("cohort_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("cohort_semesters").select("cohort_id, sem, start_date").in("cohort_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("cohort_courses").select("cohort_id, course_code").in("cohort_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("student_cohorts").select("cohort_id").in("cohort_id", ids) : Promise.resolve({ data: [] }),
  ]);
  const podCount: Record<string, number> = {}, semStarts: Record<string, Record<number, string>> = {}, courses: Record<string, string[]> = {}, studentCount: Record<string, number> = {};
  for (const p of pods ?? []) podCount[p.cohort_id] = (podCount[p.cohort_id] ?? 0) + 1;
  for (const s of sems ?? []) (semStarts[s.cohort_id] ??= {})[s.sem] = s.start_date;
  for (const c of cc ?? []) (courses[c.cohort_id] ??= []).push(c.course_code);
  for (const s of sc ?? []) studentCount[s.cohort_id] = (studentCount[s.cohort_id] ?? 0) + 1;
  return NextResponse.json({ cohorts: (cohorts ?? []).map((c) => ({ ...c, podCount: podCount[c.id] ?? 0, semStarts: semStarts[c.id] ?? {}, courses: courses[c.id] ?? [], studentCount: studentCount[c.id] ?? 0 })) });
}

// POST — create a cohort with selected courses + a program start date (auto-fills the 4 semester starts).
export async function POST(req: NextRequest) {
  const { name, courses, start_date } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const supabase = sb();
  const { data, error } = await supabase.from("cohorts").insert({ name: name.trim(), program: "CTC", current_sem: 1, current_week: 1, is_active: true, start_date: start_date || null }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const id = data.id;
  const courseCodes: string[] = Array.isArray(courses) && courses.length ? courses : ["CTC"];
  await supabase.from("cohort_courses").insert(courseCodes.map((code) => ({ cohort_id: id, course_code: code })));
  if (start_date) {
    const starts = semesterStartDates(start_date);
    await supabase.from("cohort_semesters").upsert(Object.entries(starts).map(([sem, sd]) => ({ cohort_id: id, sem: Number(sem), start_date: sd })), { onConflict: "cohort_id,sem" });
  }
  return NextResponse.json({ id });
}

// DELETE ?id=
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
  if (Object.keys(patch).length) { const { error } = await supabase.from("cohorts").update(patch).eq("id", id); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); }
  if (typeof sem === "number" && start_date) { const { error } = await supabase.from("cohort_semesters").upsert({ cohort_id: id, sem, start_date }, { onConflict: "cohort_id,sem" }); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
