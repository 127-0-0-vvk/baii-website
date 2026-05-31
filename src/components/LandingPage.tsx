"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #ffffff 12%, #e8eef8 22%, #b8cce8 35%, #6a96c8 48%, #2a5898 58%, #1a3a6b 68%, #0d1f3c 80%, #080f1e 100%)",
        }}
      >
        {/* Subtle circuit grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.015) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.015) 75%, rgba(255,255,255,0.015) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.015) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.015) 75%, rgba(255,255,255,0.015) 76%, transparent 77%)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Ambient copper glow — bottom dark area */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(196,125,42,0.10)" }}
        />

        {/* ── Logo — pinned at very top, blends into white ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex justify-center pt-8 md:pt-10 lg:pt-12 w-full"
        >
          {/* Soft white bloom so logo melts into background */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: "clamp(180px, 30vw, 420px)",
              height: "clamp(180px, 30vw, 420px)",
              background:
                "radial-gradient(circle, rgba(255,255,255,1) 30%, rgba(255,255,255,0.6) 55%, transparent 75%)",
            }}
          />
          <Image
            src="/baii-logo.png"
            alt="BAII — Bharat Advanced Innovation Incubator"
            width={400}
            height={400}
            priority
            style={{
              width: "clamp(120px, 20vw, 280px)",
              height: "auto",
              position: "relative",
            }}
          />
        </motion.div>

        {/* ── Text content — centered in remaining space ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto w-full flex-1 justify-center mt-[-2vw]">

          {/* Organisation name */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-bold tracking-[0.22em] uppercase mb-6"
            style={{
              fontSize: "clamp(0.6rem, 1.2vw, 0.8rem)",
              color: "#1a3a6b",
            }}
          >
            Bharat Advanced Innovation Incubator
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="font-black leading-none tracking-tight mb-7 whitespace-nowrap"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.8rem, 6.5vw, 5.2rem)",
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
            transition={{ duration: 0.7, delay: 0.58 }}
            className="max-w-lg leading-relaxed"
            style={{
              fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)",
              color: "rgba(210, 225, 245, 0.78)",
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
