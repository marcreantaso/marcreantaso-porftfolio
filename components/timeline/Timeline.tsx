"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Gamepad2, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { timeline, type TimelineCategory } from "@/lib/data/timeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

const CATEGORY = {
  academic: {
    label: "Academic",
    Icon: GraduationCap,
    dot: "bg-mint",
    text: "text-mint",
    border: "border-mint/30",
    glow: "shadow-[0_0_0_4px_rgba(16,185,129,0.10)]",
  },
  esports: {
    label: "Esports",
    Icon: Gamepad2,
    dot: "bg-plasma",
    text: "text-plasma",
    border: "border-plasma/30",
    glow: "shadow-[0_0_0_4px_rgba(139,92,246,0.10)]",
  },
  competition: {
    label: "Competition",
    Icon: Trophy,
    dot: "bg-neon",
    text: "text-neon",
    border: "border-neon/30",
    glow: "shadow-[0_0_0_4px_rgba(0,240,255,0.10)]",
  },
} as const;

function categoryOf(category: TimelineCategory) {
  return CATEGORY[category];
}

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 65%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section id="timeline" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="04"
            eyebrow="Timeline & track record"
            title={
              <>
                A single
                <br />
                <span className="text-muted/80">operating loop.</span>
              </>
            }
            description="Academics, esports, and product engineering share the same loop: read the state, choose a model, execute under time pressure. The timeline marks what is current rather than inventing dates."
          />

          <div className="flex flex-wrap gap-2">
            {(["academic", "esports", "competition"] as TimelineCategory[]).map((category) => {
              const config = categoryOf(category);
              const Icon = config.Icon;
              return (
                <span
                  key={category}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted"
                >
                  <Icon size={11} className={config.text} aria-hidden="true" />
                  {config.label}
                </span>
              );
            })}
          </div>
        </div>

        <div ref={ref} className="relative mt-14">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[19px] top-0 w-px bg-white/[0.08] md:left-1/2 md:-translate-x-1/2"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleY: reduce ? 1 : progress }}
            className="absolute bottom-0 left-[19px] top-0 w-px origin-top bg-gradient-to-b from-neon via-plasma to-mint md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="space-y-6 md:space-y-8">
            {timeline.map((entry, index) => {
              const config = categoryOf(entry.category);
              const Icon = config.Icon;
              const isLeft = index % 2 === 0;

              return (
                <li key={entry.id} className="relative md:grid md:grid-cols-2 md:gap-16">
                  <span
                    aria-hidden="true"
                    className="absolute left-[19px] top-7 z-10 -translate-x-1/2 md:left-1/2"
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-void",
                        config.dot,
                        config.glow,
                      )}
                    />
                  </span>

                  <motion.article
                    initial={reduce ? false : { opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
                    className={cn(
                      "panel group relative ml-12 overflow-hidden rounded-2xl p-5 sm:p-6 md:ml-0",
                      isLeft
                        ? "md:col-start-1 md:row-start-1 md:mr-4 md:text-right"
                        : "md:col-start-2 md:ml-4",
                      config.border,
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(320px_circle_at_var(--spot,50%)_0%,rgba(0,240,255,0.06),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />

                    <div
                      className={cn(
                        "relative flex flex-wrap items-center gap-2",
                        isLeft && "md:justify-end",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-void/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                        {entry.period === "Present" ? (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" aria-hidden="true" />
                        ) : (
                          <Sparkles size={9} className={config.text} aria-hidden="true" />
                        )}
                        {entry.period}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em]",
                          config.text,
                        )}
                      >
                        <Icon size={11} aria-hidden="true" />
                        {config.label}
                      </span>
                    </div>

                    <div className="relative mt-4">
                      <span
                        aria-hidden="true"
                        className="absolute -top-3 right-0 font-mono text-[34px] font-semibold leading-none tracking-[-0.04em] text-white/[0.035] md:right-auto md:left-0"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="relative text-[clamp(1.05rem,2vw,1.35rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
                        {entry.title}
                      </h3>
                      <p className={cn("relative mt-1 text-[11.5px] font-medium", config.text)}>
                        {entry.organization}
                      </p>
                      <p className="relative mt-3 text-[12.5px] leading-relaxed text-muted">
                        {entry.description}
                      </p>

                      <div
                        className={cn(
                          "relative mt-4 flex flex-wrap gap-1.5",
                          isLeft && "md:justify-end",
                        )}
                      >
                        {entry.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-10 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-faint/70">
          ongoing entries marked “Present” · no inferred dates
        </p>
      </div>
    </section>
  );
}
