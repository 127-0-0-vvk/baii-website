"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays, Users, UserCircle, LogOut, Bell, Target, Radio, Hammer,
  ShieldQuestion, Send, CheckCircle2, Clock, MessageSquare, Sparkles, School, Mail, Phone, MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getWeek, weeksInSemester, themesInSemester, semesterTitle, weekDates, ROLE_BLURB, type PodRole,
} from "@/lib/ctc";

type Profile = { id: string; full_name: string; email: string; phone: string | null; school: string | null; city: string | null; role: string };
type PodMember = { id: string; name: string; role: PodRole | null; you: boolean };
type CtcData = {
  enrolled: boolean;
  pod?: { id: string; name: string; discord_url: string | null; charter: string | null; members: PodMember[] };
  sem?: number; week?: number; yourRole?: PodRole | null;
  submission?: { id: string; deliverable_url: string; notes: string | null; submitted_at: string } | null;
  defense?: { outcome: string; feedback: string | null } | null;
  semStart?: string | null;
};

type Tab = "week" | "calendar" | "pod" | "account";
const NAV = [
  { id: "week", label: "This Week", icon: Target },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "pod", label: "My Pod", icon: Users },
] as const;

const DAY_ICON = (label: string) =>
  /kickoff/i.test(label) ? Radio : /doubt/i.test(label) ? ShieldQuestion : /submit|defend/i.test(label) ? Send : Hammer;

function Initials({ name, size = 38 }: { name: string; size?: number }) {
  const p = (name || "?").trim().split(" ");
  const l = p.length >= 2 ? p[0][0] + p[p.length - 1][0] : (p[0] || "?").slice(0, 2);
  return <div className="flex items-center justify-center rounded-full font-bold text-white shrink-0" style={{ width: size, height: size, background: "linear-gradient(135deg,#1a3a6b,#c47d2a)", fontSize: size * 0.36 }}>{l.toUpperCase()}</div>;
}

