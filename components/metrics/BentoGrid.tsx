import { ArrowUpRight, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MetricCard } from "./MetricCard";
import { ComplexityChart } from "./ComplexityChart";
import { AGRIGUARD_METRIC_CONFIG } from "@/lib/data/agriguardMetric";
import { DecisionVisual, PipelineVisual, SignalVisual, TopologyVisual } from "./visuals";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
      <p className="tabular font-mono text-[13px] text-ink">{value}</p>
      <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-faint">{label}</p>
    </div>
  );
}

export function BentoGrid() {
  return (
    <section id="metrics" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <SectionHeading
          index="02"
          eyebrow="Metrics & core strengths"
          title={
            <>
              Operating principles,
              <br />
              <span className="text-muted/80">not decoration.</span>
            </>
          }
          description="A look at the systems, awards, and habits behind the interface. Every figure below comes from a public repository or a confirmed result. No made-up benchmarks."
        />

        <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-6 lg:grid-cols-12">
          <MetricCard
            index="01"
            kicker="algorithmic precision"
            accent="neon"
            className="md:col-span-3 lg:col-span-5 lg:row-span-2"
            title="Parsers that explain themselves."
            description="PseudoPy translates pseudocode into executable Python through a rule-based pipeline, then runs a separate analysis pass for structure and syntax balance. The same discipline powers the sandbox below."
            footer={
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon" aria-hidden="true" />
                  static analysis
                </span>
                <span>offline-first</span>
              </>
            }
          >
            <div className="space-y-3">
              <PipelineVisual />
              <div className="grid grid-cols-2 gap-2">
                <Stat value="O(n)" label="single-pass lexing" />
                <Stat value="7+" label="supported constructs" />
              </div>
              <SignalVisual />
            </div>
          </MetricCard>

          <MetricCard
            index="02"
            kicker="champion · the great flavor byte"
            accent="mint"
            delay={0.06}
            className="md:col-span-3 lg:col-span-7"
            title="Champion, built under pressure."
            description="AgriGuard won the championship at The Great Flavor Byte. It brings IoT readings, crop analysis, alerts, and field workflows together in one authenticated application."
            footer={
              <>
                <span className="inline-flex items-center gap-1.5 text-mint">
                  <Trophy size={11} aria-hidden="true" /> Champion
                </span>
                <span>4 relational tables</span>
                <span>1 deployment</span>
              </>
            }
          >
            <div className="space-y-3">
              <TopologyVisual />
              <p className="rounded-lg border border-mint/25 bg-mint/[0.06] px-3 py-2 font-mono text-[10px] leading-relaxed text-mint">
                ACCS × Lucky Me Idea Noodling Competition
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-3 font-mono text-[10px]">
                <a href={AGRIGUARD_METRIC_CONFIG.destinations.caseStudy} className="inline-flex items-center gap-1.5 text-ink transition hover:text-mint">
                  Read case study <ArrowUpRight size={11} aria-hidden="true" />
                </a>
                <a href={AGRIGUARD_METRIC_CONFIG.destinations.timeline} className="inline-flex items-center gap-1.5 text-ink transition hover:text-mint">
                  View on timeline <ArrowUpRight size={11} aria-hidden="true" />
                </a>
                <a
                  href={AGRIGUARD_METRIC_CONFIG.destinations.repository}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-ink transition hover:text-mint"
                >
                  Repo <ArrowUpRight size={11} aria-hidden="true" />
                </a>
              </div>
              <p className="font-mono text-[9px] text-faint">Public demo offline · repository available</p>
            </div>
          </MetricCard>

          <MetricCard
            index="03"
            kicker="tactical mindset"
            accent="plasma"
            delay={0.1}
            className="md:col-span-3 lg:col-span-3"
            title="Macro before mechanics."
            description="MLBB roamer for Team Falcons Academy across BEAR ESPORTS MAIN, TSP FALCONS, NO DOUBT EPRO, and TSP FALCONS LAGUNA, plus PnC Esports. I read the map, manage pressure, and make decisions quickly."
            footer={
              <>
                <span>Team Falcons Academy</span>
                <span>PnC Esports</span>
              </>
            }
          >
            <DecisionVisual />
          </MetricCard>

          <MetricCard
            index="04"
            kicker="math & code efficiency"
            accent="neon"
            delay={0.14}
            className="md:col-span-3 lg:col-span-4"
            title="Complexity, made visible."
            description="Key lookups stay O(1), lexing is O(n), sorting is O(n log n), and nested scans are O(n²). The sandbox below derives a heuristic class from your loop structure."
            footer={
              <>
                <span>heuristic model</span>
                <span className="text-faint/70">not a benchmark</span>
              </>
            }
          >
            <ComplexityChart />
          </MetricCard>
        </div>
      </div>
    </section>
  );
}
