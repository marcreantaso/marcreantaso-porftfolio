"use client";

import { useCallback, useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Gamepad2, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { timeline, type TimelineEntry, type TimelineTrack } from "@/lib/data/timeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

type TimelineView = "all" | TimelineTrack;

const TRACKS = {
  academic: {
    label: "Academic",
    heading: "Academic & Engineering",
    summary: "3 entries · 1 champion title",
    Icon: GraduationCap,
    dot: "bg-mint",
    text: "text-mint",
    border: "border-mint/30",
    hover: "group-hover:border-mint/50",
    glow: "shadow-[0_0_0_4px_rgba(16,185,129,0.10)]",
    line: "bg-gradient-to-b from-mint via-mint/50 to-transparent",
    chip: "border-mint/25 bg-mint/[0.06] text-mint",
  },
  esports: {
    label: "Esports",
    heading: "Esports",
    summary: "6 competitive entries · 1 podium finish · 1 campus title",
    Icon: Gamepad2,
    dot: "bg-plasma",
    text: "text-plasma",
    border: "border-plasma/30",
    hover: "group-hover:border-plasma/50",
    glow: "shadow-[0_0_0_4px_rgba(139,92,246,0.10)]",
    line: "bg-gradient-to-b from-plasma via-plasma/50 to-transparent",
    chip: "border-plasma/25 bg-plasma/[0.06] text-plasma",
  },
} as const;

const VIEW_TABS: TimelineView[] = ["all", "academic", "esports"];

function readView(): TimelineView {
  if (typeof window === "undefined") return "all";
  const query = new URLSearchParams(window.location.search).get("track");
  const hash = window.location.hash.match(/track=(academic|esports)/)?.[1];
  return query === "academic" || query === "esports"
    ? query
    : hash === "academic" || hash === "esports"
      ? hash
      : "all";
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

function useTimelineView(): TimelineView {
  return useSyncExternalStore(subscribeToLocation, readView, () => "all" as TimelineView);
}

function updateView(view: TimelineView) {
  const url = new URL(window.location.href);
  if (view === "all") {
    url.searchParams.delete("track");
  } else {
    url.searchParams.set("track", view);
  }
  window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function TrackCard({
  entry,
  index,
  config,
}: {
  entry: TimelineEntry;
  index: number;
  config: (typeof TRACKS)[TimelineTrack];
}) {
  const Icon = config.Icon;
  const podium = entry.result === "Champion" || entry.result === "3rd Place" || entry.result === "2nd Place";

  return (
    <motion.li
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
      className="relative pl-8"
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-7 z-10 -translate-x-1/2"
      >
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-void",
            config.dot,
            config.glow,
          )}
        />
      </span>

      <article className={cn("panel group relative overflow-hidden rounded-2xl border p-5 transition-colors duration-300 sm:p-6", config.border, config.hover)}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(320px_circle_at_var(--spot,50%)_0%,rgba(0,240,255,0.06),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="relative flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em]", config.chip)}>
            {entry.status === "present" ? (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" aria-hidden="true" />
            ) : (
              <Sparkles size={9} aria-hidden="true" />
            )}
            {entry.status === "present" ? "Present" : entry.event ?? entry.result}
          </span>
          <span className={cn("inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em]", config.text)}>
            <Icon size={11} aria-hidden="true" />
            {config.label}
          </span>
          {podium ? (
            <Tag tone={entry.result === "Champion" ? "mint" : "plasma"}>
              <Trophy size={9} aria-hidden="true" />
              {entry.result}
            </Tag>
          ) : null}
        </div>

        <div className="relative mt-4">
          <span aria-hidden="true" className="absolute -top-3 right-0 font-mono text-[34px] font-semibold leading-none tracking-[-0.04em] text-white/[0.035]">
            {`${entry.track === "academic" ? "A" : "E"}${String(index + 1).padStart(2, "0")}`}
          </span>
          <h3 className="relative text-[clamp(1.05rem,2vw,1.35rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
            {entry.title}
          </h3>
          <p className={cn("relative mt-1 text-[11.5px] font-medium", config.text)}>{entry.org}</p>
          {entry.team && entry.team !== entry.title.replace(/^Roamer, /, "").replace(/^2nd Place, /, "") ? (
            <p className="relative mt-1 text-[10px] font-mono uppercase tracking-[0.12em] text-faint">{entry.team}</p>
          ) : null}
          <p className="relative mt-3 text-[12.5px] leading-relaxed text-muted">{entry.body}</p>
          <div className="relative mt-4 flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </div>
        </div>
      </article>
    </motion.li>
  );
}

function TrackLane({ track }: { track: TimelineTrack }) {
  const config = TRACKS[track];
  const Icon = config.Icon;
  const entries = timeline.filter((entry) => entry.track === track);
  const laneRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: laneRef, offset: ["start 85%", "end 65%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <div ref={laneRef} className="relative">
      <div className="mb-6 border-b border-white/[0.07] pb-5">
        <div className="flex items-center gap-2">
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", config.chip)}>
            <Icon size={16} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-ink">{config.heading}</h3>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">{config.summary}</p>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="absolute bottom-0 left-0 top-[76px] w-px bg-white/[0.08]" />
      <motion.div
        aria-hidden="true"
        style={{ scaleY: reduce ? 1 : progress }}
        className={cn("absolute bottom-0 left-0 top-[76px] w-px origin-top", config.line)}
      />
      <ol className="space-y-5">
        {entries.map((entry, index) => (
          <TrackCard key={entry.id} entry={entry} index={index} config={config} />
        ))}
      </ol>
    </div>
  );
}

export function Timeline() {
  const view = useTimelineView();
  const reduce = useReducedMotion();
  const activeTab = VIEW_TABS.indexOf(view);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "End" ? 1 : -1;
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? VIEW_TABS.length - 1 : (activeTab + direction + VIEW_TABS.length) % VIEW_TABS.length;
    updateView(VIEW_TABS[nextIndex]);
    document.getElementById(`timeline-tab-${VIEW_TABS[nextIndex]}`)?.focus();
  }, [activeTab]);

  return (
    <section id="timeline" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="04"
            eyebrow="Timeline & track record"
            title={<>Two sides of the work.<br /><span className="text-muted/80">One way of thinking.</span></>}
            description={<>Academic and engineering work is where I build, test, and explain ideas.<br />Esports is where I read the state, choose a model, and execute under time pressure. Both follow the same loop.</>}
          />

          <div role="tablist" aria-label="Timeline tracks" className="flex w-fit rounded-full border border-white/[0.08] bg-white/[0.02] p-1">
            {VIEW_TABS.map((tab) => {
              const selected = view === tab;
              return (
                <button
                  key={tab}
                  id={`timeline-tab-${tab}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`timeline-panel-${tab}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => updateView(tab)}
                  onKeyDown={handleKeyDown}
                  className={cn("rounded-full px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors", selected ? "bg-white/[0.08] text-ink" : "text-faint hover:text-muted")}
                >
                  {tab === "all" ? "All" : TRACKS[tab].label}
                </button>
              );
            })}
          </div>
        </div>

        <div role="tabpanel" id={`timeline-panel-${view}`} aria-labelledby={`timeline-tab-${view}`} className="mt-14">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.22 }}
              className={cn("grid gap-8", view === "all" && "lg:grid-cols-2")}
            >
              {(view === "all" ? (["academic", "esports"] as TimelineTrack[]) : [view]).map((track) => (
                <TrackLane key={track} track={track} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-10 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-faint/70">
          ongoing entries marked “Present” · no inferred dates
        </p>
      </div>
    </section>
  );
}
