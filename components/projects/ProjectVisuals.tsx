import { CloudOff, Database, GitBranch, Layers, Lock, Timer } from "lucide-react";
import type { ProjectVisual } from "@/lib/data/projects";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.07] bg-void/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-faint">{label}</span>
        <span className="flex gap-1" aria-hidden="true">
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span className="h-1 w-1 rounded-full bg-neon/60" />
        </span>
      </div>
      {children}
    </div>
  );
}

function Pipeline() {
  const stages = [
    { label: "pseudocode", sub: "input", icon: <GitBranch size={12} /> },
    { label: "AST", sub: "analysis", icon: <Layers size={12} /> },
    { label: "python", sub: "output", icon: <Timer size={12} /> },
  ];

  return (
    <Frame label="translation pipeline">
      <div className="flex items-center gap-2">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-2">
              <span className="text-neon/80">{stage.icon}</span>
              <span className="font-mono text-[9px] text-ink/90">{stage.label}</span>
              <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-faint">
                {stage.sub}
              </span>
            </div>
            {index < stages.length - 1 ? (
              <span className="relative h-px w-4 shrink-0 overflow-hidden bg-line">
                <span
                  className="absolute inset-y-0 w-3 bg-mint"
                  style={{ animation: "flow 2.2s linear infinite", animationDelay: `${index * 0.35}s` }}
                />
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.12em] text-faint">
        <span>rule-based · deterministic</span>
        <span className="text-mint">offline</span>
      </div>
    </Frame>
  );
}

function Topology() {
  return (
    <Frame label="deployment topology">
      <div className="flex items-center justify-between gap-2">
        {[
          { label: "devices", sub: "iot" },
          { label: "api", sub: "vercel" },
          { label: "neon", sub: "postgres" },
        ].map((node, index) => (
          <div key={node.label} className="flex flex-1 items-center gap-1.5">
            <div className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-2 text-center">
              <p className="font-mono text-[9px] text-ink/90">{node.label}</p>
              <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-faint">{node.sub}</p>
            </div>
            {index < 2 ? (
              <span className="h-4 w-px border-l border-dashed border-mint/30" aria-hidden="true" />
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.12em] text-faint">
        <span className="inline-flex items-center gap-1 text-mint">
          <Lock size={8} /> jwt session
        </span>
        <span className="inline-flex items-center gap-1">
          <Database size={8} /> drizzle
        </span>
      </div>
    </Frame>
  );
}

function Weights() {
  const weights = [
    { label: "skills", value: 40 },
    { label: "projects", value: 25 },
    { label: "experience", value: 15 },
    { label: "actor", value: 10 },
    { label: "intent", value: 10 },
  ];

  return (
    <Frame label="alignment weights">
      <div className="space-y-1.5">
        {weights.map((weight) => (
          <div key={weight.label} className="flex items-center gap-2">
            <span className="w-14 font-mono text-[8px] uppercase tracking-[0.1em] text-faint">
              {weight.label}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-plasma to-neon"
                style={{ width: `${weight.value}%` }}
              />
            </span>
            <span className="tabular w-6 text-right font-mono text-[8px] text-muted">
              {weight.value}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.12em] text-faint">
        explainable · local-first
      </p>
    </Frame>
  );
}

function Offline() {
  return (
    <Frame label="offline queue">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          {["write local", "queue event", "sync when online"].map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5"
            >
              <span className="font-mono text-[8px] text-mint">0{index + 1}</span>
              <span className="font-mono text-[8px] text-muted">{step}</span>
            </div>
          ))}
        </div>
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border border-mint/25 bg-mint/[0.05]">
          <CloudOff size={16} className="text-mint" aria-hidden="true" />
          <span className="mt-1 font-mono text-[6px] uppercase tracking-[0.12em] text-mint">offline</span>
        </div>
      </div>
      <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.12em] text-faint">
        indexeddb · service worker
      </p>
    </Frame>
  );
}

function Campus() {
  const blocks = [
    { span: "col-span-2", tone: "bg-neon/15 border-neon/25" },
    { span: "col-span-1", tone: "bg-plasma/15 border-plasma/25" },
    { span: "col-span-1", tone: "bg-mint/15 border-mint/25" },
    { span: "col-span-2", tone: "bg-white/[0.04] border-white/10" },
  ];

  return (
    <Frame label="campus systems">
      <div className="grid grid-cols-3 gap-1.5">
        {blocks.map((block, index) => (
          <div
            key={index}
            className={`${block.span} ${block.tone} h-7 rounded border`}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.12em] text-faint">
        scheduler · library · student tools
      </p>
    </Frame>
  );
}

export function ProjectVisual({ visual }: { visual: ProjectVisual }) {
  switch (visual) {
    case "pipeline":
      return <Pipeline />;
    case "topology":
      return <Topology />;
    case "weights":
      return <Weights />;
    case "offline":
      return <Offline />;
    default:
      return <Campus />;
  }
}
