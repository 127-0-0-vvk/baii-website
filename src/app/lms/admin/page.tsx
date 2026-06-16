"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Users, ShieldQuestion, CalendarCog, UserPlus, LogOut, X, Plus, ChevronDown,
  ChevronLeft, ChevronRight, Shield, Link2, Trash2, CheckCircle2, Minus, BookOpen, Radio, Hammer,
  Send, GraduationCap, CreditCard, KeyRound, Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getWeek, semesterTitle, weeksInSemester, themesInSemester, WEEKS_PER_SEM, COURSE_CATALOGUE, courseTitle, weekDates } from "@/lib/ctc";
import { CTC_SEMESTERS } from "@/data/ctc/curriculum";

type Profile = { id: string; email: string; full_name: string; role: string; phone?: string | null; school?: string | null; city?: string | null };
type Cohort = { id: string; name: string; program: string; current_sem: number; current_week: number; start_date: string | null; podCount: number; studentCount: number; courses: string[]; semStarts: Record<number, string> };
type Pod = { id: string; name: string; discord_url: string | null; charter: string | null; members: { id: string; name: string; email: string }[] };
type Tab = "dashboard" | "course" | "cohort" | "pods" | "submissions" | "students" | "tutors" | "payments" | "account";

function Av({ name, size = 34 }: { name: string; size?: number }) {
  const p = (name || "?").trim().split(" "); const l = p.length >= 2 ? p[0][0] + p[p.length - 1][0] : (p[0] || "?").slice(0, 2);
  return <div className="rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ width: size, height: size, fontSize: size * 0.36, background: "linear-gradient(135deg,#1a3a6b,#c47d2a)" }}>{l.toUpperCase()}</div>;
}
function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "#f8fafc" }}>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center"><Minus size={14} /></button>
        <span className="text-xl font-black text-slate-800 w-8 text-center">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-lg text-white flex items-center justify-center" style={{ background: "#1a3a6b" }}><Plus size={14} /></button>
      </div>
    </div>
  );
}