/* ─── THIS WEEK ─────────────────────────────────────────────── */
function ThisWeek({ data, profileId }: { data: CtcData; profileId: string }) {
  const sem = data.sem ?? 1, week = data.week ?? 1;
  const w = getWeek(sem, week);
  const [link, setLink] = useState(data.submission?.deliverable_url ?? "");
  const [notes, setNotes] = useState(data.submission?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(!!data.submission);

  if (!w) return <p className="text-slate-400 text-sm">This week&apos;s mission isn&apos;t available yet.</p>;

  const submit = async () => {
    if (!link.trim() || submitting || !data.pod) return;
    setSubmitting(true);
    await fetch("/api/student/ctc-submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: profileId, pod_id: data.pod.id, sem, week, deliverable_url: link, notes }) });
    setSubmitting(false); setSaved(true);
  };

  return (
    <div className="space-y-5">
      {/* Mission header */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-2xl" style={{ background: "rgba(196,125,42,0.3)", transform: "translate(30%,-30%)" }} />
        <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">{semesterTitle(sem)} · Week {week} of 18</p>
        <p className="text-white/70 text-xs mt-0.5">{w.theme}{w.rooted ? " · rooted inquiry" : ""}</p>
        <h1 className="text-white font-black text-2xl mt-1 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>{w.title}</h1>
        <p className="text-white/85 text-sm mt-2">{w.objective}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px]" style={{ background: "rgba(255,255,255,0.14)", color: "#e8be72" }}>
          <Sparkles size={11} /> You gain: {w.gain}
        </div>
        {data.yourRole && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] ml-2" style={{ background: "rgba(255,255,255,0.14)", color: "white" }}>
            Your role this week: <b>{data.yourRole}</b>
          </div>
        )}
      </div>

      {/* 5-day plan */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">This week&apos;s rhythm</p>
        <div className="space-y-2">
          {w.days.map((d) => {
            const Icon = DAY_ICON(d.label);
            return (
              <div key={d.day} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: d.live ? "rgba(220,38,38,0.1)" : "rgba(26,58,107,0.08)", color: d.live ? "#dc2626" : "#1a3a6b" }}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{d.day} · {d.label}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: d.live ? "#fef2f2" : "#f1f5f9", color: d.live ? "#dc2626" : "#64748b" }}>{d.live ? "LIVE" : "SUPPORT"}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{d.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deliverable */}
      <div className="rounded-2xl p-4 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#c47d2a" }}>Interactive deliverable</p>
        <p className="text-sm text-slate-700">{w.deliverable}</p>
      </div>

      {/* Defense questions */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.15)" }}>
        <div className="flex items-center gap-2 mb-2"><ShieldQuestion size={14} style={{ color: "#dc2626" }} /><p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#dc2626" }}>Friday defense — prepare answers</p></div>
        <ul className="space-y-1.5">
          {w.defense.map((q, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="font-bold" style={{ color: "#dc2626" }}>{i + 1}.</span> {q}</li>)}
        </ul>
        <p className="text-[11px] text-slate-400 mt-2">The defense is the assessment — a polished submission earns nothing on its own.</p>
      </div>

      {/* Submit */}
      <div className="rounded-2xl p-4 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-slate-500">Submit your pod&apos;s deliverable</p>
        {!data.pod ? (
          <div className="rounded-xl p-3" style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
            <p className="text-sm text-slate-500">You&apos;re enrolled, but not in a pod yet. Once your tutor places you in a pod, you&apos;ll submit your deliverable here.</p>
          </div>
        ) : data.defense ? (
          <div className="rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <p className="text-sm font-bold" style={{ color: "#15803d" }}>Defended — {data.defense.outcome}</p>
            {data.defense.feedback && <p className="text-xs text-slate-600 mt-1">{data.defense.feedback}</p>}
          </div>
        ) : (
          <>
            <input value={link} onChange={(e) => { setLink(e.target.value); setSaved(false); }} placeholder="Link to your recorded deliverable (Drive, YouTube, Loom…)"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 mb-2" />
            <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} placeholder="Notes for the lecturer (optional)" rows={2}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none mb-2" />
            <button onClick={submit} disabled={!link.trim() || submitting} className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
              {submitting ? "Saving…" : saved ? <><CheckCircle2 size={15} /> Submitted — update anytime before defense</> : <><Send size={15} /> Submit deliverable</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── CALENDAR ──────────────────────────────────────────────── */
function CalendarTab({ data }: { data: CtcData }) {
  const sem = data.sem ?? 1, week = data.week ?? 1;
  const start = data.semStart ? new Date(data.semStart + "T00:00:00") : null;
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>{semesterTitle(sem)}</h1><p className="text-slate-400 text-sm mt-0.5">18 weeks · you are on Week {week}</p></div>
      {themesInSemester(sem).map((t) => (
        <div key={t.theme}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.theme}</p>
          <div className="space-y-2">
            {t.weeks.map((wn) => {
              const w = getWeek(sem, wn); if (!w) return null;
              const current = wn === week, past = wn < week;
              const dates = start ? weekDates(start, wn) : null;
              return (
                <div key={wn} className="flex items-center gap-3 p-3 rounded-2xl bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)", opacity: past ? 0.7 : 1, border: current ? "1.5px solid #1a3a6b" : "1px solid transparent" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black" style={{ background: current ? "#1a3a6b" : "#f1f5f9", color: current ? "white" : "#94a3b8" }}>{wn}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{w.title}</p>
                    {dates ? <p className="text-[11px] text-slate-400">{fmt(dates.mon)} – {fmt(dates.fri)} · defend Fri</p> : <p className="text-[11px] text-slate-400 truncate">{w.objective}</p>}
                  </div>
                  {current && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(26,58,107,0.1)", color: "#1a3a6b" }}>This week</span>}
                  {past && <CheckCircle2 size={15} className="text-green-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── POD ───────────────────────────────────────────────────── */
function PodTab({ data }: { data: CtcData }) {
  const pod = data.pod;
  if (!pod) return null;
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
        <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Your pod</p>
        <h1 className="text-white font-black text-2xl mt-0.5" style={{ fontFamily: "var(--font-playfair)" }}>{pod.name}</h1>
        {pod.discord_url && <a href={pod.discord_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}><MessageSquare size={12} /> Open Discord channel</a>}
      </div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">Members · roles rotate weekly</p>
        <div className="divide-y divide-slate-50">
          {pod.members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Initials name={m.name} size={36} />
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-700 truncate">{m.name}{m.you && <span className="text-[10px] text-slate-400 ml-1">(you)</span>}</p>{m.role && <p className="text-[11px] text-slate-400">{ROLE_BLURB[m.role]}</p>}</div>
              {m.role && <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}>{m.role}</span>}
            </div>
          ))}
        </div>
      </div>
      {pod.charter && (
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pod charter</p>
          <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{pod.charter}</p>
        </div>
      )}
    </div>
  );
}

/* ─── ACCOUNT ───────────────────────────────────────────────── */
function AccountTab({ profile, onLogout }: { profile: Profile; onLogout: () => void }) {
  const info = [
    { icon: <Mail size={15} />, label: "Email", value: profile.email },
    { icon: <Phone size={15} />, label: "Phone", value: profile.phone || "Not set" },
    { icon: <School size={15} />, label: "School", value: profile.school || "Not set" },
    { icon: <MapPin size={15} />, label: "City", value: profile.city || "Not set" },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
        <div className="flex justify-center mb-3"><Initials name={profile.full_name || "Student"} size={72} /></div>
        <h2 className="text-white font-black text-xl" style={{ fontFamily: "var(--font-playfair)" }}>{profile.full_name}</h2>
        <p className="text-white/60 text-sm mt-0.5">{profile.email}</p>
      </div>
      <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        {info.map((it, i) => (
          <div key={it.label} className="flex items-center gap-4 px-5 py-3.5" style={{ borderTop: i ? "1px solid #f1f5f9" : "none" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(26,58,107,0.07)", color: "#1a3a6b" }}>{it.icon}</div>
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">{it.label}</p><p className={`text-sm font-medium ${it.value === "Not set" ? "text-slate-300 italic" : "text-slate-700"}`}>{it.value}</p></div>
          </div>
        ))}
      </div>
      <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-red-500 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}><LogOut size={16} /> Sign Out</button>
    </div>
  );
}

/* ─── EMPTY STATE ───────────────────────────────────────────── */
function NotEnrolled() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(26,58,107,0.06)" }}><Clock size={30} style={{ color: "#1a3a6b", opacity: 0.4 }} /></div>
      <p className="font-bold text-slate-700 mb-1">Your programme is being set up</p>
      <p className="text-sm text-slate-400 max-w-xs">You&apos;ll see your pod, your weekly mission, and the calendar here once the BAII team places you in a pod. Hang tight!</p>
    </div>
  );
}

/* ─── MAIN ──────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [data, setData] = useState<CtcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("week");

  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;
    const loadProfile = async (userId: string) => {
      const { data: p } = await supabase.from("profiles").select("id, full_name, email, phone, school, city, role").eq("id", userId).single();
      if (p?.role === "admin") { window.location.href = "/lms/admin"; return; }
      const prof = (p as Profile) ?? { id: userId, full_name: "Student", email: "", phone: null, school: null, city: null, role: "student" };
      setProfile(prof);
      try { const r = await fetch(`/api/student/ctc?student_id=${userId}`); setData(await r.json()); } catch { setData({ enrolled: false }); }
      setLoading(false);
    };
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const at = params.get("at"), rt = params.get("rt");
      if (at && rt) {
        window.history.replaceState({}, "", "/lms/student");
        const { data: d, error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
        if (error || !d.session?.user) { window.location.href = "/lms"; return; }
        loadProfile(d.session.user.id); return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { window.location.href = "/lms"; return; }
      loadProfile(session.user.id);
    }
    init();
  }, []);

  const handleLogout = async () => { await supabaseRef.current?.auth.signOut(); router.push("/lms"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} /></div>;
  if (!profile) return null;

  const enrolled = !!data?.enrolled;
  const renderTab = () => {
    if (tab === "account") return <AccountTab profile={profile} onLogout={handleLogout} />;
    if (!enrolled || !data) return <NotEnrolled />;
    if (tab === "week") return <ThisWeek data={data} profileId={profile.id} />;
    if (tab === "calendar") return <CalendarTab data={data} />;
    if (tab === "pod") return <PodTab data={data} />;
    return null;
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f1f5f9" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen bg-white" style={{ borderRight: "1px solid #e2e8f0" }}>
        <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/baii-logo.svg" alt="BAII" style={{ width: 36, height: "auto" }} />
          <div><p className="font-bold text-sm" style={{ color: "#1a3a6b" }}>BAII Studio</p><p className="text-[10px] text-slate-400">Critical Thinking</p></div>
        </div>
        <div className="px-4 py-4 mx-3 mt-4 rounded-2xl flex items-center gap-3" style={{ background: "#f8fafc" }}>
          <Initials name={profile.full_name} size={38} />
          <div className="min-w-0"><p className="font-semibold text-sm text-slate-700 truncate">{profile.full_name}</p>{data?.pod && <p className="text-[10px] text-slate-400 truncate">{data.pod.name}</p>}</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as Tab)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: tab === id ? "rgba(26,58,107,0.08)" : "transparent", color: tab === id ? "#1a3a6b" : "#94a3b8" }}><Icon size={18} />{label}</button>
          ))}
        </nav>
        <div className="px-3 pb-4 space-y-1" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => setTab("account")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: tab === "account" ? "rgba(26,58,107,0.08)" : "transparent", color: tab === "account" ? "#1a3a6b" : "#94a3b8" }}><UserCircle size={18} /> Account</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400"><LogOut size={18} /> Sign Out</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3.5" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0" }}>
          <div className="flex items-center gap-2 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/baii-logo.svg" alt="BAII" style={{ width: 30, height: "auto" }} />
            <span className="font-bold text-sm" style={{ color: "#1a3a6b" }}>{NAV.find((n) => n.id === tab)?.label ?? "Account"}</span>
          </div>
          <h1 className="hidden lg:block font-black text-lg" style={{ color: "#1a3a6b", fontFamily: "var(--font-playfair)" }}>{tab === "account" ? "Account" : NAV.find((n) => n.id === tab)?.label}</h1>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f1f5f9" }}><Bell size={16} style={{ color: "#64748b" }} /></button>
            <button onClick={() => setTab("account")}><Initials name={profile.full_name} size={36} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
          <div className="max-w-2xl mx-auto lg:max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>{renderTab()}</motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid #e2e8f0", paddingBottom: "env(safe-area-inset-bottom)", height: "calc(64px + env(safe-area-inset-bottom))" }}>
          {[...NAV, { id: "account", label: "Account", icon: UserCircle }].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as Tab)} className="flex flex-col items-center gap-1 px-3 py-2" style={{ minWidth: 56 }}>
              <Icon size={20} strokeWidth={tab === id ? 2.3 : 1.7} style={{ color: tab === id ? "#1a3a6b" : "#94a3b8" }} />
              <span className="text-[10px] font-semibold" style={{ color: tab === id ? "#1a3a6b" : "#94a3b8" }}>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
