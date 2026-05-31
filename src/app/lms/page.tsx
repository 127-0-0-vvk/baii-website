"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    if (authError) { setError(authError.message); setLoading(false); return; }

    let role = data.user.user_metadata?.role as string | undefined;
    try {
      const { data: p } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (p?.role) role = p.role;
    } catch { /* table may not exist yet */ }

    router.push(role === "admin" ? "/lms/admin" : "/lms/student");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #080f1e 0%, #0d1f3c 60%, #080f1e 100%)" }}
    >
      {/* Ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(196,125,42,0.07)" }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: "#ffffff" }}>
          {/* Top navy band */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: "linear-gradient(135deg, #0d1f3c 0%, #1a3a6b 100%)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/baii-logo.svg" alt="BAII" style={{ width: 80, height: "auto", margin: "0 auto 16px" }} />
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
              BAII Learning Portal
            </h1>
            <p className="text-white/50 text-xs mt-1">Sign in to access your dashboard</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold" style={{ color: "#1a3a6b" }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-offset-0 h-11"
                  style={{ "--tw-ring-color": "#c47d2a" } as React.CSSProperties}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold" style={{ color: "#1a3a6b" }}>Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-offset-0 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg, #1a3a6b, #235098)" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </span>
                ) : "Sign In →"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/25 text-xs mt-4">
          Access is by invitation only. &nbsp;
          <a href="/" className="text-white/45 hover:text-white/70 transition-colors underline underline-offset-2">← Back to site</a>
        </p>
      </motion.div>
    </div>
  );
}