/* ─── COURSE ────────────────────────────────────────────────── */
const DAY_ICON = (label: string) => /kickoff/i.test(label) ? Radio : /doubt/i.test(label) ? ShieldQuestion : /submit|defend/i.test(label) ? Send : Hammer;
function CourseTab() {
  const [open, setOpen] = useState<string | null>(null);
  if (open === "ctc") return <CourseDetail onBack={() => setOpen(null)} />;
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Courses</h1><p className="text-slate-400 text-sm mt-0.5">BAII programmes. Click a course to see its full day-by-day plan.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => setOpen("ctc")} className="text-left rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
          <div className="p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full blur-2xl opacity-25" style={{ background: "#c47d2a", transform: "translate(30%,-30%)" }} />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Live studio · 2 years</span>
            <h3 className="text-white font-black text-lg mt-0.5 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>Critical Thinking &amp; Communication</h3>
            <div className="flex flex-wrap gap-1.5 mt-3">{["4 semesters", "72 weeks", "Pods of 4"].map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>{t}</span>)}</div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between"><span className="text-xs text-slate-400">Mind → Think → Communicate → Build</span><span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#1a3a6b" }}>Open <ChevronRight size={13} /></span></div>
        </button>
        <div className="rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6" style={{ background: "#f8fafc" }}>
          <Plus size={22} className="text-slate-300 mb-2" /><p className="text-sm font-semibold text-slate-400">More courses coming</p>
        </div>
      </div>
    </div>
  );
}
function CourseDetail({ onBack }: { onBack: () => void }) {
  const [sem, setSem] = useState(1); const [openWeek, setOpenWeek] = useState<number | null>(1);
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#1a3a6b" }}><ChevronLeft size={14} /> All courses</button>
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Critical Thinking &amp; Communication</h1><p className="text-slate-400 text-sm mt-0.5">2-year programme · day by day.</p></div>
      <div className="flex gap-2 overflow-x-auto pb-1">{CTC_SEMESTERS.map((s) => <button key={s.sem} onClick={() => { setSem(s.sem); setOpenWeek(null); }} className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold" style={{ background: sem === s.sem ? "#1a3a6b" : "white", color: sem === s.sem ? "white" : "#64748b", border: "1px solid #e2e8f0" }}>Sem {s.sem}</button>)}</div>
      <p className="text-sm font-semibold text-slate-600">{semesterTitle(sem)}</p>
      {themesInSemester(sem).map((t) => (
        <div key={t.theme}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.theme}</p>
          <div className="space-y-2">{t.weeks.map((wn) => {
            const w = getWeek(sem, wn)!; const open = openWeek === wn;
            return (
              <div key={wn} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                <button onClick={() => setOpenWeek(open ? null : wn)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black text-white" style={{ background: "#1a3a6b" }}>{wn}</div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-slate-700 text-sm">{w.title}</p><p className="text-[11px] text-slate-400 truncate">{w.objective}</p></div>
                  <ChevronDown size={15} className="text-slate-300 shrink-0" style={{ transform: open ? "rotate(180deg)" : "none" }} />
                </button>
                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-50 pt-3">
                    <p className="text-xs text-slate-500"><b className="text-slate-600">You gain:</b> {w.gain}</p>
                    <div className="space-y-1.5">{w.days.map((d) => { const Icon = DAY_ICON(d.label); return (
                      <div key={d.day} className="flex items-start gap-2.5"><div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: d.live ? "rgba(220,38,38,0.1)" : "rgba(26,58,107,0.07)", color: d.live ? "#dc2626" : "#1a3a6b" }}><Icon size={13} /></div><div className="flex-1"><p className="text-[11px] font-bold text-slate-600">{d.day} · {d.label} <span style={{ color: d.live ? "#dc2626" : "#94a3b8" }}>· {d.live ? "LIVE" : "SUPPORT"}</span></p><p className="text-[11px] text-slate-500">{d.text}</p></div></div>
                    ); })}</div>
                    <div className="rounded-xl p-2.5" style={{ background: "rgba(196,125,42,0.06)" }}><p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#c47d2a" }}>Deliverable</p><p className="text-xs text-slate-600">{w.deliverable}</p></div>
                    <div className="rounded-xl p-2.5" style={{ background: "rgba(220,38,38,0.05)" }}><p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#dc2626" }}>Friday defense</p><ul className="space-y-0.5">{w.defense.map((q, i) => <li key={i} className="text-xs text-slate-600 flex gap-1.5"><b style={{ color: "#dc2626" }}>{i + 1}.</b> {q}</li>)}</ul></div>
                  </div>
                )}
              </div>
            );
          })}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── COHORTS ───────────────────────────────────────────────── */
function CohortTab({ cohorts, students, active, onRefresh, onSelect }: { cohorts: Cohort[]; students: Profile[]; active: Cohort | null; onRefresh: () => void; onSelect: (id: string) => void }) {
  const [name, setName] = useState(""); const [sel, setSel] = useState<string[]>(["CTC"]); const [start, setStart] = useState("");
  const [members, setMembers] = useState<Profile[]>([]); const [adding, setAdding] = useState(false);
  const patch = (b: object) => fetch("/api/admin/cohorts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: active!.id, ...b }) }).then(onRefresh);
  const loadMembers = useCallback(() => { if (active) fetch(`/api/admin/cohort-students?cohort_id=${active.id}`).then((r) => r.json()).then((d) => setMembers(d.students ?? [])); }, [active]);
  useEffect(() => { loadMembers(); }, [loadMembers]);
  const create = async () => { if (!name.trim()) return; await fetch("/api/admin/cohorts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, courses: sel, start_date: start || null }) }); setName(""); setStart(""); onRefresh(); };
  const memberAction = async (action: string, student_id: string) => { await fetch("/api/admin/cohort-students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, cohort_id: active!.id, student_id }) }); loadMembers(); onRefresh(); };
  const inCohort = new Set(members.map((m) => m.id));

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Cohorts</h1><p className="text-slate-400 text-sm mt-0.5">A cohort = one batch running the programme. Pick course(s) + a start date; the semester schedule auto-fills.</p></div>

      {/* Create */}
      <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New cohort</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cohort name (e.g. 2026 Batch A)" className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300" />
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1.5">Courses</p>
          <div className="flex flex-wrap gap-2">{COURSE_CATALOGUE.map((c) => { const on = sel.includes(c.code); return (
            <button key={c.code} onClick={() => setSel((s) => on ? s.filter((x) => x !== c.code) : [...s, c.code])} className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: on ? "#1a3a6b" : "#f1f5f9", color: on ? "white" : "#64748b" }}>{on && <CheckCircle2 size={12} />}{c.title}</button>
          ); })}</div>
        </div>
        <div><p className="text-xs font-semibold text-slate-500 mb-1">Programme start (Mon of Sem 1, Wk 1)</p><input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none" /></div>
        <button onClick={create} disabled={!name.trim() || !sel.length} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-1.5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><Plus size={15} /> Create cohort</button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {cohorts.map((c) => (
          <div key={c.id} onClick={() => onSelect(c.id)} className="flex items-center gap-2 p-4 rounded-2xl bg-white cursor-pointer" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)", border: active?.id === c.id ? "1.5px solid #1a3a6b" : "1px solid transparent" }}>
            <div className="flex-1 min-w-0"><p className="font-semibold text-slate-700 text-sm">{c.name}</p><p className="text-xs text-slate-400">{c.courses.map(courseTitle).join(", ") || "CTC"} · {c.studentCount} students · {c.podCount} pods · Sem {c.current_sem} Wk {c.current_week}</p></div>
            {active?.id === c.id && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(26,58,107,0.1)", color: "#1a3a6b" }}>Active</span>}
            <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${c.name}"? Removes its pods & enrolments.`)) fetch(`/api/admin/cohorts?id=${c.id}`, { method: "DELETE" }).then(onRefresh); }} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={15} /></button>
          </div>
        ))}
        {!cohorts.length && <p className="text-sm text-slate-400">No cohorts yet.</p>}
      </div>

      {active && (
        <>
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Position — {active.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <Stepper label="Semester" value={active.current_sem} min={1} max={4} onChange={(v) => patch({ current_sem: v, current_week: 1 })} />
              <Stepper label="Week" value={active.current_week} min={1} max={WEEKS_PER_SEM} onChange={(v) => patch({ current_week: v })} />
            </div>
            {getWeek(active.current_sem, active.current_week) && <p className="text-xs text-slate-500 mt-3">Now: <b>{getWeek(active.current_sem, active.current_week)!.title}</b></p>}
            {active.semStarts[active.current_sem] && <p className="text-[11px] text-slate-400 mt-1">This week: {(() => { const d = weekDates(new Date(active.semStarts[active.current_sem] + "T00:00:00"), active.current_week); return `${d.mon.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${d.fri.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`; })()}</p>}
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Semester schedule (auto-filled from start date — editable)</p>
            <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((s) => (
              <div key={s}><label className="text-xs font-semibold text-slate-500">{semesterTitle(s).split(" — ")[0]}</label><input type="date" defaultValue={active.semStarts[s] ?? ""} onChange={(e) => e.target.value && patch({ sem: s, start_date: e.target.value })} className="w-full mt-1 rounded-xl px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none" /></div>
            ))}</div>
          </div>

          {/* Students in cohort */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students in this cohort ({members.length})</p><button onClick={() => setAdding(!adding)} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}><UserPlus size={11} /> Assign students</button></div>
            <div className="divide-y divide-slate-50">{members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2"><Av name={m.full_name} size={28} /><div className="flex-1 min-w-0"><p className="text-sm text-slate-700 truncate">{m.full_name}</p><p className="text-[11px] text-slate-400 truncate">{m.email}</p></div><button onClick={() => memberAction("remove", m.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button></div>
            ))}{!members.length && <p className="text-xs text-slate-300 py-2">No students assigned yet.</p>}</div>
            {adding && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-100">{students.filter((s) => !inCohort.has(s.id)).map((s) => (
                <button key={s.id} onClick={() => memberAction("add", s.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left"><Av name={s.full_name} size={24} /><span className="text-sm text-slate-600 flex-1 truncate">{s.full_name}</span><Plus size={13} className="text-slate-400" /></button>
              ))}{students.filter((s) => !inCohort.has(s.id)).length === 0 && <p className="text-xs text-slate-300 px-3 py-2">All students assigned.</p>}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── PODS ──────────────────────────────────────────────────── */
function PodsTab({ cohorts }: { cohorts: Cohort[] }) {
  const [cohortId, setCohortId] = useState(cohorts[cohorts.length - 1]?.id ?? "");
  const [pods, setPods] = useState<Pod[]>([]); const [pool, setPool] = useState<Profile[]>([]);
  const [newPod, setNewPod] = useState(""); const [addTo, setAddTo] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!cohortId) return;
    const [p, s] = await Promise.all([fetch(`/api/admin/pods?cohort_id=${cohortId}`).then((r) => r.json()), fetch(`/api/admin/cohort-students?cohort_id=${cohortId}`).then((r) => r.json())]);
    setPods(p.pods ?? []); setPool(s.students ?? []);
  }, [cohortId]);
  useEffect(() => { load(); }, [load]);
  const action = async (b: object) => { await fetch("/api/admin/pods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); load(); };
  const assigned = new Set(pods.flatMap((p) => p.members.map((m) => m.id)));

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Pods</h1><p className="text-slate-400 text-sm mt-0.5">Pick a cohort, then build pods of 4 from that cohort&apos;s students.</p></div>
      <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none">
        <option value="">Select a cohort…</option>{cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {!cohortId ? <p className="text-sm text-slate-400">Select a cohort above to manage its pods.</p> : (
        <>
          <div className="flex gap-2">
            <input value={newPod} onChange={(e) => setNewPod(e.target.value)} placeholder="New pod name (e.g. Pod 1)" className="flex-1 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none" />
            <button onClick={() => { if (newPod.trim()) { action({ action: "create", cohort_id: cohortId, name: newPod }); setNewPod(""); } }} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><Plus size={15} /> Add pod</button>
          </div>
          {pods.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between mb-2"><p className="font-bold text-slate-700">{p.name} <span className="text-xs font-normal text-slate-400">· {p.members.length}/4</span></p>
                <div className="flex items-center gap-1.5"><button onClick={() => setAddTo(addTo === p.id ? null : p.id)} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}><UserPlus size={11} /> Add</button><button onClick={() => { if (confirm(`Delete ${p.name}?`)) action({ action: "delete", pod_id: p.id }); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button></div>
              </div>
              <div className="divide-y divide-slate-50">{p.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-2"><Av name={m.name} size={28} /><div className="flex-1 min-w-0"><p className="text-sm text-slate-700 truncate">{m.name}</p></div><button onClick={() => action({ action: "remove_member", pod_id: p.id, student_id: m.id })} className="text-slate-300 hover:text-red-500"><Trash2 size={13} /></button></div>
              ))}{!p.members.length && <p className="text-xs text-slate-300 py-2">No members</p>}</div>
              {addTo === p.id && (
                <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-slate-100">{pool.filter((s) => !assigned.has(s.id)).map((s) => (
                  <button key={s.id} onClick={() => action({ action: "add_member", pod_id: p.id, student_id: s.id })} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left"><Av name={s.full_name} size={24} /><span className="text-sm text-slate-600 flex-1 truncate">{s.full_name}</span><Plus size={13} className="text-slate-400" /></button>
                ))}{pool.filter((s) => !assigned.has(s.id)).length === 0 && <p className="text-xs text-slate-300 px-3 py-2">All cohort students are in a pod.</p>}</div>
              )}
            </div>
          ))}
          {!pods.length && <p className="text-sm text-slate-400">No pods yet — add one above.</p>}
        </>
      )}
    </div>
  );
}

