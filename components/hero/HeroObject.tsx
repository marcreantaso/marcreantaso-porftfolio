"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

const Scene = dynamic(() => import("./HeroScene").then((module) => module.HeroScene), {
  ssr: false,
  loading: () => <WireframeFallback />,
});

function WireframeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="h-[72%] w-[72%] animate-[spin-slow_36s_linear_infinite]">
        <defs>
          <radialGradient id="hero-fallback" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="88" fill="url(#hero-fallback)" />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <ellipse
            key={index}
            cx="100"
            cy="100"
            rx={82}
            ry={26}
            fill="none"
            stroke="#00f0ff"
            strokeOpacity={0.18}
            transform={`rotate(${index * 30} 100 100)`}
          />
        ))}
        <circle cx="100" cy="100" r="42" fill="none" stroke="#8b5cf6" strokeOpacity="0.35" />
        <circle cx="100" cy="100" r="4" fill="#10b981" />
      </svg>
    </div>
  );
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // WebGL is optional; the SVG fallback keeps the hero intact.
  }

  render() {
    if (this.state.failed) return <WireframeFallback />;
    return this.props.children;
  }
}

export function HeroObject() {
  const reduce = useReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      setWebgl(Boolean(context));
    } catch {
      setWebgl(false);
    }

  }, []);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[radial-gradient(circle_at_50%_45%,rgba(0,240,255,0.07),transparent_58%),rgba(8,8,10,0.4)]">
      <div className="pointer-events-none absolute inset-0 corner-ticks rounded-2xl opacity-70" aria-hidden="true" />

      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <span className="h-1 w-1 animate-pulse rounded-full bg-mint" aria-hidden="true" />
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
          parametric surface
        </span>
      </div>
      <div className="absolute right-4 top-4 z-10 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
        (2,3) torus knot
      </div>

      <div
        className="h-full w-full"
        role="img"
        aria-label="Interactive wireframe torus knot that reacts to pointer movement"
      >
        <SceneBoundary>
          {webgl === null ? <WireframeFallback /> : webgl ? <Scene reduced={Boolean(reduce)} /> : <WireframeFallback />}
        </SceneBoundary>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
          <p>
            φ <span className="text-ink/80">1.6180339887</span>
          </p>
          <p className="mt-1">
            θ <span className="text-ink/80">2π / 3</span>
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-void/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted backdrop-blur">
          pointer reactive
        </span>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/40 to-transparent"
      />
    </div>
  );
}
