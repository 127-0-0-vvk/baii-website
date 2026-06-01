"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, BookOpen, Users, Newspaper,
  Library, UserCircle, LogOut, Bell, ChevronRight,
  GraduationCap, Clock, Award, Zap, Cpu,
  BookMarked, CalendarDays, FileText, Settings,
  Mail, Phone, MapPin, School, Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

/* ─── types ───────────────────────────────────────────────── */
type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  school: string | null;
  city: string | null;
  role: string;
};

type Tab = "dashboard" | "courses" | "cohorts" | "news" | "library" | "account";

/* ─── nav items ───────────────────────────────────────────── */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses",   label: "Courses",   icon: BookOpen },
  { id: "cohorts",   label: "Cohorts",   icon: Users },
  { id: "news",      label: "News",      icon: Newspaper },
  { id: "library",   label: "Library",   icon: Library },
] as const;

/* ─── avatar initials ────────────────────────────────────── */
function Initials({ name, size = 40 }: { name: string; size?: number }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, #1a3a6b, #c47d2a)",
        fontSize: size * 0.36,
      }}
    >
      {letters.toUpperCase()}
    </div>
  );
}

/* ─── empty state ─────────────────────────────────────────── */
function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(26,58,107,0.06)" }}>
        <div style={{ color: "#1a3a6b", opacity: 0.3 }}>{icon}</div>
      </div>
      <p className="font-semibold text-slate-700 mb-1">{title}</p>
      <p className="text-sm text-slate-400 max-w-xs">{sub}</p>
    </div>
  );
}

/* ─── stat card ───────────────────────────────────────────── */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "#1a3a6b", fontFamily: "var(--font-playfair)" }}>{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─── DASHBOARD tab ───────────────────────────────────────── */
function DashboardTab({ profile }: { profile: Profile }) {
  const first = profile.full_name?.split(" ")[0] ?? "Student";
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #235098 100%)" }}>
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(196,125,42,0.25)", transform: "translate(30%,-30%)" }} />
        <p className="text-white/60 text-xs mb-1">Welcome back 👋</p>
        <h2 className="text-white font-black text-xl mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Hi, {first}!</h2>
        <p className="text-white/60 text-xs">Ready to build India&apos;s future?</p>
        {profile.school && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.12)" }}>
            <School size={11} className="text-white/70" />
            <span className="text-white/80 text-[11px]">{profile.school}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Progress</p>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<BookOpen size={18} />} label="Courses" value="—" color="#1a3a6b" />
          <StatCard icon={<Clock size={18} />} label="Hours" value="—" color="#c47d2a" />
          <StatCard icon={<Award size={18} />} label="Certs" value="—" color="#4a9fd4" />
        </div>
      </div>

      {/* Upcoming */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming</p>
          <span className="text-[11px] text-slate-400">See all</span>
        </div>
        <div className="rounded-2xl p-5 text-center" style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
          <CalendarDays size={24} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">No upcoming sessions</p>
          <p className="text-xs text-slate-300 mt-0.5">Your cohort schedule will appear here</p>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Access</p>
        <div className="space-y-2">
          {[
            { icon: <Zap size={16} />, label: "Energy Track", sub: "ETF → ET01–ET05", color: "#c47d2a" },
            { icon: <Cpu size={16} />, label: "Semiconductor Track", sub: "SCF → SC01–SC03", color: "#4a9fd4" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}15`, color: item.color }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-700 text-sm">{item.label}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── COURSES tab ─────────────────────────────────────────── */
function CoursesTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-black text-slate-800 text-lg" style={{ fontFamily: "var(--font-playfair)" }}>My Courses</h2>
        <Badge variant="outline" className="text-[10px]" style={{ borderColor: "#e2e8f0", color: "#94a3b8" }}>0 enrolled</Badge>
      </div>
      <EmptyState
        icon={<GraduationCap size={32} />}
        title="No courses yet"
        sub="Once the admin assigns you to a cohort, your courses will appear here."
      />
    </div>
  );
}

/* ─── COHORTS tab ─────────────────────────────────────────── */
function CohortsTab() {
  return (
    <div>
      <h2 className="font-black text-slate-800 text-lg mb-5" style={{ fontFamily: "var(--font-playfair)" }}>My Cohorts</h2>
      <EmptyState
        icon={<Users size={32} />}
        title="Not in a cohort yet"
        sub="You'll be placed in a cohort after your enrollment is confirmed by the BAII team."
      />
    </div>
  );
}

/* ─── NEWS tab ────────────────────────────────────────────── */
function NewsTab() {
  return (
    <div>
      <h2 className="font-black text-slate-800 text-lg mb-5" style={{ fontFamily: "var(--font-playfair)" }}>News & Updates</h2>
      <EmptyState
        icon={<Newspaper size={32} />}
        title="No announcements yet"
        sub="Programme updates, cohort news, and BAII announcements will appear here."
      />
    </div>
  );
}

/* ─── LIBRARY tab ─────────────────────────────────────────── */
function LibraryTab() {
  return (
    <div>
      <h2 className="font-black text-slate-800 text-lg mb-5" style={{ fontFamily: "var(--font-playfair)" }}>Resource Library</h2>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: <BookMarked size={20} />, label: "Study Materials", count: 0, color: "#1a3a6b" },
          { icon: <FileText size={20} />, label: "Lab Reports", count: 0, color: "#c47d2a" },
          { icon: <GraduationCap size={20} />, label: "Assignments", count: 0, color: "#4a9fd4" },
          { icon: <Award size={20} />, label: "Certificates", count: 0, color: "#7c3aed" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${item.color}12`, color: item.color }}>
              {item.icon}
            </div>
            <p className="text-xs font-semibold text-slate-600">{item.label}</p>
            <p className="text-xl font-black mt-1" style={{ color: item.color, fontFamily: "var(--font-playfair)" }}>{item.count}</p>
          </div>
        ))}
      </div>
      <EmptyState
        icon={<Library size={32} />}
        title="Library is empty"
        sub="Your study materials, lab reports and resources will be available here once your course begins."
      />
    </div>
  );
}

