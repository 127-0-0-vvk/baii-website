"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, Cpu, ArrowRight } from "lucide-react";
import EnrollModal from "./EnrollModal";

/* ─── types ──────────────────────────────────────────────────── */
type Course = {
  code: string;
  title: string;
  description: string;
  duration: string;
  track: "energy" | "semiconductor";
  prerequisite_code: string | null;
};

/* ─── data ───────────────────────────────────────────────────── */
const ENERGY_COURSES: Course[] = [
  { code: "ETF",  title: "Energy Foundation",               description: "Core fundamentals of energy science. The mandatory starting point for all Energy tracks.", duration: "6 weeks",    track: "energy", prerequisite_code: null  },
  { code: "ET01", title: "Solar & Storage",                 description: "Solar PV systems, battery management, energy audit, smart meter with IoT dashboard.",       duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
  { code: "ET02", title: "Wind Systems",                    description: "Turbine mechanics, power curves, blade aerodynamics, site assessment.",                      duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
  { code: "ET03", title: "Hydrogen & Fuel Cells",           description: "Green hydrogen electrolysis, PEM fuel cells, hydrogen storage and safety.",                  duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
  { code: "ET04", title: "Grid Integration & Smart Energy", description: "Smart grids, microgrids, SCADA, demand response, V2G, virtual power plants.",               duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
  { code: "ET05", title: "Energy Materials Science",        description: "Perovskite solar cells, solid-state batteries, thermoelectrics.",                            duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
];

const SC_COURSES: Course[] = [
  { code: "SCF",  title: "Semiconductor Foundation",   description: "Core fundamentals of semiconductor physics. Mandatory before all Semiconductor tracks.", duration: "6 weeks",    track: "semiconductor", prerequisite_code: null  },
  { code: "SC01", title: "Chip Design Fundamentals",   description: "VLSI basics, digital logic, CMOS, open-source EDA tools (OpenROAD, Magic VLSI).",         duration: "3–4 months", track: "semiconductor", prerequisite_code: "SCF" },
  { code: "SC02", title: "Power Semiconductors",       description: "MOSFETs, IGBTs, SiC & GaN — chips inside every solar inverter, EV and wind turbine.",     duration: "3–4 months", track: "semiconductor", prerequisite_code: "SCF" },
  { code: "SC03", title: "Sensors & MEMS",             description: "Pressure/temp sensors, MEMS accelerometers, IoT integration layer.",                       duration: "3–4 months", track: "semiconductor", prerequisite_code: "SCF" },
];

/* ─── small track card ───────────────────────────────────────── */
function TrackCard({
  course,
  accentColor,
  onEnroll,
  cardRef,
}: {
  course: Course;
  accentColor: string;
  onEnroll: (c: Course) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={cardRef}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="rounded-2xl p-5 flex flex-col gap-3 h-full"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.08)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {course.code}
        </span>
        <span className="text-white/30 text-xs">{course.duration}</span>
      </div>
      <h4
        className="text-white font-bold text-sm leading-snug flex-1"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {course.title}
      </h4>
      <p className="text-white/45 text-xs leading-relaxed">{course.description}</p>
      <button
        onClick={() => onEnroll(course)}
        className="group flex items-center gap-1.5 text-xs font-semibold transition-colors w-fit mt-auto"
        style={{ color: accentColor }}
      >
        Enroll Interest
        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

/* ─── foundation card ────────────────────────────────────────── */
function FoundationCard({
  course,
  accentColor,
  onEnroll,
  cardRef,
}: {
  course: Course;
  accentColor: string;
  onEnroll: (c: Course) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={cardRef}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 250, damping: 22 }}
      className="rounded-2xl p-7 w-full max-w-md mx-auto"
      style={{
        background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
        border: `1.5px solid ${accentColor}45`,
        boxShadow: `0 0 48px ${accentColor}12`,
      }}
    >
      {/* Mandatory badge */}
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-xs font-black tracking-widest px-3 py-1.5 rounded-full uppercase"
          style={{ background: `${accentColor}25`, color: accentColor }}
        >
          {course.code} · Foundation
        </span>
        <span className="text-white/35 text-xs">{course.duration}</span>
      </div>

      <h3
        className="text-white font-black text-2xl mb-3 leading-tight"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {course.title}
      </h3>
      <p className="text-white/55 text-sm leading-relaxed mb-5">
        {course.description}
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onEnroll(course)}
          className="group flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: "#fff" }}
        >
          Enroll Interest
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
        >
          Mandatory first step
        </span>
      </div>
    </motion.div>
  );
}

/* ─── line types ─────────────────────────────────────────────── */
type Line = { d: string };

/* ─── track section with live SVG lines ─────────────────────── */
function TrackSection({
  title,
  icon,
  accentColor,
  foundation,
  tracks,
  onEnroll,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  foundation: Course;
  tracks: Course[];
  onEnroll: (c: Course) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const foundationRef = useRef<HTMLDivElement | null>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    const foundation = foundationRef.current;
    if (!container || !foundation) return;

    const cRect = container.getBoundingClientRect();
    const fRect = foundation.getBoundingClientRect();

    const fromX = fRect.left + fRect.width / 2 - cRect.left;
    const fromY = fRect.bottom - cRect.top;

    const newLines: Line[] = [];

    trackRefs.current.forEach((ref) => {
      if (!ref) return;
      const tRect = ref.getBoundingClientRect();
      const toX = tRect.left + tRect.width / 2 - cRect.left;
      const toY = tRect.top - cRect.top;

      // Cubic bezier: start vertical, end vertical
      const midY = (fromY + toY) / 2;
      const d = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
      newLines.push({ d });
    });

    setSvgSize({ w: cRect.width, h: cRect.height });
    setLines(newLines);
  }, []);

  useEffect(() => {
    // Small delay so layout settles after hydration
    const t = setTimeout(recalculate, 80);
    const observer = new ResizeObserver(recalculate);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", recalculate);
    return () => {
      clearTimeout(t);
      observer.disconnect();
      window.removeEventListener("resize", recalculate);
    };
  }, [recalculate]);

  return (
    <div>
      {/* Track heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-10"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {icon}
        </div>
        <h3
          className="text-2xl md:text-3xl font-black text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {title}
        </h3>
        <div
          className="h-px flex-1 ml-2 hidden sm:block"
          style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }}
        />
      </motion.div>

      {/* The measured container — SVG lines are absolute inside this */}
      <div ref={containerRef} className="relative">

        {/* SVG overlay — sits between foundation and track cards */}
        {svgSize.w > 0 && lines.length > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgSize.w}
            height={svgSize.h}
            style={{ zIndex: 1 }}
          >
            {/* Dot at foundation exit */}
            {lines[0] && (
              <circle
                cx={parseFloat(lines[0].d.split(" ")[1])}
                cy={parseFloat(lines[0].d.split(" ")[2])}
                r={4}
                fill={accentColor}
                opacity={0.7}
              />
            )}
            {lines.map((line, i) => (
              <g key={i}>
                <path
                  d={line.d}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={1.5}
                  strokeOpacity={0.35}
                  strokeLinecap="round"
                />
                {/* Dot at track card entry */}
                <circle
                  cx={parseFloat(line.d.split(" ").slice(-2)[0])}
                  cy={parseFloat(line.d.split(" ").slice(-1)[0])}
                  r={3}
                  fill={accentColor}
                  opacity={0.55}
                />
              </g>
            ))}
          </svg>
        )}

        {/* Foundation card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="relative"
          style={{ zIndex: 2 }}
        >
          <FoundationCard
            course={foundation}
            accentColor={accentColor}
            onEnroll={onEnroll}
            cardRef={(el) => { foundationRef.current = el; }}
          />
        </motion.div>

        {/* Spacer between foundation and track cards — lines fill this gap */}
        <div className="h-14 md:h-16" />

        {/* Track cards grid */}
        <div
          className="relative grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(tracks.length, 2)}, 1fr)`,
            zIndex: 2,
          }}
        >
          {/* On md+: override to show all in one row if ≤5 */}
          <style>{`
            @media (min-width: 768px) {
              .track-grid-${foundation.code} {
                grid-template-columns: repeat(${tracks.length}, 1fr) !important;
              }
            }
            @media (min-width: 480px) and (max-width: 767px) {
              .track-grid-${foundation.code} {
                grid-template-columns: repeat(${Math.min(tracks.length, 3)}, 1fr) !important;
              }
            }
          `}</style>
          <div
            className={`grid gap-4 w-full track-grid-${foundation.code}`}
            style={{ gridTemplateColumns: "repeat(2, 1fr)", gridColumn: "1 / -1" }}
          >
            {tracks.map((course, i) => (
              <motion.div
                key={course.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.06 * i }}
                style={{ zIndex: 2 }}
              >
                <TrackCard
                  course={course}
                  accentColor={accentColor}
                  onEnroll={onEnroll}
                  cardRef={(el) => { trackRefs.current[i] = el; }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main export ────────────────────────────────────────────── */
export default function CourseSection() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <>
      <section
        id="courses"
        className="py-24 md:py-32"
        style={{
          background: "linear-gradient(180deg, #080f1e 0%, #0d1f3c 50%, #080f1e 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <span
              className="text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full inline-block mb-4"
              style={{
                background: "rgba(196,125,42,0.12)",
                color: "#c47d2a",
                border: "1px solid rgba(196,125,42,0.2)",
              }}
            >
              Programmes
            </span>
            <h2
              className="text-4xl md:text-5xl font-black text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Choose Your Track
            </h2>
            <p className="text-white/50 mt-3 max-w-lg mx-auto text-sm md:text-base">
              Start with the Foundation course. Complete it to unlock any
              specialisation in that series.
            </p>
          </motion.div>

          {/* Energy Track */}
          <div className="mb-28">
            <TrackSection
              title="Energy Track"
              icon={<Zap size={18} />}
              accentColor="#c47d2a"
              foundation={ENERGY_COURSES[0]}
              tracks={ENERGY_COURSES.slice(1)}
              onEnroll={setSelectedCourse}
            />
          </div>

          {/* Semiconductor Track */}
          <TrackSection
            title="Semiconductor Track"
            icon={<Cpu size={18} />}
            accentColor="#4a9fd4"
            foundation={SC_COURSES[0]}
            tracks={SC_COURSES.slice(1)}
            onEnroll={setSelectedCourse}
          />
        </div>
      </section>

      {selectedCourse && (
        <EnrollModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}
