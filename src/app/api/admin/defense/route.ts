import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

// POST { submission_id, outcome, feedback, qa, recorded_by } — record the live Friday defense (the assessment).
export async function POST(req: NextRequest) {
  const { submission_id, outcome, feedback, qa, recorded_by } = await req.json();
  if (!submission_id || !outcome) return NextResponse.json({ error: "submission_id and outcome required" }, { status: 400 });
  const supabase = sb();
  const { error } = await supabase.from("defenses").upsert(
    { submission_id, outcome, feedback: feedback ?? null, qa: qa ?? null, recorded_by: recorded_by ?? null, defended_at: new Date().toISOString() },
    { onConflict: "submission_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
