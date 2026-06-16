import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

// GET ?cohort_id — students assigned to this cohort.
export async function GET(req: NextRequest) {
  const cohortId = req.nextUrl.searchParams.get("cohort_id");
  if (!cohortId) return NextResponse.json({ error: "Missing cohort_id" }, { status: 400 });
  const supabase = sb();
  const { data: rows } = await supabase.from("student_cohorts").select("student_id").eq("cohort_id", cohortId);
  const ids = (rows ?? []).map((r) => r.student_id);
  const { data: profs } = ids.length ? await supabase.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] };
  return NextResponse.json({ students: profs ?? [] });
}

// POST { action: 'add'|'remove', cohort_id, student_id }
export async function POST(req: NextRequest) {
  const { action, cohort_id, student_id } = await req.json();
  if (!cohort_id || !student_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const supabase = sb();
  if (action === "remove") {
    await supabase.from("student_cohorts").delete().eq("cohort_id", cohort_id).eq("student_id", student_id);
    await supabase.from("pod_members").delete().eq("student_id", student_id).in("pod_id",
      (await supabase.from("pods").select("id").eq("cohort_id", cohort_id)).data?.map((p) => p.id) ?? []);
    return NextResponse.json({ ok: true });
  }
  const { error } = await supabase.from("student_cohorts").upsert({ cohort_id, student_id }, { onConflict: "student_id,cohort_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
