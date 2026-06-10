"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, RotateCcw, ArrowRight, X } from "lucide-react";
import type { InteractiveLesson as Lesson } from "@/data/interactive/types";
import { SceneStage } from "./Scenes";
import NarratorOrb from "./NarratorOrb";

export default function InteractiveLesson({
  lesson, onComplete, onSkip,
}: {
  lesson: Lesson; onComplete: () => void; onSkip: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interactionDone, setInteractionDone] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);

  const seg = lesson.segments[index];
  const isLast = index === lesson.segments.length - 1;
  const accent = lesson.accent;
  const blockedByInteraction = !!seg.requireInteraction && !interactionDone;

  const advance = useCallback(() => {
    setIndex((i) => Math.min(i + 1, lesson.segments.length - 1));
  }, [lesson.segments.length]);

  // Reset per-segment interaction state.
  useEffect(() => { setInteractionDone(false); }, [index]);

  // Drive the lesson on an independent timer (robust), and speak best-effort in parallel.
  // We do NOT rely on the speech "end" event — Chrome silently kills long utterances,
  // which used to stall the lesson. Captions always show; voice is a bonus.
  useEffect(() => {
    if (!playing) { setSpeaking(false); return; }
    const words = seg.narration.trim().split(/\s+/).filter(Boolean).length;
    const displayMs = Math.min(13000, Math.max(2800, words * 360 + 1400));

    let keepAlive: ReturnType<typeof setInterval> | undefined;
    if (!muted && typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(seg.narration);
      u.rate = 0.97;
      const voices = synth.getVoices();
      const v = voices.find((x) => /en[-_]?(IN|GB|US)/i.test(x.lang)) || voices.find((x) => /^en/i.test(x.lang));
      if (v) u.voice = v;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      try { synth.cancel(); synth.speak(u); } catch { /* ignore */ }
      // Chrome stops speaking after ~15s unless nudged.
      keepAlive = setInterval(() => { try { if (synth.speaking) { synth.pause(); synth.resume(); } } catch { /* ignore */ } }, 9000);
    }

    const timer = seg.requireInteraction ? undefined : setTimeout(() => advance(), displayMs);

    return () => {
      if (timer) clearTimeout(timer);
      if (keepAlive) clearInterval(keepAlive);
      setSpeaking(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing, muted, replayNonce]);

  // Stop speech on unmount.
  useEffect(() => () => { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ background: "#fff", boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
      {/* Top strip */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <NarratorOrb speaking={speaking} accent={accent} size={34} />
          <span className="text-xs font-bold text-slate-600">Interactive Lesson</span>
        </div>
        <button onClick={() => { setPlaying(false); onSkip(); }} className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1">
          Skip to task <X size={12} />
        </button>
      </div>

      {/* Stage */}
      <div className="relative py-6" style={{ background: `linear-gradient(180deg, ${accent}06, #ffffff)` }}>
        <AnimatePresence mode="wait">
          <motion.div key={seg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <SceneStage scene={seg.scene} accent={accent} onInteractionComplete={() => setInteractionDone(true)} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption */}
      <div className="px-5 pb-2 min-h-[52px] flex items-center justify-center">
        <p className="text-center text-sm text-slate-600 leading-relaxed max-w-md">{seg.narration}</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 pb-3">
        {lesson.segments.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className="rounded-full transition-all"
            style={{ width: i === index ? 18 : 7, height: 7, background: i === index ? accent : i < index ? `${accent}55` : "#e2e8f0" }} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-50">
        <div className="flex items-center gap-1">
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={18} className="text-slate-500" /></button>
          <button onClick={() => setPlaying((p) => !p)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: accent }}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => { setPlaying(true); setReplayNonce((n) => n + 1); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100" title="Replay narration">
            <RotateCcw size={16} className="text-slate-500" />
          </button>
          <button onClick={() => setMuted((m) => !m)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100" title={muted ? "Unmute" : "Mute"}>
            {muted ? <VolumeX size={16} className="text-slate-400" /> : <Volume2 size={16} className="text-slate-500" />}
          </button>
        </div>

        {isLast ? (
          <button onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
            style={{ background: accent }}>
            Start your task <ArrowRight size={15} />
          </button>
        ) : (
          <button onClick={advance} disabled={blockedByInteraction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: accent }}>
            {blockedByInteraction ? "Tap & check first" : "Next"} <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
