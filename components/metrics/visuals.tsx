"use client";

import { ArrowRight, Braces, Cpu, Database, Lock, Wifi } from "lucide-react";
import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { AGRIGUARD_METRIC_CONFIG } from "@/lib/data/agriguardMetric";

const architectureIcons = { wifi: Wifi, cpu: Cpu, database: Database } as const;

export function PipelineVisual() {
  const stages = [
    { label: "tokens", detail: "lex", Icon: Braces },
    { label: "ast", detail: "parse", Icon: Cpu },
    { label: "python", detail: "emit", Icon: ArrowRight },
  ];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-void/45 p-3">
      <div className="flex items-center justify-between gap-1.5">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex flex-1 items-center gap-1.5">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] px-1.5 py-2.5">
              <stage.Icon size={13} className="text-neon/80" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink/90">
                {stage.label}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-faint">
                {stage.detail}
              </span>
            </div>
            {index < stages.length - 1 ? (
              <div className="relative h-px w-4 shrink-0 overflow-hidden bg-line/80">
                <span
                  className="absolute inset-y-0 w-3 bg-neon"
                  style={{ animation: "flow 2.4s linear infinite", animationDelay: `${index * 0.4}s` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {["SET", "IF/ELSE", "FOR", "WHILE", "FUNCTION", "DISPLAY", "RETURN"].map((token) => (
          <span
            key={token}
            className="rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[8px] tracking-[0.08em] text-faint"
          >
            {token}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TopologyVisual() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <div
      className="rounded-xl border border-white/[0.07] bg-void/45 p-3"
      role="img"
      aria-label="AgriGuard sends IoT readings to Vercel API routes for analysis and alerts, then persists field workflow data in Neon Postgres through Drizzle."
    >
      <div className="relative grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] items-center gap-2 pt-5 max-[479px]:grid-cols-1 max-[479px]:gap-0 max-[479px]:pt-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 left-[34%] right-[34%] top-0 rounded-lg border border-dashed border-mint/35 max-[479px]:bottom-auto max-[479px]:left-0 max-[479px]:right-0 max-[479px]:top-[calc(33.333%+1.5rem)] max-[479px]:h-[calc(33.333%+2.5rem)]"
        >
          <span className="absolute -top-4 left-2 bg-void/90 px-1 font-mono text-[8px] uppercase tracking-[0.12em] text-mint">
            Single deployment surface
          </span>
        </div>

        {AGRIGUARD_METRIC_CONFIG.nodes.map((node, index) => {
          const Icon = architectureIcons[node.icon];
          const isActive = activeNode === node.id;
          return (
            <div key={node.id} className="relative flex items-center max-[479px]:flex-col">
              <div
                className={cn(
                  "relative z-10 flex min-h-[68px] w-full max-w-[118px] flex-col justify-center rounded-lg border bg-white/[0.025] px-2.5 py-2 transition-colors duration-200 max-[479px]:max-w-none max-[479px]:px-3",
                  isActive ? "border-mint/70 bg-mint/[0.09] shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" : "border-white/[0.10]",
                  node.id === "api" ? "mx-auto" : "",
                )}
              >
                <Icon size={13} className={cn("mb-1 text-mint", isActive && "text-white")} aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink/90">{node.title}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{node.subtitle}</span>
                {node.id === "api" ? (
                  <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded border border-mint/25 bg-mint/[0.06] px-1.5 py-0.5 font-mono text-[8px] text-mint">
                    <Lock size={9} aria-hidden="true" />
                    {AGRIGUARD_METRIC_CONFIG.auth}
                  </span>
                ) : null}
              </div>
              {index < AGRIGUARD_METRIC_CONFIG.nodes.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(100%+0.15rem)] right-[calc(-100%+0.15rem)] top-1/2 h-px border-t border-dashed border-mint/60 max-[479px]:bottom-[-1.25rem] max-[479px]:left-1/2 max-[479px]:right-auto max-[479px]:top-auto max-[479px]:h-5 max-[479px]:w-px max-[479px]:border-l max-[479px]:border-t-0"
                  style={{ animation: reduce ? "none" : "flow 2.8s ease-in-out infinite" }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 border-y-[3px] border-l-[5px] border-y-transparent border-l-mint max-[479px]:bottom-0 max-[479px]:left-1/2 max-[479px]:right-auto max-[479px]:top-auto max-[479px]:-translate-x-1/2 max-[479px]:translate-y-0 max-[479px]:rotate-90" />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5 border-t border-white/[0.06] pt-3 max-[479px]:grid-cols-2">
        {AGRIGUARD_METRIC_CONFIG.steps.map((step) => (
          <button
            key={step.label}
            type="button"
            onMouseEnter={() => setActiveNode(step.node)}
            onMouseLeave={() => setActiveNode(null)}
            onFocus={() => setActiveNode(step.node)}
            onBlur={() => setActiveNode(null)}
            className={cn(
              "rounded-md border border-white/[0.07] bg-white/[0.02] px-1.5 py-1.5 text-left font-mono text-[8px] uppercase leading-tight tracking-[0.08em] text-faint transition-colors hover:border-mint/45 hover:text-mint focus-visible:border-mint/60 focus-visible:text-mint",
              activeNode === step.node && "border-mint/45 text-mint",
            )}
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DecisionVisual() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-void/45 p-3">
      <svg viewBox="0 0 300 112" className="w-full" role="img" aria-label="Decision tree: observe, then rotate or hold, then commit or reset">
        <defs>
          <linearGradient id="decision-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {[
          { x: 150, y: 18, label: "observe", tone: "#8b5cf6" },
          { x: 82, y: 62, label: "rotate", tone: "#00f0ff" },
          { x: 218, y: 62, label: "hold", tone: "#00f0ff" },
          { x: 46, y: 102, label: "commit", tone: "#10b981" },
          { x: 120, y: 102, label: "reset", tone: "#6b7383" },
          { x: 218, y: 102, label: "re-read", tone: "#6b7383" },
        ].map((node) => (
          <g key={node.label}>
            <circle cx={node.x} cy={node.y - 4} r="3" fill={node.tone} fillOpacity="0.9" />
            <text
              x={node.x + 7}
              y={node.y - 1}
              className="fill-[#9aa3b2] font-mono"
              fontSize="8"
            >
              {node.label}
            </text>
          </g>
        ))}

        <path d="M150 24 V44 M82 66 V86 M218 66 V86" stroke="url(#decision-line)" strokeWidth="1" />
        <path d="M150 44 H82 V86 M150 44 V86 H218" stroke="url(#decision-line)" strokeWidth="1" fill="none" />
        <path d="M46 106 H218" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 4" />

        <text x="12" y="16" className="fill-[#6b7383] font-mono" fontSize="7" letterSpacing="1.4">
          MACRO DECISION LOOP
        </text>
        <text x="228" y="16" className="fill-[#10b981] font-mono" fontSize="7" letterSpacing="1.2">
          &lt; 1s
        </text>
      </svg>
    </div>
  );
}

export function SignalVisual() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-void/45 p-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-mint">
          <Lock size={10} /> encrypted by default
        </span>
        <span className="font-mono text-[9px] text-faint">local-first</span>
      </div>
      <div className="mt-3 flex items-end gap-1">
        {[32, 48, 40, 68, 54, 78, 62, 88, 72, 94, 80, 60].map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-sm bg-gradient-to-t from-mint/20 to-neon/70"
            style={{ height: `${Math.max(6, height * 0.38)}px` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[8px] uppercase tracking-[0.12em] text-faint">
        <span>queue</span>
        <span>sync</span>
        <span>resolve</span>
      </div>
    </div>
  );
}
