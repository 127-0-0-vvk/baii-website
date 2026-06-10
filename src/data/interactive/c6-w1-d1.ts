import type { InteractiveLesson } from "./types";

// Class 6 · Week 1 · Day 1 — "Look vs See" (interactive teaching lesson).
// The street objects mirror what computer vision actually detects in the Day-1 video.
export const C6_W1_D1: InteractiveLesson = {
  title: "Look vs See",
  accent: "#2563EB",
  segments: [
    {
      id: "intro",
      narration: "Welcome, Truth Detective. Today you'll learn the difference between just looking, and truly seeing.",
      scene: { type: "title", title: "Look vs See", subtitle: "Week 1 · Day 1" },
    },
    {
      id: "brain",
      narration: "Your eyes capture almost everything in front of you. But your brain only notices a tiny part of it.",
      scene: { type: "text", heading: "Here's the secret", body: "Your eyes see a LOT.\nYour brain notices a LITTLE." },
    },
    {
      id: "street",
      narration: "Watch this busy street as we move down it. A person walking… a red car… a blue scooter… some shops… a chair on the footpath… and a traffic light. Try to remember them all.",
      scene: { type: "streetPan" },
    },
    {
      id: "tap",
      narration: "Now, without looking back — tap everything you remember seeing on that street.",
      requireInteraction: true,
      scene: {
        type: "tapGame",
        heading: "Tap everything you saw",
        options: [
          { emoji: "🚶", label: "person", present: true },
          { emoji: "🚗", label: "car", present: true },
          { emoji: "🛵", label: "scooter", present: true },
          { emoji: "🎒", label: "backpack", present: true },
          { emoji: "🪑", label: "chair", present: true },
          { emoji: "🚦", label: "traffic light", present: true },
          { emoji: "🚌", label: "bus", present: false },
          { emoji: "🐕", label: "dog", present: false },
        ],
        revealText: "The bus and the dog were never on that street — your brain can ADD things that weren't there! And did you remember all six real ones? Most people miss a couple.",
      },
    },
    {
      id: "lesson",
      narration: "That is the Truth Detective's first rule. Write down only what you SEE — not what your brain guesses or adds.",
      scene: { type: "text", heading: "The first rule", body: "See what is really there.\nNot what your brain fills in." },
    },
    {
      id: "outro",
      narration: "Now it's your turn. You'll watch a real Indian street, and list everything you truly see. Ready? Let's begin your task.",
      scene: { type: "spotlight", emoji: "🔍", label: "Your task awaits" },
    },
  ],
};
