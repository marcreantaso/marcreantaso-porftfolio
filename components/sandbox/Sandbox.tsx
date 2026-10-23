"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  CornerDownLeft,
  GitBranch,
  ListTree,
  RotateCcw,
  ShieldCheck,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import { compile } from "@/lib/compiler";
import type { ComplexityAnalysis } from "@/lib/compiler/bigO";
import { PRESETS } from "@/lib/compiler/presets";
import type { Token } from "@/lib/compiler/types";
import { buildAstTree } from "@/lib/compiler/tree";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { AstTreeView } from "./AstTreeView";

type TabId = "python" | "ast" | "tokens" | "analysis";

const TABS: { id: TabId; label: string; icon: typeof Terminal }[] = [
  { id: "python", label: "Python", icon: Terminal },
  { id: "ast", label: "AST", icon: ListTree },
  { id: "tokens", label: "Tokens", icon: GitBranch },
  { id: "analysis", label: "Analysis", icon: ShieldCheck },
];

const PYTHON_KEYWORDS = new Set([
  "def",
  "return",
  "if",
  "elif",
  "else",
  "while",
  "for",
  "in",
  "range",
  "print",
  "True",
  "False",
  "and",
  "or",
  "not",
  "pass",
  "input",
  "None",
]);

const TOKEN_COLORS: Record<string, string> = {
  keyword: "text-plasma",
  identifier: "text-ink",
  number: "text-neon",
  string: "text-mint",
  operator: "text-muted",
  eof: "text-faint",
};

