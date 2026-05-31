"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Cpu, ArrowRight } from "lucide-react";
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
  {
    code: "ETF",
    title: "Energy Foundation",
    description:
      "Core fundamentals of energy science. Mandatory starting point for all energy tracks.",
    duration: "6 weeks",
    track: "energy",
    prerequisite_code: null,
  },
  {
    code: "ET01",
    title: "Solar & Storage",
    description:
      "Solar PV systems, battery management, energy audit, smart meter with IoT dashboard.",
    duration: "3–4 months",
    track: "energy",
    prerequisite_code: "ETF",
  },
  {
    code: "ET02",
    title: "Wind Systems",
    description:
      "Turbine mechanics, power curves, blade aerodynamics, site assessment.",
    duration: "3–4 months",
    track: "energy",
    prerequisite_code: "ETF",
  },
  {
    code: "ET03",
    title: "Hydrogen & Fuel Cells",
    description:
      "Green hydrogen electrolysis, PEM fuel cells, hydrogen storage and safety.",
    duration: "3–4 months",
    track: "energy",
    prerequisite_code: "ETF",
  },
  {
    code: "ET04",
    title: "Grid Integration & Smart Energy",
    description:
      "Smart grids, microgrids, SCADA, demand response, V2G, virtual power plants.",
    duration: "3–4 months",
    track: "energy",
    prerequisite_code: "ETF",
  },
  {
    code: "ET05",
    title: "Energy Materials Science",
    description:
      "Perovskite solar cells, solid-state batteries, thermoelectrics.",
    duration: "3–4 months",
    track: "energy",
    prerequisite_code: "ETF",
  },
];

const SC_COURSES: Course[] = [
  {
    code: "SCF",
    title: "Semiconductor Foundation",
    description:
      "Core fundamentals of semiconductor physics. Mandatory before all SC tracks.",
    duration: "6 weeks",
    track: "semiconductor",
    prerequisite_code: null,
  },
  {
    code: "SC01",
    title: "Chip Design Fundamentals",
    description:
      "VLSI basics, digital logic, CMOS, open-source EDA tools (OpenROAD, Magic VLSI).",
    duration: "3–4 months",
    track: "semiconductor",
    prerequisite_code: "SCF",
  },
  {
    code: "SC02",
    title: "Power Semiconductors",
    description:
      "MOSFETs, IGBTs, SiC & GaN — chips inside every solar inverter, EV and wind turbine.",
    duration: "3–4 months",
    track: "semiconductor",
    prerequisite_code: "SCF",
  },
  {
    code: "SC03",
    title: "Sensors & MEMS",
    description:
      "Pressure/temp sensors, MEMS accelerometers, IoT integration layer.",
    duration: "3–4 months",
    track: "semiconductor",
    prerequisite_code: "SCF",
  },
];

function CourseCard({
  course,
  isFoundation,
  accentColor,
  onEnroll,
}: {
  course: Course;
  isFoundation: boolean;
  accentColor: string;
  onEnroll: (c: Course) => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="rounded-2xl p-5 flex flex-col gap-3 cursor-default"
      style={{
        background: isFoundation
          ? `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${isFoundation ? accentColor + "40" : "rgba(255,255,255,0.08)"}`,
        boxShadow: isFoundation
          ? `0 0 40px ${accentColor}15`
          : undefined,
      }}
    >
      {/* Code badge */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full"
          style={{
            background: `${accentColor}20`,
            color: accentColor,
          }}
        >
          {course.code}
        </span>
        <span className="text-white/30 text-xs">{course.duration}</span>
      </div>

      {/* Title */}
      <h4
        className="text-white font-bold text-base leading-snug"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {course.title}
      </h4>

      {/* Description */}
      <p className="text-white/50 text-xs leading-relaxed flex-1">
        {course.description}
      </p>

      {/* Enroll button */}
      <button
        onClick={() => onEnroll(course)}
        className="group flex items-center gap-1.5 text-xs font-semibold transition-colors mt-1 w-fit"
        style={{ color: accentColor }}
      >
        Enroll Interest
        <ArrowRight
          size={13}
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
    </motion.div>
  );
}

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
  return (
    <div className="w-full">
      {/* Track heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-10"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
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
          className="h-px flex-1 ml-2"
          style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }}
        />
      </motion.div>

      {/* Foundation card — centered, full width capped */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="max-w-sm mx-auto mb-0"
      >
        <CourseCard
          course={foundation}
          isFoundation
          accentColor={accentColor}
          onEnroll={onEnroll}
        />
      </motion.div>

      {/* Connector lines SVG — foundation to track cards */}
      <div className="flex justify-center my-2 relative" style={{ height: 48 }}>
        <svg
          width="100%"
          height="48"
          viewBox="0 0 800 48"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Vertical stem from foundation card */}
          <line x1="400" y1="0" x2="400" y2="24" stroke={accentColor} strokeOpacity="0.4" strokeWidth="1.5" />
          {/* Horizontal bar */}
          <line x1="80" y1="24" x2="720" y2="24" stroke={accentColor} strokeOpacity="0.3" strokeWidth="1" />
          {/* 5 drops to cards */}
          {[80, 240, 400, 560, 720].map((x, i) => (
            <line key={i} x1={x} y1="24" x2={x} y2="48" stroke={accentColor} strokeOpacity="0.35" strokeWidth="1" />
          ))}
        </svg>
      </div>

      {/* Track cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {tracks.map((course, i) => (
          <motion.div
            key={course.code}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.05 * i }}
          >
            <CourseCard
              course={course}
              isFoundation={false}
              accentColor={accentColor}
              onEnroll={onEnroll}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

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
        <div className="max-w-7xl mx-auto px-6">
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
            <p className="text-white/50 mt-3 max-w-xl mx-auto text-sm md:text-base">
              Each track begins with a mandatory Foundation course. Complete it to
              unlock any specialisation in that series.
            </p>
          </motion.div>

          {/* Energy Track */}
          <div className="mb-24">
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

      {/* Enroll modal */}
      {selectedCourse && (
        <EnrollModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}
