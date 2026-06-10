import type { InteractiveLesson } from "./types";
import { C6_W1_D1 } from "./c6-w1-d1";

// Registry keyed by `${yearId}/${weekNum}/D${dayNum}` (e.g. "y6/W1/D1").
// A day with an entry here shows the interactive lesson instead of the video.
export const INTERACTIVE_LESSONS: Record<string, InteractiveLesson> = {
  "y6/W1/D1": C6_W1_D1,
};

export function getInteractiveLesson(yearId: string, weekNum: string, dayNum: number): InteractiveLesson | null {
  return INTERACTIVE_LESSONS[`${yearId}/${weekNum}/D${dayNum}`] ?? null;
}
