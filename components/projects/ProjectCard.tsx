"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Project } from "@/lib/data/projects";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";
import { ProjectVisual } from "./ProjectVisuals";

const accentText = {
  neon: "text-neon",
  mint: "text-mint",
  plasma: "text-plasma",
} as const;

const accentBorder = {
  neon: "border-neon/25 hover:border-neon/45",
  mint: "border-mint/25 hover:border-mint/45",
  plasma: "border-plasma/25 hover:border-plasma/45",
} as const;

export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (project: Project) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 24, mass: 0.4 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 24, mass: 0.4 });

  const canTilt = !reduce;

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={(event) => {
        if (!canTilt || event.pointerType !== "mouse" || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(px * 7);
        rotateX.set(-py * 7);
        ref.current.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        ref.current.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      className={cn(
        "group panel relative flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-500",
        accentBorder[project.accent],
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 25%), rgba(0,240,255,0.07), transparent 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <div className="relative flex flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className={cn("font-mono text-[10px] tracking-[0.2em]", accentText[project.accent])}>
            {project.index}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
            <Sparkles size={9} aria-hidden="true" />
            case study
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpen(project)}
          aria-haspopup="dialog"
          className="mt-5 text-left"
        >
          <h3 className="text-[clamp(1.6rem,3.2vw,2.35rem)] font-semibold leading-none tracking-[-0.035em] text-ink transition-colors group-hover:text-white">
            {project.title}
          </h3>
          <p className={cn("mt-2.5 text-[12px] leading-snug", accentText[project.accent])}>
            {project.subtitle}
          </p>
        </button>

        <p className="mt-4 line-clamp-3 text-[13px] leading-relaxed text-muted">
          {project.description}
        </p>

        <div className="mt-5 h-[132px] [&>div]:h-full">
          <ProjectVisual visual={project.visual} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 4).map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
          {project.stack.length > 4 ? <Tag>+{project.stack.length - 4}</Tag> : null}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-4">
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <p className="tabular font-mono text-[13px] text-ink">{metric.value}</p>
              <p className="mt-0.5 font-mono text-[7.5px] uppercase leading-tight tracking-[0.1em] text-faint">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          {project.links.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 font-mono text-[10px] text-muted transition hover:text-neon"
              >
                {link.label === "Repository" ? <GithubIcon size={10} /> : null}
                {link.label === "Live system" ? "Live" : link.label === "Repository" ? "Repo" : link.label}
                <ArrowUpRight size={9} />
              </a>
            ) : null,
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpen(project)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink transition hover:border-neon/40 hover:text-neon"
        >
          open study
          <ArrowUpRight size={10} />
        </button>
      </div>
    </motion.div>
  );
}
