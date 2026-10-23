"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

interface MetricCardProps {
  index: string;
  kicker: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  accent?: "neon" | "mint" | "plasma";
  delay?: number;
}

const accentMap = {
  neon: "from-neon/[0.08] via-transparent to-transparent",
  mint: "from-mint/[0.08] via-transparent to-transparent",
  plasma: "from-plasma/[0.09] via-transparent to-transparent",
};

export function MetricCard({
  index,
  kicker,
  title,
  description,
  children,
  footer,
  className,
  accent = "neon",
  delay = 0,
}: MetricCardProps) {
  const ref = useRef<HTMLElement>(null);

  return (
    <Reveal className={className} delay={delay} amount={0.12}>
      <article
        ref={ref}
        onPointerMove={(event) => {
          const node = ref.current;
          if (!node) return;
          const rect = node.getBoundingClientRect();
          node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          node.style.setProperty("--my", `${event.clientY - rect.top}px`);
        }}
        className="group panel relative flex h-full flex-col overflow-hidden rounded-2xl p-5 sm:p-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(340px circle at var(--mx, 50%) var(--my, 0%), rgba(0,240,255,0.085), transparent 68%)",
          }}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
            accentMap[accent],
          )}
        />

        <div className="relative flex items-center justify-between gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-faint">{kicker}</span>
          <span className="font-mono text-[10px] text-neon/70">{index}</span>
        </div>

        <h3 className="relative mt-4 max-w-sm text-[clamp(1.15rem,2.1vw,1.55rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {title}
        </h3>

        <p className="relative mt-3 max-w-md text-[13px] leading-relaxed text-muted">{description}</p>

        <div className="relative mt-auto pt-6">{children}</div>

        {footer ? (
          <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 font-mono text-[10px] text-faint">
            {footer}
          </div>
        ) : null}
      </article>
    </Reveal>
  );
}
