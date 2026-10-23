"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { clamp } from "@/lib/utils";

interface Preset {
  id: string;
  label: string;
  tex: string;
  fn: (x: number) => number;
  domain: [number, number];
  note: string;
}

const PRESETS: Preset[] = [
  {
    id: "gaussian",
    label: "gaussian",
    tex: "f(x) = e^{-x^{2}}",
    fn: (x) => Math.exp(-x * x),
    domain: [-3.1, 3.1],
    note: "∫ e^{-x²} dx over ℝ = √π",
  },
  {
    id: "sinc",
    label: "sinc",
    tex: "f(x) = \\dfrac{\\sin x}{x}",
    fn: (x) => (Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x),
    domain: [-10, 10],
    note: "normalized cardinal sine",
  },
  {
    id: "logistic",
    label: "logistic",
    tex: "\\sigma(x) = \\dfrac{1}{1 + e^{-x}}",
    fn: (x) => 1 / (1 + Math.exp(-x)),
    domain: [-6, 6],
    note: "σ′(x) = σ(x)(1 − σ(x))",
  },
];

const WIDTH = 360;
const HEIGHT = 158;
const PAD_X = 14;
const PAD_Y = 18;
const SAMPLES = 160;

function simpson(fn: (x: number) => number, a: number, b: number, steps = 120): number {
  if (a === b) return 0;
  const n = steps % 2 === 0 ? steps : steps + 1;
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < n; i += 1) {
    sum += fn(a + i * h) * (i % 2 === 0 ? 2 : 4);
  }
  return (h / 3) * sum;
}

