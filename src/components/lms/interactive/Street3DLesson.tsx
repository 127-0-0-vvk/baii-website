"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { CheckCircle2, ArrowRight, RotateCcw, Eye } from "lucide-react";

/* ───────────────────────── speech helper ───────────────────────── */
function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.97;
  const v = synth.getVoices().find((x) => /^en/i.test(x.lang));
  if (v) u.voice = v;
  synth.cancel();
  synth.speak(u);
}

/* ───────────────────────── reusable meshes ─────────────────────── */
type PickProps = { id?: string; onPick: (id: string) => void; highlight?: string | null };

function clickHandlers(id: string, onPick: (id: string) => void) {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { document.body.style.cursor = "default"; },
    onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPick(id); },
  };
}
const ring = (on: boolean, color: string) => on ? <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.9, 1.05, 32]} /><meshBasicMaterial color={color} transparent opacity={0.9} /></mesh> : null;

function Car({ onPick, highlight }: PickProps) {
  const hl = highlight === "car";
  return (
    <group position={[-2.2, 0, 1.2]} {...clickHandlers("car", onPick)}>
      {ring(hl, "#22c55e")}
      <mesh castShadow position={[0, 0.45, 0]}><boxGeometry args={[1.9, 0.5, 0.9]} /><meshStandardMaterial color="#c0392b" metalness={0.5} roughness={0.3} /></mesh>
      <mesh castShadow position={[0.1, 0.85, 0]}><boxGeometry args={[1.0, 0.45, 0.82]} /><meshStandardMaterial color="#7f1d1d" metalness={0.4} roughness={0.3} /></mesh>
      {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.22, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.18, 16]} /><meshStandardMaterial color="#111" /></mesh>
      ))}
    </group>
  );
}

function Scooter({ onPick, highlight }: PickProps) {
  const hl = highlight === "scooter";
  return (
    <group position={[1.6, 0, 1.6]} {...clickHandlers("scooter", onPick)}>
      {ring(hl, "#22c55e")}
      <mesh castShadow position={[0, 0.35, 0]}><boxGeometry args={[0.9, 0.18, 0.35]} /><meshStandardMaterial color="#2563eb" metalness={0.4} roughness={0.4} /></mesh>
      <mesh castShadow position={[0.45, 0.6, 0]}><boxGeometry args={[0.08, 0.5, 0.3]} /><meshStandardMaterial color="#1e293b" /></mesh>
      {[-0.45, 0.45].map((x, i) => <mesh key={i} castShadow position={[x, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.12, 16]} /><meshStandardMaterial color="#111" /></mesh>)}
    </group>
  );
}

function Person({ pos, color, id, onPick, highlight }: { pos: [number, number, number]; color: string; id: string; onPick: (id: string) => void; highlight?: string | null }) {
  const hl = highlight === id;
  return (
    <group position={pos} {...clickHandlers(id, onPick)}>
      {ring(hl, "#22c55e")}
      <mesh castShadow position={[0, 0.55, 0]}><capsuleGeometry args={[0.22, 0.5, 4, 12]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      <mesh castShadow position={[0, 1.05, 0]}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#d9a679" roughness={0.7} /></mesh>
    </group>
  );
}

function TrafficLight({ onPick, highlight, green }: PickProps & { green: boolean }) {
  const hl = highlight === "traffic";
  return (
    <group position={[3, 0, -0.6]} {...clickHandlers("traffic", onPick)}>
      {ring(hl, "#22c55e")}
      <mesh castShadow position={[0, 1.1, 0]}><cylinderGeometry args={[0.08, 0.08, 2.2, 12]} /><meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} /></mesh>
      <mesh castShadow position={[0, 2.3, 0]}><boxGeometry args={[0.3, 0.8, 0.3]} /><meshStandardMaterial color="#1e293b" /></mesh>
      <mesh position={[0, 2.55, 0.16]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#ef4444" emissive={green ? "#3f1212" : "#ef4444"} emissiveIntensity={green ? 0.2 : 1.4} /></mesh>
      <mesh position={[0, 2.3, 0.16]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#eab308" emissive="#3a2f08" /></mesh>
      <mesh position={[0, 2.05, 0.16]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#22c55e" emissive={green ? "#22c55e" : "#0c2912"} emissiveIntensity={green ? 1.4 : 0.2} /></mesh>
    </group>
  );
}

function Shop({ x, color, name }: { x: number; color: string; name: string }) {
  return (
    <group position={[x, 0, -3]}>
      <mesh castShadow receiveShadow position={[0, 1.1, 0]}><boxGeometry args={[2.2, 2.2, 1.4]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
      <mesh castShadow position={[0, 2.2, 0.75]} rotation={[0.5, 0, 0]}><boxGeometry args={[2.3, 0.1, 0.8]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[0, 0.55, 0.71]}><boxGeometry args={[1.0, 1.1, 0.05]} /><meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.4} /></mesh>
      <mesh position={[0, 1.85, 0.72]}><boxGeometry args={[1.6, 0.35, 0.05]} /><meshStandardMaterial color="#0f172a" /></mesh>
      <mesh position={[0, 1.85, 0.75]}><planeGeometry args={[1.4, 0.22]} /><meshBasicMaterial color={color} /></mesh>
      <group name={name} />
    </group>
  );
}

function Chair({ onPick, highlight }: PickProps) {
  const hl = highlight === "chair";
  return (
    <group position={[-3.4, 0, 0.6]} {...clickHandlers("chair", onPick)}>
      {ring(hl, "#22c55e")}
      <mesh castShadow position={[0, 0.45, 0]}><boxGeometry args={[0.5, 0.08, 0.5]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
      <mesh castShadow position={[0, 0.75, -0.22]}><boxGeometry args={[0.5, 0.6, 0.08]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z], i) => <mesh key={i} castShadow position={[x, 0.22, z]}><boxGeometry args={[0.06, 0.45, 0.06]} /><meshStandardMaterial color="#cbd5e1" /></mesh>)}
    </group>
  );
}

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 0.6, 0]}><cylinderGeometry args={[0.12, 0.16, 1.2, 8]} /><meshStandardMaterial color="#6b4f2a" /></mesh>
      <mesh castShadow position={[0, 1.5, 0]}><icosahedronGeometry args={[0.7, 1]} /><meshStandardMaterial color="#2f9e44" roughness={0.9} /></mesh>
    </group>
  );
}

