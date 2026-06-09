"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Lock, CheckCircle2,
  Trophy, Target, X, ArrowRight, Lightbulb,
  Dumbbell, MapPin, Play, Send, Calendar, AlertCircle, Sparkles,
} from "lucide-react";
import { Star } from "lucide-react";
import { PILLAR5_YEARS, PILLAR5_ARC, type Year, type Week, type LessonDay } from "@/data/pillar5";

// Per-day grade returned with progress.
type DayGrade = { date: string; score: number | null; level: string | null; strength: string | null; tip: string | null; attempts: number };
type Progress = { completed: Record<string, DayGrade>; today: string };
const MAX_ATTEMPTS = 3;
// Set true to enforce one lesson per calendar day. Off during testing so all days
// unlock as soon as the previous one is submitted.
const ONE_PER_DAY = false;

// Score → stars (0-3). Returns -1 when ungraded (no AI key configured).
function scoreToStars(score: number | null | undefined): number {
  if (score == null) return -1;
  if (score >= 85) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
}

function Stars({ score, size = 16 }: { score: number | null | undefined; size?: number }) {
  const n = scoreToStars(score);
  if (n < 0) return null; // ungraded — show nothing
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star key={i} size={size} strokeWidth={2}
          style={{ color: "#f59e0b", fill: i < n ? "#f59e0b" : "transparent" }} />
      ))}
    </span>
  );
}

