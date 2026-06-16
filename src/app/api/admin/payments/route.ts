import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

// GET — all payments with student name.
export async function GET() {
  const supabase = sb();
  const { data: rows, error } = await supabase.from("payments").select("id, student_id, cohort_id, amount, currency, status, note, created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = [...new Set((rows ?? []).map((r) => r.student_id))];
  const { data: profs } = ids.length ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] };
  const name: Record<string, string> = {}; for (const p of profs ?? []) name[p.id] = p.full_name;
  return NextResponse.json({ payments: (rows ?? []).map((r) => ({ ...r, student_name: name[r.student_id] ?? "—" })) });
}

// POST — record a fee/payment
export async function POST(req: NextRequest) {
  const { student_id, cohort_id, amount, status, note } = await req.json();
  if (!student_id || amount == null) return NextResponse.json({ error: "student and amount required" }, { status: 400 });
  const supabase = sb();
  const { error } = await supabase.from("payments").insert({ student_id, cohort_id: cohort_id || null, amount, status: status || "pending", note: note ?? null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE ?id=
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = sb();
  await supabase.from("payments").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
