import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PILLAR5_YEARS } from "@/data/pillar5";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const HOURS_PER_LESSON = 0.5; // estimate: video + writing per day

function istDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}
const codeToYearId = (code: string) => "y" + code.replace("P5-C", "");

// Current + longest streak from a set of IST date strings (YYYY-MM-DD).
function streaks(dates: string[], today: string): { current: number; best: number } {
  if (!dates.length) return { current: 0, best: 0 };
  const uniq = Array.from(new Set(dates)).sort(); // ascending
  const toNum = (s: string) => Date.parse(s + "T00:00:00Z") / 86400000;
  let best = 1, run = 1;
  for (let i = 1; i < uniq.length; i++) {
    run = toNum(uniq[i]) - toNum(uniq[i - 1]) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  // current streak: must include today or yesterday
  const last = uniq[uniq.length - 1];
  const gap = toNum(today) - toNum(last);
  let current = 0;
  if (gap <= 1) {
    current = 1;
    for (let i = uniq.length - 1; i > 0; i--) {
      if (toNum(uniq[i]) - toNum(uniq[i - 1]) === 1) current++; else break;
    }
  }
  return { current, best };
}

// GET /api/student/dashboard?student_id=xxx
export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("student_id");
  if (!studentId) return NextResponse.json({ error: "Missing student_id" }, { status: 400 });

  const supabase = sb();
  const today = istDate(new Date());

  // 1. Enrolled courses
  const { data: enr } = await supabase
    .from("student_cohorts")
    .select(`id, cohorts ( courses ( code, title, track, duration ) )`)
    .eq("student_id", studentId);

  type Row = { cohorts: { courses: { code: string; title: string; track: string; duration: string } | null } | null };
  const courses = (enr ?? [])
    .map((r) => (r as unknown as Row).cohorts?.courses)
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map((c) => ({ code: c.code, title: c.title, track: c.track }));

  // 2. Lesson submissions
  const { data: subs } = await supabase
    .from("lesson_responses")
    .select("course_code, week_num, day_num, submitted_at, score")
    .eq("student_id", studentId);

  const lessonsCompleted = subs?.length ?? 0;
  const submissionDates = (subs ?? []).map((s) => istDate(new Date(s.submitted_at)));
  const streak = streaks(submissionDates, today);
  const scored = (subs ?? []).map((s) => s.score).filter((s): s is number => s != null);
  const avgScore = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null;

  // completed day-keys per course
  const doneByCourse: Record<string, Set<string>> = {};
  for (const s of subs ?? []) {
    (doneByCourse[s.course_code] ??= new Set()).add(`${s.week_num}-D${s.day_num}`);
  }

  // 3. Weeks completed (a week with day content where all its days are submitted)
  let weeksCompleted = 0;
  const courseProgress = courses.map((c) => {
    const year = PILLAR5_YEARS.find((y) => y.id === codeToYearId(c.code));
    const done = doneByCourse[c.code] ?? new Set();
    let weeksDone = 0, weeksWithContent = 0;
    year?.modules.forEach((m) =>
      m.weeks_detail.forEach((w) => {
        if (w.days?.length) {
          weeksWithContent++;
          if (w.days.every((_, i) => done.has(`${w.w}-D${i + 1}`))) weeksDone++;
        }
      })
    );
    weeksCompleted += weeksDone;
    return { ...c, lessonsDone: done.size, weeksDone, weeksWithContent };
  });

  // 4. Certificates — a course certificate when every content week is complete (none yet, logic ready)
  const certificates = courseProgress.filter((c) => c.weeksWithContent > 0 && c.weeksDone === c.weeksWithContent).length;

  // 5. Upcoming — next undone day(s) in the primary course's Week 1
  const upcoming: { label: string; sub: string }[] = [];
  const primary = courses[0];
  if (primary) {
    const year = PILLAR5_YEARS.find((y) => y.id === codeToYearId(primary.code));
    const done = doneByCourse[primary.code] ?? new Set();
    const w1 = year?.modules[0]?.weeks_detail[0];
    const day = w1?.days?.find((_, i) => !done.has(`${w1.w}-D${i + 1}`));
    if (day) upcoming.push({ label: `${day.label} — ${day.title}`, sub: `${primary.title} · Week 1` });
    else if (w1?.days?.length) upcoming.push({ label: "Week 2 — coming soon", sub: `${primary.title}` });
  }

  // 6. Badges / milestones
  const badge = (id: string, emoji: string, label: string, earned: boolean, hint: string) => ({ id, emoji, label, earned, hint });
  const badges = [
    badge("first", "🌱", "First Step", lessonsCompleted >= 1, "Submit your first lesson"),
    badge("consistent", "📅", "Getting Going", lessonsCompleted >= 5, "Complete 5 lessons"),
    badge("week1", "🏆", "Week 1 Champion", weeksCompleted >= 1, "Finish a full week"),
    badge("streak3", "🔥", "3-Day Streak", streak.best >= 3, "Submit 3 days in a row"),
    badge("streak7", "⚡", "7-Day Streak", streak.best >= 7, "Submit 7 days in a row"),
    badge("sharp", "🦅", "Sharp Observer", avgScore != null && avgScore >= 80 && lessonsCompleted >= 3, "Average 80+ across lessons"),
  ];

  return NextResponse.json({
    coursesCount: courses.length,
    courses: courseProgress,
    lessonsCompleted,
    hours: Math.round(lessonsCompleted * HOURS_PER_LESSON * 10) / 10,
    certificates,
    streak,
    weeksCompleted,
    avgScore,
    upcoming,
    badges,
  });
}
