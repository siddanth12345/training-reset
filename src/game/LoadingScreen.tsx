import { useEffect, useRef, useState } from "react";

const SIZE = 140;
const STEPS = ["Connecting to servers", "Loading the living room", "Polishing tables", "Waking the boss"];

/** Loading screen with a draggable, bouncing, spinning green table. */
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const body = useRef({ x: 200, y: 200, vx: 260, vy: 190, rot: 0, spin: 140, drag: false, last: [] as { x: number; y: number; t: number }[], ox: 0, oy: 0 });

  useEffect(() => {
    const b = body.current;
    b.x = window.innerWidth / 2 - SIZE / 2;
    b.y = window.innerHeight / 2 - SIZE / 2;
    let raf = 0;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const W = window.innerWidth - SIZE, H = window.innerHeight - SIZE;
      if (!b.drag) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx) * 0.9; b.spin = -b.spin; }
        if (b.x > W) { b.x = W; b.vx = -Math.abs(b.vx) * 0.9; b.spin = -b.spin; }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy) * 0.9; }
        if (b.y > H) { b.y = H; b.vy = -Math.abs(b.vy) * 0.9; }
        // keep it lively
        const sp = Math.hypot(b.vx, b.vy);
        if (sp < 180) { const k = 180 / Math.max(sp, 1); b.vx = (b.vx || 1) * k; b.vy = (b.vy || 1) * k; }
        if (sp > 2500) { const k = 2500 / sp; b.vx *= k; b.vy *= k; }
      }
      b.rot += b.spin * dt;
      if (tableRef.current) tableRef.current.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const move = (e: PointerEvent) => {
      if (!b.drag) return;
      b.x = e.clientX - b.ox; b.y = e.clientY - b.oy;
      b.last.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (b.last.length > 6) b.last.shift();
    };
    const up = () => {
      if (!b.drag) return;
      b.drag = false;
      const a = b.last[0], z = b.last[b.last.length - 1];
      if (a && z && z.t > a.t) {
        const dt = (z.t - a.t) / 1000;
        b.vx = (z.x - a.x) / dt; b.vy = (z.y - a.y) / dt;
        b.spin = Math.max(-900, Math.min(900, b.vx * 0.6 + 120));
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 4 + Math.random() * 7)), 120);
    return () => clearInterval(id);
  }, []);

  const down = (e: React.PointerEvent) => {
    const b = body.current;
    b.drag = true; b.ox = e.clientX - b.x; b.oy = e.clientY - b.y; b.last = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
  };
  const done = progress >= 100;

  return (
    <div className="fixed inset-0 z-50 select-none overflow-hidden bg-hud-panel font-mono text-hud">
      <div ref={tableRef} onPointerDown={down} className="absolute left-0 top-0 cursor-grab touch-none active:cursor-grabbing" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-xl">
          <rect x="8" y="8" width="16" height="16" rx="3" fill="hsl(130 45% 22%)" />
          <rect x="76" y="8" width="16" height="16" rx="3" fill="hsl(130 45% 22%)" />
          <rect x="8" y="76" width="16" height="16" rx="3" fill="hsl(130 45% 22%)" />
          <rect x="76" y="76" width="16" height="16" rx="3" fill="hsl(130 45% 22%)" />
          <rect x="12" y="12" width="76" height="76" rx="8" fill="hsl(128 55% 42%)" stroke="hsl(130 50% 25%)" strokeWidth="4" />
          <path d="M22 30 H78 M22 50 H78 M22 70 H78" stroke="hsl(128 45% 34%)" strokeWidth="2" />
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-4">
        <h1 className="text-5xl font-black uppercase tracking-tight">TBLE</h1>
        <p className="text-xs uppercase tracking-widest opacity-70">{done ? "Servers ready" : STEPS[Math.min(3, Math.floor(progress / 25))] + "…"}</p>
        <div className="h-3 w-80 overflow-hidden rounded bg-hud-track">
          <div className="h-full bg-crosshair transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs opacity-60">Drag the green table and throw it around!</p>
        {done && (
          <button className="pointer-events-auto rounded bg-crosshair px-8 py-3 font-black uppercase text-hud-ink" onClick={onDone}>Continue</button>
        )}
      </div>
    </div>
  );
}
