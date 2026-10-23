"use client";

import { useId, useMemo, useState } from "react";

const WIDTH = 300;
const HEIGHT = 148;
const PAD = 20;
const MAX_N = 100;

interface Curve {
  id: string;
  label: string;
  color: string;
  fn: (n: number) => number;
}

const CURVES: Curve[] = [
  { id: "constant", label: "O(1)", color: "#10b981", fn: () => 1 },
  { id: "log", label: "O(log n)", color: "#00f0ff", fn: (n) => Math.log2(Math.max(n, 2)) },
  { id: "linearithmic", label: "O(n log n)", color: "#8b5cf6", fn: (n) => n * Math.log2(Math.max(n, 2)) },
  { id: "quadratic", label: "O(n²)", color: "#f472b6", fn: (n) => n * n },
];

const MAX_VALUE = Math.log10(MAX_N * MAX_N + 1);

function scaleX(n: number): number {
  return PAD + ((n - 1) / (MAX_N - 1)) * (WIDTH - PAD * 2);
}

function scaleY(value: number): number {
  const normalized = Math.log10(value + 1) / MAX_VALUE;
  return HEIGHT - PAD - normalized * (HEIGHT - PAD * 2);
}

export function ComplexityChart() {
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? pinned;
  const gradientId = useId().replace(/:/g, "");

  const paths = useMemo(() => {
    return CURVES.map((curve) => {
      const points = Array.from({ length: 60 }, (_, index) => {
        const n = 1 + (index / 59) * (MAX_N - 1);
        return `${index === 0 ? "M" : "L"}${scaleX(n).toFixed(2)},${scaleY(curve.fn(n)).toFixed(2)}`;
      });
      return { ...curve, d: points.join(" ") };
    });
  }, []);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-void/45 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">growth model</span>
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">log y-axis</span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-2 w-full"
        role="img"
        aria-label="Complexity growth chart comparing O(1), O(log n), O(n log n), and O(n squared) on a logarithmic y-axis"
      >
        <defs>
          <linearGradient id={`${gradientId}-grid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[1, 10, 100, 1000, 10000].map((value) => {
          const y = scaleY(value);
          if (y < PAD - 2 || y > HEIGHT - PAD + 2) return null;
          return (
            <g key={value}>
              <line x1={PAD} x2={WIDTH - PAD} y1={y} y2={y} stroke="rgba(255,255,255,0.055)" />
              <text x={PAD - 4} y={y + 2.5} textAnchor="end" fontSize="6.5" className="fill-[#6b7383] font-mono">
                {value >= 1000 ? `${value / 1000}k` : value}
              </text>
            </g>
          );
        })}

        {[1, 25, 50, 75, 100].map((n) => (
          <g key={n}>
            <line x1={scaleX(n)} x2={scaleX(n)} y1={PAD} y2={HEIGHT - PAD} stroke="rgba(255,255,255,0.035)" />
            <text x={scaleX(n)} y={HEIGHT - 5} textAnchor="middle" fontSize="6.5" className="fill-[#6b7383] font-mono">
              {n}
            </text>
          </g>
        ))}

        <path d={`M${PAD},${scaleY(1)} L${WIDTH - PAD},${scaleY(1)}`} stroke="rgba(16,185,129,0.12)" strokeWidth="7" />

        {paths.map((curve) => {
          const isActive = active === null || active === curve.id;
          return (
            <path
              key={curve.id}
              d={curve.d}
              fill="none"
              stroke={curve.color}
              strokeWidth={active === curve.id ? 2.1 : 1.3}
              strokeOpacity={isActive ? 0.95 : 0.16}
              strokeLinecap="round"
              className="transition-[stroke-opacity,stroke-width] duration-300"
            />
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Highlight complexity class">
        {CURVES.map((curve) => {
          const isActive = active === curve.id;
          return (
            <button
              key={curve.id}
              type="button"
              onClick={() => setPinned((current) => (current === curve.id ? null : curve.id))}
              onMouseEnter={() => setHovered(curve.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(curve.id)}
              onBlur={() => setHovered(null)}
              aria-pressed={pinned === curve.id}
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[9px] transition"
              style={{
                borderColor: isActive ? `${curve.color}55` : "rgba(255,255,255,0.07)",
                color: isActive ? curve.color : "#9aa3b2",
                background: isActive ? `${curve.color}0d` : "transparent",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: curve.color }} />
              {curve.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