function highlightPython(line: string) {
  if (!line) return " ";
  const pattern =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#.*|\b(?:def|return|if|elif|else|while|for|in|range|print|True|False|and|or|not|pass|input|None)\b|\b\d+(?:\.\d+)?\b)/g;

  return line.split(pattern).map((part, index) => {
    if (!part) return null;
    if (part.startsWith("#")) {
      return (
        <span key={index} className="text-faint/70 italic">
          {part}
        </span>
      );
    }
    if (part.startsWith('"') || part.startsWith("'")) {
      return (
        <span key={index} className="text-mint">
          {part}
        </span>
      );
    }
    if (PYTHON_KEYWORDS.has(part)) {
      return (
        <span key={index} className="text-plasma">
          {part}
        </span>
      );
    }
    if (/^\d/.test(part)) {
      return (
        <span key={index} className="text-neon">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function ErrorCard({
  source,
  message,
  line,
  column,
}: {
  source: string;
  message: string;
  line: number;
  column: number;
}) {
  const lines = source.split("\n");
  const start = Math.max(0, line - 2);
  const end = Math.min(lines.length, line + 1);

  return (
    <div className="rounded-xl border border-red-500/25 bg-red-500/[0.045] p-3.5">
      <div className="flex items-start gap-2.5">
        <TriangleAlert size={14} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-400">
            syntax diagnostic · line {line}, column {column}
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-red-200/90">{message}</p>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-red-500/15 bg-void/50 p-2.5 font-mono text-[11px] leading-[1.7]">
        {lines.slice(start, end).map((text, index) => {
          const number = start + index + 1;
          const isErrorLine = number === line;
          return (
            <div key={number}>
              <div className={isErrorLine ? "text-red-200" : "text-faint/60"}>
                <span className="mr-3 inline-block w-6 select-none text-right opacity-50">
                  {number}
                </span>
                {text || " "}
              </div>
              {isErrorLine ? (
                <div className="text-red-400">
                  <span className="mr-3 inline-block w-6 select-none" />
                  {" ".repeat(Math.max(0, column - 1))}
                  <span aria-hidden="true">^</span>
                  <span className="sr-only"> error here</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PythonPanel({ lines, highlight }: { lines: string[]; highlight: number | null }) {
  return (
    <div className="h-full overflow-auto py-3 font-mono text-[11.5px] leading-[1.7]">
      {highlight ? (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-md border border-neon/20 bg-neon/[0.05] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-neon">
          <GitBranch size={10} aria-hidden="true" />
          linked to AST node · line {highlight}
        </div>
      ) : null}
      {lines.map((line, index) => {
        const number = index + 1;
        const isHighlighted = highlight === number;
        return (
          <div
            key={number}
            className={cn("flex px-1 transition-colors", isHighlighted && "bg-neon/[0.09]")}
          >
            <span className="w-10 shrink-0 select-none pr-3 text-right text-faint/40">{number}</span>
            <code className="whitespace-pre text-ink/85">{highlightPython(line)}</code>
          </div>
        );
      })}
    </div>
  );
}

function TokenPanel({ tokens }: { tokens: Token[] }) {
  const visible = tokens.filter((token) => token.type !== "eof");

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse font-mono text-[10.5px]">
        <thead className="sticky top-0 z-10 bg-space/95 backdrop-blur">
          <tr className="text-left text-[8.5px] uppercase tracking-[0.16em] text-faint">
            <th className="px-3 py-2 font-normal">#</th>
            <th className="px-2 py-2 font-normal">type</th>
            <th className="px-2 py-2 font-normal">value</th>
            <th className="px-3 py-2 text-right font-normal">line:col</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((token, index) => (
            <tr key={`${token.line}-${token.column}-${index}`} className="border-t border-white/[0.04]">
              <td className="px-3 py-1.5 text-faint/50">{String(index + 1).padStart(2, "0")}</td>
              <td className={cn("px-2 py-1.5", TOKEN_COLORS[token.type])}>{token.type}</td>
              <td className="max-w-[160px] truncate px-2 py-1.5 text-ink/85">
                {token.type === "string" ? `"${token.value}"` : token.value}
              </td>
              <td className="px-3 py-1.5 text-right text-faint">
                {token.line}:{token.column}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalysisPanel({ analysis }: { analysis: ComplexityAnalysis }) {
  return (
    <div className="h-full overflow-auto p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
            static complexity class
          </p>
          <p className="text-gradient mt-1 inline-block text-[clamp(2.2rem,5vw,3rem)] font-semibold leading-none tracking-[-0.04em]">
            {analysis.label}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full border border-plasma/25 bg-plasma/[0.08] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-plasma">
            {analysis.recursive ? "recursive" : "iterative"}
          </span>
          <span className="font-mono text-[9px] text-faint">loop depth {analysis.maxLoopDepth}</span>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "loops", value: analysis.loops },
          { label: "depth", value: analysis.maxLoopDepth },
          { label: "functions", value: analysis.functions },
          { label: "nodes", value: analysis.nodeCount },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
            <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">
              {item.label}
            </dt>
            <dd className="tabular mt-0.5 font-mono text-sm text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-5 space-y-2">
        {analysis.notes.map((note) => (
          <li key={note} className="flex gap-2 text-[11.5px] leading-relaxed text-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neon" aria-hidden="true" />
            {note}
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-white/[0.06] pt-3 font-mono text-[9px] leading-relaxed text-faint/80">
        Heuristic derived from loop nesting, halving patterns, and self-calls. Nothing is executed
        or benchmarked; the analyzer reasons about structure only.
      </p>
    </div>
  );
}

export function Sandbox() {
  const [source, setSource] = useState(PRESETS[0].code);
  const [activePreset, setActivePreset] = useState<string | null>(PRESETS[0].id);
  const [tab, setTab] = useState<TabId>("python");
  const [selectedPythonLine, setSelectedPythonLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const deferredSource = useDeferredValue(source);
  const result = useMemo(() => compile(deferredSource), [deferredSource]);
  const astTree = useMemo(
    () => (result.ok ? buildAstTree(result.program) : null),
    [result],
  );
  const isStale = source !== deferredSource;

  const gutterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyTimer = useRef<number | null>(null);

  const lineCount = source.split("\n").length;

  useEffect(() => {
    setSelectedPythonLine(null);
  }, [deferredSource]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (result.ok) {
      setAnnouncement(
        `Translation ready. ${result.stats.statements} statements, complexity ${result.analysis.label}.`,
      );
    } else {
      setAnnouncement(`Diagnostic on line ${result.error.line}: ${result.error.message}`);
    }
  }, [result]);

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setSource(preset.code);
    setActivePreset(preset.id);
    setSelectedPythonLine(null);
    textareaRef.current?.focus();
  };

  const copyPython = async () => {
    if (!result.ok) return;
    try {
      await navigator.clipboard.writeText(result.python);
      setCopied(true);
      setAnnouncement("Python output copied to clipboard.");
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setAnnouncement("Clipboard access was blocked by the browser.");
    }
  };

  const tabCount: Record<TabId, string> = result.ok
    ? {
        python: `${result.pythonLines.length}`,
        ast: `${result.analysis.nodeCount}`,
        tokens: `${result.stats.tokens}`,
        analysis: result.analysis.label,
      }
    : { python: "—", ast: "—", tokens: "—", analysis: "—" };

  return (
    <section id="sandbox" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="03"
            eyebrow="Interactive compiler sandbox"
            title={
              <>
                Pseudocode in.
                <br />
                <span className="text-muted/80">Python out.</span>
              </>
            }
            description="A compact compiler that runs entirely in your browser: lexer, recursive-descent parser, positioned AST, Python emitter, and a loop-nesting complexity heuristic. Edit the program, click through the tree, and watch the output re-derive itself."
          />

          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/25 bg-mint/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-mint">
              <ShieldCheck size={11} aria-hidden="true" />
              local execution
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
              zero network calls
            </span>
          </div>
        </div>

        <div className="panel mt-10 overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-3 border-b border-white/[0.07] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                pseudocode.translate
              </span>
              <span className="hidden rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[8px] text-faint sm:inline">
                v1.0
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em]",
                  result.ok
                    ? "border-mint/25 bg-mint/[0.06] text-mint"
                    : "border-red-500/30 bg-red-500/[0.06] text-red-300",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isStale ? "animate-pulse bg-neon" : result.ok ? "bg-mint" : "bg-red-400",
                  )}
                  aria-hidden="true"
                />
                {isStale ? "translating" : result.ok ? "ast ready" : "diagnostic"}
              </span>
              <span className="sr-only" aria-live="polite">
                {announcement}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col border-b border-white/[0.07] bg-void/55 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.06] px-3 py-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    aria-pressed={activePreset === preset.id}
                    title={preset.description}
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9px] transition",
                      activePreset === preset.id
                        ? "border-neon/30 bg-neon/[0.08] text-neon"
                        : "border-white/[0.07] text-faint hover:border-white/15 hover:text-ink",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  input.pseudo · {lineCount} lines
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset(PRESETS[0].id)}
                  className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-faint transition hover:text-neon"
                >
                  <RotateCcw size={10} aria-hidden="true" />
                  reset
                </button>
              </div>

              <div className="flex bg-[#0a0b10]/60">
                <div
                  ref={gutterRef}
                  aria-hidden="true"
                  className="h-[330px] select-none overflow-hidden py-3 pl-3 pr-2 text-right font-mono text-[11.5px] leading-[1.7] text-faint/40 sm:h-[390px]"
                >
                  {Array.from({ length: lineCount }, (_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>

                <textarea
                  ref={textareaRef}
                  value={source}
                  onChange={(event) => {
                    setSource(event.target.value);
                    setActivePreset(null);
                  }}
                  onScroll={(event) => {
                    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
                  }}
                  onKeyDown={(event) => {
                    const element = event.currentTarget;

                    if (event.key === "Tab") {
                      event.preventDefault();
                      const start = element.selectionStart;
                      const end = element.selectionEnd;
                      const next = `${source.slice(0, start)}  ${source.slice(end)}`;
                      setSource(next);
                      setActivePreset(null);
                      window.requestAnimationFrame(() => {
                        element.selectionStart = start + 2;
                        element.selectionEnd = start + 2;
                      });
                    }

                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      setTab("python");
                      element.blur();
                    }
                  }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  wrap="off"
                  aria-label="Pseudocode editor"
                  className="h-[330px] w-full resize-none overflow-auto bg-transparent py-3 pr-4 font-mono text-[11.5px] leading-[1.7] text-ink caret-neon outline-none sm:h-[390px]"
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-2 font-mono text-[9px] text-faint">
                <span className="inline-flex items-center gap-1.5">
                  <CornerDownLeft size={10} aria-hidden="true" />
                  tab indents · ⌘↵ runs
                </span>
                <span className={cn(isStale ? "text-neon" : "text-transparent")}>compiling…</span>
              </div>
            </div>

            <div className="flex min-h-[430px] flex-col bg-space/40">
              <div className="flex items-stretch border-b border-white/[0.06]">
                <div
                  role="tablist"
                  aria-label="Compiler output"
                  className="flex flex-1 items-stretch"
                >
                  {TABS.map((item) => {
                    const Icon = item.icon;
                    const isActive = tab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`panel-${item.id}`}
                        id={`tab-${item.id}`}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => setTab(item.id)}
                        onKeyDown={(event) => {
                          if (
                            event.key !== "ArrowRight" &&
                            event.key !== "ArrowLeft" &&
                            event.key !== "Home" &&
                            event.key !== "End"
                          ) {
                            return;
                          }

                          event.preventDefault();
                          const index = TABS.findIndex((entry) => entry.id === item.id);
                          let nextIndex = index;

                          if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
                          if (event.key === "ArrowLeft") {
                            nextIndex = (index - 1 + TABS.length) % TABS.length;
                          }
                          if (event.key === "Home") nextIndex = 0;
                          if (event.key === "End") nextIndex = TABS.length - 1;

                          const next = TABS[nextIndex];
                          setTab(next.id);
                          document.getElementById(`tab-${next.id}`)?.focus();
                        }}
                        className={cn(
                          "relative flex flex-1 items-center justify-center gap-1.5 px-2 py-3 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors",
                          isActive ? "text-neon" : "text-faint hover:text-ink",
                        )}
                      >
                        <Icon size={11} aria-hidden="true" />
                        {item.label}
                        <span className="hidden text-[8px] text-faint/70 sm:inline">
                          {tabCount[item.id]}
                        </span>
                        {isActive ? (
                          <span className="absolute inset-x-2 bottom-0 h-px bg-neon" aria-hidden="true" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={copyPython}
                  disabled={!result.ok}
                  className="flex shrink-0 items-center gap-1.5 border-l border-white/[0.06] px-3 font-mono text-[9px] uppercase tracking-[0.12em] text-faint transition hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? "copied" : "copy"}
                </button>
              </div>

              <div className="min-h-0 flex-1">
                {!result.ok ? (
                  <div className="h-full p-3" id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
                    <ErrorCard
                      source={deferredSource}
                      message={result.error.message}
                      line={result.error.line}
                      column={result.error.column}
                    />
                    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] px-4 py-10 text-center">
                      <TriangleAlert size={16} className="text-faint" aria-hidden="true" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                        {tab === "python"
                          ? "python emission paused"
                          : tab === "ast"
                            ? "ast not built"
                            : tab === "tokens"
                              ? "token stream unavailable"
                              : "analysis unavailable"}
                      </p>
                      <p className="max-w-xs text-[11px] leading-relaxed text-faint/80">
                        Resolve the diagnostic above; the pipeline recompiles automatically as you
                        type.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    id={`panel-${tab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${tab}`}
                    className="h-full"
                  >
                    {tab === "python" ? (
                      <PythonPanel
                        lines={result.pythonLines}
                        highlight={selectedPythonLine}
                      />
                    ) : null}

                    {tab === "ast" ? (
                      astTree ? (
                        <AstTreeView
                          tree={astTree}
                          lineMap={result.lineMap}
                          onSelect={(_node, pythonLine) => {
                            setSelectedPythonLine(pythonLine);
                          }}
                        />
                      ) : null
                    ) : null}

                    {tab === "tokens" ? <TokenPanel tokens={result.tokens} /> : null}

                    {tab === "analysis" ? <AnalysisPanel analysis={result.analysis} /> : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-white/[0.07] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <span>
                tokens <span className="text-ink/80">{result.ok ? result.stats.tokens : "—"}</span>
              </span>
              <span>
                statements <span className="text-ink/80">{result.ok ? result.stats.statements : "—"}</span>
              </span>
              <span>
                complexity{" "}
                <span className="text-mint">{result.ok ? result.analysis.label : "—"}</span>
              </span>
              <span>
                compiled{" "}
                <span className="text-ink/80">
                  {(result.ok ? result.stats.durationMs : result.durationMs).toFixed(1)}ms
                </span>
              </span>
            </div>
            <span className={result.ok ? "text-mint" : "text-red-300"}>
              {result.ok ? "0 diagnostics" : "1 diagnostic"}
            </span>
          </div>
        </div>

        <p className="mt-4 font-mono text-[9px] leading-relaxed text-faint/80">
          Supported subset: SET/assignment · DISPLAY/PRINT · INPUT · IF/ELSE IF/ELSE/ENDIF ·
          WHILE/ENDWHILE · FOR/FROM/TO/STEP/ENDFOR · FUNCTION/ENDFUNCTION · RETURN · MOD · AND/OR/NOT.
          Blocks are keyword-terminated, not indentation-based.
        </p>
      </div>
    </section>
  );
}
