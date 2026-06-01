"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Users, ClipboardList, CreditCard,
  LogOut, Plus, X, Eye, EyeOff, Download, RefreshCw,
  CheckCircle2, XCircle, Clock, ChevronRight, Search,
  BookOpen, GraduationCap, Zap, Cpu, MoreHorizontal,
  UserPlus, Settings, Bell, Shield, School, MapPin, Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

/* ─── types ───────────────────────────────────────────────── */
type Profile = { id: string; email: string; full_name: string; role: string; phone: string | null; school: string | null; city: string | null; created_at: string; };
type EnrollRequest = { id: string; full_name: string; phone: string; school: string; city: string; course_code: string; status: string; created_at: string; };
type Tab = "dashboard" | "users" | "enrollments" | "payments";

const COURSES = [
  { code: "ETF",  label: "Energy Foundation",         track: "energy" },
  { code: "ET01", label: "Solar & Storage",            track: "energy" },
  { code: "ET02", label: "Wind Systems",               track: "energy" },
  { code: "ET03", label: "Hydrogen & Fuel Cells",      track: "energy" },
  { code: "ET04", label: "Grid Integration",           track: "energy" },
  { code: "ET05", label: "Energy Materials Science",   track: "energy" },
  { code: "SCF",  label: "Semiconductor Foundation",   track: "semi" },
  { code: "SC01", label: "Chip Design Fundamentals",   track: "semi" },
  { code: "SC02", label: "Power Semiconductors",       track: "semi" },
  { code: "SC03", label: "Sensors & MEMS",             track: "semi" },
];

/* ─── Initials avatar ─────────────────────────────────────── */
function Av({ name, size = 32 }: { name: string; size?: number }) {
  const p = (name || "?").trim().split(" ");
  const l = p.length >= 2 ? p[0][0] + p[p.length - 1][0] : (p[0] || "?").slice(0, 2);
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36, background: "linear-gradient(135deg,#1a3a6b,#c47d2a)" }}>
      {l.toUpperCase()}
    </div>
  );
}

/* ─── Status badge ────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    pending:  { bg: "#fff7ed", color: "#c47d2a", icon: <Clock size={11} /> },
    approved: { bg: "#f0fdf4", color: "#16a34a", icon: <CheckCircle2 size={11} /> },
    rejected: { bg: "#fef2f2", color: "#dc2626", icon: <XCircle size={11} /> },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── Stat card ───────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, color }}>{icon}</div>
        <MoreHorizontal size={16} className="text-slate-300" />
      </div>
      <p className="text-2xl font-black text-slate-800 mb-0.5" style={{ fontFamily: "var(--font-playfair)" }}>{value}</p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {sub && <p className="text-[11px] text-slate-300 mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Assign Course Modal ─────────────────────────────────── */
