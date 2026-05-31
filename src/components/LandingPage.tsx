"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight, Zap, Cpu, MapPin, Mail, Phone,
  GraduationCap, FlaskConical, Clock, Award, ArrowRight
} from "lucide-react";
import CourseSection from "./CourseSection";

/* ─── fade-up on scroll ──────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── stat card ──────────────────────────────────────────────── */
function StatCard({ value, label, color = "#c47d2a" }: { value: string; label: string; color?: string }) {
  return (
    <div className="glass rounded-2xl p-6 text-center">
      <p className="text-3xl md:text-4xl font-black mb-1" style={{ color, fontFamily: "var(--font-playfair)" }}>
        {value}
      </p>
      <p className="text-white/50 text-xs tracking-wide">{label}</p>
    </div>
  );
}

export default function LandingPage() {
  const [enrollHovered, setEnrollHovered] = useState(false);
  const router = useRouter();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #ffffff 0%, #ffffff 10%, #e8eef8 20%, #b8cce8 33%, #6a96c8 46%, #2a5898 57%, #1a3a6b 67%, #0d1f3c 80%, #080f1e 100%)",
        }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Copper bloom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none" style={{ background: "rgba(196,125,42,0.12)" }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex justify-center"
          style={{ paddingTop: "clamp(24px, 5vh, 56px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/baii-logo.svg" alt="BAII" className="float" style={{ width: "clamp(88px, 13vw, 210px)", height: "auto" }} />
        </motion.div>

        {/* Text */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, paddingBottom: "clamp(32px, 6vh, 80px)" }}
          className="relative z-10 flex flex-col items-center text-center px-6 flex-1 justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <Badge variant="outline" className="glass-copper border-0 text-[10px] tracking-[0.2em] uppercase mb-6 px-4 py-1.5" style={{ color: "#c47d2a" }}>
              Bharat Advanced Innovation Incubator
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="font-black leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.7rem, 6vw, 5.2rem)",
              color: "#ffffff",
              textShadow: "0 2px 40px rgba(0,0,0,0.4)",
              marginBottom: "clamp(12px, 2vh, 22px)",
            }}
          >
            India&apos;s Future Is Built Here.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.7 }}
            className="max-w-md leading-relaxed"
            style={{
              fontSize: "clamp(0.85rem, 1.6vw, 1rem)",
              color: "rgba(210,225,245,0.78)",
              marginBottom: "clamp(28px, 4vh, 52px)",
            }}
          >
            Real programmes. Real labs. Real outcomes.
            <br />Where India&apos;s builders are made.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.div
              onHoverStart={() => setEnrollHovered(true)}
              onHoverEnd={() => setEnrollHovered(false)}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden rounded-full cursor-pointer"
              onClick={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Button
                size="lg"
                className="relative rounded-full font-semibold tracking-wide border bg-transparent hover:bg-transparent"
                style={{
                  fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)",
                  padding: "clamp(10px, 1.4vw, 14px) clamp(24px, 3.5vw, 44px)",
                  color: enrollHovered ? "#0d1f3c" : "#ffffff",
                  border: "1.5px solid rgba(255,255,255,0.75)",
                  transition: "color 0.3s ease",
                  background: "transparent",
                  height: "auto",
                }}
              >
                <motion.span
                  className="absolute inset-0 rounded-full bg-white"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: enrollHovered ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Enroll Now <ChevronRight size={14} />
                </span>
              </Button>
            </motion.div>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/lms")}
              className="rounded-full font-semibold tracking-wide"
              style={{
                fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)",
                padding: "clamp(10px, 1.4vw, 14px) clamp(24px, 3.5vw, 44px)",
                color: "rgba(255,255,255,0.55)",
                border: "1.5px solid rgba(255,255,255,0.18)",
                height: "auto",
              }}
            >
              Login
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "#080f1e" }}>
        <div className="max-w-4xl mx-auto px-6">
          <FadeUp>
            <div className="grid grid-cols-3 gap-4">
              <StatCard value="90%" label="Semiconductors imported" color="#c47d2a" />
              <StatCard value="80%" label="Solar panels from China" color="#4a9fd4" />
              <StatCard value="0" label="Industry-tied programmes for students" color="#e8be72" />
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="mt-10 glass rounded-2xl p-8 text-center">
              <p className="text-xl md:text-2xl font-bold text-white leading-relaxed" style={{ fontFamily: "var(--font-playfair)" }}>
                &ldquo;The engineers who will fix this are in school right now.<br />
                <span className="text-copper">BAII is where they start.</span>&rdquo;
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* ── PROGRAMME HIGHLIGHTS ──────────────────────────── */}
      <section className="py-24" style={{ background: "linear-gradient(180deg, #080f1e 0%, #0d1f3c 100%)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp className="text-center mb-14">
            <Badge className="glass-copper border-0 mb-4 text-[10px] tracking-widest uppercase px-4 py-1.5" style={{ color: "#c47d2a" }}>
              What You Get
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white" style={{ fontFamily: "var(--font-playfair)" }}>
              Not a Classroom.<br />
              <span className="text-copper">A Launchpad.</span>
            </h2>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <GraduationCap size={22} />, title: "16 Structured Levels", desc: "Each level unlocks the next with industry benchmarks." },
              { icon: <FlaskConical size={22} />, title: "9 Hands-On Labs", desc: "You build, test, and document like a professional engineer." },
              { icon: <Clock size={22} />, title: "3–4 Months", desc: "Intensive weekend programme designed around your schedule." },
              { icon: <Award size={22} />, title: "BAII Certificate", desc: "Industry-tied certification that means something." },
            ].map((item, i) => (
              <FadeUp key={i} delay={0.08 * i}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="glass rounded-2xl p-6 h-full"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(196,125,42,0.15)", color: "#c47d2a" }}>
                    {item.icon}
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ──────────────────────────────────────────── */}
      <CourseSection />

      {/* ── FOR SCHOOLS ──────────────────────────────────────── */}
      <section className="py-24" style={{ background: "linear-gradient(180deg, #080f1e 0%, #0d1f3c 50%, #080f1e 100%)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <FadeUp className="text-center mb-14">
            <Badge className="glass-copper border-0 mb-4 text-[10px] tracking-widest uppercase px-4 py-1.5" style={{ color: "#c47d2a" }}>
              For Schools
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white" style={{ fontFamily: "var(--font-playfair)" }}>
              Partner With BAII
            </h2>
            <p className="text-white/50 mt-3 max-w-md mx-auto text-sm">Help your students access the most forward-looking programme in India — and earn as you do it.</p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <FadeUp delay={0.1}>
              <div className="space-y-3">
                {["Refer students, earn per successful enrolment", "BAII branding for your school", "Annual innovation summit — your students present", "No investment, no risk, just impact"].map((b, i) => (
                  <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(196,125,42,0.2)" }}>
                      <ArrowRight size={12} style={{ color: "#c47d2a" }} />
                    </div>
                    <span className="text-white/75 text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="glass rounded-2xl p-7" style={{ border: "1px solid rgba(196,125,42,0.2)" }}>
                <h3 className="text-white font-bold text-lg mb-5" style={{ fontFamily: "var(--font-playfair)" }}>Partner Enquiry</h3>
                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                  {["School name", "Contact name", "Phone number", "City"].map((p) => (
                    <input key={p} type="text" placeholder={p}
                      className="w-full rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-copper-600 transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  ))}
                  <Button className="w-full rounded-xl font-semibold text-white" style={{ background: "linear-gradient(135deg, #c47d2a, #d4913a)", height: "44px" }}>
                    Send Enquiry →
                  </Button>
                </form>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden" style={{ background: "#080f1e" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: "rgba(196,125,42,0.1)" }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <FadeUp>
            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
              Ready to <span className="shimmer">Build India</span>?
            </h2>
            <p className="text-white/50 mb-10 text-sm">Next cohort · 30 seats · Applications close when filled.</p>
            <Button
              size="lg"
              onClick={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full px-10 py-6 text-base font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #b87022, #c47d2a, #d4913a)", boxShadow: "0 0 60px rgba(196,125,42,0.45)", height: "auto" }}
            >
              Apply Now — Choose Your Track <ChevronRight size={18} className="ml-1" />
            </Button>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="py-14 border-t" style={{ background: "#050b16", borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/baii-logo.svg" alt="BAII" style={{ width: 52, height: "auto" }} className="mb-4 opacity-90" />
              <p className="text-white/40 text-sm leading-relaxed mb-4">Bharat Advanced Innovation Incubator.<br />Building India&apos;s next generation of innovators.</p>
              <div className="flex items-center gap-2">
                <span className="dot-live" />
                <span className="text-white/40 text-xs">Accepting applications · BP1 July 2025</span>
              </div>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-4">Programmes</p>
              <ul className="space-y-2 text-white/40 text-sm">
                {["ETF — Energy Foundation", "ET01 — Solar & Storage", "SCF — Semiconductor Foundation", "SC01 — Chip Design"].map((l) => (
                  <li key={l} className="hover:text-white/70 transition-colors cursor-pointer">{l}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-4">Contact</p>
              <ul className="space-y-3 text-white/40 text-sm">
                <li className="flex items-center gap-3"><Mail size={13} style={{ color: "#c47d2a" }} />hello@baii.in</li>
                <li className="flex items-center gap-3"><Phone size={13} style={{ color: "#c47d2a" }} />+91 98765 43210</li>
                <li className="flex items-center gap-3"><MapPin size={13} style={{ color: "#c47d2a" }} />Bengaluru, India</li>
              </ul>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs text-white border-white/15 bg-transparent hover:bg-white/5" onClick={() => router.push("/lms")}>
                  Login
                </Button>
                <Button size="sm" className="flex-1 rounded-lg text-xs text-white font-semibold" style={{ background: "linear-gradient(135deg, #c47d2a, #d4913a)" }} onClick={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>

          <Separator className="opacity-10 mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-xs">© 2025 Bharat Advanced Innovation Incubator. All rights reserved.</p>
            <p className="text-white/20 text-xs">Made in India 🇮🇳 · For India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
