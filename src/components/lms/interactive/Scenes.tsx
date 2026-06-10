"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Scene } from "@/data/interactive/types";

export function SceneStage({
  scene, accent, onInteractionComplete,
}: {
  scene: Scene; accent: string; onInteractionComplete?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Entry animation whenever the scene changes.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-anim]");
    anime.set(targets, { opacity: 0, translateY: 16, scale: 0.92 });
    anime({
      targets,
      opacity: [0, 1],
      translateY: [16, 0],
      scale: [0.92, 1],
      delay: anime.stagger(110, { start: 80 }),
      duration: 620,
      easing: "easeOutCubic",
    });
  }, [scene]);

  return (
    <div ref={ref} className="w-full flex flex-col items-center justify-center text-center px-4" style={{ minHeight: 280 }}>
      {scene.type === "title" && (
        <>
          <h2 data-anim className="font-black text-3xl sm:text-4xl" style={{ fontFamily: "var(--font-playfair)", color: accent }}>{scene.title}</h2>
          {scene.subtitle && <p data-anim className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">{scene.subtitle}</p>}
        </>
      )}

      {scene.type === "text" && (
        <>
          {scene.heading && <p data-anim className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>{scene.heading}</p>}
          <p data-anim className="font-black text-2xl sm:text-3xl text-slate-800 leading-snug whitespace-pre-line" style={{ fontFamily: "var(--font-playfair)" }}>{scene.body}</p>
        </>
      )}

      {scene.type === "spotlight" && (
        <>
          <div data-anim className="text-7xl mb-3">{scene.emoji}</div>
          <p data-anim className="font-bold text-xl text-slate-700">{scene.label}</p>
        </>
      )}

      {scene.type === "reveal" && (
        <>
          {scene.heading && <p data-anim className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: accent }}>{scene.heading}</p>}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {scene.items.map((it, i) => (
              <div key={i} data-anim className="flex flex-col items-center gap-1">
                <div className="rounded-2xl flex items-center justify-center text-4xl" style={{ width: 76, height: 76, background: `${accent}10`, border: `1.5px solid ${accent}25` }}>{it.emoji}</div>
                <span className="text-[11px] font-semibold text-slate-500">{it.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {scene.type === "tapGame" && (
        <TapGame scene={scene} accent={accent} onComplete={onInteractionComplete} />
      )}
    </div>
  );
}

function TapGame({
  scene, accent, onComplete,
}: {
  scene: Extract<Scene, { type: "tapGame" }>; accent: string; onComplete?: () => void;
}) {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  const toggle = (i: number) => {
    if (checked) return;
    setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };
  const check = () => { setChecked(true); onComplete?.(); };

  return (
    <div className="w-full">
      <p data-anim className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: accent }}>{scene.heading}</p>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        {scene.options.map((o, i) => {
          const sel = picked.has(i);
          let bg = "white", border = "#e2e8f0";
          if (checked) {
            if (o.present && sel) { bg = "#f0fdf4"; border = "#86efac"; }
            else if (o.present && !sel) { bg = "#fffbeb"; border = "#fde68a"; }   // missed a real one
            else if (!o.present && sel) { bg = "#fef2f2"; border = "#fecaca"; }    // tapped a fake
          } else if (sel) { bg = `${accent}12`; border = accent; }
          return (
            <button key={i} data-anim onClick={() => toggle(i)} disabled={checked}
              className="relative rounded-2xl flex flex-col items-center justify-center gap-1 py-3 transition-all"
              style={{ background: bg, border: `1.5px solid ${border}` }}>
              <span className="text-3xl">{o.emoji}</span>
              <span className="text-[10px] font-semibold text-slate-500">{o.label}</span>
              {checked && o.present && sel && <CheckCircle2 size={14} className="absolute -top-1.5 -right-1.5" style={{ color: "#16a34a" }} />}
              {checked && !o.present && sel && <XCircle size={14} className="absolute -top-1.5 -right-1.5" style={{ color: "#dc2626" }} />}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <button onClick={check}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
          style={{ background: accent }}>
          Check my answer
        </button>
      ) : (
        <div className="rounded-2xl p-4 text-left" style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}>
          <p className="text-sm text-slate-700 leading-relaxed">{scene.revealText}</p>
        </div>
      )}
    </div>
  );
}
