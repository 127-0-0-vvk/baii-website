import type { InteractiveLesson } from "./types";
import { C6_W1_D1 } from "./c6-w1-d1";

// 2D interactive (anime.js) lessons, keyed by `${yearId}/${weekNum}/D${dayNum}`.
// (Day 1 now uses the richer 3D lesson below, so it's kept here only as a fallback.)
export const INTERACTIVE_LESSONS: Record<string, InteractiveLesson> = {
  "y6/W1/D1": C6_W1_D1,
};

export function getInteractiveLesson(yearId: string, weekNum: string, dayNum: number): InteractiveLesson | null {
  return INTERACTIVE_LESSONS[`${yearId}/${weekNum}/D${dayNum}`] ?? null;
}

// 3D lessons disabled — 2D cinematic gives the better experience.
const THREED_LESSONS = new Set<string>();
export function has3DLesson(yearId: string, weekNum: string, dayNum: number): boolean {
  return THREED_LESSONS.has(`${yearId}/${weekNum}/D${dayNum}`);
}
