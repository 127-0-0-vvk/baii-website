"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Users, ClipboardList, CreditCard, BookOpen,
  LogOut, Plus, X, Eye, EyeOff, Download, RefreshCw,
  CheckCircle2, XCircle, Clock, Search, GraduationCap,
  UserPlus, Bell, Mail, Phone, MapPin, School, Shield,
  ChevronRight, Zap, Cpu, Settings, UserCircle, MoreHorizontal,
  ArrowRight, Bookmark, Pencil, ChevronDown, Save, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { PILLAR5_YEARS, type Year, type Week } from "@/data/pillar5";

/* ─── types ───────────────────────────────────────────────── */
type Profile = { id: string; email: string; full_name: string; role: string; phone: string | null; school: string | null; city: string | null; created_at: string; };
type EnrollRequest = { id: string; full_name: string; phone: string; school: string; city: string; course_code: string; status: string; created_at: string; };
type StudentCourse = { id: string; enrolled_at: string; cohorts: { id: string; name: string; courses: { code: string; title: string; track: string; duration: string } } };
type Tab = "dashboard" | "students" | "enrollments" | "courses" | "payments" | "account";

const ALL_COURSES = [
  { code: "P5-C6",  label: "Class 6 — The Truth Detective",    track: "p5", year: "Class 6",  duration: "35 weeks" },
  { code: "P5-C7",  label: "Class 7 — The Data Journalist",    track: "p5", year: "Class 7",  duration: "35 weeks" },
  { code: "P5-C8",  label: "Class 8 — The Debater",            track: "p5", year: "Class 8",  duration: "35 weeks" },
  { code: "P5-C9",  label: "Class 9 — The Researcher",         track: "p5", year: "Class 9",  duration: "35 weeks" },
  { code: "P5-C10", label: "Class 10 — The Strategist",        track: "p5", year: "Class 10", duration: "35 weeks" },
  { code: "P5-C11", label: "Class 11 — The Communicator",      track: "p5", year: "Class 11", duration: "35 weeks" },
  { code: "P5-C12", label: "Class 12 — The Builder",           track: "p5", year: "Class 12", duration: "35 weeks" },
];

/* ─── helpers ─────────────────────────────────────────────── */
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

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    pending:  { bg: "#fff7ed", color: "#c47d2a", icon: <Clock size={10} /> },
    approved: { bg: "#f0fdf4", color: "#16a34a", icon: <CheckCircle2 size={10} /> },
    rejected: { bg: "#fef2f2", color: "#dc2626", icon: <XCircle size={10} /> },
  };
  const s = m[status] ?? m.pending;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: s.bg, color: s.color }}>{s.icon}{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, color }}>{icon}</div>
        <MoreHorizontal size={16} className="text-slate-200" />
      </div>
      <p className="text-2xl font-black text-slate-800 mb-0.5" style={{ fontFamily: "var(--font-playfair)" }}>{value}</p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {sub && <p className="text-[11px] text-slate-300 mt-1">{sub}</p>}
    </div>
  );
}

