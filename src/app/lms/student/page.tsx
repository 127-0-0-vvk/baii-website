"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogOut, BookOpen, Award, Clock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  email: string;
  school: string | null;
  city: string | null;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => typeof window !== "undefined" ? createClient() : null as unknown as ReturnType<typeof createClient>);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/lms"); return; }
      supabase.from("profiles").select("full_name, email, school, city, role")
        .eq("id", data.user.id).single()
        .then(({ data: p }) => {
          if (!p) { router.push("/lms"); return; }
          if (p.role === "admin") { router.push("/lms/admin"); return; }
          setProfile(p);
          setLoading(false);
        });
    });
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/lms");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080f1e" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#c47d2a", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #080f1e, #0d1f3c)" }}>
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
            <p className="text-white font-semibold text-sm leading-tight">BAII Student Portal</p>
            <p className="text-white/40 text-xs">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1
            className="text-3xl font-black text-white mb-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Welcome, {profile?.full_name?.split(" ")[0] ?? "Student"}.
          </h1>
          <p className="text-white/50 text-sm">
            {profile?.school && `${profile.school} · `}
            {profile?.city}
          </p>
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl p-6 mb-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "rgba(196,125,42,0.15)" }}
            >
              <User size={22} style={{ color: "#c47d2a" }} />
            </div>
            <div>
              <p className="text-white font-semibold">{profile?.full_name}</p>
              <p className="text-white/50 text-sm">{profile?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            { icon: <BookOpen size={20} />, label: "Enrolled Courses", value: "—", note: "Assigned by admin" },
            { icon: <Clock size={20} />, label: "Hours Completed", value: "—", note: "Tracked per cohort" },
            { icon: <Award size={20} />, label: "Certificates", value: "—", note: "After completion" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className="rounded-xl p-5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="mb-3" style={{ color: "#c47d2a" }}>{item.icon}</div>
              <p className="text-2xl font-black text-white mb-0.5" style={{ fontFamily: "var(--font-playfair)" }}>
                {item.value}
              </p>
              <p className="text-white/60 text-sm font-medium">{item.label}</p>
              <p className="text-white/30 text-xs mt-1">{item.note}</p>
            </motion.div>
          ))}
        </div>

        {/* Courses placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="rounded-2xl p-8 text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <BookOpen size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-white/50 text-sm font-medium">No courses assigned yet</p>
          <p className="text-white/30 text-xs mt-1">
            Your cohort will be confirmed by the BAII team. Check back soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