export function FormulaWidget() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [x, setX] = useState(0.65);
  const [equationHtml, setEquationHtml] = useState<string | null>(null);
  const plotRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef(false);
  const clipId = useId().replace(/:/g, "");

  const preset = PRESETS[presetIndex];
  const [minX, maxX] = preset.domain;

  useEffect(() => {
    let cancelled = false;
    import("katex")
      .then((module) => {
        if (cancelled) return;
        const katex = module.default;
        setEquationHtml(
          katex.renderToString(preset.tex, {
            throwOnError: false,
            displayMode: true,
            output: "html",
          }),
        );
      })
      .catch(() => setEquationHtml(null));
    return () => {
      cancelled = true;
    };
  }, [preset.tex]);

  useEffect(() => {
    setX((preset.domain[0] + preset.domain[1]) / 2 + (preset.domain[1] - preset.domain[0]) * 0.04);
  }, [preset]);

  const samples = useMemo(() => {
    return Array.from({ length: SAMPLES + 1 }, (_, index) => {
      const sx = minX + ((maxX - minX) * index) / SAMPLES;
      return { x: sx, y: preset.fn(sx) };
    });
  }, [preset, minX, maxX]);

  const yBounds = useMemo(() => {
    const values = samples.map((sample) => sample.y).concat(0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.14 || 0.4;
    return { min: min - pad, max: max + pad };
  }, [samples]);

  const scaleX = (value: number) => PAD_X + ((value - minX) / (maxX - minX)) * (WIDTH - PAD_X * 2);
  const scaleY = (value: number) =>
    HEIGHT - PAD_Y - ((value - yBounds.min) / (yBounds.max - yBounds.min)) * (HEIGHT - PAD_Y * 2);

  const path = useMemo(() => {
    return samples
      .map((sample, index) => `${index === 0 ? "M" : "L"}${scaleX(sample.x).toFixed(2)},${scaleY(sample.y).toFixed(2)}`)
      .join(" ");
  }, [samples, scaleX, scaleY]);

  const areaPath = useMemo(() => {
    const inside = samples.filter((sample) => sample.x <= x);
    if (inside.length < 2) return "";
    const points = inside
      .map((sample, index) => `${index === 0 ? "M" : "L"}${scaleX(sample.x).toFixed(2)},${scaleY(sample.y).toFixed(2)}`)
      .join(" ");
    return `${points} L${scaleX(x).toFixed(2)},${scaleY(0).toFixed(2)} L${scaleX(inside[0].x).toFixed(2)},${scaleY(0).toFixed(2)} Z`;
  }, [samples, x, scaleX, scaleY]);

  const fx = preset.fn(x);
  const h = 0.0005;
  const derivative = (preset.fn(x + h) - preset.fn(x - h)) / (2 * h);
  const integral = simpson(preset.fn, minX, x, 160);

  const handlePointer = (clientX: number) => {
    const svg = plotRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const svgX = ratio * WIDTH;
    const ratioInPlot = clamp((svgX - PAD_X) / (WIDTH - PAD_X * 2), 0, 1);
    setX(minX + ratioInPlot * (maxX - minX));
  };

  return (
    <div className="panel overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" aria-hidden="true" />
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted">
            live calculus
          </span>
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Function preset">
          {PRESETS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPresetIndex(index)}
              aria-pressed={presetIndex === index}
              className={
                presetIndex === index
                  ? "rounded-full border border-neon/30 bg-neon/10 px-2.5 py-1 font-mono text-[9px] text-neon"
                  : "rounded-full border border-transparent px-2.5 py-1 font-mono text-[9px] text-faint transition hover:text-ink"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div
          className="min-h-[3.1rem] text-[clamp(0.8rem,2.6vw,1rem)] text-ink [&_.katex]:text-inherit"
          aria-label={preset.note}
        >
          {equationHtml ? (
            <div dangerouslySetInnerHTML={{ __html: equationHtml }} />
          ) : (
            <p className="font-mono text-xs text-muted">{preset.note}</p>
          )}
        </div>

        <svg
          ref={plotRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Plot of the ${preset.label} function. Drag to inspect a point; current x is ${x.toFixed(2)}.`}
          className="mt-1 w-full cursor-crosshair touch-none select-none"
          onPointerDown={(event) => {
            dragRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            handlePointer(event.clientX);
          }}
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse" && !dragRef.current) return;
            handlePointer(event.clientX);
          }}
          onPointerUp={(event) => {
            dragRef.current = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onPointerLeave={() => {
            dragRef.current = false;
          }}
        >
          <defs>
            <linearGradient id={`${clipId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id={`${clipId}-line`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="55%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {Array.from({ length: 6 }, (_, index) => {
            const gy = PAD_Y + ((HEIGHT - PAD_Y * 2) * index) / 5;
            return (
              <line
                key={`h-${index}`}
                x1={PAD_X}
                x2={WIDTH - PAD_X}
                y1={gy}
                y2={gy}
                stroke="rgba(255,255,255,0.055)"
                strokeWidth="1"
              />
            );
          })}
          {Array.from({ length: 7 }, (_, index) => {
            const gx = PAD_X + ((WIDTH - PAD_X * 2) * index) / 6;
            return (
              <line
                key={`v-${index}`}
                y1={PAD_Y}
                y2={HEIGHT - PAD_Y}
                x1={gx}
                x2={gx}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            );
          })}

          <line
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={scaleY(0)}
            y2={scaleY(0)}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1"
          />

          {areaPath ? <path d={areaPath} fill={`url(#${clipId}-area)`} /> : null}
          <path d={path} fill="none" stroke={`url(#${clipId}-line)`} strokeWidth="1.9" strokeLinecap="round" />

          <line
            x1={scaleX(x)}
            x2={scaleX(x)}
            y1={PAD_Y - 4}
            y2={HEIGHT - PAD_Y + 4}
            stroke="rgba(0,240,255,0.32)"
            strokeDasharray="3 4"
            strokeWidth="1"
          />

          <line
            x1={scaleX(clamp(x - (maxX - minX) * 0.075, minX, maxX))}
            y1={scaleY(fx - derivative * (maxX - minX) * 0.075)}
            x2={scaleX(clamp(x + (maxX - minX) * 0.075, minX, maxX))}
            y2={scaleY(fx + derivative * (maxX - minX) * 0.075)}
            stroke="rgba(16,185,129,0.55)"
            strokeWidth="1.1"
          />

          <circle cx={scaleX(x)} cy={scaleY(fx)} r="8" fill="rgba(0,240,255,0.12)" />
          <circle cx={scaleX(x)} cy={scaleY(fx)} r="3.4" fill="#08080a" stroke="#00f0ff" strokeWidth="1.8" />
        </svg>

        <div className="mt-1 flex items-center justify-between font-mono text-[9px] text-faint">
          <span>{minX}</span>
          <span className="inline-flex items-center gap-1 text-neon/70">
            <MoveHorizontal size={10} /> drag to inspect
          </span>
          <span>{maxX}</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px border-t border-white/[0.06] bg-white/[0.03] sm:grid-cols-4">
        {[
          { label: "x", value: x.toFixed(3) },
          { label: "f(x)", value: fx.toFixed(4) },
          { label: "f′(x)", value: derivative.toFixed(4) },
          { label: "∫ₐˣ", value: integral.toFixed(4) },
        ].map((item) => (
          <div key={item.label} className="bg-space/80 px-4 py-2.5">
            <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">{item.label}</dt>
            <dd className="tabular mt-1 font-mono text-[12px] text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-2.5">
        <span className="font-mono text-[9px] text-faint">{preset.note}</span>
        <label className="flex items-center gap-2">
          <span className="sr-only">Inspect x coordinate</span>
          <input
            type="range"
            min={minX}
            max={maxX}
            step={(maxX - minX) / 400}
            value={x}
            onChange={(event) => setX(Number(event.target.value))}
            className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/15 accent-neon"
          />
        </label>
      </div>
    </div>
  );
}
