import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

// POST /api/student/ctc-submit  { student_id, pod_id, sem, week, deliverable_url, notes }
// One deliverable per pod per week. Any pod member can submit/update before the defense.
export async function POST(req: NextRequest) {
  const { student_id, pod_id, sem, week, deliverable_url, notes } = await req.json();
  if (!student_id || !pod_id || !sem || !week || !deliverable_url?.trim()) {
    return NextResponse.json({ error: "Missing pod, week, or deliverable link" }, { status: 400 });
  }
  const supabase = sb();
  const { error } = await supabase.from("submissions").upsert(
    { pod_id, sem, week, deliverable_url: deliverable_url.trim(), notes: notes ?? null, submitted_by: student_id, submitted_at: new Date().toISOString() },
    { onConflict: "pod_id,sem,week" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
