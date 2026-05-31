"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LMSLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Try profiles table first; fall back to user_metadata for resilience
    let role = data.user.user_metadata?.role as string | undefined;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profile?.role) role = profile.role;
    } catch { /* profiles table may not exist yet */ }

    router.push(role === "admin" ? "/lms/admin" : "/lms/student");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #080f1e 0%, #0d1f3c 50%, #080f1e 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(196,125,42,0.08)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(26,58,107,0.1)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          }}
        >
          {/* Logo — identical to main page hero */}
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/baii-logo.svg"
              alt="BAII"
              style={{ width: 80, height: "auto" }}
            />
          </div>

          <h1
            className="text-xl font-bold text-center mb-1"
            style={{ fontFamily: "var(--font-playfair)", color: "#1a3a6b" }}
          >
            BAII Learning Portal
          </h1>
          <p className="text-xs text-center mb-7" style={{ color: "rgba(26,58,107,0.5)" }}>
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: "#1a3a6b" }}>Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: "#f4f7fb",
                  border: "1px solid rgba(26,58,107,0.15)",
                  color: "#1a3a6b",
                  focusRingColor: "#1a3a6b",
                }}
              />
            </div>

            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: "#1a3a6b" }}>Password</label>
              <div className="relative">
                <input
                  required
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3.5 py-2.5 pr-10 text-sm focus:outline-none transition-all"
                  style={{
                    background: "#f4f7fb",
                    border: "1px solid rgba(26,58,107,0.15)",
                    color: "#1a3a6b",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(26,58,107,0.35)" }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ background: "linear-gradient(135deg, #c47d2a, #d4913a)" }}
            >
              <LogIn size={15} />
              {loading ? "Signing in…" : "Sign In"}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          Access is by invitation only.{" "}
          <a href="/" className="text-white/40 hover:text-white/60 transition-colors">← Back to site</a>
        </p>
      </motion.div>
    </div>
  );
}
