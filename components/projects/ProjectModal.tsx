"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Trophy, X } from "lucide-react";
import type { Project } from "@/lib/data/projects";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { Tag } from "@/components/ui/Tag";
import { cn, withBasePath } from "@/lib/utils";
import { ProjectVisual } from "./ProjectVisuals";

const accentText = {
  neon: "text-neon",
  mint: "text-mint",
  plasma: "text-plasma",
} as const;

const accentGlow = {
  neon: "from-neon/20",
  mint: "from-mint/20",
  plasma: "from-plasma/20",
} as const;

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!project) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [project, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <motion.button
            type="button"
            aria-label="Close case study"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-void/80 backdrop-blur-md"
            tabIndex={-1}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-white/[0.09] bg-space/95 shadow-[0_40px_120px_rgba(0,0,0,0.65)] sm:rounded-3xl"
          >
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent opacity-70",
                accentGlow[project.accent],
              )}
            />

            <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-7">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
                  case study · {project.index}
                </p>
                <h2
                  id="case-study-title"
                  className="mt-1.5 text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-[-0.03em] text-ink"
                >
                  {project.title}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted transition hover:border-neon/35 hover:text-neon"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
              <p className={cn("text-[13px] font-medium", accentText[project.accent])}>
                {project.subtitle}
              </p>

              {project.award ? (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-mint/20 bg-mint/[0.05] px-3.5 py-3">
                  <Trophy size={14} className="mt-0.5 shrink-0 text-mint" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-mint">
                      {project.award.split(":")[0].trim()}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted">
                      {project.award.split(":").slice(1).join(":").trim()}
                    </p>
                  </div>
                </div>
              ) : null}

              <p className="mt-5 max-w-2xl text-[13.5px] leading-relaxed text-muted">
                {project.description}
              </p>

              <div className="mt-5 h-[160px]">
                {project.preview ? (
                  <img
                    src={withBasePath(project.preview)}
                    alt={`${project.title} preview`}
                    decoding="async"
                    className="h-full w-full rounded-xl border border-white/[0.07] object-cover object-top"
                  />
                ) : (
                  <ProjectVisual visual={project.visual} />
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {project.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
                  >
                    <p className="tabular font-mono text-sm text-ink">{metric.value}</p>
                    <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-faint">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] text-neon">
                    the problem
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {project.caseStudy.problem}
                  </p>
                </section>
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] text-mint">
                    the approach
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {project.caseStudy.approach}
                  </p>
                </section>
              </div>

              <section className="mt-8">
                <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] text-plasma">
                  engineering decisions
                </h3>
                <ul className="mt-3 space-y-2">
                  {project.caseStudy.decisions.map((decision, index) => (
                    <li key={decision} className="flex gap-3 text-[12.5px] leading-relaxed text-muted">
                      <span className="mt-px font-mono text-[10px] text-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
                    constraints
                  </h3>
                  <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-muted">
                    {project.caseStudy.constraints.map((constraint) => (
                      <li key={constraint} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden="true" />
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
                    architecture
                  </h3>
                  <ol className="mt-3 space-y-2">
                    {project.caseStudy.architecture.map((layer) => (
                      <li key={layer.layer} className="flex items-start gap-3">
                        <span className="mt-0.5 w-[74px] shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/80">
                          {layer.layer}
                        </span>
                        <span className="border-l border-white/10 pl-3 text-[11.5px] leading-snug text-muted">
                          {layer.detail}
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <div className="mt-8 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/[0.07] pt-5">
                {project.links.map((link) =>
                  link.href ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-[11px] font-medium text-ink transition hover:border-neon/40 hover:text-neon"
                    >
                      {link.label === "Repository" ? <GithubIcon size={13} /> : null}
                      {link.label}
                      <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <span
                      key={link.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] px-4 py-2 text-[11px] text-faint"
                    >
                      {link.label}
                      <span className="font-mono text-[8px] uppercase tracking-[0.12em]">
                        {link.note}
                      </span>
                    </span>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