/* ─── ASSIGN COURSE MODAL ─────────────────────────────────── */
function AssignModal({ userId, userName, onClose, onDone }: { userId: string; userName: string; onClose: () => void; onDone: () => void }) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [err, setErr] = useState("");

  const assign = async () => {
    if (!selected) return;
    setLoading(true); setErr("");
    const res = await fetch("/api/admin/assign-course", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: userId, course_code: selected }) });
    const json = await res.json();
    if (!res.ok) setErr(json.error); else { setDone(json.course); onDone(); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={16} /></button>
        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={36} className="mx-auto mb-3 text-green-500" />
            <p className="font-bold text-slate-800">{userName} enrolled!</p>
            <p className="text-sm text-slate-400 mt-1">{done}</p>
          </div>
        ) : (
          <>
            <p className="font-bold text-slate-800 mb-1">Assign Course</p>
            <p className="text-xs text-slate-400 mb-4">Enrolling: <span className="font-semibold text-slate-600">{userName}</span></p>
            <div className="max-h-60 overflow-y-auto space-y-0.5 mb-4">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-2 py-1.5">🧠 Pillar 5 — Critical Thinking & Communication</p>
              {ALL_COURSES.map((course, i) => {
                const colors = ["#2563EB","#059669","#DC2626","#7C3AED","#B45309","#15803D","#1E3A5F"];
                return (
                  <button key={course.code} onClick={() => setSelected(course.code)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
                    style={{ background: selected === course.code ? "rgba(26,58,107,0.08)" : "transparent", color: selected === course.code ? "#1a3a6b" : "#64748b" }}>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: colors[i] }}>{course.year.replace("Class ","C")}</span>
                    {course.label.split("—")[1]?.trim()}
                    {selected === course.code && <CheckCircle2 size={13} className="ml-auto" style={{color:"#1a3a6b"}} />}
                  </button>
                );
              })}
            </div>
            {err && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2 mb-3">{err}</p>}
            <button onClick={assign} disabled={!selected || loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
              {loading ? "Enrolling…" : "Enroll →"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ─── STUDENT DETAIL PANEL ────────────────────────────────── */
type LessonResponse = { course_code: string; week_num: string; day_num: number; response: string; submitted_at: string };
const DAY_LABELS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function StudentPanel({ student, onClose, onRefresh }: { student: Profile; onClose: () => void; onRefresh: () => void }) {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [lessonResponses, setLessonResponses] = useState<LessonResponse[]>([]);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/student-courses?student_id=${student.id}`)
      .then(r => r.json()).then(d => { setCourses(d.enrollments ?? []); setLoadingCourses(false); });
    fetch(`/api/admin/lesson-responses?student_id=${student.id}`)
      .then(r => r.json()).then(d => setLessonResponses(d.responses ?? []));
  }, [student.id]);

  const info = [
    { icon: <Mail size={14} />,   label: "Email",  value: student.email },
    { icon: <Phone size={14} />,  label: "Phone",  value: student.phone || "Not provided" },
    { icon: <School size={14} />, label: "School", value: student.school || "Not provided" },
    { icon: <MapPin size={14} />, label: "City",   value: student.city || "Not provided" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl z-10">

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
            <p className="font-bold text-slate-700 text-sm">Student Profile</p>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"><X size={15} className="text-slate-400" /></button>
          </div>

          <div className="p-5 space-y-5">
            {/* Profile hero */}
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>
              <div className="flex items-center gap-4">
                <Av name={student.full_name} size={56} />
                <div>
                  <p className="font-black text-white text-lg leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>{student.full_name}</p>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "rgba(196,125,42,0.25)", color: "#e8be72" }}>Student</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">Contact & Details</p>
              {info.map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <div className="mx-4 border-t border-slate-50" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(26,58,107,0.07)", color: "#1a3a6b" }}>{item.icon}</div>
                    <div>
                      <p className="text-[10px] text-slate-400">{item.label}</p>
                      <p className={`text-sm font-medium ${item.value === "Not provided" ? "text-slate-300 italic" : "text-slate-700"}`}>{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mx-4 border-t border-slate-50" />
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(26,58,107,0.07)", color: "#1a3a6b" }}><Clock size={14} /></div>
                <div><p className="text-[10px] text-slate-400">Joined</p><p className="text-sm font-medium text-slate-700">{new Date(student.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>
              </div>
            </div>

            {/* Enrolled courses */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Courses</p>
                <button onClick={() => setAssignOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                  style={{ background: "rgba(26,58,107,0.08)", color: "#1a3a6b" }}>
                  <Plus size={11} /> Assign
                </button>
              </div>

              {loadingCourses ? (
                <div className="px-4 py-6 text-center"><div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} /></div>
              ) : courses.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Bookmark size={22} className="mx-auto mb-2" style={{ color: "rgba(0,0,0,0.1)" }} />
                  <p className="text-sm text-slate-300">No courses assigned</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {courses.map(sc => {
                    const course = sc.cohorts?.courses;
                    const isEnergy = course?.track === "energy";
                    return (
                      <div key={sc.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: isEnergy ? "rgba(196,125,42,0.1)" : "rgba(74,159,212,0.1)", color: isEnergy ? "#c47d2a" : "#4a9fd4" }}>
                          {isEnergy ? <Zap size={14} /> : <Cpu size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{course?.title}</p>
                          <p className="text-[11px] text-slate-400">{course?.code} · {course?.duration}</p>
                        </div>
                        <span className="text-[10px] text-slate-300">{new Date(sc.enrolled_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lesson responses */}
            {lessonResponses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">
                  Lesson Responses ({lessonResponses.length})
                </p>
                <div className="divide-y divide-slate-50">
                  {lessonResponses.map(r => {
                    const key = `${r.course_code}-${r.week_num}-D${r.day_num}`;
                    const isOpen = expandedResponse === key;
                    return (
                      <div key={key}>
                        <button onClick={() => setExpandedResponse(isOpen ? null : key)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black text-white"
                            style={{ background: "#1a3a6b" }}>
                            D{r.day_num}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700">{r.week_num} · Day {r.day_num} — {DAY_LABELS[r.day_num]}</p>
                            <p className="text-[10px] text-slate-400">{r.course_code} · {new Date(r.submitted_at).toLocaleDateString("en-IN")}</p>
                          </div>
                          <ChevronDown size={14} className="text-slate-300 transition-transform shrink-0"
                            style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3">
                            <div className="rounded-xl p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap"
                              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                              {r.response}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggested actions */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">Quick Actions</p>
              {[
                { label: "Send Login Credentials", icon: <Mail size={14} />, action: () => {} },
                { label: "Assign to Course", icon: <GraduationCap size={14} />, action: () => setAssignOpen(true) },
              ].map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <div className="mx-4 border-t border-slate-50" />}
                  <button onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(26,58,107,0.07)", color: "#1a3a6b" }}>{item.icon}</div>
                    <span className="text-sm font-medium text-slate-700 flex-1 text-left">{item.label}</span>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {assignOpen && (
        <AssignModal userId={student.id} userName={student.full_name}
          onClose={() => setAssignOpen(false)}
          onDone={() => { setAssignOpen(false); fetch(`/api/admin/student-courses?student_id=${student.id}`).then(r => r.json()).then(d => setCourses(d.enrollments ?? [])); onRefresh(); }}
        />
      )}
    </>
  );
}

/* ─── CREATE USER MODAL ───────────────────────────────────── */
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
    if (!res.ok) setErr(json.error ?? "Failed"); else { setSuccess({ ...json.credentials, emailSent: json.emailSent }); onDone(); }
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
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center"><CheckCircle2 size={20} className="text-green-500" /></div><div><p className="font-bold text-slate-800">Account Created!</p><p className="text-xs text-slate-400">{success.full_name}</p></div></div>
            <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              {[["Login URL","baii.in/lms"],["Email",success.email],["Password",success.password]].map(([l,v]) => (
                <div key={l}><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">{l}</p><p className="text-sm font-mono font-semibold text-slate-700">{v}</p></div>
              ))}
            </div>
            <p className="text-xs mb-4" style={{ color: success.emailSent ? "#16a34a" : "#f97316" }}>{success.emailSent ? "✓ Credentials emailed" : "⚠ Share credentials manually"}</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#1a3a6b,#235098)" }}>Done</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-slate-800 text-lg mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Create Student</h3>
            <p className="text-slate-400 text-xs mb-5">Student receives login credentials via email.</p>
            <form onSubmit={submit} className="space-y-3">
              {[{k:"full_name",l:"Full Name",t:"text",p:"Student name",req:true},{k:"email",l:"Email",t:"email",p:"student@email.com",req:true},{k:"phone",l:"Phone",t:"text",p:"+91 98765 43210",req:false},{k:"school",l:"School",t:"text",p:"School name",req:false},{k:"city",l:"City",t:"text",p:"City",req:false}].map(({k,l,t,p,req}) => (
                <div key={k}><label className="text-xs font-semibold text-slate-500 mb-1 block">{l}{req&&" *"}</label>
                  <input required={req} type={t} placeholder={p} value={form[k as keyof typeof form]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-colors" />
                </div>
              ))}
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Password *</label>
                <div className="relative">
                  <input required type={showPw?"text":"password"} placeholder="Min 8 chars" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                    className="w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-colors" />
                  <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">{showPw?<EyeOff size={14}/>:<Eye size={14}/>}</button>
                </div>
              </div>
              {err && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{err}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-1 disabled:opacity-50 hover:opacity-90" style={{background:"linear-gradient(135deg,#1a3a6b,#235098)"}}>
                {loading?<span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Creating…</span>:"Create & Send Credentials →"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ─── PAGES ───────────────────────────────────────────────── */

function DashboardPage({ users, enrollments }: { users: Profile[]; enrollments: EnrollRequest[] }) {
  const students = users.filter(u => u.role === "student");
  const pending = enrollments.filter(e => e.status === "pending").length;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-playfair)" }}>Dashboard</h1><p className="text-slate-400 text-sm mt-0.5">Overview of BAII operations</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20}/>} label="Total Students" value={students.length} color="#1a3a6b"/>
        <StatCard icon={<ClipboardList size={20}/>} label="Pending Enquiries" value={pending} color="#c47d2a"/>
        <StatCard icon={<BookOpen size={20}/>} label="Courses Available" value={7} sub="Pillar 5 · C6 to C12" color="#4a9fd4"/>
        <StatCard icon={<CreditCard size={20}/>} label="Payments" value="—" sub="Coming soon" color="#7c3aed"/>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:"0 1px 12px rgba(0,0,0,0.05)"}}>
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between"><p className="font-bold text-slate-700 text-sm">Recent Students</p></div>
        {students.length === 0 ? (
          <div className="px-5 py-10 text-center"><Users size={28} className="mx-auto mb-2 text-slate-200"/><p className="text-sm text-slate-400">No students yet</p></div>
        ) : (
          <table className="w-full text-sm"><tbody>
            {students.slice(0,5).map(u=>(
              <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Av name={u.full_name} size={32}/><div><p className="font-semibold text-slate-700 text-sm">{u.full_name}</p><p className="text-xs text-slate-400">{u.email}</p></div></div></td>
                <td className="px-5 py-3.5 text-xs text-slate-400 hidden sm:table-cell">{u.school||"—"}</td>
                <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
    </div>
  );
}

function StudentsPage({ users, onRefresh }: { users: Profile[]; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const students = users.filter(u => u.role === "student" && (
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u.school||"").toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-black text-slate-800" style={{fontFamily:"var(--font-playfair)"}}>Students</h1><p className="text-slate-400 text-sm mt-0.5">{students.length} student{students.length!==1?"s":""} · click any row to view details</p></div>
          <button onClick={()=>setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{background:"linear-gradient(135deg,#1a3a6b,#235098)"}}>
            <UserPlus size={15}/> New Student
          </button>
        </div>
        <div className="relative"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, school…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-colors"/></div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:"0 1px 12px rgba(0,0,0,0.05)"}}>
          <table className="w-full text-sm">
            <thead><tr style={{background:"#f8fafc"}}>
              {["Student","Phone","School","City","Joined",""].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {students.length===0?(
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-300 text-sm">{search?"No results":"No students yet. Create the first one."}</td></tr>
              ):students.map(u=>(
                <tr key={u.id} onClick={()=>setSelected(u)} className="border-t border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Av name={u.full_name} size={34}/><div><p className="font-semibold text-slate-700">{u.full_name}</p><p className="text-xs text-slate-400">{u.email}</p></div></div></td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{u.phone||"—"}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 hidden sm:table-cell">{u.school||"—"}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 hidden md:table-cell">{u.city||"—"}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3.5"><ChevronRight size={14} className="text-slate-300"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>{selected && <StudentPanel student={selected} onClose={()=>setSelected(null)} onRefresh={onRefresh}/>}</AnimatePresence>
      {createOpen && <CreateUserModal onClose={()=>setCreateOpen(false)} onDone={()=>{setCreateOpen(false);onRefresh();}}/>}
    </>
  );
}

function EnrollmentsPage({ enrollments, onRefresh }: { enrollments: EnrollRequest[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState<"all"|"pending"|"approved"|"rejected">("all");
  const [updating, setUpdating] = useState<string|null>(null);
  const filtered = enrollments.filter(e=>filter==="all"||e.status===filter);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch("/api/admin/enrollments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    onRefresh(); setUpdating(null);
  };

  const convertToStudent = async (e: EnrollRequest) => {
    const password = "BAII@" + Math.random().toString(36).slice(2,8).toUpperCase();
    await fetch("/api/admin/create-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({full_name:e.full_name,email:e.phone+"@baii.in",password,phone:e.phone,school:e.school,city:e.city})});
    await updateStatus(e.id,"approved");
  };

  const exportCSV = () => {
    const rows=[["Name","Phone","School","City","Course","Status","Date"],...enrollments.map(e=>[e.full_name,e.phone,e.school,e.city,e.course_code,e.status,new Date(e.created_at).toLocaleDateString("en-IN")])];
    const blob=new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});
    Object.assign(document.createElement("a"),{href:URL.createObjectURL(blob),download:"enrollments.csv"}).click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800" style={{fontFamily:"var(--font-playfair)"}}>Enrollment Requests</h1>
          <p className="text-slate-400 text-sm mt-0.5">Online interest forms submitted from baii.in</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"><Download size={14}/>Export</button>
      </div>

      {/* What this means */}
      <div className="rounded-xl p-4 flex gap-3" style={{background:"rgba(26,58,107,0.04)",border:"1px solid rgba(26,58,107,0.1)"}}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{background:"rgba(26,58,107,0.12)",color:"#1a3a6b"}}><span className="text-[10px] font-black">i</span></div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1">How this works</p>
          <p className="text-xs text-slate-500 leading-relaxed">These are interest forms submitted from the BAII website. <span className="font-semibold text-slate-600">Pending</span> = waiting for your review · <span className="font-semibold text-slate-600">Approved</span> = confirmed, ready to create account · <span className="font-semibold text-slate-600">Rejected</span> = not suitable. Use <span style={{color:"#1a3a6b"}} className="font-semibold">Convert to Student</span> on approved entries to auto-create their account.</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all","pending","approved","rejected"] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{background:filter===f?"#1a3a6b":"#f1f5f9",color:filter===f?"white":"#94a3b8"}}>
            {f} ({f==="all"?enrollments.length:enrollments.filter(e=>e.status===f).length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto" style={{boxShadow:"0 1px 12px rgba(0,0,0,0.05)"}}>
        <table className="w-full text-sm">
          <thead><tr style={{background:"#f8fafc"}}>
            {["Applicant","School / City","Course","Status","Date","Actions"].map(h=>(
              <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.length===0?(
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-300 text-sm">No requests yet</td></tr>
            ):filtered.map(e=>(
              <tr key={e.id} className="border-t border-slate-50 hover:bg-slate-50/40 transition-colors">
                <td className="px-5 py-3.5"><p className="font-semibold text-slate-700">{e.full_name}</p><p className="text-xs text-slate-400">{e.phone}</p></td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{e.school}<br/><span className="text-slate-400">{e.city}</span></td>
                <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-[11px] font-bold" style={{background:"rgba(196,125,42,0.1)",color:"#c47d2a"}}>{e.course_code}</span></td>
                <td className="px-5 py-3.5"><StatusBadge status={e.status}/></td>
                <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{new Date(e.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5 flex-wrap">
                    {e.status==="pending"&&<>
                      <button disabled={updating===e.id} onClick={()=>updateStatus(e.id,"approved")} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold hover:opacity-80" style={{background:"#f0fdf4",color:"#16a34a"}}>Approve</button>
                      <button disabled={updating===e.id} onClick={()=>updateStatus(e.id,"rejected")} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold hover:opacity-80" style={{background:"#fef2f2",color:"#dc2626"}}>Reject</button>
                    </>}
                    {e.status==="approved"&&
                      <button disabled={updating===e.id} onClick={()=>convertToStudent(e)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold hover:opacity-80" style={{background:"rgba(26,58,107,0.08)",color:"#1a3a6b"}}><UserPlus size={11}/>Convert</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Week edit modal ──────────────────────────────────────── */
function WeekEditModal({ yearId, moduleId, week, yearColor, onClose, onSaved }: {
  yearId: string; moduleId: string; week: Week; yearColor: string;
  onClose: () => void; onSaved: (updated: Week) => void;
}) {
  const [form, setForm] = useState({ topic: week.topic, concept: week.concept, exercise: week.exercise, india_example: week.example });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setSaving(true); setErr("");
    const res = await fetch("/api/admin/pillar5", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year_id: yearId, module_id: moduleId, week_num: week.w, ...form }),
    });
    if (!res.ok) { const j = await res.json(); setErr(j.error); }
    else { setSaved(true); onSaved({ ...week, topic: form.topic, concept: form.concept, exercise: form.exercise, example: form.india_example }); }
    setSaving(false);
  };

  const field = (key: keyof typeof form, label: string, rows = 2) => (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
      <textarea rows={rows} value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
        className="w-full rounded-xl px-3 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-700 resize-none focus:outline-none focus:border-slate-400 transition-colors"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{scale:0.95,y:16}} animate={{scale:1,y:0}}
        className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 rounded-t-2xl shrink-0" style={{background:yearColor}}>
          <div>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{week.w}</p>
            <p className="text-white font-bold text-base">{form.topic}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"rgba(255,255,255,0.2)"}}>
            <X size={14} className="text-white"/>
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {saved && <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-semibold"><CheckCircle2 size={16}/> Saved successfully</div>}
          {err && <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm"><AlertCircle size={15}/> {err}</div>}
          {field("topic", "Week Title", 1)}
          {field("concept", "Concept / Lesson", 4)}
          {field("exercise", "Exercise", 4)}
          {field("india_example", "India Example", 3)}
        </div>

        <div className="px-5 pb-5 shrink-0">
          <button onClick={save} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90"
            style={{background:yearColor}}>
            {saving ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/> : <Save size={15}/>}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── COURSES PAGE ─────────────────────────────────────────── */
function CoursesPage() {
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [editingWeek, setEditingWeek] = useState<{yearId:string;moduleId:string;week:Week;color:string} | null>(null);
  const [years, setYears] = useState(PILLAR5_YEARS);
  const [loading, setLoading] = useState(false);

  // Load any admin overrides from Supabase
  const loadOverrides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pillar5");
      const { years: merged } = await res.json();
      if (merged) setYears(merged);
    } catch { /* use static data */ }
    setLoading(false);
  };

  useState(() => { loadOverrides(); });

  const handleSaved = (yearId: string, moduleId: string, updated: Week) => {
    setYears(prev => prev.map(y => y.id !== yearId ? y : {
      ...y, modules: y.modules.map(m => m.id !== moduleId ? m : {
        ...m, weeks_detail: m.weeks_detail.map(w => w.w === updated.w ? updated : w)
      })
    }));
    setEditingWeek(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800" style={{fontFamily:"var(--font-playfair)"}}>Courses</h1>
          <p className="text-slate-400 text-sm mt-0.5">Click any year → module → week to view or edit content</p>
        </div>
        <button onClick={loadOverrides} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""}/> Refresh
        </button>
      </div>

      {/* Pillar 5 header */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{background:"linear-gradient(135deg,#1a3a6b,#235098)"}}>
        <div className="absolute right-0 top-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{background:"#c47d2a",transform:"translate(30%,-30%)"}}/>
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Pillar 5 · Mandatory</p>
        <h2 className="text-white font-black text-xl mb-2" style={{fontFamily:"var(--font-playfair)"}}>Critical Thinking & Communication</h2>
        <div className="flex flex-wrap gap-1.5">
          {["7 Years","5 Modules/Year","35 Weeks/Year","245 Lesson Nodes"].map(t=>(
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(255,255,255,0.15)",color:"white"}}>{t}</span>
          ))}
        </div>
      </div>

      {/* Year accordion */}
      <div className="space-y-2">
        {years.map((year, yi) => {
          const isYearOpen = expandedYear === year.id;
          return (
            <div key={year.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
              {/* Year row */}
              <button onClick={() => { setExpandedYear(isYearOpen ? null : year.id); setExpandedModule(null); }}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm" style={{background:year.color}}>
                  C{6+yi}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">{year.label} — {year.title}</p>
                  <p className="text-xs text-slate-400 truncate italic">"{year.tagline}"</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 hidden sm:block">{year.modules.length} modules · {year.modules.reduce((a,m)=>a+m.weeks_detail.length,0)} weeks</span>
                  <ChevronDown size={16} className="text-slate-400 transition-transform" style={{transform: isYearOpen ? "rotate(180deg)" : "none"}}/>
                </div>
              </button>

              {/* Modules */}
              {isYearOpen && (
                <div className="border-t border-slate-100">
                  {/* Year mission */}
                  <div className="px-5 py-3 text-xs leading-relaxed" style={{background:`${year.color}06`,color:"#64748b"}}>
                    <span className="font-semibold" style={{color:year.color}}>Year-end mission: </span>{year.finalMission.split(":")[0]}
                  </div>

                  {year.modules.map((mod, mi) => {
                    const modKey = `${year.id}-${mod.id}`;
                    const isModOpen = expandedModule === modKey;
                    return (
                      <div key={mod.id} className="border-t border-slate-50">
                        {/* Module row */}
                        <button onClick={() => setExpandedModule(isModOpen ? null : modKey)}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{background:year.color}}>
                            M{mi+1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-700 text-sm">{mod.title}</p>
                            <p className="text-xs text-slate-400">{mod.subtitle} · {mod.weeks}</p>
                          </div>
                          <ChevronDown size={14} className="text-slate-300 transition-transform shrink-0" style={{transform:isModOpen?"rotate(180deg)":"none"}}/>
                        </button>

                        {/* Weeks table */}
                        {isModOpen && (
                          <div className="border-t border-slate-50">
                            <table className="w-full text-sm">
                              <thead>
                                <tr style={{background:"#f8fafc"}}>
                                  {["Week","Topic","Concept","Exercise","India Example","Edit"].map(h=>(
                                    <th key={h} className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {mod.weeks_detail.map((week, wi) => (
                                  <tr key={week.w} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 shrink-0">
                                      <span className="text-[10px] font-black px-2 py-1 rounded-md text-white inline-block" style={{background:year.color}}>
                                        {week.w}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-700 text-xs max-w-[120px]">
                                      <p className="truncate">{week.topic}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] hidden md:table-cell">
                                      <p className="line-clamp-2">{week.concept}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] hidden lg:table-cell">
                                      <p className="line-clamp-2">{week.exercise}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs max-w-[140px] hidden xl:table-cell" style={{color:"#92500f"}}>
                                      <p className="line-clamp-2">{week.example || "—"}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => setEditingWeek({yearId:year.id, moduleId:mod.id, week, color:year.color})}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                                        style={{background:`${year.color}12`,color:year.color}}>
                                        <Pencil size={11}/> Edit
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingWeek && (
          <WeekEditModal
            yearId={editingWeek.yearId}
            moduleId={editingWeek.moduleId}
            week={editingWeek.week}
            yearColor={editingWeek.color}
            onClose={() => setEditingWeek(null)}
            onSaved={(updated) => handleSaved(editingWeek.yearId, editingWeek.moduleId, updated)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PaymentsPage() {
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-800" style={{fontFamily:"var(--font-playfair)"}}>Payments</h1><p className="text-slate-400 text-sm mt-0.5">Track student fee submissions</p></div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<CreditCard size={20}/>} label="Total Collected" value="₹0" color="#7c3aed"/>
        <StatCard icon={<Clock size={20}/>} label="Pending" value="₹0" color="#c47d2a"/>
        <StatCard icon={<CheckCircle2 size={20}/>} label="This Month" value="₹0" color="#16a34a"/>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100" style={{boxShadow:"0 1px 12px rgba(0,0,0,0.05)"}}>
        <div className="px-5 py-4 border-b border-slate-50"><p className="font-bold text-slate-700 text-sm">Payment History</p></div>
        <div className="px-5 py-16 text-center"><CreditCard size={32} className="mx-auto mb-3" style={{color:"rgba(0,0,0,0.07)"}}/><p className="font-semibold text-slate-400 mb-1">No payments yet</p><p className="text-xs text-slate-300 max-w-xs mx-auto">Payment records will appear here once students submit fees.</p></div>
      </div>
    </div>
  );
}

function AccountPage({ adminName, adminEmail, onLogout }: { adminName: string; adminEmail: string; onLogout: () => void }) {
  return (
    <div className="space-y-5 max-w-lg">
      <div><h1 className="text-2xl font-black text-slate-800" style={{fontFamily:"var(--font-playfair)"}}>Account</h1><p className="text-slate-400 text-sm mt-0.5">Your admin profile</p></div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:"0 1px 12px rgba(0,0,0,0.05)"}}>
        <div className="p-6 flex items-center gap-4" style={{background:"linear-gradient(135deg,#1a3a6b,#235098)"}}>
          <Av name={adminName} size={56}/>
          <div><p className="font-black text-white text-xl" style={{fontFamily:"var(--font-playfair)"}}>{adminName}</p><span className="text-[11px] font-bold px-2.5 py-1 rounded-full mt-1 inline-flex items-center gap-1" style={{background:"rgba(196,125,42,0.25)",color:"#e8be72"}}><Shield size={10}/>Administrator</span></div>
        </div>
        <div className="divide-y divide-slate-50">
          {[{icon:<Mail size={14}/>,label:"Email",value:adminEmail},{icon:<Shield size={14}/>,label:"Role",value:"Admin"},{icon:<Clock size={14}/>,label:"Portal",value:"BAII Learning Portal v1.0"}].map(item=>(
            <div key={item.label} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:"rgba(26,58,107,0.07)",color:"#1a3a6b"}}>{item.icon}</div>
              <div><p className="text-[10px] text-slate-400">{item.label}</p><p className="text-sm font-medium text-slate-700">{item.value}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:"0 1px 12px rgba(0,0,0,0.05)"}}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 pt-4 pb-2">Actions</p>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-red-50 transition-colors group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors" style={{background:"rgba(239,68,68,0.08)",color:"#ef4444"}}><LogOut size={14}/></div>
          <span className="text-sm font-medium text-red-500">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

/* ─── SIDEBAR NAV ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { id: "students",    label: "Students",    icon: Users },
  { id: "enrollments", label: "Enrollments", icon: ClipboardList },
  { id: "courses",     label: "Courses",     icon: BookOpen },
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
  const [adminEmail, setAdminEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const [uRes, eRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/admin/enrollments")]);
    const [u, e] = await Promise.all([uRes.json(), eRes.json()]);
    setUsers(u.users ?? []); setEnrollments(e.enrollments ?? []);
  }, []);

  useEffect(() => {
    const sb = createClient(); supabaseRef.current = sb;
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const at = params.get("at"), rt = params.get("rt");
      let userId="", metaRole="";
      if (at && rt) {
        window.history.replaceState({}, "", "/lms/admin");
        const { data, error } = await sb.auth.setSession({ access_token: at, refresh_token: rt });
        if (error || !data.session?.user) { window.location.href = "/lms"; return; }
        userId = data.session.user.id; metaRole = data.session.user.user_metadata?.role||"";
        setAdminName(data.session.user.user_metadata?.full_name||"Admin");
        setAdminEmail(data.session.user.email||"");
      } else {
        const { data: { session } } = await sb.auth.getSession();
        if (!session?.user) { window.location.href = "/lms"; return; }
        userId = session.user.id; metaRole = session.user.user_metadata?.role||"";
        setAdminName(session.user.user_metadata?.full_name||"Admin");
        setAdminEmail(session.user.email||"");
      }
      const { data: p } = await sb.from("profiles").select("role,full_name").eq("id",userId).single();
      const role = p?.role||metaRole;
      if (role !== "admin") { window.location.href = "/lms/student"; return; }
      if (p?.full_name) setAdminName(p.full_name);
      await fetchData(); setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => { await supabaseRef.current?.auth.signOut(); window.location.href = "/lms"; };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:"#1a3a6b",borderTopColor:"transparent"}}/>
    </div>
  );

  const renderPage = () => {
    const pages: Record<Tab, React.ReactNode> = {
      dashboard:   <DashboardPage users={users} enrollments={enrollments}/>,
      students:    <StudentsPage users={users} onRefresh={fetchData}/>,
      enrollments: <EnrollmentsPage enrollments={enrollments} onRefresh={fetchData}/>,
      courses:     <CoursesPage/>,
      payments:    <PaymentsPage/>,
      account:     <AccountPage adminName={adminName} adminEmail={adminEmail} onLogout={handleLogout}/>,
    };
    return (
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>
          {pages[tab]}
        </motion.div>
      </AnimatePresence>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/baii-logo.svg" alt="BAII" style={{width:36,height:"auto"}}/>
        <div><p className="font-bold text-sm text-slate-800">BAII Admin</p><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400"/><p className="text-[10px] text-slate-400">Active</p></div></div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-3 pb-2 pt-1">Main</p>
        {NAV_ITEMS.map(({id,label,icon:Icon})=>{
          const active=tab===id;
          return <button key={id} onClick={()=>{setTab(id as Tab);setSidebarOpen(false);}} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{background:active?"rgba(26,58,107,0.08)":"transparent",color:active?"#1a3a6b":"#94a3b8"}}>
            <Icon size={17} strokeWidth={active?2.2:1.8}/>{label}{active&&<div className="ml-auto w-1.5 h-1.5 rounded-full" style={{background:"#c47d2a"}}/>}
          </button>;
        })}
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-3 pb-2 pt-4">Settings</p>
        <button onClick={()=>{setTab("account");setSidebarOpen(false);}} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{background:tab==="account"?"rgba(26,58,107,0.08)":"transparent",color:tab==="account"?"#1a3a6b":"#94a3b8"}}>
          <UserCircle size={17}/> Account
        </button>
      </nav>
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
          <Av name={adminName} size={32}/>
          <div className="min-w-0"><p className="font-semibold text-sm text-slate-700 truncate">{adminName}</p><span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{background:"rgba(196,125,42,0.12)",color:"#c47d2a"}}>Admin</span></div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all"><LogOut size={16}/>Sign Out</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen bg-white border-r border-slate-100"><SidebarContent/></aside>
      <AnimatePresence>
        {sidebarOpen&&<>
          <motion.div className="fixed inset-0 bg-black/30 z-40 lg:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSidebarOpen(false)}/>
          <motion.aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col lg:hidden" initial={{x:-260}} animate={{x:0}} exit={{x:-260}} transition={{type:"spring",damping:28}}>
            <SidebarContent/>
          </motion.aside>
        </>}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 flex items-center justify-between px-5 py-3.5" style={{boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={()=>setSidebarOpen(true)}>
              <div className="space-y-1"><div className="w-4 h-0.5 bg-slate-500 rounded"/><div className="w-4 h-0.5 bg-slate-500 rounded"/><div className="w-4 h-0.5 bg-slate-500 rounded"/></div>
            </button>
            <p className="font-bold text-slate-800 text-sm hidden sm:block capitalize">{tab==="students"?"Students":tab.charAt(0).toUpperCase()+tab.slice(1)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors" onClick={fetchData}><RefreshCw size={15} className="text-slate-400"/></button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"><Bell size={16} className="text-slate-400"/></button>
            <button onClick={()=>setTab("account")}><Av name={adminName} size={34}/></button>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-6 lg:p-8 overflow-y-auto"><div className="max-w-6xl mx-auto">{renderPage()}</div></main>
      </div>
    </div>
  );
}
