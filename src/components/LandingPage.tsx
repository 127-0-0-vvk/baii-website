"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Zap,
  Cpu,
  GraduationCap,
  Building2,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Users,
  Clock,
  Award,
  BookOpen,
  FlaskConical,
  TrendingUp,
  Globe,
  Star,
  Send,
  Mail,
  Phone,
  MapPin,
  X,
} from "lucide-react";

/* ─── helpers ──────────────────────────────────────────────────── */

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ─── counter animation ─────────────────────────────────────────── */

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, motionVal, target]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ─── fade-up wrapper ────────────────────────────────────────────── */

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Apply Modal ────────────────────────────────────────────────── */

function ApplyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-2xl p-8 w-full max-w-lg relative"
              style={{
                background: "rgba(13, 31, 60, 0.95)",
                border: "1px solid rgba(196,125,42,0.3)",
              }}
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-copper-600/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-copper-400" />
                  </div>
                  <h3
                    className="text-2xl font-bold text-white mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Application Received!
                  </h3>
                  <p className="text-white/60 text-sm">
                    We&apos;ll reach out within 48 hours to schedule your
                    orientation call.
                  </p>
                </div>
              ) : (
                <>
                  <h3
                    className="text-2xl font-bold text-white mb-1"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Apply for Next Cohort
                  </h3>
                  <p className="text-white/50 text-sm mb-6">
                    BP1 · Energy Innovation · Starting July 2025
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-xs mb-1 block">
                          Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Your name"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs mb-1 block">
                          Age *
                        </label>
                        <input
                          required
                          type="number"
                          placeholder="15"
                          min="14"
                          max="20"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-white/60 text-xs mb-1 block">
                        School Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Delhi Public School, Bengaluru"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-xs mb-1 block">
                          City *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="City"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs mb-1 block">
                          Programme *
                        </label>
                        <select
                          required
                          className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-copper-500 transition-colors"
                        >
                          <option value="">Select</option>
                          <option value="bp1-energy">BP1 — Energy</option>
                          <option value="bp2-semi">
                            BP2 — Semiconductors (Coming)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-white/60 text-xs mb-1 block">
                        Parent&apos;s Phone *
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                      style={{
                        background:
                          "linear-gradient(135deg, #c47d2a, #e8be72, #c47d2a)",
                        backgroundSize: "200% auto",
                      }}
                    >
                      Submit Application →
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Landing Page ──────────────────────────────────────────── */

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const stats = [
    { value: 90, suffix: "%", label: "Semiconductors imported" },
    { value: 80, suffix: "%", label: "Solar panels from China" },
    { value: 0, suffix: "", label: "Industry-tied post-10 programmes" },
  ];

  const programme = [
    {
      icon: <BookOpen size={22} />,
      title: "16 Structured Levels",
      desc: "From theory to applied — each level unlocks the next with industry benchmarks.",
    },
    {
      icon: <FlaskConical size={22} />,
      title: "9 Hands-On Labs",
      desc: "Real energy systems. You build, test, and document like a professional engineer.",
    },
    {
      icon: <Clock size={22} />,
      title: "3–4 Months",
      desc: "Intensive weekend programme designed for post-10th students across India.",
    },
    {
      icon: <Award size={22} />,
      title: "BAII Certification",
      desc: "An industry-tied certificate that means something at college admission and job interviews.",
    },
    {
      icon: <TrendingUp size={22} />,
      title: "₹1 Lakh Investment",
      desc: "Complete programme fee. No hidden costs. EMI options available.",
    },
    {
      icon: <Users size={22} />,
      title: "Cohort-Based",
      desc: "Learn alongside 30 driven students. Bonds built here last a career.",
    },
  ];

  const whyItems = [
    {
      icon: "⚡",
      title: "Energy",
      color: "#c47d2a",
      points: [
        "India needs 500 GW of renewable capacity by 2030",
        "Solar, wind, hydrogen — all need engineers who start young",
        "Energy security = national security",
      ],
    },
    {
      icon: "💡",
      title: "Semiconductors",
      color: "#4a9fd4",
      points: [
        "Every phone, car, and weapon runs on chips",
        "India currently designs almost none of them",
        "₹76,000 crore fab incentive — zero trained talent pipeline",
      ],
    },
  ];

  const schoolBenefits = [
    "Refer students, earn per successful enrolment",
    "BAII branding for your school",
    "Annual innovation summit — your students present",
    "No investment, no risk, just impact",
  ];

  return (
    <div className="bg-navy-900 text-white overflow-x-hidden">
      <ApplyModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center circuit-bg overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top, #1a3a6b 0%, #0d1f3c 50%, #080f1e 100%)",
        }}
      >
        {/* Ambient blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(196,125,42,0.12)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
          style={{ background: "rgba(74,159,212,0.10)" }}
        />

        {/* Scroll-linked hero content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 animate-float"
          >
            <Image
              src="/baii-logo-white.png"
              alt="BAII Logo"
              width={100}
              height={100}
              priority
              className="drop-shadow-2xl"
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-copper rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ color: "#c47d2a" }}
          >
            Bharat Advanced Innovation Incubator
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            <span className="text-white text-glow-white">India&apos;s</span>
            <br />
            <span className="gradient-text-copper">Future</span>
            <br />
            <span className="text-white">Is Built Here.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-10"
          >
            The first applied innovation incubator for post-10th students.
            <br />
            <span style={{ color: "#c47d2a" }}>Energy</span> and{" "}
            <span style={{ color: "#4a9fd4" }}>Semiconductors</span> — the two
            sectors that decide whether India becomes a superpower.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => setModalOpen(true)}
              className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #b87022 0%, #c47d2a 40%, #d4913a 100%)",
                boxShadow: "0 0 40px rgba(196,125,42,0.4)",
              }}
            >
              Apply for Next Cohort
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <a
              href="#programme"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
              }}
            >
              Explore Programme
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 grid grid-cols-3 gap-8 md:gap-16"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-3xl md:text-4xl font-black mb-1"
                  style={{
                    color: i === 2 ? "#4a9fd4" : "#c47d2a",
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  <AnimatedCounter
                    target={s.value}
                    suffix={s.suffix}
                    duration={2 + i * 0.3}
                  />
                </div>
                <div className="text-white/50 text-xs tracking-wide">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={16} className="text-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── REALITY CHECK ────────────────────────────────────────── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #080f1e 0%, #0d1222 50%, #080f1e 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp>
            <p className="text-center text-white/40 text-sm tracking-widest uppercase mb-4">
              The reality
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2
              className="text-4xl md:text-6xl font-black text-center leading-tight mb-16"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              India imports what it{" "}
              <span className="gradient-text-copper">should be building.</span>
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                stat: "90%",
                label: "of semiconductors",
                detail:
                  "Every chip in every Indian smartphone comes from Taiwan, South Korea, or China.",
                color: "#c47d2a",
                icon: <Cpu size={24} />,
              },
              {
                stat: "80%",
                label: "of solar panels",
                detail:
                  "India&apos;s green energy future is built on Chinese supply chains.",
                color: "#4a9fd4",
                icon: <Globe size={24} />,
              },
              {
                stat: "2030",
                label: "the deadline",
                detail:
                  "India&apos;s 500 GW renewable target. Zero trained engineers in the pipeline.",
                color: "#e8be72",
                icon: <TrendingUp size={24} />,
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={0.1 * i}>
                <div
                  className="glass rounded-2xl p-6 h-full border-gradient"
                  style={{ borderColor: `${item.color}30` }}
                >
                  <div
                    className="mb-4 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div
                    className="text-5xl font-black mb-1"
                    style={{
                      color: item.color,
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    {item.stat}
                  </div>
                  <div className="text-white font-semibold mb-3">
                    {item.label}
                  </div>
                  <p
                    className="text-white/50 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.detail }}
                  />
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <div
              className="mt-12 rounded-2xl p-8 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(196,125,42,0.1) 0%, rgba(74,159,212,0.05) 100%)",
                border: "1px solid rgba(196,125,42,0.2)",
              }}
            >
              <p
                className="text-2xl md:text-3xl font-bold text-white leading-relaxed"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                &ldquo;The engineers who will fix this are in Class 10 right
                now.
                <br />
                <span className="gradient-text-copper">
                  BAII is where they start.
                </span>
                &rdquo;
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PROGRAMME ────────────────────────────────────────────── */}
      <section
        id="programme"
        className="relative py-28 circuit-bg overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #0d1f3c 0%, #1a3a6b 50%, #0d1f3c 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-4">
              <span
                className="glass-copper rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase inline-block"
                style={{ color: "#c47d2a" }}
              >
                Programme · BP1
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h2
              className="text-4xl md:text-6xl font-black text-center mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Energy{" "}
              <span className="gradient-text-copper">Innovation</span>{" "}
              <span className="text-white">Course</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="text-white/60 text-center max-w-2xl mx-auto mb-16 text-lg">
              Not a coaching class. Not another degree. A structured,
              industry-tied programme that turns a post-10th student into a
              certified, job-ready professional.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {programme.map((item, i) => (
              <FadeUp key={i} delay={0.05 * i}>
                <motion.div
                  className="glass rounded-2xl p-6 h-full cursor-default"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: "rgba(196,125,42,0.15)",
                      color: "#c47d2a",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          {/* Curriculum snapshot */}
          <FadeUp delay={0.2}>
            <div
              className="rounded-2xl p-8"
              style={{
                background: "rgba(8,15,30,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h3
                className="text-2xl font-bold text-white mb-6 text-center"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                What You&apos;ll Build
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Solar panel efficiency measurement system",
                  "Battery management circuit — from scratch",
                  "Wind turbine power output logger",
                  "Smart energy meter with IoT dashboard",
                  "Mini grid simulation model",
                  "Full energy audit report for a real building",
                  "Innovation pitch deck — investor-ready",
                  "Research paper — publishable standard",
                  "Portfolio of all 9 labs",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0"
                      style={{ color: "#c47d2a" }}
                    />
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── WHY THESE SECTORS ───────────────────────────────────── */}
      <section
        className="py-28 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080f1e, #0d1f3c)" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp>
            <h2
              className="text-4xl md:text-5xl font-black text-center mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Why These{" "}
              <span className="gradient-text-copper">Two Sectors</span>?
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-white/50 text-center max-w-xl mx-auto mb-16">
              Every other industry — defence, healthcare, EVs, AI — runs on
              energy and chips. Control these two and India controls its destiny.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8">
            {whyItems.map((item, i) => (
              <FadeUp key={i} delay={0.1 * i}>
                <motion.div
                  className="rounded-2xl p-8"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}12 0%, transparent 60%)`,
                    border: `1px solid ${item.color}25`,
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3
                    className="text-2xl font-bold mb-6"
                    style={{
                      color: item.color,
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <ul className="space-y-3">
                    {item.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          style={{ background: item.color }}
                        />
                        <span className="text-white/70 text-sm leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR SCHOOLS ──────────────────────────────────────────── */}
      <section
        className="py-28"
        style={{
          background:
            "linear-gradient(180deg, #0d1f3c 0%, #1a3a6b 50%, #0d1f3c 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-4">
              <span
                className="glass-copper rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase inline-block"
                style={{ color: "#c47d2a" }}
              >
                For Schools & Principals
              </span>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2
              className="text-4xl md:text-5xl font-black text-center mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Partner With{" "}
              <span className="gradient-text-copper">BAII</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="text-white/60 text-center max-w-xl mx-auto mb-16">
              Help your students access the most forward-looking education
              programme in India — and earn as you do it.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <FadeUp delay={0.1}>
              <div className="space-y-4">
                {schoolBenefits.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 glass rounded-xl p-4"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(196,125,42,0.15)" }}
                    >
                      <CheckCircle2 size={16} style={{ color: "#c47d2a" }} />
                    </div>
                    <span className="text-white/80 text-sm leading-relaxed">
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div
                className="rounded-2xl p-8"
                style={{
                  background: "rgba(8,15,30,0.8)",
                  border: "1px solid rgba(196,125,42,0.2)",
                }}
              >
                <h3
                  className="text-xl font-bold text-white mb-6"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Partner Enquiry
                </h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <input
                      type="text"
                      placeholder="School name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Principal / Contact name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-copper-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-semibold text-navy-900 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #c47d2a, #e8be72)" }}
                  >
                    <Send size={16} />
                    Send Enquiry
                  </button>
                </form>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── APPLY CTA ────────────────────────────────────────────── */}
      <section
        className="relative py-32 overflow-hidden"
        style={{ background: "#080f1e" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(196,125,42,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(196,125,42,0.08)" }}
        />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <FadeUp>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill="#c47d2a"
                  style={{ color: "#c47d2a" }}
                />
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h2
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Ready to{" "}
              <span className="shimmer-text">Build India</span>
              <span className="text-white">?</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Next cohort starts July 2025. 30 seats. Applications close when
              filled.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <button
              onClick={() => setModalOpen(true)}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-xl font-bold text-lg text-white transition-all duration-300 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, #b87022 0%, #c47d2a 40%, #d4913a 100%)",
                boxShadow: "0 0 60px rgba(196,125,42,0.5)",
              }}
            >
              Apply Now — BP1 Energy
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </FadeUp>

          <FadeUp delay={0.4}>
            <p className="text-white/30 text-sm mt-6">
              No entrance exam · Open to Class 10 pass-outs across India
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className="relative py-16"
        style={{
          background:
            "linear-gradient(180deg, #080f1e 0%, #050b16 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <Image
                src="/baii-logo-white.png"
                alt="BAII"
                width={56}
                height={56}
                className="mb-4 opacity-90"
              />
              <p className="text-white/40 text-sm leading-relaxed mb-4">
                Bharat Advanced Innovation Incubator.
                <br />
                Building India&apos;s next generation of innovators — one
                cohort at a time.
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "#4ade80",
                    boxShadow: "0 0 6px #4ade80",
                  }}
                />
                <span className="text-white/40 text-xs">
                  Accepting applications · BP1 July 2025
                </span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">
                Programmes
              </h4>
              <ul className="space-y-2">
                {[
                  "BP1 — Energy Innovation",
                  "BP2 — Semiconductors (Coming)",
                  "For Schools",
                  "About BAII",
                ].map((link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-white/40 hover:text-copper-400 text-sm transition-colors"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/40 text-sm">
                  <Mail size={14} style={{ color: "#c47d2a" }} />
                  hello@baii.in
                </li>
                <li className="flex items-center gap-3 text-white/40 text-sm">
                  <Phone size={14} style={{ color: "#c47d2a" }} />
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-3 text-white/40 text-sm">
                  <MapPin size={14} style={{ color: "#c47d2a" }} />
                  Bengaluru, India
                </li>
              </ul>

              {/* Login / Signup */}
              <div className="flex gap-3 mt-8">
                <button
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                >
                  Login
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #c47d2a, #d4913a)",
                    color: "white",
                  }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-white/25 text-xs">
              © 2025 Bharat Advanced Innovation Incubator. All rights reserved.
            </p>
            <p className="text-white/25 text-xs">
              Made in India 🇮🇳 · For India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
