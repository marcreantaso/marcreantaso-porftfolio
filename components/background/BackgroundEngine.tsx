"use client";

import { useEffect, useRef, useState } from "react";
import { Flower2, Hexagon, Waves, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { createRenderer, type ModeId, type PointerState, type Renderer } from "./modes";

const MODES: { id: ModeId; label: string; short: string; Icon: typeof Wind }[] = [
  { id: "vector", label: "Vector Field", short: "Vector", Icon: Wind },
  { id: "fibonacci", label: "Fibonacci Grid", short: "Fibonacci", Icon: Flower2 },
  { id: "voronoi", label: "Voronoi Diagram", short: "Voronoi", Icon: Hexagon },
  { id: "perlin", label: "Perlin Waves", short: "Perlin", Icon: Waves },
];

const STORAGE_KEY = "mrg:math-mode";

function isModeId(value: string | null): value is ModeId {
  return value === "vector" || value === "fibonacci" || value === "voronoi" || value === "perlin";
}

export function BackgroundEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<ModeId>("vector");
  const [mounted, setMounted] = useState(false);
  const rendererRef = useRef<Renderer | null>(null);
  const modeRef = useRef<ModeId>("vector");
  const needsDrawRef = useRef(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isModeId(stored)) {
        modeRef.current = stored;
        setMode(stored);
      }
    } catch {
      // Storage can be unavailable in private contexts.
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    modeRef.current = mode;
    rendererRef.current = createRenderer(mode);
    needsDrawRef.current = true;

    const canvas = canvasRef.current;
    if (
      canvas &&
      typeof canvas.animate === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      canvas.animate([{ opacity: 0.35 }, { opacity: 1 }], {
        duration: 600,
        easing: "ease-out",
      });
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures.
    }
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedQuery.matches;

    let width = 0;
    let height = 0;
    let elapsed = 0;
    let last = performance.now();
    let frame = 0;

    const pointer: PointerState = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.4,
      strength: 0,
    };
    let lastMove = -10_000;

    if (!rendererRef.current) rendererRef.current = createRenderer(modeRef.current);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsDrawRef.current = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      lastMove = performance.now();
      pointer.strength = Math.min(1, pointer.strength + 0.18);
    };

    const onReducedChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      needsDrawRef.current = true;
    };

    const render = (now: number) => {
      frame = window.requestAnimationFrame(render);

      if (document.hidden) {
        last = now;
        return;
      }

      const dt = Math.min(48, Math.max(8, now - last));
      last = now;

      if (reduced) {
        if (!needsDrawRef.current) return;
        needsDrawRef.current = false;
        pointer.strength = 0;
        rendererRef.current?.frame({ ctx: context, width, height, time: 0, dt, pointer });
        return;
      }

      elapsed += dt;
      const targetStrength = now - lastMove < 1800 ? 1 : 0.28;
      pointer.strength += (targetStrength - pointer.strength) * 0.035;

      rendererRef.current?.frame({
        ctx: context,
        width,
        height,
        time: elapsed / 1000,
        dt,
        pointer,
      });
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("orientationchange", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    reducedQuery.addEventListener("change", onReducedChange);
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("pointermove", onPointerMove);
      reducedQuery.removeEventListener("change", onReducedChange);
    };
  }, []);

  const active = MODES.find((item) => item.id === mode) ?? MODES[0];

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-700",
          mounted ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
        <div
          role="group"
          aria-label="Mathematical background visualization"
          className="glass flex items-center gap-1 rounded-full p-1 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          <span className="hidden select-none items-center gap-1.5 pl-2.5 pr-1 font-mono text-[9px] uppercase tracking-[0.22em] text-faint lg:flex">
            <span className="h-1 w-1 rounded-full bg-mint" aria-hidden="true" />
            math
          </span>
          {MODES.map(({ id, label, short, Icon }) => {
            const isActive = mode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={isActive}
                aria-label={`${label} background`}
                title={`${label} background`}
                className={cn(
                  "group relative flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "bg-neon/12 text-neon"
                    : "text-faint hover:bg-white/[0.04] hover:text-ink",
                )}
              >
                <Icon size={13} strokeWidth={1.6} aria-hidden="true" />
                <span className={cn("hidden xl:inline", isActive && "inline")}>{short}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 hidden pl-1 font-mono text-[9px] tracking-[0.18em] text-faint/70 lg:block">
          {active.label.toUpperCase()} · POINTER ACTIVE
        </p>
      </div>
    </>
  );
}
