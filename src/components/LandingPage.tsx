"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #ffffff 12%, #e8eef8 22%, #b8cce8 35%, #6a96c8 48%, #2a5898 58%, #1a3a6b 68%, #0d1f3c 80%, #080f1e 100%)",
        }}
      >
        {/* Subtle circuit grid overlay on dark portion */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.015) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.015) 75%, rgba(255,255,255,0.015) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.015) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.015) 75%, rgba(255,255,255,0.015) 76%, transparent 77%)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Ambient glow on dark section */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(196,125,42,0.10)" }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto w-full">
          {/* Logo — sits on white, use blue logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
            style={{
              filter: "drop-shadow(0 4px 24px rgba(26,58,107,0.15))",
            }}
          >
            <Image
              src="/baii-logo.png"
              alt="BAII Logo"
              width={110}
              height={110}
              priority
            />
          </motion.div>

          {/* Organisation name — navy on the lighter gradient area */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xs font-bold tracking-[0.25em] uppercase mb-8"
            style={{ color: "#1a3a6b" }}
          >
            Bharat Advanced Innovation Incubator
          </motion.p>

          {/* Main headline — single line, responsive size */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-black leading-none tracking-tight mb-8 whitespace-nowrap"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem, 7vw, 5.5rem)",
              color: "#ffffff",
              textShadow: "0 2px 40px rgba(0,0,0,0.4)",
            }}
          >
            India&apos;s Future Is Built Here.
          </motion.h1>

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-xl leading-relaxed"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              color: "rgba(210, 225, 245, 0.80)",
            }}
          >
            Real programmes. Real labs. Real outcomes.
            <br />
            For students who are done waiting to be taken seriously.
          </motion.p>
        </div>
      </section>
    </div>
  );
}
