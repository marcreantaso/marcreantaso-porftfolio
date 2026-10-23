"use client";

import { useCallback, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { additionalProjects, projects, type Project } from "@/lib/data/projects";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { withBasePath } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

export function ProjectGrid() {
  const [active, setActive] = useState<Project | null>(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="systems" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="01"
            eyebrow="A few things I have built"
            title={
              <>
                Projects I have worked on,
                <br />
                <span className="text-muted/80">with the details included.</span>
              </>
            }
            description="These projects cover programming education, farming tools, career planning, and waste collection. Open a card to see what I built, how it works, and what I learned along the way."
          />

          <Reveal delay={0.1} className="shrink-0">
            <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
              4 projects · 2 live
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={setActive} />
          ))}
        </div>

        <Reveal className="mt-12" delay={0.05}>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                Additional builds
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                repositories · open source
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {additionalProjects.map((project) => (
                <a
                  key={project.name}
                  href={project.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-void/40 p-4 transition hover:border-neon/25 hover:bg-white/[0.025]"
                >
                  <div>
                    {project.preview ? (
                      <img
                        src={withBasePath(project.preview)}
                        alt={`${project.name} preview`}
                        loading="lazy"
                        decoding="async"
                        className="mb-4 h-28 w-full rounded-lg border border-white/[0.07] object-cover object-top"
                      />
                    ) : null}
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink">{project.name}</p>
                      <span className="rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-faint">
                        {project.kind}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                      {project.description}
                    </p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                      {project.meta}
                    </p>
                  </div>
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-faint transition group-hover:border-neon/35 group-hover:text-neon">
                    <ArrowUpRight size={13} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <p className="mt-6 flex items-start gap-2 font-mono text-[9px] leading-relaxed text-faint/80">
          <GithubIcon size={11} className="mt-0.5 shrink-0" />
          Correspondence: AgriGuard&apos;s public demo is currently offline; its repository remains
          available. PseudoPy and CaDeT link to live deployments.
        </p>
      </div>

      <ProjectModal project={active} onClose={close} />
    </section>
  );
}
