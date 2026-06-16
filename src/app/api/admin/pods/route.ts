import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

// GET ?cohort_id — pods with members
export async function GET(req: NextRequest) {
  const cohortId = req.nextUrl.searchParams.get("cohort_id");
  if (!cohortId) return NextResponse.json({ error: "Missing cohort_id" }, { status: 400 });
  const supabase = sb();
  const { data: pods, error } = await supabase.from("pods").select("id, name, discord_url, charter").eq("cohort_id", cohortId).order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const podIds = (pods ?? []).map((p) => p.id);
  const { data: mems } = podIds.length ? await supabase.from("pod_members").select("pod_id, student_id").in("pod_id", podIds) : { data: [] };
  const memIds = [...new Set((mems ?? []).map((m) => m.student_id))];
  const { data: profs } = memIds.length ? await supabase.from("profiles").select("id, full_name, email").in("id", memIds) : { data: [] };
  const profById: Record<string, { full_name: string; email: string }> = {};
  for (const p of profs ?? []) profById[p.id] = { full_name: p.full_name, email: p.email };
  const membersByPod: Record<string, { id: string; name: string; email: string }[]> = {};
  for (const m of mems ?? []) (membersByPod[m.pod_id] ??= []).push({ id: m.student_id, name: profById[m.student_id]?.full_name ?? "Student", email: profById[m.student_id]?.email ?? "" });
  return NextResponse.json({ pods: (pods ?? []).map((p) => ({ ...p, members: membersByPod[p.id] ?? [] })) });
}

// POST — actions: create pod, add/remove member, update pod
export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = sb();
  if (body.action === "create") {
    if (!body.cohort_id || !body.name?.trim()) return NextResponse.json({ error: "cohort_id and name required" }, { status: 400 });
    const { data, error } = await supabase.from("pods").insert({ cohort_id: body.cohort_id, name: body.name.trim() }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
  }
  if (body.action === "add_member") {
    const { error } = await supabase.from("pod_members").upsert({ pod_id: body.pod_id, student_id: body.student_id }, { onConflict: "pod_id,student_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "remove_member") {
    const { error } = await supabase.from("pod_members").delete().eq("pod_id", body.pod_id).eq("student_id", body.student_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "update") {
    const { error } = await supabase.from("pods").update({ discord_url: body.discord_url ?? null, charter: body.charter ?? null, name: body.name }).eq("id", body.pod_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
