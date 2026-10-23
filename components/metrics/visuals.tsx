import { ArrowRight, Braces, Cpu, Database, Lock, Wifi } from "lucide-react";

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
  return (
    <div className="rounded-xl border border-white/[0.07] bg-void/45 p-3">
      <svg viewBox="0 0 300 96" className="w-full" role="img" aria-label="AgriGuard architecture: IoT devices to Vercel API to Neon Postgres, protected by JWT sessions">
        <defs>
          <linearGradient id="topology-line" x1="0" x2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {[
          { x: 12, y: 34, label: "IoT devices", sub: "readings", Icon: Wifi },
          { x: 112, y: 18, label: "Vercel API", sub: "/api routes", Icon: Cpu },
          { x: 212, y: 34, label: "Neon PG", sub: "Drizzle", Icon: Database },
        ].map((node) => (
          <g key={node.label}>
            <rect
              x={node.x}
              y={node.y}
              width="76"
              height="42"
              rx="8"
              fill="rgba(255,255,255,0.025)"
              stroke="rgba(255,255,255,0.09)"
            />
            <foreignObject x={node.x + 8} y={node.y + 7} width="60" height="30">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-ink/85">
                  {node.label}
                </span>
                <span className="font-mono text-[7px] uppercase tracking-[0.1em] text-faint">
                  {node.sub}
                </span>
              </div>
            </foreignObject>
          </g>
        ))}

        <path d="M88 55 H112 V39" fill="none" stroke="url(#topology-line)" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M188 39 V55 H212" fill="none" stroke="url(#topology-line)" strokeWidth="1" strokeDasharray="3 3" />

        <circle cx="174" cy="70" r="2.5" fill="#10b981" />
        <text x="182" y="73" className="fill-[#9aa3b2] font-mono" fontSize="7">
          JWT session · bcrypt
        </text>
        <text x="12" y="16" className="fill-[#6b7383] font-mono" fontSize="7" letterSpacing="1.4">
          SINGLE DEPLOYMENT SURFACE
        </text>
      </svg>
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
