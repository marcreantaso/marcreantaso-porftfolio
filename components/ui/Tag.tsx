import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tag({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "neon" | "mint" | "plasma";
}) {
  const tones = {
    default: "border-white/10 bg-white/[0.03] text-muted",
    neon: "border-neon/25 bg-neon/[0.07] text-neon",
    mint: "border-mint/25 bg-mint/[0.07] text-mint",
    plasma: "border-plasma/25 bg-plasma/[0.08] text-plasma",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-mint">
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-mint opacity-60" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-mint" />
      </span>
      {children}
    </span>
  );
}
