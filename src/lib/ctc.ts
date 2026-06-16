import { CTC_CURRICULUM, CTC_SEMESTERS, type CtcWeek } from "@/data/ctc/curriculum";

// Default four rotating pod roles (editable later).
export const POD_ROLES = ["Lead", "Researcher", "Builder", "Skeptic"] as const;
export type PodRole = (typeof POD_ROLES)[number];

export const ROLE_BLURB: Record<PodRole, string> = {
  Lead: "Coordinates the pod and presents in the defense.",
  Researcher: "Finds the evidence and sources.",
  Builder: "Makes the interactive deliverable.",
  Skeptic: "Stress-tests the work and preps for the defense questions.",
};

export const WEEKS_PER_SEM = 18;
export const SEM_LENGTH_WEEKS = 20; // 18 active + 2 flex/showcase

// In-app course catalogue (cohorts pick one or more of these). Add new courses here.
export const COURSE_CATALOGUE = [
  { code: "CTC", title: "Critical Thinking & Communication", years: 2, desc: "Mind → Think → Communicate → Decide & Build" },
] as const;

export function courseTitle(code: string): string {
  return COURSE_CATALOGUE.find((c) => c.code === code)?.title ?? code;
}

// From a program start date (Monday of Sem 1 Wk 1), the start Monday of each semester.
export function semesterStartDates(programStart: string): Record<number, string> {
  const out: Record<number, string> = {};
  const base = new Date(programStart + "T00:00:00");
  for (let s = 1; s <= 4; s++) {
    const d = new Date(base);
    d.setDate(d.getDate() + (s - 1) * SEM_LENGTH_WEEKS * 7);
    out[s] = d.toISOString().slice(0, 10);
  }
  return out;
}

export function getWeek(sem: number, week: number): CtcWeek | null {
  return CTC_CURRICULUM.find((w) => w.sem === sem && w.week === week) ?? null;
}

export function weeksInSemester(sem: number): CtcWeek[] {
  return CTC_CURRICULUM.filter((w) => w.sem === sem).sort((a, b) => a.week - b.week);
}

export function semesterTitle(sem: number): string {
  return CTC_SEMESTERS.find((s) => s.sem === sem)?.title ?? `Semester ${sem}`;
}

// Distinct themes (in order) within a semester, with their week ranges.
export function themesInSemester(sem: number): { theme: string; weeks: number[] }[] {
  const out: { theme: string; weeks: number[] }[] = [];
  for (const w of weeksInSemester(sem)) {
    const last = out[out.length - 1];
    if (last && last.theme === w.theme) last.weeks.push(w.week);
    else out.push({ theme: w.theme, weeks: [w.week] });
  }
  return out;
}

// Calendar: given the semester's Week-1 Monday, the Mon–Fri dates of any week + the Friday deadline.
export function weekDates(semStart: Date, week: number): { mon: Date; fri: Date; days: Date[] } {
  const mon = new Date(semStart);
  mon.setDate(mon.getDate() + (week - 1) * 7);
  const days = Array.from({ length: 5 }, (_, i) => { const d = new Date(mon); d.setDate(d.getDate() + i); return d; });
  return { mon, fri: days[4], days };
}

// Deterministic weekly role rotation for a pod's members (so roles rotate every week).
export function rotateRoles(memberIds: string[], week: number): Record<string, PodRole> {
  const map: Record<string, PodRole> = {};
  memberIds.slice(0, 4).forEach((id, i) => {
    map[id] = POD_ROLES[(i + week) % POD_ROLES.length];
  });
  return map;
}
