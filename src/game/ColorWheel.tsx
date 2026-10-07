import { useRef } from "react";
import * as THREE from "three";

/** Hue ring like a classic color wheel, plus a brightness slider. */
export function ColorWheel({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const hsl = { h: 0, s: 0, l: 0 };
  new THREE.Color(value).getHSL(hsl);
  const light = hsl.s < 0.05 ? hsl.l : hsl.l;

  const pick = (e: React.PointerEvent) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const r = ref.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // 0° = red on the right, going counter-clockwise like the reference wheel.
    let h = Math.atan2(-dy, dx) / (Math.PI * 2);
    if (h < 0) h += 1;
    onChange("#" + new THREE.Color().setHSL(h, 1, light < 0.08 || light > 0.92 ? 0.5 : light).getHexString());
  };

  const ang = -hsl.h * Math.PI * 2;
  return (
    <div className="flex items-center gap-4">
      <div
        ref={ref}
        onPointerDown={pick}
        onPointerMove={pick}
        className="relative h-28 w-28 shrink-0 cursor-crosshair touch-none rounded-full"
        style={{
          background: "conic-gradient(from 90deg, red, magenta, blue, cyan, lime, yellow, red)",
          WebkitMask: "radial-gradient(circle, transparent 42%, black 43%)",
          mask: "radial-gradient(circle, transparent 42%, black 43%)",
        }}
      >
        <span
          className="pointer-events-none absolute h-3 w-3 rounded-full border-2 border-hud-ink bg-hud"
          style={{ left: `calc(50% + ${Math.cos(ang) * 46}px - 6px)`, top: `calc(50% + ${Math.sin(ang) * 46}px - 6px)` }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="h-8 w-8 rounded border-2 border-hud/40" style={{ background: value }} />
        <input
          type="range" min={0} max={1} step={0.01} value={hsl.l}
          onChange={(e) => onChange("#" + new THREE.Color().setHSL(hsl.h, hsl.s || 1, Number(e.target.value)).getHexString())}
          className="w-28 accent-[var(--crosshair)]"
          aria-label="Brightness"
        />
        <span className="text-[10px] uppercase opacity-70">Brightness</span>
      </div>
    </div>
  );
}
