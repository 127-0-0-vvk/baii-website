"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import CourseSection from "./CourseSection";

export default function LandingPage() {
  const [enrollHovered, setEnrollHovered] = useState(false);
  const router = useRouter();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY       = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #ffffff 10%, #e8eef8 20%, #b8cce8 33%, #6a96c8 46%, #2a5898 57%, #1a3a6b 67%, #0d1f3c 80%, #080f1e 100%)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Copper bloom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: "rgba(196,125,42,0.12)" }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex justify-center"
          style={{ paddingTop: "clamp(24px, 5vh, 56px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/baii-logo.svg"
            alt="BAII — Bharat Advanced Innovation Incubator"
            className="float"
            style={{ width: "clamp(88px, 13vw, 210px)", height: "auto" }}
          />
        </motion.div>

        {/* Text + buttons */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, paddingBottom: "clamp(32px, 6vh, 80px)" }}
          className="relative z-10 flex flex-col items-center text-center px-6 flex-1 justify-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="glass-copper border-0 text-[10px] tracking-[0.2em] uppercase mb-6 px-4 py-1.5"
              style={{ color: "#c47d2a" }}
            >
              Bharat Advanced Innovation Incubator
            </Badge>
          </motion.div>

          {/* Headline */}
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

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.7 }}
            className="max-w-md leading-relaxed"
            style={{
              fontSize: "clamp(0.85rem, 1.6vw, 1rem)",
              color: "rgba(210, 225, 245, 0.78)",
              marginBottom: "clamp(28px, 4vh, 52px)",
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
            transition={{ delay: 0.68, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            {/* Enroll Now */}
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

            {/* Login */}
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

      {/* ── COURSE SECTION ───────────────────────────────────── */}
      <CourseSection />

    </div>
  );
}
