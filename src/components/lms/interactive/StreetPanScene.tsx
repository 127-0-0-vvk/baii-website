"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

// A cinematic 2D street: the "camera" pans across a wide SVG while objects pop in
// with staggered springs and a parallax background — anime.js-landing-page style.
export default function StreetPanScene({ accent }: { accent: string }) {
  const trackRef = useRef<SVGGElement>(null);
  const bgRef = useRef<SVGGElement>(null);

  // Objects laid out along a wide track. x positions drive both placement and reveal order.
  const objects: { x: number; el: React.ReactNode; label?: string }[] = [
    { x: 120, label: "person", el: <Person color="#3b82f6" /> },
    { x: 300, label: "car", el: <Car /> },
    { x: 520, el: <Shop x={0} color="#e07a5f" /> },
    { x: 690, label: "scooter", el: <Scooter /> },
    { x: 860, el: <Shop x={0} color="#81b29a" /> },
    { x: 1010, label: "chair", el: <Chair /> },
    { x: 1150, label: "traffic light", el: <TrafficLight /> },
    { x: 1320, label: "person", el: <Person color="#ec4899" /> },
  ];
  const TRACK_W = 1480;
  const VIEW_W = 720; // logical viewBox width of the visible camera

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Reveal objects with a stagger, scaled + rising like a spring.
    anime.set(".sp-obj", { opacity: 0, translateY: 26, scale: 0.6 });
    anime({ targets: ".sp-obj", opacity: [0, 1], translateY: [26, 0], scale: [0.6, 1], delay: anime.stagger(260, { start: 300 }), duration: 700, easing: "easeOutElastic(1, .7)" });
    anime.set(".sp-label", { opacity: 0, translateY: 8 });
    anime({ targets: ".sp-label", opacity: [0, 1], translateY: [8, 0], delay: anime.stagger(260, { start: 700 }), duration: 500, easing: "easeOutCubic" });

    if (reduce) return;
    // Camera pan: translate the foreground track from start to end.
    anime({ targets: trackRef.current, translateX: [40, -(TRACK_W - VIEW_W) - 40], duration: 9000, easing: "easeInOutSine" });
    // Parallax background moves slower.
    anime({ targets: bgRef.current, translateX: [20, -(TRACK_W - VIEW_W) * 0.45], duration: 9000, easing: "easeInOutSine" });
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-2xl" style={{ border: `1px solid ${accent}20`, background: "linear-gradient(180deg,#eaf2ff,#ffffff)" }}>
      <svg viewBox={`0 0 ${VIEW_W} 300`} width="100%" style={{ display: "block" }}>
        {/* sky */}
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe3ff" /><stop offset="1" stopColor="#eef5ff" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={VIEW_W} height="300" fill="url(#sky)" />

        {/* parallax background buildings */}
        <g ref={bgRef}>
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x={40 + i * 110} y={120 - (i % 3) * 22} width="80" height={140 + (i % 3) * 22} rx="6" fill="#c7d6ef" opacity={0.7} />
          ))}
        </g>

        {/* road */}
        <rect x="0" y="232" width={VIEW_W} height="68" fill="#3f3f46" />
        <rect x="0" y="226" width={VIEW_W} height="8" fill="#facc15" opacity="0.8" />

        {/* foreground track (camera pans this) */}
        <g ref={trackRef}>
          {objects.map((o, i) => (
            <g key={i} transform={`translate(${o.x}, 132)`}>
              <g className="sp-obj" style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}>{o.el}</g>
              {o.label && (
                <g className="sp-label" transform="translate(0,-96)">
                  <rect x="-44" y="-14" width="88" height="24" rx="12" fill="#0f172a" />
                  <text x="0" y="3" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">{o.label}</text>
                </g>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ── flat SVG props (drawn around local origin, sitting on y=100 baseline) ── */
function Person({ color }: { color: string }) {
  return (<g><rect x="-12" y="36" width="24" height="46" rx="11" fill={color} /><circle cx="0" cy="22" r="13" fill="#d9a679" /></g>);
}
function Car() {
  return (<g><rect x="-46" y="50" width="92" height="30" rx="10" fill="#c0392b" /><rect x="-26" y="30" width="46" height="24" rx="8" fill="#7f1d1d" /><circle cx="-26" cy="84" r="11" fill="#111" /><circle cx="26" cy="84" r="11" fill="#111" /></g>);
}
function Scooter() {
  return (<g><circle cx="-22" cy="78" r="13" fill="#111" /><circle cx="24" cy="78" r="13" fill="#111" /><rect x="-26" y="56" width="50" height="12" rx="6" fill="#2563eb" /><rect x="20" y="30" width="8" height="32" rx="4" fill="#1e293b" /></g>);
}
function Chair() {
  return (<g><rect x="-18" y="58" width="36" height="8" rx="3" fill="#e5e7eb" /><rect x="10" y="30" width="8" height="36" rx="3" fill="#cbd5e1" /><rect x="-18" y="64" width="6" height="22" fill="#cbd5e1" /><rect x="12" y="64" width="6" height="22" fill="#cbd5e1" /></g>);
}
function TrafficLight() {
  return (<g><rect x="-5" y="0" width="10" height="88" rx="4" fill="#334155" /><rect x="-16" y="-30" width="32" height="46" rx="8" fill="#1e293b" /><circle cx="0" cy="-18" r="7" fill="#ef4444" /><circle cx="0" cy="0" r="7" fill="#eab308" /><circle cx="0" cy="14" r="6" fill="#22c55e" /></g>);
}
function Shop({ color }: { x: number; color: string }) {
  return (<g><rect x="-55" y="-30" width="110" height="112" rx="8" fill={color} /><rect x="-58" y="-34" width="116" height="16" rx="6" fill="#f8fafc" /><rect x="-22" y="34" width="44" height="48" rx="4" fill="#1e293b" /><rect x="-40" y="-18" width="80" height="16" rx="4" fill="#0f172a" /></g>);
}
