"use client";

import { useEffect, useRef } from "react";
import type P5Type from "p5";

// A generative "narrator" orb drawn with p5.js. It breathes gently and pulses
// faster + brighter while narration is speaking. p5 is loaded dynamically (no SSR).
export default function NarratorOrb({ speaking, accent, size = 80 }: { speaking: boolean; accent: string; size?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useEffect(() => {
    let instance: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const p5mod = await import("p5");
      const P5 = p5mod.default;
      if (cancelled || !hostRef.current) return;

      const sketch = (p: P5Type) => {
        let t = 0;
        p.setup = () => {
          const c = p.createCanvas(size, size);
          c.parent(hostRef.current!);
          p.noStroke();
        };
        p.draw = () => {
          p.clear();
          const spk = speakingRef.current;
          t += spk ? 0.18 : 0.05;
          const cx = size / 2, cy = size / 2;
          const base = size * 0.28;
          const amp = spk ? size * 0.06 : size * 0.02;
          const r = base + Math.sin(t) * amp;
          // soft halo
          const [cr, cg, cb] = hexToRgb(accent);
          for (let i = 6; i >= 1; i--) {
            p.fill(cr, cg, cb, (spk ? 22 : 12) - i);
            p.circle(cx, cy, (r + i * (size * 0.04)) * 2);
          }
          // wobbly core
          p.fill(cr, cg, cb, 235);
          p.beginShape();
          const pts = 28;
          for (let i = 0; i <= pts; i++) {
            const a = (i / pts) * p.TWO_PI;
            const wob = spk ? Math.sin(a * 3 + t * 2) * size * 0.03 : Math.sin(a * 2 + t) * size * 0.012;
            const rr = r + wob;
            p.vertex(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
          }
          p.endShape(p.CLOSE);
        };
      };

      instance = new P5(sketch) as unknown as { remove: () => void };
    })();

    return () => { cancelled = true; instance?.remove(); };
  }, [accent, size]);

  return <div ref={hostRef} style={{ width: size, height: size }} />;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
