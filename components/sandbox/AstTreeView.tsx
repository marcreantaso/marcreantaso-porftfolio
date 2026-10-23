"use client";

import { useMemo, useState } from "react";
import {
  NODE_HEIGHT,
  layoutTree,
  type AstTreeNode,
  type PositionedNode,
} from "@/lib/compiler/tree";

const KIND_STYLE: Record<
  AstTreeNode["kind"],
  { fill: string; stroke: string; text: string; dot: string }
> = {
  program: {
    fill: "rgba(0,240,255,0.12)",
    stroke: "rgba(0,240,255,0.55)",
    text: "#e6e8ef",
    dot: "#00f0ff",
  },
  function: {
    fill: "rgba(139,92,246,0.14)",
    stroke: "rgba(139,92,246,0.55)",
    text: "#e6e8ef",
    dot: "#8b5cf6",
  },
  control: {
    fill: "rgba(16,185,129,0.11)",
    stroke: "rgba(16,185,129,0.5)",
    text: "#e6e8ef",
    dot: "#10b981",
  },
  statement: {
    fill: "rgba(255,255,255,0.035)",
    stroke: "rgba(255,255,255,0.16)",
    text: "#c9cedb",
    dot: "#6b7383",
  },
  branch: {
    fill: "rgba(255,255,255,0.018)",
    stroke: "rgba(255,255,255,0.1)",
    text: "#9aa3b2",
    dot: "#4b5362",
  },
};

const PADDING = 26;

export function AstTreeView({
  tree,
  lineMap,
  onSelect,
}: {
  tree: AstTreeNode;
  lineMap: Record<number, number>;
  onSelect?: (node: PositionedNode, pythonLine: number | null) => void;
}) {
  const layout = useMemo(() => layoutTree(tree), [tree]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = layout.nodes.find((node) => node.id === selectedId) ?? null;
  const selectedPythonLine = selected ? lineMap[selected.id] ?? null : null;

  const handleSelect = (node: PositionedNode) => {
    setSelectedId(node.id);
    onSelect?.(node, lineMap[node.id] ?? null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
        <span>
          {layout.nodes.length} nodes · depth {layout.depth}
        </span>
        <span className="hidden sm:inline">click a node to inspect</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2">
        <div className="inline-block min-w-full">
          <svg
            width={layout.width + PADDING * 2}
            height={layout.height + PADDING * 2}
            viewBox={`0 0 ${layout.width + PADDING * 2} ${layout.height + PADDING * 2}`}
            role="group"
            aria-label="Abstract syntax tree of the translated pseudocode. Select a node to see its line mapping."
            className="max-w-none"
          >
            <g transform={`translate(${PADDING}, ${PADDING})`}>
              {layout.edges.map((edge) => {
                const midY = (edge.fromY + edge.toY) / 2;
                return (
                  <path
                    key={`${edge.fromId}-${edge.toId}`}
                    d={`M${edge.fromX} ${edge.fromY} C ${edge.fromX} ${midY}, ${edge.toX} ${midY}, ${edge.toX} ${edge.toY}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                  />
                );
              })}

              {layout.nodes.map((node) => {
                const style = KIND_STYLE[node.kind];
                const isSelected = node.id === selectedId;
                const maxCharacters = Math.floor((node.width - 16) / 5.9);
                const label =
                  node.label.length > maxCharacters
                    ? `${node.label.slice(0, Math.max(4, maxCharacters - 1))}…`
                    : node.label;

                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.kind} node: ${node.label}, line ${node.line}`}
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(node)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSelect(node);
                      }
                    }}
                    className="cursor-pointer outline-none focus-visible:[&>rect]:stroke-neon focus-visible:[&>rect]:stroke-2"
                  >
                    <rect
                      x={node.x - node.width / 2}
                      y={node.y - NODE_HEIGHT / 2}
                      width={node.width}
                      height={NODE_HEIGHT}
                      rx={7}
                      fill={style.fill}
                      stroke={isSelected ? "#00f0ff" : style.stroke}
                      strokeWidth={isSelected ? 1.6 : 1}
                      className="transition-[stroke,fill] duration-200 hover:brightness-125"
                    />
                    <circle
                      cx={node.x - node.width / 2 + 9}
                      cy={node.y}
                      r={1.8}
                      fill={style.dot}
                      aria-hidden="true"
                    />
                    <text
                      x={node.x}
                      y={node.y + 3.4}
                      textAnchor="middle"
                      fontFamily="var(--font-jetbrains), monospace"
                      fontSize="9.3"
                      fill={style.text}
                      pointerEvents="none"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-h-[42px] items-center justify-between gap-3 border-t border-white/[0.06] px-3 py-2">
        {selected ? (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: KIND_STYLE[selected.kind].dot }}
                aria-hidden="true"
              />
              <span className="truncate font-mono text-[10px] text-ink/85">{selected.label}</span>
            </div>
            <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
              line {selected.line}
              {selectedPythonLine ? ` → py ${selectedPythonLine}` : ""}
            </span>
          </>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
            select a node to inspect its source line
          </span>
        )}
      </div>
    </div>
  );
}