/* ─── Day Lesson View ────────────────────────────────────────── */
function DayLessonView({
  week, year, studentId, courseCode, progress, onDayComplete, onClose, nextWeek, onNextWeek,
}: {
  week: Week; year: Year; studentId?: string; courseCode?: string;
  progress: Progress; onDayComplete: (key: string, grade: DayGrade) => void; onClose: () => void;
  nextWeek?: Week | null; onNextWeek?: () => void;
}) {
  const days = week.days ?? [];
  const dayKey = (d: number) => `${week.w}-D${d}`;
  const isDone = (d: number) => dayKey(d) in progress.completed;
  // One lesson per calendar day: day N+1 unlocks only on a later IST date than day N's submission.
  const dayUnlocked = (d: number) => {
    if (d === 1) return true;
    if (!isDone(d - 1)) return false;
    if (!ONE_PER_DAY) return true; // testing: unlock immediately on submit
    return progress.completed[dayKey(d - 1)].date < progress.today;
  };
  // Locked purely because the previous day was finished today (comes back tomorrow).
  const waitingForTomorrow = (d: number) =>
    ONE_PER_DAY && d > 1 && isDone(d - 1) && !isDone(d) && progress.completed[dayKey(d - 1)].date === progress.today;

  const allDone = days.every((_, i) => isDone(i + 1));

  // Start on the first day that's open (not done) and unlocked; else first not-done; else last.
  const initialDay = (() => {
    for (let i = 0; i < days.length; i++) {
      if (!isDone(i + 1) && dayUnlocked(i + 1)) return i + 1;
    }
    for (let i = 0; i < days.length; i++) if (!isDone(i + 1)) return i + 1;
    return days.length;
  })();

  const [activeDay, setActiveDay] = useState(initialDay);
  const [watched, setWatched] = useState(false);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redoMode, setRedoMode] = useState(false);
  // When the whole week is done we show a summary; focusDay lets the student reopen one day to redo.
  const [focusDay, setFocusDay] = useState<number | null>(null);
  // accepted feedback carries the grade; rejected feedback carries only a message.
  const [feedback, setFeedback] = useState<
    | { accepted: true; score: number | null; level: string | null; strength: string | null; tip: string | null }
    | { accepted: false; message: string }
    | null
  >(null);

  const currentDayData: LessonDay | undefined = days[activeDay - 1];
  const hasVideo = !!currentDayData?.video_url;
  // No-video (claim/text) days have no "watch" gate — go straight to the task.
  const ready = watched || !hasVideo;
  const minWords = currentDayData?.min_words ?? 30;
  const wordCount = response.trim() ? response.trim().split(/\s+/).filter(Boolean).length : 0;
  const meetsMin = wordCount >= minWords;

  // Time-on-lesson: starts when the day opens, sent (capped) at submit so dashboard "Hours" is real.
  const startRef = useRef<number>(Date.now());
  useEffect(() => { setWatched(false); setResponse(""); setFeedback(null); setRedoMode(false); startRef.current = Date.now(); }, [activeDay]);

  const submit = async () => {
    if (!meetsMin || submitting || !currentDayData) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/student/lesson-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          course_code: courseCode,
          year_id: year.id,
          module_id: "m1",
          week_num: week.w,
          day_num: activeDay,
          response,
          prompt: currentDayData.prompt,
          criteria: currentDayData.grading_criteria,
          min_words: minWords,
          day_title: `${currentDayData.label} — ${currentDayData.title}`,
          video_url: currentDayData.video_url,
          time_seconds: Math.round((Date.now() - startRef.current) / 1000),
        }),
      });
      const data = await res.json();
      if (data.accepted) {
        const g = data.grade ?? {};
        const grade: DayGrade = {
          date: progress.today,
          score: g.score ?? null, level: g.level ?? null, strength: g.strength ?? null, tip: g.tip ?? null,
          attempts: data.attempts ?? ((progress.completed[dayKey(activeDay)]?.attempts ?? 0) + 1),
        };
        onDayComplete(dayKey(activeDay), grade);
        setRedoMode(false);
        setFeedback({ accepted: true, score: grade.score, level: grade.level, strength: grade.strength, tip: grade.tip });
      } else {
        setFeedback({ accepted: false, message: data.feedback || "Please re-read the task and try again." });
      }
    } catch {
      setFeedback({ accepted: false, message: "Something went wrong submitting. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const totalDays = days.length;
  const nextLabel = days[activeDay]?.label;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm">{week.topic}</p>
          <p className="text-[10px] text-slate-400">{year.label} · Module 1 · {week.w}</p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: allDone ? "#f0fdf4" : `${year.color}12`, color: allDone ? "#16a34a" : year.color }}>
          {days.filter((_, i) => isDone(i + 1)).length}/{totalDays} done
        </span>
      </div>

      {/* Day pills */}
      <div className="flex gap-2 px-4 pt-4 pb-1">
        {days.map((d, i) => {
          const dn = i + 1;
          const done = isDone(dn);
          const unlocked = dayUnlocked(dn);
          const active = activeDay === dn;
          return (
            <button key={dn}
              onClick={() => { setActiveDay(dn); setFocusDay(allDone ? dn : null); }}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
              style={{
                background: active ? year.color : done ? "#f0fdf4" : "white",
                border: `1.5px solid ${active ? year.color : done ? "#bbf7d0" : "#e2e8f0"}`,
                opacity: !unlocked && !done ? 0.55 : 1,
              }}>
              <span className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: active ? "rgba(255,255,255,0.8)" : done ? "#16a34a" : "#94a3b8" }}>
                {LABELS[i] ?? `D${dn}`}
              </span>
              {done
                ? <CheckCircle2 size={14} style={{ color: active ? "white" : "#16a34a" }} />
                : unlocked
                  ? <span className="text-sm font-black" style={{ color: active ? "white" : year.color }}>{dn}</span>
                  : <Lock size={12} style={{ color: "#cbd5e1" }} />}
              {done && scoreToStars(progress.completed[dayKey(dn)]?.score) >= 0 && (
                <Stars score={progress.completed[dayKey(dn)].score} size={9} />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {allDone && focusDay === null ? (
          <div className="mx-4 mt-5">
            <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${year.color}, ${year.color}cc)` }}>
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-white font-black text-xl mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Week 1 Complete!</p>
              <p className="text-white/80 text-sm">You finished all 5 days of &quot;Look vs See&quot;</p>
              {(() => {
                const scored = days.map((_, i) => progress.completed[dayKey(i + 1)]?.score).filter((s): s is number => s != null);
                if (!scored.length) return null;
                const avg = Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
                return (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: "rgba(255,255,255,0.95)" }}>
                    <Stars score={avg} size={18} />
                    <span className="text-sm font-black" style={{ color: year.color }}>Week average</span>
                  </div>
                );
              })()}
              <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.15)" }}>
                <p className="text-white/90 text-xs leading-relaxed">
                  The skill you built this week — seeing what&apos;s actually there vs. what your brain fills in —
                  is one most adults never consciously develop. On to the next one!
                </p>
              </div>
              {/* Continue to next week */}
              {nextWeek && onNextWeek ? (
                <button onClick={onNextWeek}
                  className="mt-4 w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: "white", color: year.color }}>
                  Start next week: {nextWeek.topic} <ArrowRight size={15} />
                </button>
              ) : (
                <p className="mt-4 text-white/70 text-xs">More weeks coming soon 🚀</p>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-5 mb-2 px-1">Your 5-day journey</p>
            {days.map((d, i) => {
              const g = progress.completed[dayKey(i + 1)];
              const used = g?.attempts ?? 1;
              return (
                <button key={d.day} onClick={() => { setActiveDay(i + 1); setFocusDay(i + 1); }}
                  className="w-full text-left bg-white rounded-xl border border-slate-100 px-4 py-3 mb-2 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#f0fdf4" }}>
                    <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700">{d.label} — {d.title}</p>
                    {g?.tip ? <p className="text-[10px] text-slate-400 truncate">{g.tip}</p> : <p className="text-[10px] text-slate-400">Submitted</p>}
                  </div>
                  {scoreToStars(g?.score) >= 0 && <Stars score={g.score} size={12} />}
                  <span className="text-[9px] text-slate-300 shrink-0">{used < MAX_ATTEMPTS ? "Redo →" : "Final"}</span>
                </button>
              );
            })}
          </div>
        ) : currentDayData ? (
          <AnimatePresence mode="wait">
            <motion.div key={activeDay} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 pt-4 space-y-4">

              {allDone && focusDay !== null && (
                <button onClick={() => { setFocusDay(null); setRedoMode(false); }}
                  className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: year.color }}>
                  <ChevronLeft size={14} /> Back to week summary
                </button>
              )}

              {/* Day title */}
              <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${year.color}, ${year.color}cc)` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={12} style={{ color: "rgba(255,255,255,0.7)" }} />
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{currentDayData.label} · Day {activeDay} of {totalDays}</span>
                </div>
                <p className="text-white font-black text-lg leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>{currentDayData.title}</p>
              </div>

              {/* If this day is locked until tomorrow */}
              {!isDone(activeDay) && !dayUnlocked(activeDay) ? (
                <div className="rounded-2xl p-6 text-center" style={{ background: "white", border: "1px solid #e2e8f0" }}>
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${year.color}10` }}>
                    <Lock size={20} style={{ color: year.color }} />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">
                    {waitingForTomorrow(activeDay) ? "Come back tomorrow" : "Finish the previous day first"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {waitingForTomorrow(activeDay)
                      ? "One lesson per day — this keeps your brain fresh. This day unlocks tomorrow. See you then!"
                      : "Each day unlocks the next once it's submitted."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Video — only for video days, visible before the answer form opens (locked while writing) */}
                  {hasVideo && !watched ? (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Watch first</p>
                      <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                        <iframe
                          src={currentDayData.video_url + "?rel=0&modestbranding=1"}
                          title={currentDayData.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen className="w-full h-full" style={{ border: "none" }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5 px-0.5">
                        <p className="text-[10px] text-slate-400">{currentDayData.video_note}</p>
                        <a href={currentDayData.video_url!.replace("/embed/", "/watch?v=")} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-semibold whitespace-nowrap ml-2" style={{ color: year.color }}>
                          Open in YouTube ↗
                        </a>
                      </div>
                    </div>
                  ) : hasVideo && watched && !(isDone(activeDay) && !redoMode) ? (
                    // Form is open → lock the video so the student answers from memory.
                    <div className="rounded-2xl flex flex-col items-center justify-center gap-1.5 py-6" style={{ background: "#0f172a" }}>
                      <Lock size={20} style={{ color: "rgba(255,255,255,0.6)" }} />
                      <p className="text-xs font-semibold text-white/70">Video locked while you answer</p>
                      <p className="text-[10px] text-white/40">Write from what you remember — no peeking!</p>
                    </div>
                  ) : null}

                  {/* Read-first / instructions card for no-video (claim/text) days */}
                  {!hasVideo && (currentDayData.read || currentDayData.instructions) && !(isDone(activeDay) && !redoMode) && (
                    <div className="rounded-2xl p-4" style={{ background: `${year.color}08`, border: `1px solid ${year.color}20` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={13} style={{ color: year.color }} />
                        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: year.color }}>{currentDayData.read ? "Read this first" : "Today's task"}</p>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{currentDayData.read || currentDayData.instructions}</p>
                    </div>
                  )}

                  {isDone(activeDay) && !redoMode ? (
                    (() => {
                      const g = progress.completed[dayKey(activeDay)];
                      const used = g?.attempts ?? 1;
                      const canRedo = used < MAX_ATTEMPTS;
                      return (
                        <div className="rounded-2xl p-4" style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                          <div className="flex items-center gap-3">
                            <CheckCircle2 size={20} style={{ color: "#16a34a" }} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm" style={{ color: "#15803d" }}>Day {activeDay} submitted!</p>
                                <Stars score={g?.score} size={14} />
                              </div>
                              <p className="text-xs" style={{ color: "#16a34a" }}>
                                {activeDay < totalDays ? `${nextLabel} ${ONE_PER_DAY ? "unlocks tomorrow" : "is unlocked"}` : "Week 1 complete 🎉"}
                              </p>
                            </div>
                          </div>
                          {g?.strength && <p className="text-xs mt-3 leading-relaxed" style={{ color: "#166534" }}>👏 {g.strength}</p>}
                          {g?.tip && <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#3f6212" }}>💡 {g.tip}</p>}

                          {/* Redo — max 3 attempts */}
                          <div className="mt-3 pt-3 border-t" style={{ borderColor: "#bbf7d0" }}>
                            {canRedo ? (
                              <button
                                onClick={() => { setRedoMode(true); setWatched(false); setResponse(""); setFeedback(null); }}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                                style={{ background: "white", border: `1.5px solid ${year.color}`, color: year.color }}>
                                <ArrowRight size={14} /> Redo this day to improve · {MAX_ATTEMPTS - used} {MAX_ATTEMPTS - used === 1 ? "try" : "tries"} left
                              </button>
                            ) : (
                              <p className="text-[11px] text-center text-slate-400">All {MAX_ATTEMPTS} attempts used — your best work stands 💪</p>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : !ready ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl p-4" style={{ background: `${year.color}08`, border: `1px solid ${year.color}20` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Play size={13} style={{ color: year.color }} />
                          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: year.color }}>Instructions</p>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{currentDayData.instructions}</p>
                      </div>
                      <button onClick={() => setWatched(true)}
                        className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                        style={{ background: year.color }}>
                        <CheckCircle2 size={16} /> I&apos;ve watched the video
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {redoMode && (
                        <div className="rounded-xl px-3.5 py-2.5 flex items-center justify-between" style={{ background: `${year.color}10`, border: `1px solid ${year.color}30` }}>
                          <p className="text-xs font-semibold" style={{ color: year.color }}>
                            ✏️ Redo — attempt {(progress.completed[dayKey(activeDay)]?.attempts ?? 1) + 1} of {MAX_ATTEMPTS}
                          </p>
                          <button onClick={() => { setRedoMode(false); setWatched(false); setResponse(""); setFeedback(null); }}
                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600">Cancel</button>
                        </div>
                      )}
                      <div className="rounded-2xl p-4" style={{ background: "rgba(26,58,107,0.04)", border: "1px solid rgba(26,58,107,0.1)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dumbbell size={13} className="text-slate-500" />
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Your Task</p>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{currentDayData.prompt}</p>
                      </div>

                      <textarea
                        value={response}
                        onChange={(e) => { setResponse(e.target.value); if (feedback && !feedback.accepted) setFeedback(null); }}
                        placeholder="Write your response here…"
                        rows={9}
                        className="w-full rounded-2xl px-4 py-3.5 text-sm border bg-white text-slate-700 placeholder:text-slate-300 focus:outline-none transition-colors resize-none leading-relaxed"
                        style={{ borderColor: meetsMin ? "#bbf7d0" : "#e2e8f0" }}
                      />

                      {/* Word counter */}
                      <div className="flex items-center justify-between px-1 -mt-1">
                        <span className="text-[11px] font-medium" style={{ color: meetsMin ? "#16a34a" : "#94a3b8" }}>
                          {wordCount} / {minWords} words {meetsMin ? "✓" : "minimum"}
                        </span>
                      </div>

                      {/* AI feedback (needs work) */}
                      {feedback && !feedback.accepted && (
                        <div className="rounded-2xl p-3.5 flex gap-2.5" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                          <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#b45309" }}>Tutor feedback</p>
                            <p className="text-sm leading-relaxed" style={{ color: "#92400e" }}>{feedback.message}</p>
                          </div>
                        </div>
                      )}

                      <button onClick={submit} disabled={!meetsMin || submitting}
                        className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: year.color }}>
                        {submitting
                          ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Checking your answer…</>
                          : <><Send size={15} /> Submit Day {activeDay}</>}
                      </button>
                      <p className="text-center text-[10px] text-slate-300">
                        A tutor checks your answer before it&apos;s accepted.
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>

      {/* Accepted feedback toast */}
      <AnimatePresence>
        {feedback && feedback.accepted && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto rounded-2xl p-4 shadow-2xl flex gap-3"
            style={{ background: "white", border: "1.5px solid #bbf7d0" }}>
            <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center" style={{ background: "#f0fdf4" }}>
              <Sparkles size={18} style={{ color: "#16a34a" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#15803d" }}>Accepted!</p>
                <Stars score={feedback.score} size={14} />
              </div>
              {feedback.strength
                ? <p className="text-sm text-slate-700 leading-relaxed">👏 {feedback.strength}</p>
                : <p className="text-sm text-slate-700 leading-relaxed">Nice work — submission received! 🎉</p>}
              {feedback.tip && <p className="text-xs text-slate-500 leading-relaxed mt-1">💡 {feedback.tip}</p>}
            </div>
            <button onClick={() => setFeedback(null)} className="shrink-0 text-slate-300 hover:text-slate-500"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Week preview sheet (weeks without day content) ─────────── */
function WeekSheet({ week, yearColor, onClose }: { week: Week; yearColor: string; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto z-10 shadow-2xl"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 rounded-t-3xl sm:rounded-t-2xl" style={{ background: yearColor }}>
          <div>
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{week.w}</span>
            <p className="text-white font-black text-lg leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>{week.topic}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
            <X size={16} className="text-white" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-2xl p-4" style={{ background: `${yearColor}08`, border: `1px solid ${yearColor}20` }}>
            <div className="flex items-center gap-2 mb-2"><Lightbulb size={14} style={{ color: yearColor }} /><p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: yearColor }}>Concept</p></div>
            <p className="text-sm text-slate-700 leading-relaxed">{week.concept}</p>
          </div>
          {week.exercise && (
            <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2"><Dumbbell size={14} className="text-slate-500" /><p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">This Week&apos;s Exercise</p></div>
              <p className="text-sm text-slate-700 leading-relaxed">{week.exercise}</p>
            </div>
          )}
          {week.example && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(196,125,42,0.06)", border: "1px solid rgba(196,125,42,0.15)" }}>
              <div className="flex items-center gap-2 mb-2"><MapPin size={14} style={{ color: "#c47d2a" }} /><p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#c47d2a" }}>India Example</p></div>
              <p className="text-sm leading-relaxed" style={{ color: "#92500f" }}>{week.example}</p>
            </div>
          )}
          <div className="rounded-2xl p-4 text-center" style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
            <Lock size={16} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs text-slate-400">Full day-by-day lesson content coming soon for this week</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Module path (week nodes) ───────────────────────────────── */
function ModulePath({
  year, moduleIndex, started, progress, onOpenLesson,
}: {
  year: Year; moduleIndex: number; started: boolean;
  progress: Progress; onOpenLesson: (week: Week) => void;
}) {
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const mod = year.modules[moduleIndex];
  const isBoss = (i: number) => i === mod.weeks_detail.length - 1;

  const isWeekUnlocked = (idx: number) => {
    if (!started) return false;
    if (idx === 0) return true; // W1 unlocked once cohort is live
    const w1 = mod.weeks_detail[0];
    if (!w1.days) return false;
    // W2+ unlocks only when all 5 days of W1 are submitted
    return w1.days.every((_, di) => `${w1.w}-D${di + 1}` in progress.completed);
  };

  return (
    <>
      <div className="px-4 py-3 space-y-1">
        {mod.weeks_detail.map((week, i) => {
          const unlocked = isWeekUnlocked(i);
          const boss = isBoss(i);
          const hasDays = !!week.days?.length;
          const isRight = i % 2 !== 0;
          return (
            <div key={i} className={`flex items-center mb-3 ${isRight ? "justify-end" : "justify-start"}`}>
              {isRight && <div className="flex-1 h-px mx-2" style={{ background: `${year.color}25` }} />}
              <motion.button
                whileHover={unlocked ? { scale: 1.08 } : {}}
                whileTap={unlocked ? { scale: 0.95 } : {}}
                onClick={() => { if (!unlocked) return; if (hasDays) onOpenLesson(week); else setSelectedWeek(week); }}
                className="relative flex flex-col items-center gap-1.5"
                style={{ minWidth: boss ? 80 : 64, cursor: unlocked ? "pointer" : "default" }}>
                <div className="relative flex items-center justify-center rounded-full font-black shadow-sm transition-all"
                  style={{
                    width: boss ? 72 : 56, height: boss ? 72 : 56,
                    background: boss
                      ? unlocked ? `linear-gradient(135deg, ${year.color}, ${year.color}cc)` : `${year.color}20`
                      : unlocked ? year.color : `${year.color}15`,
                    border: `2.5px solid ${unlocked ? year.color : year.color + "30"}`,
                    opacity: started && !unlocked ? 0.45 : 1,
                  }}>
                  {boss
                    ? <Trophy size={26} style={{ color: unlocked ? "white" : year.color, opacity: unlocked ? 1 : 0.5 }} />
                    : unlocked
                      ? (hasDays ? <Play size={18} style={{ color: "white" }} /> : <span style={{ fontSize: 15, fontWeight: 900, color: "white" }}>{i + 1}</span>)
                      : <Lock size={17} style={{ color: year.color, opacity: 0.5 }} />}
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: year.color }}>
                    {week.w.replace("W", "")}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-center leading-tight max-w-[76px]" style={{ color: unlocked ? year.color : "#94a3b8" }}>
                  {boss ? "🏆 Mission" : hasDays && unlocked ? "5-Day Lesson" : week.topic.split(" ").slice(0, 3).join(" ")}
                </p>
                {hasDays && unlocked && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${year.color}18`, color: year.color }}>Interactive</span>
                )}
              </motion.button>
              {!isRight && <div className="flex-1 h-px mx-2" style={{ background: `${year.color}25` }} />}
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {selectedWeek && <WeekSheet week={selectedWeek} yearColor={year.color} onClose={() => setSelectedWeek(null)} />}
      </AnimatePresence>
    </>
  );
}

/* ─── Main course view ───────────────────────────────────────── */
export default function Pillar5Course({
  onBack, allowedYearIds, started = false, studentId, courseCode,
}: {
  onBack: () => void; allowedYearIds?: string[]; started?: boolean;
  studentId?: string; courseCode?: string;
}) {
  const years = allowedYearIds?.length
    ? PILLAR5_YEARS.filter((y) => allowedYearIds.includes(y.id))
    : PILLAR5_YEARS;
  const restricted = !!(allowedYearIds?.length);

  const [activeYearId, setActiveYearId] = useState(years[0]?.id ?? "y6");
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [showArc, setShowArc] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Week | null>(null);
  const [progress, setProgress] = useState<Progress>({ completed: {}, today: "" });

  const year = years.find((y) => y.id === activeYearId) ?? years[0];
  const yearIndex = years.findIndex((y) => y.id === activeYearId);

  useEffect(() => {
    if (!studentId || !courseCode) return;
    fetch(`/api/student/lesson-progress?student_id=${studentId}&course_code=${courseCode}`)
      .then((r) => r.json())
      .then((d) => setProgress({ completed: d.completed ?? {}, today: d.today ?? "" }))
      .catch(() => {});
  }, [studentId, courseCode]);

  const handleDayComplete = (key: string, grade: DayGrade) => {
    setProgress((p) => ({ ...p, completed: { ...p.completed, [key]: grade } }));
  };

  if (selectedLesson) {
    // Next week with day-content in this year (across modules, in order) — for the "Start next week" button.
    const allWeeks = year.modules.flatMap((m) => m.weeks_detail);
    const curIdx = allWeeks.findIndex((w) => w.w === selectedLesson.w);
    const nextWeek = allWeeks.slice(curIdx + 1).find((w) => w.days?.length) ?? null;
    return (
      <DayLessonView
        week={selectedLesson} year={year} studentId={studentId} courseCode={courseCode}
        progress={progress} onDayComplete={handleDayComplete} onClose={() => setSelectedLesson(null)}
        nextWeek={nextWeek}
        onNextWeek={nextWeek ? () => setSelectedLesson(nextWeek) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">Critical Thinking & Communication</p>
          <p className="text-[10px] text-slate-400">{restricted ? `Pillar 5 · ${year.label} · ${year.title}` : "Pillar 5 · Class 6–12 · 7 Years"}</p>
        </div>
        {!restricted && (
          <button onClick={() => setShowArc(!showArc)} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: showArc ? "#1a3a6b" : "#f1f5f9", color: showArc ? "white" : "#64748b" }}>7-Year Arc</button>
        )}
      </div>

      <AnimatePresence>
        {showArc && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="mx-4 mt-3 rounded-2xl overflow-hidden shadow-lg z-20" style={{ border: "1px solid rgba(26,58,107,0.15)" }}>
            <div className="px-5 py-3" style={{ background: "#1a3a6b" }}><p className="text-white font-bold text-sm">Every skill compounds on the previous one</p></div>
            {PILLAR5_ARC.map((a, i) => {
              const y = PILLAR5_YEARS[i];
              return (
                <button key={i} onClick={() => { setActiveYearId(y.id); setActiveModuleIdx(0); setShowArc(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3 border-t border-slate-100 hover:bg-slate-50 transition-colors bg-white text-left">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: y.lightColor }}>
                    <span className="text-[10px] font-black" style={{ color: y.color }}>C{6 + i}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{a.skill} <span className="font-normal text-slate-400">— {y.title}</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.outcome}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 shrink-0" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {!restricted && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {years.map((y) => {
            const cls = y.label.replace("Class ", "");
            return (
              <button key={y.id} onClick={() => { setActiveYearId(y.id); setActiveModuleIdx(0); }}
                className="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
                style={{ background: activeYearId === y.id ? y.color : "white", border: `1.5px solid ${activeYearId === y.id ? y.color : "#e2e8f0"}`, minWidth: 72 }}>
                <span className="text-[10px] font-black" style={{ color: activeYearId === y.id ? "rgba(255,255,255,0.8)" : "#94a3b8" }}>C{cls}</span>
                <span className="text-xs font-bold" style={{ color: activeYearId === y.id ? "white" : "#64748b" }}>{cls}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Year hero */}
      <AnimatePresence mode="wait">
        <motion.div key={year.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="mx-4 mb-4 mt-3">
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${year.color} 0%, ${year.color}cc 100%)` }}>
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: "rgba(255,255,255,0.5)", transform: "translate(30%,-30%)" }} />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{year.label} · 35 Weeks · 5 Modules</p>
                <h2 className="text-white font-black text-xl leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>{year.title}</h2>
                <p className="text-white/80 text-xs mt-1 italic">&ldquo;{year.tagline}&rdquo;</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3" style={{ background: "rgba(255,255,255,0.2)" }}><Target size={20} className="text-white" /></div>
            </div>
            <p className="text-white/80 text-xs leading-relaxed mb-4">{year.description}</p>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.15)" }}>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">Year-End Mission</p>
              <p className="text-white text-xs leading-relaxed">{year.finalMission.split(":")[0]}:</p>
              <p className="text-white/80 text-xs leading-relaxed">{year.finalMission.split(":").slice(1).join(":").trim()}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Module tabs */}
      <div className="px-4 mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">5 Modules</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {year.modules.map((mod, i) => (
            <button key={mod.id} onClick={() => setActiveModuleIdx(i)}
              className="shrink-0 flex flex-col items-start px-3.5 py-2.5 rounded-xl transition-all"
              style={{ background: activeModuleIdx === i ? year.color : "white", border: `1.5px solid ${activeModuleIdx === i ? year.color : "#e2e8f0"}`, minWidth: 110 }}>
              <span className="text-[9px] font-bold mb-0.5 uppercase tracking-wider" style={{ color: activeModuleIdx === i ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>{mod.weeks}</span>
              <span className="text-xs font-bold leading-tight" style={{ color: activeModuleIdx === i ? "white" : "#64748b" }}>{mod.title}</span>
              <span className="text-[10px] mt-0.5 leading-tight" style={{ color: activeModuleIdx === i ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>{mod.weeks_detail.length} weeks</span>
            </button>
          ))}
        </div>
      </div>

      {/* Module content */}
      <AnimatePresence mode="wait">
        <motion.div key={`${year.id}-${activeModuleIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: `${year.color}10`, border: `1px solid ${year.color}25` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm" style={{ background: year.color }}>M{activeModuleIdx + 1}</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{year.modules[activeModuleIdx].title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{year.modules[activeModuleIdx].subtitle}</p>
              </div>
            </div>
          </div>

          <div className="mx-4 bg-white rounded-2xl overflow-hidden mb-4 border border-slate-100" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
            <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">{year.modules[activeModuleIdx].weeks_detail.length} weeks</p>
              <div className="flex items-center gap-1">
                {started
                  ? <><CheckCircle2 size={11} style={{ color: year.color }} /><p className="text-[10px] font-semibold" style={{ color: year.color }}>Cohort live</p></>
                  : <><Lock size={11} className="text-slate-300" /><p className="text-[10px] text-slate-400">Unlocks at cohort start</p></>}
              </div>
            </div>
            <ModulePath year={year} moduleIndex={activeModuleIdx} started={started} progress={progress} onOpenLesson={setSelectedLesson} />
          </div>

          <div className="mx-4 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assessment Breakdown</p>
            <div className="grid grid-cols-2 gap-2">
              {year.assessment.map((a, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-slate-100">
                  <p className="text-lg font-black mb-1" style={{ color: year.color, fontFamily: "var(--font-playfair)" }}>{a.weight}</p>
                  <p className="text-xs font-semibold text-slate-700 leading-tight mb-1">{a.label}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="sticky bottom-0 flex items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-100">
        <button
          onClick={() => {
            if (activeModuleIdx > 0) setActiveModuleIdx((m) => m - 1);
            else if (yearIndex > 0) { setActiveYearId(years[yearIndex - 1].id); setActiveModuleIdx(years[yearIndex - 1].modules.length - 1); }
          }}
          disabled={yearIndex <= 0 && activeModuleIdx === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 disabled:opacity-30 transition-all hover:bg-slate-50">
          <ChevronLeft size={15} /> Prev
        </button>
        <div className="flex gap-1">
          {year.modules.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i === activeModuleIdx ? year.color : "#e2e8f0" }} />
          ))}
        </div>
        <button
          onClick={() => {
            if (activeModuleIdx < year.modules.length - 1) setActiveModuleIdx((m) => m + 1);
            else if (yearIndex < years.length - 1) { setActiveYearId(years[yearIndex + 1].id); setActiveModuleIdx(0); }
          }}
          disabled={yearIndex >= years.length - 1 && activeModuleIdx === year.modules.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-30 transition-all hover:opacity-90"
          style={{ background: year.color }}>
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
