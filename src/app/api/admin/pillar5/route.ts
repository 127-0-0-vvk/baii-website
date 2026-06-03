import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PILLAR5_YEARS } from "@/data/pillar5";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// GET — fetch all overrides merged with static data
export async function GET() {
  const supabase = sb();
  const { data: overrides } = await supabase
    .from("pillar5_content")
    .select("*");

  // Build a lookup: `${year_id}::${module_id}::${week_num}` → override row
  const lookup: Record<string, Record<string, string>> = {};
  (overrides ?? []).forEach((row: Record<string, string>) => {
    lookup[`${row.year_id}::${row.module_id}::${row.week_num}`] = row;
  });

  // Merge static data with overrides
  const merged = PILLAR5_YEARS.map(year => ({
    ...year,
    modules: year.modules.map(mod => ({
      ...mod,
      weeks_detail: mod.weeks_detail.map(week => {
        const key = `${year.id}::${mod.id}::${week.w}`;
        const override = lookup[key];
        return override ? {
          ...week,
          topic:    override.topic    ?? week.topic,
          concept:  override.concept  ?? week.concept,
          exercise: override.exercise ?? week.exercise,
          example:  override.india_example ?? week.example,
        } : week;
      }),
    })),
  }));

  return NextResponse.json({ years: merged });
}

// PUT — save one week override
export async function PUT(req: NextRequest) {
  const supabase = sb();
  const { year_id, module_id, week_num, topic, concept, exercise, india_example } = await req.json();

  if (!year_id || !module_id || !week_num) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("pillar5_content")
    .upsert({
      year_id, module_id, week_num,
      topic, concept, exercise, india_example,
      updated_at: new Date().toISOString(),
    }, { onConflict: "year_id,module_id,week_num" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
