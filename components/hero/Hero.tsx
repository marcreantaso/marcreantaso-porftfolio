"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Sparkles, Terminal, Trophy } from "lucide-react";
import { site } from "@/lib/data/site";
import { ActionLink } from "@/components/ui/ActionLink";
import { StatusPill, Tag } from "@/components/ui/Tag";
import { HeroObject } from "./HeroObject";
import { FormulaWidget } from "./FormulaWidget";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="home" className="relative">
      <div className="mx-auto w-full max-w-[86rem] px-5 pb-16 pt-24 sm:px-8 sm:pt-28 lg:pt-32">
        <motion.div
          initial={reduce ? false : "hidden"}
          animate={reduce ? false : "show"}
          variants={container}
          className="grid gap-12 lg:grid-cols-[1.618fr_1fr] lg:items-center lg:gap-14"
        >
          <div>
            <motion.div variants={item} className="flex flex-wrap items-center gap-3">
              <StatusPill>Open to engineering roles</StatusPill>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                {site.location} · GMT+8
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-7 text-[clamp(2.9rem,7.4vw,6rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink"
            >
              Where Logic
              <br />
              <span className="text-gradient">Meets Geometry.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-xl text-fluid-lg leading-relaxed text-muted"
            >
              I&apos;m <span className="font-medium text-ink">{site.name}</span> — a full-stack
              software engineer and CS student bridging algorithmic rigor, mathematical elegance, and
              high-performance systems.
            </motion.p>

            <motion.p variants={item} className="mt-4 max-w-xl text-sm leading-relaxed text-muted/85">
              I build compiler pipelines, offline-first PWAs, and precision AgTech platforms — then
              wrap them in interfaces that treat mathematics as a design material.
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
              <ActionLink href="#systems" icon={<ArrowDownRight size={16} />}>
                Explore systems
              </ActionLink>
              <ActionLink href="#sandbox" variant="ghost" icon={<Terminal size={15} />}>
                Launch math sandbox
              </ActionLink>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.07] pt-6"
            >
              <a
                href="#timeline"
                className="group inline-flex items-center gap-2 text-[12px] text-muted transition hover:text-ink"
              >
                <Trophy size={14} className="text-mint" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink">Champion</span> · The Great Flavor Byte
                </span>
                <ArrowUpRight
                  size={12}
                  className="text-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              <span className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                <Sparkles size={12} className="text-plasma" aria-hidden="true" />
                {site.degree} · {site.school}
              </span>
            </motion.div>
          </div>

          <motion.div variants={item} className="relative">
            <HeroObject />
            <div className="mt-4">
              <FormulaWidget />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] sm:grid-cols-3 lg:mt-20"
        >
          {site.stats.map((stat) => (
            <div key={stat.label} className="group bg-void/70 px-5 py-5 transition-colors hover:bg-space/80">
              <p className="tabular text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-none tracking-[-0.03em] text-ink">
                {stat.value}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["Compiler pipelines", "Offline-first PWAs", "AgTech IoT", "Algorithmic design"].map(
              (label) => (
                <Tag key={label}>{label}</Tag>
              ),
            )}
          </div>
          <a
            href="#metrics"
            className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint transition hover:text-neon"
          >
            scroll to decode
            <span className="inline-block h-px w-8 bg-line transition-all group-hover:w-12 group-hover:bg-neon" />
          </a>
        </div>
      </div>
    </section>
  );
}
