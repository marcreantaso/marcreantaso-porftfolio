import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "relative",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-4xl",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-faint",
          align === "center" && "justify-center",
        )}
      >
        <span className="text-neon">{index}</span>
        <span className="h-px w-7 bg-gradient-to-r from-neon/50 to-transparent" aria-hidden="true" />
        <span>{eyebrow}</span>
      </div>

      <h2 className="mt-5 text-[clamp(1.9rem,4.6vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink">
        {title}
      </h2>

      {description ? (
        <p className="mt-5 max-w-2xl text-fluid-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </Reveal>
  );
}
