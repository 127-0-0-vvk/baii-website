import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

// GET ?student_id — full detail: profile + cohorts + pods.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("student_id");
  if (!id) return NextResponse.json({ error: "Missing student_id" }, { status: 400 });
  const supabase = sb();
  const { data: profile } = await supabase.from("profiles").select("id, full_name, email, phone, school, city, role, created_at").eq("id", id).single();
  const { data: scs } = await supabase.from("student_cohorts").select("cohort_id").eq("student_id", id);
  const cohortIds = (scs ?? []).map((s) => s.cohort_id);
  const { data: cohorts } = cohortIds.length ? await supabase.from("cohorts").select("id, name").in("id", cohortIds) : { data: [] };
  const { data: pms } = await supabase.from("pod_members").select("pod_id").eq("student_id", id);
  const podIds = (pms ?? []).map((p) => p.pod_id);
  const { data: pods } = podIds.length ? await supabase.from("pods").select("id, name").in("id", podIds) : { data: [] };
  return NextResponse.json({ profile, cohorts: cohorts ?? [], pods: pods ?? [] });
}

// POST { action: 'set_password'|'delete'|'update_profile', student_id, ... }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = sb();
  const id = body.student_id;
  if (!id) return NextResponse.json({ error: "Missing student_id" }, { status: 400 });

  if (body.action === "set_password") {
    if (!body.password || body.password.length < 6) return NextResponse.json({ error: "Password too short" }, { status: 400 });
    const { error } = await supabase.auth.admin.updateUserById(id, { password: body.password });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "delete") {
    const { error } = await supabase.auth.admin.deleteUser(id); // cascades profile via FK
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "update_profile") {
    const patch: Record<string, string | null> = {};
    for (const k of ["full_name", "phone", "school", "city"]) if (k in body) patch[k] = body[k] ?? null;
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