function AssignModal({ user, onClose, onDone }: { user: Profile; onClose: () => void; onDone: () => void }) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [err, setErr] = useState("");

  const assign = async () => {
    if (!selected) return;
    setLoading(true); setErr("");
    const res = await fetch("/api/admin/assign-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: user.id, course_code: selected }),
    });
    const json = await res.json();
    if (!res.ok) setErr(json.error);
    else { setDone(json.course); onDone(); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={16} /></button>

        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={36} className="mx-auto mb-3" style={{ color: "#16a34a" }} />
            <p className="font-bold text-slate-800 text-lg" style={{ fontFamily: "var(--font-playfair)" }}>Enrolled!</p>
            <p className="text-slate-500 text-sm mt-1">{user.full_name} → {done}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <Av name={user.full_name} size={40} />
              <div>
                <p className="font-bold text-slate-800">{user.full_name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Assign to Course</p>
            <div className="space-y-1.5 mb-5 max-h-64 overflow-y-auto">
              {["energy", "semi"].map(track => (
                <div key={track}>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-2 py-1.5">{track === "energy" ? "⚡ Energy Track" : "💡 Semiconductor Track"}</p>
                  {COURSES.filter(c => c.track === track).map(c => (
                    <button key={c.code} onClick={() => setSelected(c.code)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                      style={{ background: selected === c.code ? "rgba(26,58,107,0.08)" : "transparent", color: selected === c.code ? "#1a3a6b" : "#64748b" }}>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ background: selected === c.code ? "#1a3a6b" : "#f1f5f9", color: selected === c.code ? "white" : "#94a3b8" }}>{c.code}</span>
                      {c.label}
                      {selected === c.code && <CheckCircle2 size={14} className="ml-auto" style={{ color: "#1a3a6b" }} />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            {err && <p className="text-red-500 text-xs mb-3 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
            <button onClick={assign} disabled={!selected || loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
              {loading ? "Enrolling…" : "Enroll Student →"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Create User Modal ───────────────────────────────────── */
function CreateUserModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", school: "", city: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ email: string; password: string; full_name: string; emailSent: boolean } | null>(null);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr("");
    const res = await fetch("/api/admin/create-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    if (!res.ok) setErr(json.error ?? "Failed");
    else { setSuccess({ ...json.credentials, emailSent: json.emailSent }); onDone(); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={16} /></button>

        {success ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center"><CheckCircle2 size={20} className="text-green-500" /></div>
              <div><p className="font-bold text-slate-800">Account Created!</p><p className="text-xs text-slate-400">{success.full_name}</p></div>
            </div>
            <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              {[["Login URL", "baii.in/lms"], ["Email", success.email], ["Password", success.password]].map(([l, v]) => (
                <div key={l}><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">{l}</p><p className="text-sm font-mono font-semibold text-slate-700">{v}</p></div>
              ))}
            </div>
            <p className="text-xs mb-4" style={{ color: success.emailSent ? "#16a34a" : "#f97316" }}>
              {success.emailSent ? "✓ Credentials emailed to student" : "⚠ Share credentials manually"}
            </p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>Done</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-slate-800 text-lg mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Create Student</h3>
            <p className="text-slate-400 text-xs mb-5">Student receives login credentials via email.</p>
            <form onSubmit={submit} className="space-y-3">
              {[{ k: "full_name", l: "Full Name", t: "text", p: "Student name" }, { k: "email", l: "Email", t: "email", p: "student@email.com" }, { k: "phone", l: "Phone", t: "text", p: "+91 98765 43210" }, { k: "school", l: "School", t: "text", p: "School name" }, { k: "city", l: "City", t: "text", p: "City" }].map(({ k, l, t, p }) => (
                <div key={k}><label className="text-xs font-semibold text-slate-500 mb-1 block">{l}</label>
                  <input required={k === "full_name" || k === "email"} type={t} placeholder={p} value={form[k as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors" />
                </div>
              ))}
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Password</label>
                <div className="relative">
                  <input required type={showPw ? "text" : "password"} placeholder="Min 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
              </div>
              {err && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{err}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-1 disabled:opacity-50 hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating…</span> : "Create & Send Credentials →"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ─── DASHBOARD page ──────────────────────────────────────── */
function DashboardPage({ users, enrollments }: { users: Profile[]; enrollments: EnrollRequest[] }) {
  const students = users.filter(u => u.role === "student");
  const pending = enrollments.filter(e => e.status === "pending").length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Welcome back, Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Total Students" value={students.length} color="#1a3a6b" />
        <StatCard icon={<ClipboardList size={20} />} label="Pending Enrollments" value={pending} color="#c47d2a" />
        <StatCard icon={<BookOpen size={20} />} label="Active Courses" value={10} sub="ETF to SC03" color="#4a9fd4" />
        <StatCard icon={<CreditCard size={20} />} label="Payments" value="—" sub="Coming soon" color="#7c3aed" />
      </div>

      {/* Recent students */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
          <p className="font-bold text-slate-700 text-sm">Recent Students</p>
        </div>
        {students.length === 0 ? (
          <div className="px-5 py-10 text-center"><Users size={28} className="mx-auto mb-2 text-slate-200" /><p className="text-sm text-slate-400">No students yet</p></div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {students.slice(0, 5).map((u) => (
                <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Av name={u.full_name} size={32} />
                      <div><p className="font-semibold text-slate-700 text-sm">{u.full_name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{u.city || "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── USERS page ──────────────────────────────────────────── */
function UsersPage({ users, onRefresh }: { users: Profile[]; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [assignUser, setAssignUser] = useState<Profile | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = users.filter(u =>
    u.role === "student" &&
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()) ||
     u.school?.toLowerCase().includes(search.toLowerCase()) || "")
  );

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Students</h1><p className="text-slate-400 text-sm mt-0.5">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</p></div>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
            <UserPlus size={15} /> New Student
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, school…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-colors" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Student", "School", "City", "Phone", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-300 text-sm">
                  {search ? "No students match your search" : "No students yet. Create the first one above."}
                </td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Av name={u.full_name} size={34} />
                      <div><p className="font-semibold text-slate-700">{u.full_name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{u.school || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{u.city || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{u.phone || "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setAssignUser(u)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                      style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}>
                      <GraduationCap size={13} /> Assign Course
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assignUser && <AssignModal user={assignUser} onClose={() => setAssignUser(null)} onDone={() => setAssignUser(null)} />}
      {createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} onDone={() => { setCreateOpen(false); onRefresh(); }} />}
    </>
  );
}

/* ─── ENROLLMENTS page ────────────────────────────────────── */
function EnrollmentsPage({ enrollments, onRefresh }: { enrollments: EnrollRequest[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = enrollments.filter(e => filter === "all" || e.status === filter);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch("/api/admin/enrollments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    onRefresh();
    setUpdating(null);
  };

  const exportCSV = () => {
    const rows = [["Name","Phone","School","City","Course","Status","Date"], ...enrollments.map(e => [e.full_name,e.phone,e.school,e.city,e.course_code,e.status,new Date(e.created_at).toLocaleDateString("en-IN")])];
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "enrollments.csv" }).click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Enrollments</h1><p className="text-slate-400 text-sm mt-0.5">{enrollments.length} total requests</p></div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all","pending","approved","rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{ background: filter === f ? "#1a3a6b" : "#f1f5f9", color: filter === f ? "white" : "#94a3b8" }}>
            {f} {f === "all" ? `(${enrollments.length})` : `(${enrollments.filter(e => e.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Name","School","City","Course","Status","Date","Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-300 text-sm">No enrollment requests yet</td></tr>
            ) : filtered.map((e) => (
              <tr key={e.id} className="border-t border-slate-50 hover:bg-slate-50/40 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-700">{e.full_name}<div className="text-xs text-slate-400">{e.phone}</div></td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{e.school}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{e.city}</td>
                <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-[11px] font-bold" style={{ background: "rgba(196,125,42,0.1)", color: "#c47d2a" }}>{e.course_code}</span></td>
                <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(e.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3.5">
                  {e.status === "pending" && (
                    <div className="flex gap-1.5">
                      <button disabled={updating === e.id} onClick={() => updateStatus(e.id, "approved")}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                        style={{ background: "#f0fdf4", color: "#16a34a" }}>Approve</button>
                      <button disabled={updating === e.id} onClick={() => updateStatus(e.id, "rejected")}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                        style={{ background: "#fef2f2", color: "#dc2626" }}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── PAYMENTS page ───────────────────────────────────────── */
function PaymentsPage() {
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Payments</h1><p className="text-slate-400 text-sm mt-0.5">Track and manage student payments</p></div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<CreditCard size={20} />} label="Total Collected" value="₹0" color="#7c3aed" />
        <StatCard icon={<Clock size={20} />} label="Pending" value="₹0" color="#c47d2a" />
        <StatCard icon={<CheckCircle2 size={20} />} label="This Month" value="₹0" color="#16a34a" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
        <div className="px-5 py-4 border-b border-slate-50"><p className="font-bold text-slate-700 text-sm">Payment History</p></div>
        <div className="px-5 py-16 text-center">
          <CreditCard size={32} className="mx-auto mb-3" style={{ color: "rgba(0,0,0,0.08)" }} />
          <p className="font-semibold text-slate-400 mb-1">No payments yet</p>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">Payment records will appear here once students complete their fee submission.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── SIDEBAR NAV ─────────────────────────────────────────── */
const NAV = [
  { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { id: "users",       label: "Students",    icon: Users },
  { id: "enrollments", label: "Enrollments", icon: ClipboardList },
  { id: "payments",    label: "Payments",    icon: CreditCard },
] as const;

/* ─── MAIN ────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const [uRes, eRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/enrollments"),
    ]);
    const [u, e] = await Promise.all([uRes.json(), eRes.json()]);
    setUsers(u.users ?? []);
    setEnrollments(e.enrollments ?? []);
  }, []);

  useEffect(() => {
    const sb = createClient();
    supabaseRef.current = sb;

    async function init() {
      const params = new URLSearchParams(window.location.search);
      const at = params.get("at"), rt = params.get("rt");
      let userId = "", metaRole = "";

      if (at && rt) {
        window.history.replaceState({}, "", "/lms/admin");
        const { data, error } = await sb.auth.setSession({ access_token: at, refresh_token: rt });
        if (error || !data.session?.user) { window.location.href = "/lms"; return; }
        userId = data.session.user.id;
        metaRole = data.session.user.user_metadata?.role || "";
        setAdminName(data.session.user.user_metadata?.full_name || "Admin");
      } else {
        const { data: { session } } = await sb.auth.getSession();
        if (!session?.user) { window.location.href = "/lms"; return; }
        userId = session.user.id;
        metaRole = session.user.user_metadata?.role || "";
        setAdminName(session.user.user_metadata?.full_name || "Admin");
      }

      // Verify admin
      const { data: p } = await sb.from("profiles").select("role, full_name").eq("id", userId).single();
      const role = p?.role || metaRole;
      if (role !== "admin") { window.location.href = "/lms/student"; return; }
      if (p?.full_name) setAdminName(p.full_name);

      await fetchData();
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabaseRef.current?.auth.signOut();
    window.location.href = "/lms";
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} />
    </div>
  );

  const renderPage = () => {
    const pages: Record<Tab, React.ReactNode> = {
      dashboard:   <DashboardPage users={users} enrollments={enrollments} />,
      users:       <UsersPage users={users} onRefresh={fetchData} />,
      enrollments: <EnrollmentsPage enrollments={enrollments} onRefresh={fetchData} />,
      payments:    <PaymentsPage />,
    };
    return (
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {pages[tab]}
        </motion.div>
      </AnimatePresence>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/baii-logo.svg" alt="BAII" style={{ width: 36, height: "auto" }} />
        <div><p className="font-bold text-sm text-slate-800">BAII Admin</p><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><p className="text-[10px] text-slate-400">Active</p></div></div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-3 pb-2 pt-1">Menu</p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: active ? "rgba(26,58,107,0.08)" : "transparent", color: active ? "#1a3a6b" : "#94a3b8" }}>
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#c47d2a" }} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-slate-100 pt-3">
        <Separator className="mb-3 opacity-0" />
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
          <Av name={adminName} size={32} />
          <div className="min-w-0"><p className="font-semibold text-sm text-slate-700 truncate">{adminName}</p><span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(196,125,42,0.12)", color: "#c47d2a" }}>Admin</span></div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen bg-white border-r border-slate-100">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
            <motion.aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col lg:hidden" initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", damping: 28 }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 flex items-center justify-between px-5 py-3.5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setSidebarOpen(true)}>
              <div className="space-y-1"><div className="w-4 h-0.5 bg-slate-500 rounded" /><div className="w-4 h-0.5 bg-slate-500 rounded" /><div className="w-4 h-0.5 bg-slate-500 rounded" /></div>
            </button>
            <div className="hidden sm:block">
              <p className="font-bold text-slate-800 text-sm capitalize">{tab === "users" ? "Students" : tab.charAt(0).toUpperCase() + tab.slice(1)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors" onClick={fetchData}>
              <RefreshCw size={15} className="text-slate-400" />
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
              <Bell size={16} className="text-slate-400" />
            </button>
            <Av name={adminName} size={34} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}
