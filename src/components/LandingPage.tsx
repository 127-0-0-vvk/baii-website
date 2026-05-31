"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import CourseSection from "./CourseSection";

export default function LandingPage() {
  const [enrollHovered, setEnrollHovered] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);
  const router = useRouter();

  const scrollToCourses = () =>
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #ffffff 10%, #e8eef8 20%, #b8cce8 33%, #6a96c8 46%, #2a5898 57%, #1a3a6b 67%, #0d1f3c 80%, #080f1e 100%)",
        }}
      >
        {/* Circuit grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.015) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.015) 75%, rgba(255,255,255,0.015) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.015) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.015) 75%, rgba(255,255,255,0.015) 76%, transparent 77%)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Copper glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(196,125,42,0.10)" }}
        />

        {/* ── Logo — always at top, never overlaps text ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex justify-center"
          style={{ paddingTop: "clamp(24px, 5vh, 56px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/baii-logo.svg"
            alt="BAII — Bharat Advanced Innovation Incubator"
            style={{
              width: "clamp(88px, 14vw, 220px)",
              height: "auto",
            }}
          />
        </motion.div>

        {/* ── Text + buttons — fills remaining height, centered ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 flex-1 justify-center"
          style={{ paddingBottom: "clamp(32px, 6vh, 80px)" }}
        >
          {/* Org name */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="font-bold tracking-[0.22em] uppercase"
            style={{
              fontSize: "clamp(0.5rem, 1vw, 0.72rem)",
              color: "#1a3a6b",
              marginBottom: "clamp(12px, 2vh, 24px)",
            }}
          >
            Bharat Advanced Innovation Incubator
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-black leading-none tracking-tight whitespace-nowrap"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.5rem, 5.5vw, 4.8rem)",
              color: "#ffffff",
              textShadow: "0 2px 40px rgba(0,0,0,0.4)",
              marginBottom: "clamp(12px, 2vh, 24px)",
            }}
          >
            India&apos;s Future Is Built Here.
          </motion.h1>

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="max-w-lg leading-relaxed"
            style={{
              fontSize: "clamp(0.82rem, 1.5vw, 1rem)",
              color: "rgba(210, 225, 245, 0.78)",
              marginBottom: "clamp(24px, 4vh, 48px)",
            }}
          >
            Real programmes. Real labs. Real outcomes.
            <br />
            Where India&apos;s builders are made.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.72 }}
            className="flex items-center gap-4"
          >
            {/* Enroll Now */}
            <motion.button
              onHoverStart={() => setEnrollHovered(true)}
              onHoverEnd={() => setEnrollHovered(false)}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToCourses}
              className="relative overflow-hidden rounded-full font-semibold tracking-wide"
              style={{
                fontSize: "clamp(0.72rem, 1.2vw, 0.88rem)",
                padding: "clamp(9px, 1.2vw, 13px) clamp(22px, 3vw, 42px)",
                color: enrollHovered ? "#0d1f3c" : "#ffffff",
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,0.75)",
                transition: "color 0.35s ease",
              }}
            >
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: "#ffffff", originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: enrollHovered ? 1 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: enrollHovered ? "0 0 18px rgba(255,255,255,0.4)" : "none",
                  transition: "box-shadow 0.35s ease",
                }}
              />
              <span className="relative z-10">Enroll Now</span>
            </motion.button>

            {/* Login */}
            <motion.button
              onHoverStart={() => setLoginHovered(true)}
              onHoverEnd={() => setLoginHovered(false)}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/lms")}
              className="relative overflow-hidden rounded-full font-semibold tracking-wide"
              style={{
                fontSize: "clamp(0.72rem, 1.2vw, 0.88rem)",
                padding: "clamp(9px, 1.2vw, 13px) clamp(22px, 3vw, 42px)",
                color: loginHovered ? "#ffffff" : "rgba(255,255,255,0.55)",
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,0.22)",
                transition: "color 0.3s ease",
              }}
            >
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)", originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: loginHovered ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="relative z-10">Login</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── COURSE SECTION ───────────────────────────────────────── */}
      <CourseSection />
    </div>
  );
}