function Cow({ onPick, highlight }: PickProps) {
  const hl = highlight === "cow";
  return (
    <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={[0.2, 0, -1.2]} {...clickHandlers("cow", onPick)}>
        {ring(hl, "#22c55e")}
        <mesh castShadow position={[0, 0.7, 0]}><boxGeometry args={[1.2, 0.7, 0.6]} /><meshStandardMaterial color="#f5f5f4" roughness={0.8} /></mesh>
        <mesh castShadow position={[0.7, 0.85, 0]}><boxGeometry args={[0.45, 0.45, 0.45]} /><meshStandardMaterial color="#e7e5e4" /></mesh>
        {[[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]].map(([x, z], i) => <mesh key={i} castShadow position={[x, 0.25, z]}><cylinderGeometry args={[0.09, 0.09, 0.5, 8]} /><meshStandardMaterial color="#44403c" /></mesh>)}
        {/* spots */}
        <mesh position={[0.1, 1.0, 0.31]}><circleGeometry args={[0.15, 16]} /><meshStandardMaterial color="#292524" /></mesh>
      </group>
    </Float>
  );
}

function Ground() {
  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#3f3f46" roughness={1} /></mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2.6]}><planeGeometry args={[14, 0.2]} /><meshStandardMaterial color="#fde68a" /></mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -1.6]}><planeGeometry args={[14, 3]} /><meshStandardMaterial color="#52525b" roughness={1} /></mesh>
    </>
  );
}

/* GSAP intro camera dolly (runs once on mount) */
function IntroCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(11, 7, 11);
    const tween = gsap.to(camera.position, { x: 6.5, y: 4.2, z: 6.5, duration: 2.2, ease: "power3.out", onUpdate: () => camera.lookAt(0, 0.8, 0) });
    return () => { tween.kill(); };
  }, [camera]);
  return null;
}

/* The street — `changed` swaps one detail (a cow appears) for the change-blindness test */
function Street({ changed, onPick, highlight }: { changed: boolean; onPick: (id: string) => void; highlight: string | null }) {
  return (
    <group>
      <Ground />
      <Shop x={-3} color="#e07a5f" name="cloth" />
      <Shop x={0} color="#81b29a" name="tea" />
      <Shop x={3} color="#f2cc8f" name="fruit" />
      <Car onPick={onPick} highlight={highlight} />
      <Scooter onPick={onPick} highlight={highlight} />
      <Person pos={[-0.6, 0, 1.8]} color="#3b82f6" id="person1" onPick={onPick} highlight={highlight} />
      <Person pos={[0.8, 0, 0.4]} color="#ec4899" id="person2" onPick={onPick} highlight={highlight} />
      <TrafficLight onPick={onPick} highlight={highlight} green={false} />
      <Chair onPick={onPick} highlight={highlight} />
      <Tree x={-4.5} z={-1} />
      <Tree x={4.5} z={1.5} />
      {changed && <Cow onPick={onPick} highlight={highlight} />}
    </group>
  );
}

