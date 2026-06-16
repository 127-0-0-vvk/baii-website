"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Users, ShieldQuestion, CalendarCog, UserPlus, LogOut, X,
  Plus, ChevronDown, ChevronLeft, ChevronRight, Shield, Link2, Trash2, CheckCircle2, Minus, BookOpen, Radio, Hammer, Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getWeek, semesterTitle, weeksInSemester, themesInSemester, WEEKS_PER_SEM } from "@/lib/ctc";
import { CTC_SEMESTERS } from "@/data/ctc/curriculum";

type Profile = { id: string; email: string; full_name: string; role: string };
type Cohort = { id: string; name: string; program: string; current_sem: number; current_week: number; podCount: number; semStarts: Record<number, string> };
type Pod = { id: string; name: string; discord_url: string | null; charter: string | null; members: { id: string; name: string; email: string }[] };
type Tab = "dashboard" | "course" | "cohort" | "pods" | "defense" | "students" | "account";

function Av({ name, size = 34 }: { name: string; size?: number }) {
  const p = (name || "?").trim().split(" "); const l = p.length >= 2 ? p[0][0] + p[p.length - 1][0] : (p[0] || "?").slice(0, 2);
  return <div className="rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ width: size, height: size, fontSize: size * 0.36, background: "linear-gradient(135deg,#1a3a6b,#c47d2a)" }}>{l.toUpperCase()}</div>;
}

/* ─── COHORT & CALENDAR ─────────────────────────────────────── */
function CohortTab({ cohorts, active, onRefresh, onSelect }: { cohorts: Cohort[]; active: Cohort | null; onRefresh: () => void; onSelect: (id: string) => void }) {
  const [newName, setNewName] = useState("");
  const create = async () => { if (!newName.trim()) return; await fetch("/api/admin/cohorts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) }); setNewName(""); onRefresh(); };
  const patch = async (body: object) => { await fetch("/api/admin/cohorts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: active!.id, ...body }) }); onRefresh(); };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Cohorts & Calendar</h1><p className="text-slate-400 text-sm mt-0.5">A <b>cohort</b> = one batch of students running the 2-year CTC programme together. Create one, set which Sem/Week they&apos;re on, and the semester start dates.</p></div>

      <div className="flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New cohort name (e.g. 2026 Batch A)" className="flex-1 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-white focus:outline-none focus:border-slate-300" />
        <button onClick={create} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><Plus size={15} /> Create</button>
      </div>

      <div className="space-y-2">
        {cohorts.map((c) => (
          <div key={c.id} className="flex items-center gap-2 p-4 rounded-2xl bg-white cursor-pointer" onClick={() => onSelect(c.id)} style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)", border: active?.id === c.id ? "1.5px solid #1a3a6b" : "1px solid transparent" }}>
            <div className="flex-1"><p className="font-semibold text-slate-700 text-sm">{c.name}</p><p className="text-xs text-slate-400">{c.podCount} pods · Sem {c.current_sem} · Week {c.current_week}</p></div>
            {active?.id === c.id && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(26,58,107,0.1)", color: "#1a3a6b" }}>Active</span>}
            <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete cohort "${c.name}"? This removes its pods and submissions.`)) fetch(`/api/admin/cohorts?id=${c.id}`, { method: "DELETE" }).then(onRefresh); }} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={15} /></button>
          </div>
        ))}
        {!cohorts.length && <p className="text-sm text-slate-400">No cohorts yet — create one above.</p>}
      </div>

      {active && (
        <>
          {/* Position control */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Programme position — {active.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <Stepper label="Semester" value={active.current_sem} min={1} max={4} onChange={(v) => patch({ current_sem: v, current_week: 1 })} />
              <Stepper label="Week" value={active.current_week} min={1} max={WEEKS_PER_SEM} onChange={(v) => patch({ current_week: v })} />
            </div>
            {getWeek(active.current_sem, active.current_week) && <p className="text-xs text-slate-500 mt-3">Now: <b>{getWeek(active.current_sem, active.current_week)!.title}</b> — {getWeek(active.current_sem, active.current_week)!.theme}</p>}
          </div>

          {/* Semester start dates */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Semester start dates (Monday of Week 1) — drives the calendar</p>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s}>
                  <label className="text-xs font-semibold text-slate-500">{semesterTitle(s).split(" — ")[0]}</label>
                  <input type="date" defaultValue={active.semStarts[s] ?? ""} onChange={(e) => e.target.value && patch({ sem: s, start_date: e.target.value })} className="w-full mt-1 rounded-xl px-3 py-2 text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:border-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
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

/* ─── PODS ──────────────────────────────────────────────────── */
function PodsTab({ active, students, onRefresh }: { active: Cohort | null; students: Profile[]; onRefresh: () => void }) {
  const [pods, setPods] = useState<Pod[]>([]);
  const [newPod, setNewPod] = useState("");
  const [addTo, setAddTo] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!active) return;
    const r = await fetch(`/api/admin/pods?cohort_id=${active.id}`); setPods((await r.json()).pods ?? []);
  }, [active]);
  useEffect(() => { load(); }, [load]);

  const action = async (body: object) => { await fetch("/api/admin/pods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); await load(); onRefresh(); };
  const assigned = new Set(pods.flatMap((p) => p.members.map((m) => m.id)));

  if (!active) return <p className="text-sm text-slate-400">Select a cohort in the Cohorts tab first.</p>;
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Pods · {active.name}</h1><p className="text-slate-400 text-sm mt-0.5">Teams of 4 — roles rotate automatically each week.</p></div>
      <div className="flex gap-2">
        <input value={newPod} onChange={(e) => setNewPod(e.target.value)} placeholder="New pod name (e.g. Pod 1)" className="flex-1 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-white focus:outline-none focus:border-slate-300" />
        <button onClick={() => { if (newPod.trim()) { action({ action: "create", cohort_id: active.id, name: newPod }); setNewPod(""); } }} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><Plus size={15} /> Add pod</button>
      </div>
      {pods.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-slate-700">{p.name} <span className="text-xs font-normal text-slate-400">· {p.members.length}/4</span></p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setAddTo(addTo === p.id ? null : p.id)} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}><UserPlus size={11} /> Add member</button>
              <button onClick={() => { if (confirm(`Delete ${p.name}?`)) action({ action: "delete", pod_id: p.id }); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {p.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2">
                <Av name={m.name} size={30} />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-700 truncate">{m.name}</p><p className="text-[11px] text-slate-400 truncate">{m.email}</p></div>
                <button onClick={() => action({ action: "remove_member", pod_id: p.id, student_id: m.id })} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
            {!p.members.length && <p className="text-xs text-slate-300 py-2">No members yet</p>}
          </div>
          {addTo === p.id && (
            <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-slate-100">
              {students.filter((s) => !assigned.has(s.id)).map((s) => (
                <button key={s.id} onClick={() => action({ action: "add_member", pod_id: p.id, student_id: s.id })} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left">
                  <Av name={s.full_name} size={26} /><span className="text-sm text-slate-600 flex-1 truncate">{s.full_name}</span><Plus size={13} className="text-slate-400" />
                </button>
              ))}
              {students.filter((s) => !assigned.has(s.id)).length === 0 && <p className="text-xs text-slate-300 px-3 py-2">All students are assigned.</p>}
            </div>
          )}
        </div>
      ))}
      {!pods.length && <p className="text-sm text-slate-400">No pods yet — add one above.</p>}
    </div>
  );
}

/* ─── DEFENSE ───────────────────────────────────────────────── */
type SubRow = { pod_id: string; pod_name: string; submission: { id: string; deliverable_url: string; notes: string | null } | null; defense: { outcome: string; feedback: string | null } | null };
function DefenseTab({ active, adminId, onRefresh }: { active: Cohort | null; adminId: string; onRefresh: () => void }) {
  const [rows, setRows] = useState<SubRow[]>([]);
  const sem = active?.current_sem ?? 1, week = active?.current_week ?? 1;
  const w = getWeek(sem, week);
  const load = useCallback(async () => {
    if (!active) return;
    const r = await fetch(`/api/admin/submissions?cohort_id=${active.id}&sem=${sem}&week=${week}`);
    setRows((await r.json()).rows ?? []);
  }, [active, sem, week]);
  useEffect(() => { load(); }, [load]);

  const record = async (submission_id: string, outcome: string, feedback: string) => {
    await fetch("/api/admin/defense", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submission_id, outcome, feedback, recorded_by: adminId }) });
    await load(); onRefresh();
  };

  if (!active) return <p className="text-sm text-slate-400">Select a cohort first.</p>;
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Friday Defense</h1><p className="text-slate-400 text-sm mt-0.5">{active.name} · {semesterTitle(sem).split(" — ")[0]} · Week {week}{w ? ` — ${w.title}` : ""}</p></div>
      <div className="rounded-xl p-3 flex gap-2.5" style={{ background: "rgba(26,58,107,0.04)", border: "1px solid rgba(26,58,107,0.1)" }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(26,58,107,0.12)", color: "#1a3a6b" }}><span className="text-[10px] font-black">i</span></div>
        <p className="text-xs text-slate-500 leading-relaxed">The defense <b className="text-slate-600">is the assessment</b>. Each pod submits its deliverable, then defends it live — you fire the questions below, and record an outcome per pod. Change the week in <b className="text-slate-600">Cohorts</b>. (Showing this cohort&apos;s current week.)</p>
      </div>
      {w && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.15)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#dc2626" }}>Fire these questions</p>
          <ul className="space-y-1">{w.defense.map((q, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><b style={{ color: "#dc2626" }}>{i + 1}.</b> {q}</li>)}</ul>
        </div>
      )}
      {rows.map((r) => <DefenseRow key={r.pod_id} row={r} onRecord={record} />)}
      {!rows.length && <p className="text-sm text-slate-400">No pods in this cohort yet.</p>}
    </div>
  );
}
function DefenseRow({ row, onRecord }: { row: SubRow; onRecord: (id: string, outcome: string, fb: string) => void }) {
  const [outcome, setOutcome] = useState(row.defense?.outcome ?? "");
  const [fb, setFb] = useState(row.defense?.feedback ?? "");
  const outcomes = [["strong", "Strong", "#16a34a"], ["passed", "Passed", "#1a3a6b"], ["revise", "Revise", "#c47d2a"], ["not_defended", "No-show", "#dc2626"]] as const;
  return (
    <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-700">{row.pod_name}</p>
        {row.submission ? <a href={row.submission.deliverable_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold flex items-center gap-1" style={{ color: "#1a3a6b" }}><Link2 size={12} /> Deliverable</a> : <span className="text-[11px] text-slate-300">No submission</span>}
      </div>
      {row.submission?.notes && <p className="text-xs text-slate-400 mt-1">{row.submission.notes}</p>}
      {row.submission && (
        <div className="mt-3">
          <div className="flex gap-1.5 flex-wrap mb-2">
            {outcomes.map(([val, lbl, col]) => (
              <button key={val} onClick={() => setOutcome(val)} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: outcome === val ? col : "#f1f5f9", color: outcome === val ? "white" : "#64748b" }}>{lbl}</button>
            ))}
          </div>
          <textarea value={fb} onChange={(e) => setFb(e.target.value)} placeholder="Feedback from the defense…" rows={2} className="w-full rounded-xl px-3 py-2 text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:border-slate-300 resize-none mb-2" />
          <button onClick={() => outcome && onRecord(row.submission!.id, outcome, fb)} disabled={!outcome} className="text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-40 flex items-center gap-1.5" style={{ background: "#1a3a6b" }}>
            <CheckCircle2 size={13} /> {row.defense ? "Update" : "Record"} defense
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── STUDENTS ──────────────────────────────────────────────── */
function StudentsTab({ students, cohorts, onRefresh }: { students: Profile[]; cohorts: Cohort[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [assign, setAssign] = useState<Profile | null>(null);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Students</h1><p className="text-slate-400 text-sm mt-0.5">{students.length} students · assign each to a pod to enrol them</p></div>
        <button onClick={() => setOpen(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><UserPlus size={15} /> New student</button>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        {students.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid #f1f5f9" : "none" }}>
            <Av name={s.full_name} size={32} /><div className="flex-1 min-w-0"><p className="font-medium text-slate-700 text-sm truncate">{s.full_name}</p><p className="text-xs text-slate-400 truncate">{s.email}</p></div>
            <button onClick={() => setAssign(s)} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0" style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}><UserPlus size={11} /> Assign to pod</button>
          </div>
        ))}
        {!students.length && <p className="text-sm text-slate-400 p-5 text-center">No students yet.</p>}
      </div>
      {open && <CreateStudent onClose={() => setOpen(false)} onDone={() => { setOpen(false); onRefresh(); }} />}
      {assign && <AssignPodModal student={assign} cohorts={cohorts} onClose={() => setAssign(null)} onDone={() => { setAssign(null); onRefresh(); }} />}
    </div>
  );
}

function AssignPodModal({ student, cohorts, onClose, onDone }: { student: Profile; cohorts: Cohort[]; onClose: () => void; onDone: () => void }) {
  const [cohortId, setCohortId] = useState(cohorts[0]?.id ?? "");
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");

  useEffect(() => {
    if (!cohortId) return;
    setLoading(true);
    fetch(`/api/admin/pods?cohort_id=${cohortId}`).then((r) => r.json()).then((d) => setPods(d.pods ?? [])).finally(() => setLoading(false));
  }, [cohortId]);

  const assignTo = async (pod: Pod) => {
    await fetch("/api/admin/pods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add_member", pod_id: pod.id, student_id: student.id }) });
    setDone(pod.name); onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300"><X size={16} /></button>
        {done ? (
          <div className="text-center py-3"><CheckCircle2 size={36} className="mx-auto mb-3 text-green-500" /><p className="font-bold text-slate-800">{student.full_name} assigned!</p><p className="text-sm text-slate-400 mt-1">Added to {done}</p></div>
        ) : (
          <>
            <p className="font-bold text-slate-800 mb-1">Assign to a pod</p>
            <p className="text-xs text-slate-400 mb-4">Enrolling <span className="font-semibold text-slate-600">{student.full_name}</span> into the CTC programme via a pod.</p>
            <label className="text-[11px] font-semibold text-slate-500">Cohort</label>
            <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} className="w-full mt-1 mb-3 rounded-xl px-3 py-2.5 text-sm border border-slate-200 bg-slate-50 focus:outline-none">
              {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="text-[11px] font-semibold text-slate-500">Pod</label>
            <div className="mt-1 max-h-52 overflow-y-auto space-y-1.5">
              {loading ? <p className="text-xs text-slate-400 py-3 text-center">Loading pods…</p> :
                pods.length ? pods.map((p) => {
                  const has = p.members.some((m) => m.id === student.id);
                  return (
                    <button key={p.id} disabled={has} onClick={() => assignTo(p)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm border disabled:opacity-50" style={{ borderColor: "#e2e8f0", background: "white" }}>
                      <span className="font-medium text-slate-700">{p.name} <span className="text-xs text-slate-400">· {p.members.length}/4</span></span>
                      <span className="text-[11px] font-semibold" style={{ color: has ? "#16a34a" : "#1a3a6b" }}>{has ? "Already in" : "Add →"}</span>
                    </button>
                  );
                }) : <p className="text-xs text-slate-400 py-3 text-center">No pods in this cohort. Create pods in the Pods tab first.</p>}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
function CreateStudent({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setErr("");
    const r = await fetch("/api/admin/create-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json(); if (!r.ok) setErr(j.error ?? "Failed"); else onDone(); setLoading(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300"><X size={16} /></button>
        <h3 className="font-bold text-slate-800 text-lg mb-4" style={{ fontFamily: "var(--font-playfair)" }}>New Student</h3>
        <form onSubmit={submit} className="space-y-3">
          {[["full_name", "Full name", "text"], ["email", "Email", "email"], ["password", "Password (min 8)", "text"]].map(([k, l, t]) => (
            <input key={k} required type={t} placeholder={l} value={f[k as keyof typeof f]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))} className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:border-slate-300" />
          ))}
          {err && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>{loading ? "Creating…" : "Create student"}</button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── COURSE (the 2-year CTC programme, day by day) ─────────── */
const DAY_ICON = (label: string) => /kickoff/i.test(label) ? Radio : /doubt/i.test(label) ? ShieldQuestion : /submit|defend/i.test(label) ? Send : Hammer;

// Course catalogue → cards. Click a course to open its dedicated detail page.
function CourseTab() {
  const [open, setOpen] = useState<string | null>(null);
  if (open === "ctc") return <CourseDetail onBack={() => setOpen(null)} />;
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Courses</h1><p className="text-slate-400 text-sm mt-0.5">BAII programmes. Click a course to see its full day-by-day plan.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CTC course card */}
        <button onClick={() => setOpen("ctc")} className="text-left rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
          <div className="p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full blur-2xl opacity-25" style={{ background: "#c47d2a", transform: "translate(30%,-30%)" }} />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Pillar 1 · Live studio</span>
            <h3 className="text-white font-black text-lg mt-0.5 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>Critical Thinking &amp; Communication</h3>
            <div className="flex flex-wrap gap-1.5 mt-3">{["2 years", "4 semesters", "72 weeks", "Pods of 4"].map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>{t}</span>)}</div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between"><span className="text-xs text-slate-400">Mind → Think → Communicate → Decide &amp; Build</span><span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#1a3a6b" }}>Open <ChevronRight size={13} /></span></div>
        </button>
        {/* Placeholder for future courses */}
        <div className="rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6" style={{ background: "#f8fafc" }}>
          <Plus size={22} className="text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-400">More courses coming</p>
          <p className="text-xs text-slate-300 mt-0.5">New programmes will appear here as cards.</p>
        </div>
      </div>
    </div>
  );
}

function CourseDetail({ onBack }: { onBack: () => void }) {
  const [sem, setSem] = useState(1);
  const [openWeek, setOpenWeek] = useState<number | null>(1);
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#1a3a6b" }}><ChevronLeft size={14} /> All courses</button>
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Critical Thinking &amp; Communication</h1><p className="text-slate-400 text-sm mt-0.5">The 2-year programme · 4 semesters × 18 weeks · day by day. (Content edited in code for now.)</p></div>

      {/* Semester tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CTC_SEMESTERS.map((s) => (
          <button key={s.sem} onClick={() => { setSem(s.sem); setOpenWeek(null); }} className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold" style={{ background: sem === s.sem ? "#1a3a6b" : "white", color: sem === s.sem ? "white" : "#64748b", border: "1px solid #e2e8f0" }}>
            Sem {s.sem}
          </button>
        ))}
      </div>
      <p className="text-sm font-semibold text-slate-600">{semesterTitle(sem)}</p>

      {themesInSemester(sem).map((t) => (
        <div key={t.theme}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.theme}</p>
          <div className="space-y-2">
            {t.weeks.map((wn) => {
              const w = getWeek(sem, wn)!;
              const open = openWeek === wn;
              return (
                <div key={wn} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                  <button onClick={() => setOpenWeek(open ? null : wn)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black text-white" style={{ background: "#1a3a6b" }}>{wn}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-slate-700 text-sm">{w.title}</p><p className="text-[11px] text-slate-400 truncate">{w.objective}</p></div>
                    {w.rooted && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(196,125,42,0.12)", color: "#c47d2a" }}>rooted</span>}
                    <ChevronDown size={15} className="text-slate-300 shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-50 pt-3">
                      <p className="text-xs text-slate-500"><b className="text-slate-600">You gain:</b> {w.gain}</p>
                      <div className="space-y-1.5">
                        {w.days.map((d) => {
                          const Icon = DAY_ICON(d.label);
                          return (
                            <div key={d.day} className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: d.live ? "rgba(220,38,38,0.1)" : "rgba(26,58,107,0.07)", color: d.live ? "#dc2626" : "#1a3a6b" }}><Icon size={13} /></div>
                              <div className="flex-1"><p className="text-[11px] font-bold text-slate-600">{d.day} · {d.label} <span className="font-semibold" style={{ color: d.live ? "#dc2626" : "#94a3b8" }}>· {d.live ? "LIVE" : "SUPPORT"}</span></p><p className="text-[11px] text-slate-500">{d.text}</p></div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="rounded-xl p-2.5" style={{ background: "rgba(196,125,42,0.06)" }}><p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#c47d2a" }}>Deliverable</p><p className="text-xs text-slate-600">{w.deliverable}</p></div>
                      <div className="rounded-xl p-2.5" style={{ background: "rgba(220,38,38,0.05)" }}><p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#dc2626" }}>Friday defense</p><ul className="space-y-0.5">{w.defense.map((q, i) => <li key={i} className="text-xs text-slate-600 flex gap-1.5"><b style={{ color: "#dc2626" }}>{i + 1}.</b> {q}</li>)}</ul></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── DASHBOARD (overview) ──────────────────────────────────── */
function DashboardTab({ cohorts, students, onGo }: { cohorts: Cohort[]; students: Profile[]; onGo: (t: Tab) => void }) {
  const totalPods = cohorts.reduce((a, c) => a + c.podCount, 0);
  const stat = (label: string, value: string | number, color: string) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-100" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
      <p className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color }}>{label}</p>
    </div>
  );
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Dashboard</h1><p className="text-slate-400 text-sm mt-0.5">BAII Groundtruth Studio · Critical Thinking & Communication</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stat("Cohorts", cohorts.length, "#1a3a6b")}
        {stat("Pods", totalPods, "#c47d2a")}
        {stat("Students", students.length, "#4a9fd4")}
        {stat("Program", "2-yr CTC", "#16a34a")}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[["course", "View the course", "All 4 semesters, week by week", BookOpen], ["cohort", "Cohorts & calendar", "Set the week, dates", CalendarCog], ["pods", "Manage pods", "Teams of 4 + members", Users], ["defense", "Friday defense", "Record outcomes", ShieldQuestion]].map(([id, t, d, Icon]) => {
          const I = Icon as typeof BookOpen;
          return (
            <button key={id as string} onClick={() => onGo(id as Tab)} className="text-left bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}><I size={18} /></div>
              <div><p className="font-semibold text-slate-700 text-sm">{t as string}</p><p className="text-xs text-slate-400">{d as string}</p></div>
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(26,58,107,0.04)", border: "1px solid rgba(26,58,107,0.1)" }}>
        <p className="text-sm font-semibold text-slate-700 mb-1">More analytics coming here</p>
        <p className="text-xs text-slate-500">Pod progress, defense outcomes over the semester, attendance and submissions — this overview will fill in as cohorts run.</p>
      </div>
    </div>
  );
}

/* ─── NAV + MAIN ────────────────────────────────────────────── */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "course", label: "Course", icon: BookOpen },
  { id: "cohort", label: "Cohorts", icon: CalendarCog },
  { id: "pods", label: "Pods", icon: Users },
  { id: "defense", label: "Defense", icon: ShieldQuestion },
  { id: "students", label: "Students", icon: Users },
] as const;

export default function AdminDashboard() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [activeCohortId, setActiveCohortId] = useState<string | null>(null);
  const [students, setStudents] = useState<Profile[]>([]);
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminId, setAdminId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [cRes, uRes] = await Promise.all([fetch("/api/admin/cohorts"), fetch("/api/admin/users")]);
    const c = (await cRes.json()).cohorts ?? []; const u = (await uRes.json()).users ?? [];
    setCohorts(c); setStudents(u.filter((x: Profile) => x.role === "student"));
    setActiveCohortId((prev) => prev ?? c[c.length - 1]?.id ?? null);
  }, []);

  useEffect(() => {
    const sb = createClient(); supabaseRef.current = sb;
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const at = params.get("at"), rt = params.get("rt"); let userId = "", metaRole = "";
      if (at && rt) { window.history.replaceState({}, "", "/lms/admin"); const { data, error } = await sb.auth.setSession({ access_token: at, refresh_token: rt }); if (error || !data.session?.user) { window.location.href = "/lms"; return; } userId = data.session.user.id; metaRole = data.session.user.user_metadata?.role || ""; setAdminName(data.session.user.user_metadata?.full_name || "Admin"); setAdminEmail(data.session.user.email || ""); }
      else { const { data: { session } } = await sb.auth.getSession(); if (!session?.user) { window.location.href = "/lms"; return; } userId = session.user.id; metaRole = session.user.user_metadata?.role || ""; setAdminName(session.user.user_metadata?.full_name || "Admin"); setAdminEmail(session.user.email || ""); }
      setAdminId(userId);
      const { data: p } = await sb.from("profiles").select("role, full_name").eq("id", userId).single();
      if ((p?.role || metaRole) !== "admin") { window.location.href = "/lms/student"; return; }
      if (p?.full_name) setAdminName(p.full_name);
      await fetchAll(); setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => { await supabaseRef.current?.auth.signOut(); window.location.href = "/lms"; };
  const active = cohorts.find((c) => c.id === activeCohortId) ?? null;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} /></div>;

  const page = () => {
    if (tab === "dashboard") return <DashboardTab cohorts={cohorts} students={students} onGo={setTab} />;
    if (tab === "course") return <CourseTab />;
    if (tab === "cohort") return <CohortTab cohorts={cohorts} active={active} onRefresh={fetchAll} onSelect={setActiveCohortId} />;
    if (tab === "pods") return <PodsTab active={active} students={students} onRefresh={fetchAll} />;
    if (tab === "defense") return <DefenseTab active={active} adminId={adminId} onRefresh={fetchAll} />;
    if (tab === "students") return <StudentsTab students={students} cohorts={cohorts} onRefresh={fetchAll} />;
    return (
      <div className="space-y-5 max-w-lg">
        <h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Account</h1>
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <div className="p-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}><Av name={adminName} size={56} /><div><p className="font-black text-white text-xl" style={{ fontFamily: "var(--font-playfair)" }}>{adminName}</p><span className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(196,125,42,0.25)", color: "#e8be72" }}><Shield size={10} /> Lecturer</span></div></div>
          <div className="px-5 py-3.5 text-sm text-slate-600">{adminEmail}</div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-red-500 text-sm font-medium hover:bg-red-50"><LogOut size={15} /> Sign Out</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen bg-white border-r border-slate-100">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/baii-logo.svg" alt="BAII" style={{ width: 36, height: "auto" }} /><div><p className="font-bold text-sm text-slate-800">BAII Lecturer</p><p className="text-[10px] text-slate-400">Groundtruth Studio</p></div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id as Tab)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: tab === id ? "rgba(26,58,107,0.08)" : "transparent", color: tab === id ? "#1a3a6b" : "#94a3b8" }}><Icon size={17} />{label}</button>)}
        </nav>
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <button onClick={() => setTab("account")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: tab === "account" ? "rgba(26,58,107,0.08)" : "transparent", color: tab === "account" ? "#1a3a6b" : "#94a3b8" }}><UserCircleIcon /> Account</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50"><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 flex items-center justify-between px-5 py-3.5">
          <p className="font-bold text-slate-800 text-sm capitalize">{tab}</p>
          <div className="flex items-center gap-2"><button onClick={fetchAll} className="text-xs text-slate-400 hover:text-slate-600">Refresh</button><Av name={adminName} size={34} /></div>
        </header>
        <main className="flex-1 p-5 md:p-8 overflow-y-auto" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}><div className="max-w-3xl mx-auto"><AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>{page()}</motion.div></AnimatePresence></div></main>
        {/* mobile nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-white border-t border-slate-100" style={{ paddingBottom: "env(safe-area-inset-bottom)", height: "calc(64px + env(safe-area-inset-bottom))" }}>
          {[...NAV, { id: "account", label: "Account", icon: Shield }].map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id as Tab)} className="flex flex-col items-center gap-1 px-2 py-2"><Icon size={19} style={{ color: tab === id ? "#1a3a6b" : "#94a3b8" }} /><span className="text-[10px] font-semibold" style={{ color: tab === id ? "#1a3a6b" : "#94a3b8" }}>{label}</span></button>)}
        </nav>
      </div>
    </div>
  );
}
function UserCircleIcon() { return <Users size={17} />; }
