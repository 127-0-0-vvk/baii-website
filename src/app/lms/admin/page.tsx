"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ClipboardList,
  LogOut,
  Plus,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  school: string | null;
  city: string | null;
  created_at: string;
};

type EnrollRequest = {
  id: string;
  full_name: string;
  phone: string;
  school: string;
  city: string;
  course_code: string;
  status: string;
  created_at: string;
};

type Tab = "users" | "enrollments";

export default function AdminDashboard() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);

  // Create user form state
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    school: "",
    city: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{email:string;password:string;full_name:string;emailSent:boolean}|null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    setLoading(true);
    const [{ data: u }, { data: e }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("enrollment_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers((u as Profile[]) ?? []);
    setEnrollments((e as EnrollRequest[]) ?? []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sb = createClient();
    supabaseRef.current = sb;

    sb.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session?.user) { router.push('/lms'); return; }
      let role = session.user.user_metadata?.role as string | undefined;
      sb.from('profiles').select('role').eq('id', session.user.id).single()
        .then(({ data: p }) => {
          if (p?.role) role = p.role;
          if (role !== 'admin') router.push('/lms/student');
          else fetchData();
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabaseRef.current?.auth.signOut();
    router.push("/lms");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const json = await res.json();
    if (!res.ok) {
      setCreateError(json.error ?? "Failed to create user");
    } else {
      setCreatedCredentials({ ...json.credentials, emailSent: json.emailSent });
      setCreateSuccess(true);
      fetchData();
    }
    setCreateLoading(false);
  };

  const updateEnrollStatus = async (id: string, status: string) => {
    await supabaseRef.current?.from("enrollment_requests").update({ status }).eq("id", id);
    setEnrollments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Phone", "School", "City", "Course", "Status", "Date"],
      ...enrollments.map((e) => [
        e.full_name, e.phone, e.school, e.city, e.course_code,
        e.status, new Date(e.created_at).toLocaleDateString("en-IN"),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "baii-enrollments.csv"; a.click();
  };

  const statusColor = (s: string) =>
    s === "approved" ? "#4ade80" : s === "rejected" ? "#f87171" : "#c47d2a";

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #080f1e, #0d1f3c)" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-40"
        style={{
          background: "rgba(8,15,30,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/baii-logo.svg" alt="BAII" style={{ width: 36, height: "auto" }} />
          <div>
            <p className="text-white font-semibold text-sm leading-tight">BAII Admin</p>
            <div className="flex items-center gap-1">
              <Shield size={10} style={{ color: "#c47d2a" }} />
              <p className="text-white/40 text-xs">Dashboard</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["users", "enrollments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
              style={{
                background: tab === t ? "rgba(196,125,42,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${tab === t ? "rgba(196,125,42,0.35)" : "rgba(255,255,255,0.08)"}`,
                color: tab === t ? "#c47d2a" : "rgba(255,255,255,0.5)",
              }}
            >
              {t === "users" ? <Users size={14} /> : <ClipboardList size={14} />}
              {t === "users" ? `Users (${users.length})` : `Enrollments (${enrollments.length})`}
            </button>
          ))}
          <button
            onClick={fetchData}
            className="ml-auto flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "#c47d2a", borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <>
            {/* USERS TAB */}
            {tab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>
                    Student Accounts
                  </h2>
                  <button
                    onClick={() => { setCreateModal(true); setCreateSuccess(false); setCreateError(""); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #c47d2a, #d4913a)" }}
                  >
                    <Plus size={14} /> Create Student
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                        {["Name", "Email", "School", "City", "Role", "Joined"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-white/40 font-semibold text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-t transition-colors hover:bg-white/[0.02]"
                          style={{ borderColor: "rgba(255,255,255,0.05)" }}
                        >
                          <td className="px-4 py-3 text-white font-medium">{u.full_name || "—"}</td>
                          <td className="px-4 py-3 text-white/60">{u.email}</td>
                          <td className="px-4 py-3 text-white/50">{u.school || "—"}</td>
                          <td className="px-4 py-3 text-white/50">{u.city || "—"}</td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: u.role === "admin" ? "rgba(196,125,42,0.2)" : "rgba(74,159,212,0.15)",
                                color: u.role === "admin" ? "#c47d2a" : "#4a9fd4",
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/40 text-xs">
                            {new Date(u.created_at).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">
                            No users yet. Create the first student account above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ENROLLMENTS TAB */}
            {tab === "enrollments" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>
                    Enrollment Requests
                  </h2>
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                        {["Name", "Phone", "School", "City", "Course", "Status", "Date", "Action"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-white/40 font-semibold text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e) => (
                        <tr
                          key={e.id}
                          className="border-t transition-colors hover:bg-white/[0.02]"
                          style={{ borderColor: "rgba(255,255,255,0.05)" }}
                        >
                          <td className="px-4 py-3 text-white font-medium">{e.full_name}</td>
                          <td className="px-4 py-3 text-white/60">{e.phone}</td>
                          <td className="px-4 py-3 text-white/50">{e.school}</td>
                          <td className="px-4 py-3 text-white/50">{e.city}</td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: "rgba(196,125,42,0.2)", color: "#c47d2a" }}
                            >
                              {e.course_code}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                              style={{
                                background: `${statusColor(e.status)}18`,
                                color: statusColor(e.status),
                              }}
                            >
                              {e.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/40 text-xs">
                            {new Date(e.created_at).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            {e.status === "pending" && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateEnrollStatus(e.id, "approved")}
                                  className="text-xs px-2 py-1 rounded text-green-400 hover:bg-green-400/10 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateEnrollStatus(e.id, "rejected")}
                                  className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-400/10 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {enrollments.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-white/30 text-sm">
                            No enrollment requests yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Student Modal */}
      <AnimatePresence>
        {createModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCreateModal(false)} />
            <motion.div
              className="relative w-full max-w-md rounded-2xl p-8 z-10"
              style={{
                background: "rgba(13,31,60,0.98)",
                border: "1px solid rgba(196,125,42,0.3)",
              }}
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <button
                onClick={() => setCreateModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              {createSuccess ? (
                <div className="py-2">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 size={28} style={{ color: "#4ade80" }} />
                    <div>
                      <h3 className="text-white font-bold text-base" style={{ fontFamily: "var(--font-playfair)" }}>Account Created!</h3>
                      <p className="text-white/40 text-xs">{createdCredentials?.full_name}</p>
                    </div>
                  </div>

                  {/* Credentials box — always shown */}
                  <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Login URL</p>
                      <p className="text-copper-400 text-sm font-semibold" style={{ color: "#c47d2a" }}>baii.in/lms</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Email</p>
                      <p className="text-white text-sm font-mono">{createdCredentials?.email}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Password</p>
                      <p className="text-white text-sm font-mono font-bold bg-white/10 rounded px-2 py-1 inline-block tracking-wider">{createdCredentials?.password}</p>
                    </div>
                  </div>

                  {/* Email status */}
                  <p className="text-xs mb-4 flex items-center gap-2" style={{ color: createdCredentials?.emailSent ? "#4ade80" : "#f97316" }}>
                    {createdCredentials?.emailSent ? "✓ Credentials emailed to student" : "⚠ Email not sent — share credentials above manually"}
                  </p>

                  <button
                    onClick={() => {
                      setCreateModal(false);
                      setCreateSuccess(false);
                      setCreatedCredentials(null);
                      setNewUser({ full_name: "", email: "", password: "", phone: "", school: "", city: "" });
                    }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #c47d2a, #d4913a)" }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                    Create Student Account
                  </h3>
                  <p className="text-white/40 text-xs mb-5">
                    Student will receive login credentials via email.
                  </p>
                  <form onSubmit={handleCreateUser} className="space-y-3">
                    {[
                      { key: "full_name", label: "Full Name", type: "text", placeholder: "Student name" },
                      { key: "email", label: "Email", type: "email", placeholder: "student@email.com" },
                      { key: "phone", label: "Phone", type: "text", placeholder: "+91 98765 43210" },
                      { key: "school", label: "School", type: "text", placeholder: "School name" },
                      { key: "city", label: "City", type: "text", placeholder: "City" },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="text-white/50 text-xs mb-1 block">{label} *</label>
                        <input
                          required
                          type={type}
                          placeholder={placeholder}
                          value={newUser[key as keyof typeof newUser]}
                          onChange={(e) => setNewUser((u) => ({ ...u, [key]: e.target.value }))}
                          className="w-full rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Password *</label>
                      <div className="relative">
                        <input
                          required
                          type={showPw ? "text" : "password"}
                          placeholder="Min 8 characters"
                          value={newUser.password}
                          onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                          className="w-full rounded-lg px-3 py-2.5 pr-9 text-white text-sm placeholder:text-white/25 focus:outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                          {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                    {createError && (
                      <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{createError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-1 transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #c47d2a, #d4913a)" }}
                    >
                      {createLoading ? "Creating…" : "Create & Send Credentials →"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
