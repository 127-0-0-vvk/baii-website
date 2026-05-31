"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, Cpu, ArrowRight, ChevronDown } from "lucide-react";
import EnrollModal from "./EnrollModal";

type Course = {
  code: string;
  title: string;
  description: string;
  duration: string;
  track: "energy" | "semiconductor";
  prerequisite_code: string | null;
};

const ENERGY_COURSES: Course[] = [
  { code: "ETF",  title: "Energy Foundation",               description: "Core fundamentals of energy science. The mandatory starting point for all Energy tracks.", duration: "6 weeks",    track: "energy", prerequisite_code: null  },
  { code: "ET01", title: "Solar & Storage",                 description: "Solar PV, battery management, energy audit, IoT meter.",                                   duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
  { code: "ET02", title: "Wind Systems",                    description: "Turbine mechanics, power curves, blade aerodynamics.",                                      duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
  { code: "ET03", title: "Hydrogen & Fuel Cells",           description: "Green hydrogen electrolysis, PEM fuel cells, storage.",                                     duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
  { code: "ET04", title: "Grid Integration & Smart Energy", description: "Smart grids, microgrids, SCADA, V2G, virtual power plants.",                                duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
  { code: "ET05", title: "Energy Materials Science",        description: "Perovskite solar cells, solid-state batteries, thermoelectrics.",                           duration: "3–4 months", track: "energy", prerequisite_code: "ETF" },
];

const SC_COURSES: Course[] = [
  { code: "SCF",  title: "Semiconductor Foundation", description: "Core fundamentals of semiconductor physics. Mandatory before all SC tracks.", duration: "6 weeks",    track: "semiconductor", prerequisite_code: null  },
  { code: "SC01", title: "Chip Design",              description: "VLSI basics, digital logic, CMOS, open-source EDA tools.",                    duration: "3–4 months", track: "semiconductor", prerequisite_code: "SCF" },
  { code: "SC02", title: "Power Semiconductors",     description: "MOSFETs, IGBTs, SiC & GaN — chips inside every inverter and EV.",             duration: "3–4 months", track: "semiconductor", prerequisite_code: "SCF" },
  { code: "SC03", title: "Sensors & MEMS",           description: "Pressure/temp sensors, MEMS accelerometers, IoT layer.",                      duration: "3–4 months", track: "semiconductor", prerequisite_code: "SCF" },
];

/* ─── compact track card ─────────────────────────────────────── */
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
    <div
      ref={cardRef}
      className="rounded-xl p-3.5 flex flex-col gap-2 h-full transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.08)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {course.code}
        </span>
        <span className="text-white/25 text-[10px]">{course.duration}</span>
      </div>
      <h4
        className="text-white font-bold text-xs leading-snug"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {course.title}
      </h4>
      <p className="text-white/40 text-[11px] leading-relaxed flex-1">{course.description}</p>
      <button
        onClick={() => onEnroll(course)}
        className="group flex items-center gap-1 text-[11px] font-semibold transition-colors w-fit mt-1"
        style={{ color: accentColor }}
      >
        Enroll
        <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
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
    <div
      ref={cardRef}
      className="rounded-2xl p-6 w-full max-w-sm mx-auto"
      style={{
        background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
        border: `1.5px solid ${accentColor}45`,
        boxShadow: `0 0 40px ${accentColor}10`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase"
          style={{ background: `${accentColor}25`, color: accentColor }}
        >
          {course.code} · Foundation
        </span>
        <span className="text-white/35 text-xs">{course.duration}</span>
      </div>
      <h3
        className="text-white font-black text-xl mb-2 leading-tight"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {course.title}
      </h3>
      <p className="text-white/55 text-sm leading-relaxed mb-4">{course.description}</p>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => onEnroll(course)}
          className="group flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, color: "#fff" }}
        >
          Enroll Interest
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
        >
          Mandatory first step
        </span>
      </div>
    </div>
  );
}

type LineData = { d: string };

/* ─── track section ──────────────────────────────────────────── */
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
  const containerRef   = useRef<HTMLDivElement>(null);
  const foundationRef  = useRef<HTMLDivElement | null>(null);
  const trackRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const [lines, setLines]     = useState<LineData[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const recalculate = useCallback(() => {
    const isMob = window.innerWidth < 768;
    setIsMobile(isMob);
    if (isMob) { setLines([]); return; }

    const container  = containerRef.current;
    const foundation = foundationRef.current;
    if (!container || !foundation) return;

    const cRect = container.getBoundingClientRect();
    const fRect = foundation.getBoundingClientRect();

    const fromX = fRect.left + fRect.width / 2 - cRect.left;
    const fromY = fRect.bottom - cRect.top;

    const newLines: LineData[] = [];
    trackRefs.current.forEach((ref) => {
      if (!ref) return;
      const tRect = ref.getBoundingClientRect();
      const toX   = tRect.left + tRect.width / 2 - cRect.left;
      const toY   = tRect.top - cRect.top;
      const midY  = fromY + (toY - fromY) * 0.5;
      newLines.push({
        d: `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`,
      });
    });

    setSvgSize({ w: cRect.width, h: cRect.height });
    setLines(newLines);
  }, []);

  useEffect(() => {
    const t = setTimeout(recalculate, 100);
    const ro = new ResizeObserver(recalculate);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", recalculate);
    return () => { clearTimeout(t); ro.disconnect(); window.removeEventListener("resize", recalculate); };
  }, [recalculate]);

  const cols = tracks.length <= 3 ? tracks.length : Math.ceil(tracks.length / 2);

  return (
    <div>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-10"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {icon}
        </div>
        <h3
          className="text-xl md:text-2xl font-black text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {title}
        </h3>
        <div
          className="h-px flex-1 ml-1 hidden sm:block"
          style={{ background: `linear-gradient(to right, ${accentColor}35, transparent)` }}
        />
      </motion.div>

      {/* Container (SVG + cards) */}
      <div ref={containerRef} className="relative">

        {/* Desktop SVG lines */}
        {!isMobile && svgSize.w > 0 && lines.length > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgSize.w}
            height={svgSize.h}
            style={{ zIndex: 1 }}
          >
            {lines.map((line, i) => {
              const parts = line.d.split(" ");
              const toX = parseFloat(parts[parts.length - 2]);
              const toY = parseFloat(parts[parts.length - 1]);
              const fromX = parseFloat(parts[1]);
              const fromY = parseFloat(parts[2]);
              return (
                <g key={i}>
                  <path
                    d={line.d}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={1.2}
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                  />
                  {i === 0 && (
                    <circle cx={fromX} cy={fromY} r={3} fill={accentColor} opacity={0.6} />
                  )}
                  <circle cx={toX} cy={toY} r={2.5} fill={accentColor} opacity={0.5} />
                </g>
              );
            })}
          </svg>
        )}

        {/* Foundation card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ zIndex: 2, position: "relative" }}
        >
          <FoundationCard
            course={foundation}
            accentColor={accentColor}
            onEnroll={onEnroll}
            cardRef={(el) => { foundationRef.current = el; }}
          />
        </motion.div>

        {/* Mobile connector arrow */}
        {isMobile && (
          <div className="flex flex-col items-center my-3" style={{ color: `${accentColor}60` }}>
            <div className="w-px h-5" style={{ background: `${accentColor}40` }} />
            <ChevronDown size={14} style={{ color: `${accentColor}60` }} />
          </div>
        )}

        {/* Spacer for desktop lines */}
        {!isMobile && <div className="h-12" />}

        {/* Track cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-3"
          style={{
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : `repeat(${cols}, 1fr)`,
            zIndex: 2,
            position: "relative",
          }}
        >
          {tracks.map((course, i) => (
            <motion.div
              key={course.code}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
            >
              <TrackCard
                course={course}
                accentColor={accentColor}
                onEnroll={onEnroll}
                cardRef={(el) => { trackRefs.current[i] = el; }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── main ───────────────────────────────────────────────────── */
export default function CourseSection() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <>
      <section
        id="courses"
        className="py-20 md:py-28"
        style={{
          background: "linear-gradient(180deg, #080f1e 0%, #0d1f3c 50%, #080f1e 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span
              className="text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full inline-block mb-4"
              style={{ background: "rgba(196,125,42,0.12)", color: "#c47d2a", border: "1px solid rgba(196,125,42,0.2)" }}
            >
              Programmes
            </span>
            <h2
              className="text-3xl md:text-5xl font-black text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Choose Your Track
            </h2>
            <p className="text-white/50 mt-3 max-w-md mx-auto text-sm">
              Start with the Foundation. Complete it to unlock any specialisation in that series.
            </p>
          </motion.div>

          <div className="mb-24">
            <TrackSection
              title="Energy Track"
              icon={<Zap size={16} />}
              accentColor="#c47d2a"
              foundation={ENERGY_COURSES[0]}
              tracks={ENERGY_COURSES.slice(1)}
              onEnroll={setSelectedCourse}
            />
          </div>

          <TrackSection
            title="Semiconductor Track"
            icon={<Cpu size={16} />}
            accentColor="#4a9fd4"
            foundation={SC_COURSES[0]}
            tracks={SC_COURSES.slice(1)}
            onEnroll={setSelectedCourse}
          />
        </div>
      </section>

      {selectedCourse && (
        <EnrollModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </>
  );
}
