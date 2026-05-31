"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <section
        className="relative min-h-screen flex flex-col items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #ffffff 10%, #e8eef8 20%, #b8cce8 33%, #6a96c8 46%, #2a5898 57%, #1a3a6b 67%, #0d1f3c 80%, #080f1e 100%)",
        }}
      >
        {/* Circuit grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.015) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.015) 75%, rgba(255,255,255,0.015) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.015) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.015) 75%, rgba(255,255,255,0.015) 76%, transparent 77%)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Copper glow at bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(196,125,42,0.10)" }}
        />

        {/* ── Logo — top, fully blended ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex justify-center pt-6 md:pt-8 w-full"
        >
          <Image
            src="/baii-logo.png"
            alt="BAII — Bharat Advanced Innovation Incubator"
            width={400}
            height={400}
            priority
            style={{
              width: "clamp(110px, 18vw, 260px)",
              height: "auto",
              /* multiply makes pure white pixels fully transparent —
                 logo colours remain, white bg disappears into hero */
              mixBlendMode: "multiply",
            }}
          />
        </motion.div>

        {/* ── Text + button ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto w-full flex-1 justify-center mt-[-4vw]">

          {/* Org name */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="font-bold tracking-[0.22em] uppercase mb-5"
            style={{
              fontSize: "clamp(0.55rem, 1.1vw, 0.75rem)",
              color: "#1a3a6b",
            }}
          >
            Bharat Advanced Innovation Incubator
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-black leading-none tracking-tight mb-6 whitespace-nowrap"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.7rem, 6.2vw, 5rem)",
              color: "#ffffff",
              textShadow: "0 2px 40px rgba(0,0,0,0.4)",
            }}
          >
            India&apos;s Future Is Built Here.
          </motion.h1>

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="max-w-lg leading-relaxed mb-10"
            style={{
              fontSize: "clamp(0.88rem, 1.7vw, 1.05rem)",
              color: "rgba(210, 225, 245, 0.78)",
            }}
          >
            Real programmes. Real labs. Real outcomes.
            <br />
            For students who are done waiting to be taken seriously.
          </motion.p>

          {/* Enroll Now button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.72 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden rounded-full font-semibold tracking-wide"
            style={{
              fontSize: "clamp(0.82rem, 1.4vw, 0.95rem)",
              padding: "clamp(10px, 1.4vw, 14px) clamp(28px, 4vw, 48px)",
              color: hovered ? "#0d1f3c" : "#ffffff",
              background: "transparent",
              border: "1.5px solid rgba(255,255,255,0.75)",
              transition: "color 0.35s ease",
            }}
          >
            {/* Fill on hover */}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: "#ffffff", originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: hovered ? 1 : 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Animated border glow */}
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: hovered
                  ? "0 0 18px rgba(255,255,255,0.45), inset 0 0 12px rgba(255,255,255,0.08)"
                  : "0 0 0px rgba(255,255,255,0)",
                transition: "box-shadow 0.35s ease",
              }}
            />

            <span className="relative z-10">Enroll Now</span>
          </motion.button>
        </div>
      </section>
    </div>
  );
}