/* ─── SUBMISSIONS (was Defense) ─────────────────────────────── */
type SubRow = { pod_id: string; pod_name: string; submission: { id: string; deliverable_url: string; notes: string | null } | null; defense: { outcome: string; feedback: string | null } | null };
function SubmissionsTab({ active, adminId }: { active: Cohort | null; adminId: string }) {
  const [rows, setRows] = useState<SubRow[]>([]); const sem = active?.current_sem ?? 1, week = active?.current_week ?? 1; const w = getWeek(sem, week);
  const load = useCallback(async () => { if (!active) return; const r = await fetch(`/api/admin/submissions?cohort_id=${active.id}&sem=${sem}&week=${week}`); setRows((await r.json()).rows ?? []); }, [active, sem, week]);
  useEffect(() => { load(); }, [load]);
  const record = async (id: string, outcome: string, feedback: string) => { await fetch("/api/admin/defense", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submission_id: id, outcome, feedback, recorded_by: adminId }) }); load(); };
  if (!active) return <p className="text-sm text-slate-400">Select a cohort in the Cohorts tab first.</p>;
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Submissions &amp; Defense</h1><p className="text-slate-400 text-sm mt-0.5">{active.name} · {semesterTitle(sem).split(" — ")[0]} · Week {week}{w ? ` — ${w.title}` : ""}</p></div>
      <div className="rounded-xl p-3 flex gap-2.5" style={{ background: "rgba(26,58,107,0.04)", border: "1px solid rgba(26,58,107,0.1)" }}><div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(26,58,107,0.12)", color: "#1a3a6b" }}><span className="text-[10px] font-black">i</span></div><p className="text-xs text-slate-500 leading-relaxed">Each pod submits its weekly deliverable, then defends it live — fire the questions, record an outcome. Change the week in <b className="text-slate-600">Cohorts</b>.</p></div>
      {w && <div className="rounded-2xl p-4" style={{ background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.15)" }}><p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#dc2626" }}>Questions to fire</p><ul className="space-y-1">{w.defense.map((q, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><b style={{ color: "#dc2626" }}>{i + 1}.</b> {q}</li>)}</ul></div>}
      {rows.map((r) => <SubRowCard key={r.pod_id} row={r} onRecord={record} />)}
      {!rows.length && <p className="text-sm text-slate-400">No pods in this cohort yet.</p>}
    </div>
  );
}
function SubRowCard({ row, onRecord }: { row: SubRow; onRecord: (id: string, o: string, f: string) => void }) {
  const [outcome, setOutcome] = useState(row.defense?.outcome ?? ""); const [fb, setFb] = useState(row.defense?.feedback ?? "");
  const outs = [["strong", "Strong", "#16a34a"], ["passed", "Passed", "#1a3a6b"], ["revise", "Revise", "#c47d2a"], ["not_defended", "No-show", "#dc2626"]] as const;
  return (
    <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between"><p className="font-bold text-slate-700">{row.pod_name}</p>{row.submission ? <a href={row.submission.deliverable_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold flex items-center gap-1" style={{ color: "#1a3a6b" }}><Link2 size={12} /> Deliverable</a> : <span className="text-[11px] text-slate-300">No submission</span>}</div>
      {row.submission?.notes && <p className="text-xs text-slate-400 mt-1">{row.submission.notes}</p>}
      {row.submission && (<div className="mt-3"><div className="flex gap-1.5 flex-wrap mb-2">{outs.map(([v, l, c]) => <button key={v} onClick={() => setOutcome(v)} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: outcome === v ? c : "#f1f5f9", color: outcome === v ? "white" : "#64748b" }}>{l}</button>)}</div><textarea value={fb} onChange={(e) => setFb(e.target.value)} placeholder="Feedback…" rows={2} className="w-full rounded-xl px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none mb-2" /><button onClick={() => outcome && onRecord(row.submission!.id, outcome, fb)} disabled={!outcome} className="text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-40 flex items-center gap-1.5" style={{ background: "#1a3a6b" }}><CheckCircle2 size={13} /> {row.defense ? "Update" : "Record"}</button></div>)}
    </div>
  );
}

