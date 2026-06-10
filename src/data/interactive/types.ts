// Interactive lesson model — a 45d.ai-style code-rendered animated lesson.
// A lesson is a sequence of narrated SEGMENTS; each segment shows a SCENE and
// optionally requires the learner to interact before advancing.

export type SceneObject = { emoji: string; label: string };

export type Scene =
  | { type: "title"; title: string; subtitle?: string }
  | { type: "text"; heading?: string; body: string }
  | { type: "reveal"; heading?: string; items: SceneObject[] }           // items fade in one-by-one
  | { type: "spotlight"; emoji: string; label: string }                  // one big focal object
  | {
      type: "tapGame";                                                   // tap everything you saw
      heading: string;
      options: (SceneObject & { present: boolean })[];                   // present=false are distractors
      revealText: string;
    };

export type Segment = {
  id: string;
  narration: string;            // spoken aloud (free browser TTS) + shown as caption
  scene: Scene;
  requireInteraction?: boolean; // wait for the learner (e.g. tapGame) before advancing
};

export type InteractiveLesson = {
  title: string;
  accent: string;               // hex accent colour (matches the year)
  segments: Segment[];
};