/* ─── ACCOUNT tab ─────────────────────────────────────────── */
function AccountTab({ profile, onLogout }: { profile: Profile; onLogout: () => void }) {
  return (
    <div className="space-y-5">
      {/* Profile hero */}
      <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #235098 100%)" }}>
        <div className="flex justify-center mb-3">
          <Initials name={profile.full_name || "Student"} size={72} />
        </div>
        <h2 className="text-white font-black text-xl" style={{ fontFamily: "var(--font-playfair)" }}>{profile.full_name}</h2>
        <p className="text-white/60 text-sm mt-0.5">{profile.email}</p>
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: "rgba(196,125,42,0.25)", color: "#e8be72" }}>
            <Shield size={10} />
            {profile.role === "admin" ? "Admin" : "Student"}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 pt-4 pb-2">Personal Details</p>
        {[
          { icon: <Mail size={15} />, label: "Email", value: profile.email },
          { icon: <Phone size={15} />, label: "Phone", value: profile.phone || "Not set" },
          { icon: <School size={15} />, label: "School", value: profile.school || "Not set" },
          { icon: <MapPin size={15} />, label: "City", value: profile.city || "Not set" },
        ].map((item, i, arr) => (
          <div key={item.label}>
            <div className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(26,58,107,0.07)", color: "#1a3a6b" }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className={`text-sm font-medium truncate ${item.value === "Not set" ? "text-slate-300 italic" : "text-slate-700"}`}>{item.value}</p>
              </div>
            </div>
            {i < arr.length - 1 && <Separator className="ml-16" />}
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 pt-4 pb-2">Account</p>
        <button className="flex items-center gap-4 px-5 py-3.5 w-full hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(26,58,107,0.07)", color: "#1a3a6b" }}>
            <Settings size={15} />
          </div>
          <span className="text-sm font-medium text-slate-700 flex-1 text-left">Change Password</span>
          <ChevronRight size={14} className="text-slate-300" />
        </button>
        <Separator className="ml-16" />
        <button
          onClick={onLogout}
          className="flex items-center gap-4 px-5 py-3.5 w-full hover:bg-red-50 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
            <LogOut size={15} />
          </div>
          <span className="text-sm font-medium text-red-500 flex-1 text-left">Sign Out</span>
        </button>
      </div>

      <p className="text-center text-xs text-slate-300 pb-2">BAII Student Portal · v1.0</p>
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
export default function StudentDashboard() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    const sb = createClient();
    supabaseRef.current = sb;

    const loadProfile = async (userId: string) => {
      const { data: p } = await sb
        .from("profiles")
        .select("id, full_name, email, phone, school, city, role")
        .eq("id", userId)
        .single();

      if (!p) {
        // No profile row yet — use session metadata as fallback
        const { data: { session } } = await sb.auth.getSession();
        if (!session) { window.location.href = "/lms"; return; }
        setProfile({
          id: userId,
          full_name: session.user.user_metadata?.full_name || "Student",
          email: session.user.email || "",
          phone: null, school: null, city: null, role: "student",
        });
        setLoading(false);
        return;
      }

      if (p.role === "admin") { window.location.href = "/lms/admin"; return; }
      setProfile(p as Profile);
      setLoading(false);
    };

    async function init() {
      // 1. Check URL for tokens passed from login page
      const params = new URLSearchParams(window.location.search);
      const at = params.get("at");
      const rt = params.get("rt");

      if (at && rt) {
        // Remove tokens from URL immediately
        window.history.replaceState({}, "", "/lms/student");
        const { data, error } = await sb.auth.setSession({ access_token: at, refresh_token: rt });
        if (error || !data.session?.user) { window.location.href = "/lms"; return; }
        loadProfile(data.session.user.id);
        return;
      }

      // 2. Fallback: check existing localStorage session
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) { window.location.href = "/lms"; return; }
      loadProfile(session.user.id);
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabaseRef.current?.auth.signOut();
    router.push("/lms");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const renderContent = () => {
    if (!profile) return null;
    const views: Record<Tab, React.ReactNode> = {
      dashboard: <DashboardTab profile={profile} />,
      courses:   <CoursesTab />,
      cohorts:   <CohortsTab />,
      news:      <NewsTab />,
      library:   <LibraryTab />,
      account:   <AccountTab profile={profile} onLogout={handleLogout} />,
    };
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {views[activeTab]}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f1f5f9" }}>

      {/* ── DESKTOP SIDEBAR ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen"
        style={{ background: "#fff", borderRight: "1px solid #e2e8f0" }}>
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/baii-logo.svg" alt="BAII" style={{ width: 36, height: "auto" }} />
          <div>
            <p className="font-bold text-sm" style={{ color: "#1a3a6b" }}>BAII Portal</p>
            <p className="text-[10px] text-slate-400">Student Dashboard</p>
          </div>
        </div>

        {/* Profile mini */}
        <div className="px-4 py-4 mx-3 mt-4 rounded-2xl" style={{ background: "#f8fafc" }}>
          <div className="flex items-center gap-3">
            <Initials name={profile?.full_name || "S"} size={38} />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-700 truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? "rgba(26,58,107,0.08)" : "transparent",
                  color: active ? "#1a3a6b" : "#94a3b8",
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#c47d2a" }} />}
              </button>
            );
          })}
        </nav>

        {/* Account + logout */}
        <div className="px-3 pb-4 space-y-1" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={() => setActiveTab("account")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === "account" ? "rgba(26,58,107,0.08)" : "transparent",
              color: activeTab === "account" ? "#1a3a6b" : "#94a3b8",
            }}
          >
            <UserCircle size={18} />
            Account
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* ── TOP BAR ───────────────────────────────────── */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3.5"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0" }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/baii-logo.svg" alt="BAII" style={{ width: 30, height: "auto" }} />
            <span className="font-bold text-sm" style={{ color: "#1a3a6b" }}>
              {NAV.find(n => n.id === activeTab)?.label ?? "Dashboard"}
            </span>
          </div>

          {/* Desktop title */}
          <h1 className="hidden lg:block font-black text-lg" style={{ color: "#1a3a6b", fontFamily: "var(--font-playfair)" }}>
            {activeTab === "account" ? "Account" : NAV.find(n => n.id === activeTab)?.label}
          </h1>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: "#f1f5f9" }}>
              <Bell size={16} style={{ color: "#64748b" }} />
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className="w-9 h-9 rounded-xl overflow-hidden"
            >
              <Initials name={profile?.full_name || "S"} size={36} />
            </button>
          </div>
        </header>

        {/* ── CONTENT ───────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5"
          style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
          <div className="max-w-2xl mx-auto lg:max-w-3xl">
            {renderContent()}
          </div>
        </main>

        {/* ── BOTTOM NAV (mobile + tablet) ──────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid #e2e8f0",
            paddingBottom: "env(safe-area-inset-bottom)",
            height: "calc(64px + env(safe-area-inset-bottom))",
          }}>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative"
                style={{ minWidth: 56 }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(26,58,107,0.07)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.6}
                  style={{ color: active ? "#1a3a6b" : "#94a3b8", position: "relative" }}
                />
                <span
                  className="text-[10px] font-semibold relative"
                  style={{ color: active ? "#1a3a6b" : "#94a3b8" }}
                >
                  {label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -top-1 w-1 h-1 rounded-full"
                    style={{ background: "#c47d2a" }}
                  />
                )}
              </button>
            );
          })}

        </nav>
      </div>
    </div>
  );
}