/* ─── STUDENTS ──────────────────────────────────────────────── */
function StudentsTab({ students, onRefresh }: { students: Profile[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false); const [exp, setExp] = useState<string | null>(null);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Students</h1><p className="text-slate-400 text-sm mt-0.5">{students.length} students · tap a row for details (assign in Cohorts)</p></div><button onClick={() => setOpen(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><UserPlus size={15} /> New student</button></div>
      <div className="space-y-2">{students.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <button onClick={() => setExp(exp === s.id ? null : s.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left"><Av name={s.full_name} size={32} /><div className="flex-1 min-w-0"><p className="font-medium text-slate-700 text-sm truncate">{s.full_name}</p><p className="text-xs text-slate-400 truncate">{s.email}</p></div><ChevronDown size={15} className="text-slate-300" style={{ transform: exp === s.id ? "rotate(180deg)" : "none" }} /></button>
          {exp === s.id && <StudentDetail student={s} onRefresh={onRefresh} />}
        </div>
      ))}{!students.length && <p className="text-sm text-slate-400">No students yet.</p>}</div>
      {open && <CreateUser role="student" onClose={() => setOpen(false)} onDone={() => { setOpen(false); onRefresh(); }} />}
    </div>
  );
}
function StudentDetail({ student, onRefresh }: { student: Profile; onRefresh: () => void }) {
  const [d, setD] = useState<{ profile: Profile; cohorts: { id: string; name: string }[]; pods: { id: string; name: string }[] } | null>(null);
  useEffect(() => { fetch(`/api/admin/user-manage?student_id=${student.id}`).then((r) => r.json()).then(setD); }, [student.id]);
  const act = async (body: object) => { await fetch("/api/admin/user-manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: student.id, ...body }) }); };
  const setPw = async () => { const pw = prompt(`New password for ${student.full_name} (min 6 chars):`); if (pw && pw.length >= 6) { await act({ action: "set_password", password: pw }); alert("Password updated."); } };
  const del = async () => { if (confirm(`Delete ${student.full_name}? This removes their account permanently.`)) { await act({ action: "delete" }); onRefresh(); } };
  if (!d) return <div className="px-4 pb-3 text-xs text-slate-400">Loading…</div>;
  const rows = [["ID", student.id.slice(0, 8) + "…"], ["Email", d.profile?.email], ["Phone", d.profile?.phone || "—"], ["School", d.profile?.school || "—"], ["City", d.profile?.city || "—"], ["Cohorts", d.cohorts.map((c) => c.name).join(", ") || "None"], ["Pods", d.pods.map((p) => p.name).join(", ") || "None"]];
  return (
    <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">{rows.map(([k, v]) => <div key={k as string}><p className="text-[10px] text-slate-400 uppercase tracking-wider">{k}</p><p className="text-xs text-slate-600 break-words">{v}</p></div>)}</div>
      <div className="flex gap-2"><button onClick={setPw} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1" style={{ background: "#f1f5f9", color: "#1a3a6b" }}><KeyRound size={12} /> Set password</button><button onClick={del} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1" style={{ background: "#fef2f2", color: "#dc2626" }}><Trash2 size={12} /> Delete user</button></div>
    </div>
  );
}

/* ─── TUTORS ────────────────────────────────────────────────── */
function TutorsTab({ tutors, onRefresh }: { tutors: Profile[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Tutors</h1><p className="text-slate-400 text-sm mt-0.5">{tutors.length} tutors (lecturers)</p></div><button onClick={() => setOpen(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><UserPlus size={15} /> New tutor</button></div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>{tutors.map((t, i) => (
        <div key={t.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid #f1f5f9" : "none" }}><Av name={t.full_name} size={32} /><div className="flex-1 min-w-0"><p className="font-medium text-slate-700 text-sm truncate">{t.full_name}</p><p className="text-xs text-slate-400 truncate">{t.email}</p></div><span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(196,125,42,0.12)", color: "#c47d2a" }}>Tutor</span></div>
      ))}{!tutors.length && <p className="text-sm text-slate-400 p-5 text-center">No tutors yet.</p>}</div>
      {open && <CreateUser role="tutor" onClose={() => setOpen(false)} onDone={() => { setOpen(false); onRefresh(); }} />}
    </div>
  );
}

/* ─── PAYMENTS ──────────────────────────────────────────────── */
type Payment = { id: string; student_id: string; student_name: string; amount: number; currency: string; status: string; note: string | null; created_at: string };
function PaymentsTab({ students }: { students: Profile[] }) {
  const [rows, setRows] = useState<Payment[]>([]); const [f, setF] = useState({ student_id: "", amount: "", status: "paid", note: "" });
  const load = () => fetch("/api/admin/payments").then((r) => r.json()).then((d) => setRows(d.payments ?? []));
  useEffect(() => { load(); }, []);
  const add = async () => { if (!f.student_id || !f.amount) return; await fetch("/api/admin/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: f.student_id, amount: Number(f.amount), status: f.status, note: f.note }) }); setF({ student_id: "", amount: "", status: "paid", note: "" }); load(); };
  const total = rows.filter((r) => r.status === "paid").reduce((a, r) => a + Number(r.amount), 0);
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Payments &amp; Fees</h1><p className="text-slate-400 text-sm mt-0.5">₹{total.toLocaleString("en-IN")} collected</p></div>
      <div className="bg-white rounded-2xl p-4 space-y-2" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Record a payment</p>
        <select value={f.student_id} onChange={(e) => setF((x) => ({ ...x, student_id: e.target.value }))} className="w-full rounded-xl px-3 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none"><option value="">Select student…</option>{students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select>
        <div className="flex gap-2"><input value={f.amount} onChange={(e) => setF((x) => ({ ...x, amount: e.target.value }))} type="number" placeholder="Amount ₹" className="flex-1 rounded-xl px-3 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none" /><select value={f.status} onChange={(e) => setF((x) => ({ ...x, status: e.target.value }))} className="rounded-xl px-3 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none">{["paid", "pending", "partial", "waived"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <input value={f.note} onChange={(e) => setF((x) => ({ ...x, note: e.target.value }))} placeholder="Note (e.g. Sem 1 fee)" className="w-full rounded-xl px-3 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none" />
        <button onClick={add} disabled={!f.student_id || !f.amount} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>Add payment</button>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>{rows.map((r, i) => (
        <div key={r.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid #f1f5f9" : "none" }}><div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-700 truncate">{r.student_name}</p><p className="text-[11px] text-slate-400">{r.note || "—"} · {new Date(r.created_at).toLocaleDateString("en-IN")}</p></div><p className="text-sm font-bold text-slate-700">₹{Number(r.amount).toLocaleString("en-IN")}</p><span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: r.status === "paid" ? "#f0fdf4" : "#fffbeb", color: r.status === "paid" ? "#16a34a" : "#c47d2a" }}>{r.status}</span><button onClick={() => fetch(`/api/admin/payments?id=${r.id}`, { method: "DELETE" }).then(load)} className="text-slate-300 hover:text-red-500"><Trash2 size={13} /></button></div>
      ))}{!rows.length && <p className="text-sm text-slate-400 p-5 text-center">No payments recorded.</p>}</div>
    </div>
  );
}

/* ─── CREATE USER MODAL (student or tutor) ──────────────────── */
function CreateUser({ role, onClose, onDone }: { role: "student" | "tutor"; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ full_name: "", email: "", password: "", phone: "" }); const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setErr(""); const r = await fetch("/api/admin/create-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, role }) }); const j = await r.json(); if (!r.ok) setErr(j.error ?? "Failed"); else onDone(); setLoading(false); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300"><X size={16} /></button>
        <h3 className="font-bold text-slate-800 text-lg mb-4 capitalize" style={{ fontFamily: "var(--font-playfair)" }}>New {role}</h3>
        <form onSubmit={submit} className="space-y-3">
          {[["full_name", "Full name", "text"], ["email", "Email", "email"], ["phone", "Phone", "text"], ["password", "Password (min 8)", "text"]].map(([k, l, t]) => <input key={k} required={k !== "phone"} type={t} placeholder={l} value={f[k as keyof typeof f]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))} className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300" />)}
          {err && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>{loading ? "Creating…" : `Create ${role}`}</button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── ACCOUNT (editable) ────────────────────────────────────── */
function AccountTab({ profile, adminId, onLogout, onRefresh }: { profile: Profile | null; adminId: string; onLogout: () => void; onRefresh: () => void }) {
  const [name, setName] = useState(profile?.full_name ?? ""); const [phone, setPhone] = useState(profile?.phone ?? ""); const [saved, setSaved] = useState(false);
  useEffect(() => { setName(profile?.full_name ?? ""); setPhone(profile?.phone ?? ""); }, [profile]);
  const save = async () => { await fetch("/api/admin/user-manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: adminId, action: "update_profile", full_name: name, phone }) }); setSaved(true); onRefresh(); setTimeout(() => setSaved(false), 2000); };
  const setPw = async () => { const pw = prompt("New password (min 6):"); if (pw && pw.length >= 6) { await fetch("/api/admin/user-manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: adminId, action: "set_password", password: pw }) }); alert("Password updated."); } };
  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Account</h1>
      <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        <div className="p-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><Av name={name || "Admin"} size={56} /><div><p className="font-black text-white text-xl" style={{ fontFamily: "var(--font-playfair)" }}>{name || "Admin"}</p><span className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(196,125,42,0.25)", color: "#e8be72" }}><Shield size={10} /> Administrator</span></div></div>
        <div className="p-5 space-y-3">
          <div><label className="text-[11px] font-semibold text-slate-500">Full name</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300" /></div>
          <div><label className="text-[11px] font-semibold text-slate-500">Email</label><input value={profile?.email ?? ""} disabled className="w-full mt-1 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-100 text-slate-400" /></div>
          <div><label className="text-[11px] font-semibold text-slate-500">Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" className="w-full mt-1 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300" /></div>
          <div className="flex gap-2"><button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>{saved ? <><CheckCircle2 size={15} /> Saved</> : <><Save size={15} /> Save</>}</button><button onClick={setPw} className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5" style={{ background: "#f1f5f9", color: "#1a3a6b" }}><KeyRound size={14} /> Password</button></div>
        </div>
      </div>
      <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-red-500 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}><LogOut size={16} /> Sign Out</button>
    </div>
  );
}

/* ─── NAV + MAIN ────────────────────────────────────────────── */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "course", label: "Course", icon: BookOpen },
  { id: "cohort", label: "Cohorts", icon: CalendarCog },
  { id: "pods", label: "Pods", icon: Users },
  { id: "submissions", label: "Submissions", icon: ShieldQuestion },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "tutors", label: "Tutors", icon: Users },
  { id: "payments", label: "Payments", icon: CreditCard },
] as const;

function DashboardTab({ cohorts, students, tutors, onGo }: { cohorts: Cohort[]; students: Profile[]; tutors: Profile[]; onGo: (t: Tab) => void }) {
  const totalPods = cohorts.reduce((a, c) => a + c.podCount, 0);
  const stat = (label: string, value: string | number) => <div className="bg-white rounded-2xl p-5 border border-slate-100" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}><p className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>{value}</p><p className="text-xs mt-0.5 text-slate-400">{label}</p></div>;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Dashboard</h1><p className="text-slate-400 text-sm mt-0.5">BAII Groundtruth Studio</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stat("Cohorts", cohorts.length)}{stat("Pods", totalPods)}{stat("Students", students.length)}{stat("Tutors", tutors.length)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[["course", "Course", BookOpen], ["cohort", "Cohorts & calendar", CalendarCog], ["pods", "Pods", Users], ["submissions", "Submissions & defense", ShieldQuestion], ["students", "Students", GraduationCap], ["payments", "Payments", CreditCard]].map(([id, t, Icon]) => { const I = Icon as typeof BookOpen; return (
        <button key={id as string} onClick={() => onGo(id as Tab)} className="text-left bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}><I size={18} /></div><p className="font-semibold text-slate-700 text-sm">{t as string}</p></button>
      ); })}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [cohorts, setCohorts] = useState<Cohort[]>([]); const [activeCohortId, setActiveCohortId] = useState<string | null>(null);
  const [students, setStudents] = useState<Profile[]>([]); const [tutors, setTutors] = useState<Profile[]>([]);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null); const [adminId, setAdminId] = useState(""); const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [cRes, uRes] = await Promise.all([fetch("/api/admin/cohorts"), fetch("/api/admin/users")]);
    const c = (await cRes.json()).cohorts ?? []; const u = (await uRes.json()).users ?? [];
    setCohorts(c); setStudents(u.filter((x: Profile) => x.role === "student")); setTutors(u.filter((x: Profile) => x.role === "tutor"));
    setActiveCohortId((prev) => prev ?? c[c.length - 1]?.id ?? null);
  }, []);

  useEffect(() => {
    const sb = createClient(); supabaseRef.current = sb;
    async function init() {
      const params = new URLSearchParams(window.location.search); const at = params.get("at"), rt = params.get("rt"); let userId = "", metaRole = "";
      if (at && rt) { window.history.replaceState({}, "", "/lms/admin"); const { data, error } = await sb.auth.setSession({ access_token: at, refresh_token: rt }); if (error || !data.session?.user) { window.location.href = "/lms"; return; } userId = data.session.user.id; metaRole = data.session.user.user_metadata?.role || ""; }
      else { const { data: { session } } = await sb.auth.getSession(); if (!session?.user) { window.location.href = "/lms"; return; } userId = session.user.id; metaRole = session.user.user_metadata?.role || ""; }
      setAdminId(userId);
      const { data: p } = await sb.from("profiles").select("id, full_name, email, phone, role").eq("id", userId).single();
      if ((p?.role || metaRole) !== "admin") { window.location.href = "/lms/student"; return; }
      setAdminProfile((p as Profile) ?? null);
      await fetchAll(); setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => { await supabaseRef.current?.auth.signOut(); window.location.href = "/lms"; };
  const active = cohorts.find((c) => c.id === activeCohortId) ?? null;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} /></div>;

  const page = () => {
    switch (tab) {
      case "dashboard": return <DashboardTab cohorts={cohorts} students={students} tutors={tutors} onGo={setTab} />;
      case "course": return <CourseTab />;
      case "cohort": return <CohortTab cohorts={cohorts} students={students} active={active} onRefresh={fetchAll} onSelect={setActiveCohortId} />;
      case "pods": return <PodsTab cohorts={cohorts} />;
      case "submissions": return <SubmissionsTab active={active} adminId={adminId} />;
      case "students": return <StudentsTab students={students} onRefresh={fetchAll} />;
      case "tutors": return <TutorsTab tutors={tutors} onRefresh={fetchAll} />;
      case "payments": return <PaymentsTab students={students} />;
      case "account": return <AccountTab profile={adminProfile} adminId={adminId} onLogout={handleLogout} onRefresh={fetchAll} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen bg-white border-r border-slate-100">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-100">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/baii-logo.svg" alt="BAII" style={{ width: 36, height: "auto" }} /><div><p className="font-bold text-sm text-slate-800">BAII Admin</p><p className="text-[10px] text-slate-400">Groundtruth Studio</p></div></div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">{NAV.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id as Tab)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: tab === id ? "rgba(26,58,107,0.08)" : "transparent", color: tab === id ? "#1a3a6b" : "#94a3b8" }}><Icon size={17} />{label}</button>)}</nav>
        <div className="px-3 pb-4 border-t border-slate-100 pt-3"><button onClick={() => setTab("account")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: tab === "account" ? "rgba(26,58,107,0.08)" : "transparent", color: tab === "account" ? "#1a3a6b" : "#94a3b8" }}><Shield size={16} /> Account</button><button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50"><LogOut size={16} /> Sign Out</button></div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 flex items-center justify-between px-5 py-3.5">
          <p className="font-bold text-slate-800 text-sm capitalize">{tab === "submissions" ? "Submissions" : tab}</p>
          <div className="flex items-center gap-2"><button onClick={fetchAll} className="text-xs text-slate-400 hover:text-slate-600">Refresh</button><button onClick={() => setTab("account")} title="Account"><Av name={adminProfile?.full_name || "Admin"} size={34} /></button></div>
        </header>
        <main className="flex-1 p-5 md:p-8 overflow-y-auto" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}><div className="max-w-3xl mx-auto"><AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>{page()}</motion.div></AnimatePresence></div></main>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-white border-t border-slate-100 overflow-x-auto" style={{ paddingBottom: "env(safe-area-inset-bottom)", height: "calc(60px + env(safe-area-inset-bottom))" }}>
          {[...NAV, { id: "account", label: "Account", icon: Shield }].map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id as Tab)} className="flex flex-col items-center gap-0.5 px-2.5 py-2 shrink-0"><Icon size={18} style={{ color: tab === id ? "#1a3a6b" : "#94a3b8" }} /><span className="text-[9px] font-semibold" style={{ color: tab === id ? "#1a3a6b" : "#94a3b8" }}>{label}</span></button>)}
        </nav>
      </div>
    </div>
  );
}