/* ───────────────────────── main lesson ─────────────────────────── */
type Phase = "explore" | "blink" | "find" | "reveal";

export default function Street3DLesson({ accent = "#2563EB", onComplete, onSkip }: { accent?: string; onComplete: () => void; onSkip: () => void }) {
  const [phase, setPhase] = useState<Phase>("explore");
  const [countdown, setCountdown] = useState(12);
  const [tries, setTries] = useState(0);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [wrongMsg, setWrongMsg] = useState("");
  const blinkRef = useRef<HTMLDivElement>(null);

  // Explore countdown → blink → find
  useEffect(() => {
    if (phase !== "explore") return;
    speak("Welcome, Truth Detective. Look around this street. Drag to explore, and try to remember everything you see.");
    if (countdown <= 0) { goBlink(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown]);

  const goBlink = () => {
    setPhase("blink");
    speak("Now… blink!");
    if (blinkRef.current) {
      gsap.fromTo(blinkRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 1, onComplete: () => {
        setPhase("find");
        speak("Something on the street is different now. Tap on the thing that changed.");
      } });
    } else { setPhase("find"); }
  };

  const onPick = (id: string) => {
    if (phase !== "find") return;
    if (id === "cow") {
      setHighlight("cow"); setPhase("reveal");
      speak("You found it! A cow appeared — but did you notice it the moment it arrived? Most people don't. Your brain misses changes when its attention is busy. That's called change blindness. A real detective looks twice.");
    } else {
      const n = tries + 1; setTries(n);
      setWrongMsg(n >= 3 ? "Hint: look for something new that wasn't there before…" : "Not that one — look again carefully!");
    }
  };

  const showAnswer = () => { setHighlight("cow"); setPhase("reveal"); speak("Here it is — a cow appeared. Your brain missed it because change blindness hides changes when you're busy looking elsewhere."); };

  const changed = phase === "find" || phase === "reveal" || phase === "blink";

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 relative" style={{ background: "#0b1020", boxShadow: "0 1px 12px rgba(0,0,0,0.08)" }}>
      {/* Top strip */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">3D Lesson · Look vs See</span>
        <button onClick={onSkip} className="text-[11px] font-semibold text-white/50 hover:text-white/80">Skip to task ✕</button>
      </div>

      {/* Canvas */}
      <div style={{ height: 420 }}>
        <Canvas shadows dpr={[1, 1.8]} camera={{ position: [6.5, 4.2, 6.5], fov: 45 }} gl={{ antialias: true }}>
          <color attach="background" args={["#0b1020"]} />
          <fog attach="fog" args={["#0b1020", 14, 30]} />
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[6, 10, 4]} intensity={1.6} shadow-mapSize={[1024, 1024]}>
            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 40]} />
          </directionalLight>
          <Environment preset="sunset" />
          <Street changed={changed} onPick={onPick} highlight={highlight} />
          <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={24} blur={2.2} far={8} />
          <IntroCamera />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={14} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.2}
            autoRotate={phase === "explore"} autoRotateSpeed={0.8} enableDamping />
        </Canvas>
      </div>

      {/* Blink overlay */}
      <div ref={blinkRef} className="absolute inset-0 z-30 pointer-events-none" style={{ background: "white", opacity: 0 }} />

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(11,16,32,0.78)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {phase === "explore" && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white"><Eye size={16} /><p className="text-sm">Look around — remember everything. <span className="opacity-60">Drag to explore.</span></p></div>
              <button onClick={goBlink} className="shrink-0 text-xs font-bold px-3 py-2 rounded-xl text-white" style={{ background: accent }}>Ready ({countdown}s)</button>
            </div>
          )}
          {phase === "find" && (
            <div className="flex items-center justify-between gap-3">
              <div className="text-white"><p className="text-sm font-semibold">Something changed. Tap what's different.</p>{wrongMsg && <p className="text-[11px] text-amber-300 mt-0.5">{wrongMsg}</p>}</div>
              {tries >= 2 && <button onClick={showAnswer} className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl text-white/90" style={{ background: "rgba(255,255,255,0.15)" }}>Show me</button>}
            </div>
          )}
          {phase === "reveal" && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2 text-white"><CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" /><p className="text-sm leading-snug">A <b>cow</b> appeared — and your brain probably missed the moment it did. That&apos;s <b>change blindness</b>. Real detectives look twice.</p></div>
              <button onClick={onComplete} className="shrink-0 text-sm font-bold px-4 py-2.5 rounded-xl text-white flex items-center gap-1.5" style={{ background: accent }}>Start task <ArrowRight size={14} /></button>
            </div>
          )}
          {phase === "blink" && <p className="text-center text-white text-sm">👁️ Blink…</p>}
        </div>
      </div>
    </div>
  );
}
