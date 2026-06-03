"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Lock, CheckCircle2,
  Star, Trophy, Flame, Target, BookOpen, X,
  ArrowRight, Lightbulb, Dumbbell, MapPin,
} from "lucide-react";
import { PILLAR5_YEARS, PILLAR5_ARC, type Year, type Week } from "@/data/pillar5";

/* ─── Week detail sheet ──────────────────────────────────────── */
function WeekSheet({ week, yearColor, onClose }: { week: Week; yearColor: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto z-10 shadow-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        {/* Header strip */}
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
          {/* Concept */}
          <div className="rounded-2xl p-4" style={{ background: `${yearColor}08`, border: `1px solid ${yearColor}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} style={{ color: yearColor }} />
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: yearColor }}>Concept</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{week.concept}</p>
          </div>

          {/* Exercise */}
          {week.exercise && (
            <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell size={14} className="text-slate-500" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">This Week&apos;s Exercise</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{week.exercise}</p>
            </div>
          )}

          {/* India example */}
          {week.example && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(196,125,42,0.06)", border: "1px solid rgba(196,125,42,0.15)" }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} style={{ color: "#c47d2a" }} />
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#c47d2a" }}>India Example</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#92500f" }}>{week.example}</p>
            </div>
          )}

          {/* CTA */}
          <button className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: yearColor }}>
            <Lock size={14} />
            Unlocks when cohort begins
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Module path ────────────────────────────────────────────── */
function ModulePath({ year, moduleIndex }: { year: Year; moduleIndex: number }) {
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const mod = year.modules[moduleIndex];
  const isBoss = (i: number) => i === mod.weeks_detail.length - 1;

  return (
    <>
      <div className="px-4 py-2">
        {mod.weeks_detail.map((week, i) => {
          const isRight = i % 2 !== 0;
          const boss = isBoss(i);
          return (
            <div key={i} className={`flex items-center mb-3 ${isRight ? "justify-end" : "justify-start"}`}>
              {/* Connector line left side */}
              {isRight && <div className="flex-1 h-px mx-2" style={{ background: `${year.color}30` }} />}

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedWeek(week)}
                className="relative flex flex-col items-center gap-1.5 group"
                style={{ minWidth: boss ? 80 : 64 }}
              >
                {/* Node circle */}
                <div
                  className="relative flex items-center justify-center rounded-full font-black text-white shadow-lg transition-all"
                  style={{
                    width: boss ? 72 : 56,
                    height: boss ? 72 : 56,
                    background: boss
                      ? `linear-gradient(135deg, ${year.color}, ${year.color}cc)`
                      : `${year.color}18`,
                    border: `2.5px solid ${boss ? year.color : year.color + "40"}`,
                    color: boss ? "white" : year.color,
                    fontSize: boss ? 22 : 16,
                  }}
                >
                  {boss ? <Trophy size={28} /> : <Lock size={18} style={{ opacity: 0.6 }} />}
                  {/* Week badge */}
                  <span
                    className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: year.color }}
                  >
                    {week.w.replace("W", "")}
                  </span>
                </div>

                {/* Label */}
                <p
                  className="text-[10px] font-semibold text-center leading-tight max-w-[72px]"
                  style={{ color: boss ? year.color : "#94a3b8" }}
                >
                  {boss ? "🏆 Mission" : week.topic.split("—")[0].trim().split(" ").slice(0, 3).join(" ")}
                </p>
              </motion.button>

              {/* Connector line right side */}
              {!isRight && <div className="flex-1 h-px mx-2" style={{ background: `${year.color}30` }} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedWeek && (
          <WeekSheet week={selectedWeek} yearColor={year.color} onClose={() => setSelectedWeek(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Main course view ───────────────────────────────────────── */
export default function Pillar5Course({ onBack }: { onBack: () => void }) {
  const [activeYearId, setActiveYearId] = useState("y6");
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [showArc, setShowArc] = useState(false);

  const year = PILLAR5_YEARS.find(y => y.id === activeYearId)!;
  const yearIndex = PILLAR5_YEARS.findIndex(y => y.id === activeYearId);

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">Critical Thinking & Communication</p>
          <p className="text-[10px] text-slate-400">Pillar 5 · Class 6–12 · 7 Years</p>
        </div>
        <button
          onClick={() => setShowArc(!showArc)}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: showArc ? "#1a3a6b" : "#f1f5f9", color: showArc ? "white" : "#64748b" }}
        >
          7-Year Arc
        </button>
      </div>

      {/* 7-Year Arc overlay */}
      <AnimatePresence>
        {showArc && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-4 mt-3 rounded-2xl overflow-hidden shadow-lg z-20"
            style={{ border: "1px solid rgba(26,58,107,0.15)" }}
          >
            <div className="px-5 py-3" style={{ background: "#1a3a6b" }}>
              <p className="text-white font-bold text-sm">Every skill compounds on the previous one</p>
              <p className="text-white/60 text-xs mt-0.5">A Class 12 student building a real output uses all 7 years simultaneously.</p>
            </div>
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

      {/* Year selector — horizontal scroll */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {PILLAR5_YEARS.map((y, i) => (
          <button key={y.id} onClick={() => { setActiveYearId(y.id); setActiveModuleIdx(0); }}
            className="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
            style={{
              background: activeYearId === y.id ? y.color : "white",
              border: `1.5px solid ${activeYearId === y.id ? y.color : "#e2e8f0"}`,
              minWidth: 72,
            }}>
            <span className="text-[10px] font-black" style={{ color: activeYearId === y.id ? "rgba(255,255,255,0.8)" : "#94a3b8" }}>C{6 + i}</span>
            <span className="text-xs font-bold" style={{ color: activeYearId === y.id ? "white" : "#64748b" }}>{y.label.replace("Class ", "")}</span>
          </button>
        ))}
      </div>

      {/* Year hero card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={year.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="mx-4 mb-4"
        >
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${year.color} 0%, ${year.color}cc 100%)` }}>
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: "rgba(255,255,255,0.5)", transform: "translate(30%,-30%)" }} />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{year.label} · 35 Weeks · 5 Modules</p>
                <h2 className="text-white font-black text-xl leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>{year.title}</h2>
                <p className="text-white/80 text-xs mt-1 italic">"{year.tagline}"</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Target size={20} className="text-white" />
              </div>
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
              style={{
                background: activeModuleIdx === i ? year.color : "white",
                border: `1.5px solid ${activeModuleIdx === i ? year.color : "#e2e8f0"}`,
                minWidth: 110,
              }}>
              <span className="text-[9px] font-bold mb-0.5 uppercase tracking-wider" style={{ color: activeModuleIdx === i ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>{mod.weeks}</span>
              <span className="text-xs font-bold leading-tight" style={{ color: activeModuleIdx === i ? "white" : "#64748b" }}>{mod.title}</span>
              <span className="text-[10px] mt-0.5 leading-tight" style={{ color: activeModuleIdx === i ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>{mod.weeks_detail.length} weeks</span>
            </button>
          ))}
        </div>
      </div>

      {/* Module info */}
      <AnimatePresence mode="wait">
        <motion.div key={`${year.id}-${activeModuleIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Module header */}
          <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: `${year.color}10`, border: `1px solid ${year.color}25` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm"
                style={{ background: year.color }}>M{activeModuleIdx + 1}</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{year.modules[activeModuleIdx].title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{year.modules[activeModuleIdx].subtitle}</p>
              </div>
            </div>
          </div>

          {/* Duolingo-style path */}
          <div className="mx-4 bg-white rounded-2xl overflow-hidden mb-4 border border-slate-100" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
            <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">{year.modules[activeModuleIdx].weeks_detail.length} lessons</p>
              <div className="flex items-center gap-1">
                <Lock size={11} className="text-slate-300" />
                <p className="text-[10px] text-slate-400">Unlocks at cohort start</p>
              </div>
            </div>
            <ModulePath year={year} moduleIndex={activeModuleIdx} />
          </div>

          {/* Assessment for this year */}
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

      {/* Bottom nav arrows */}
      <div className="sticky bottom-0 flex items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-100">
        <button
          onClick={() => {
            if (activeModuleIdx > 0) setActiveModuleIdx(m => m - 1);
            else if (yearIndex > 0) { setActiveYearId(PILLAR5_YEARS[yearIndex - 1].id); setActiveModuleIdx(4); }
          }}
          disabled={activeYearId === "y6" && activeModuleIdx === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 disabled:opacity-30 transition-all hover:bg-slate-50"
        >
          <ChevronLeft size={15} /> Prev
        </button>

        <div className="flex gap-1">
          {year.modules.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i === activeModuleIdx ? year.color : "#e2e8f0" }} />
          ))}
        </div>

        <button
          onClick={() => {
            if (activeModuleIdx < 4) setActiveModuleIdx(m => m + 1);
            else if (yearIndex < 6) { setActiveYearId(PILLAR5_YEARS[yearIndex + 1].id); setActiveModuleIdx(0); }
          }}
          disabled={activeYearId === "y12" && activeModuleIdx === 3}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-30 transition-all hover:opacity-90"
          style={{ background: year.color }}
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
