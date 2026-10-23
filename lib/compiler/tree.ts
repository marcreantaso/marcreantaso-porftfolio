import { emitExpression } from "./codegen";
import type { Program, Statement } from "./types";

export interface AstTreeNode {
  id: number;
  label: string;
  kind: "program" | "function" | "control" | "statement" | "branch";
  line: number;
  children: AstTreeNode[];
}

export interface PositionedNode {
  id: number;
  parentId: number | null;
  label: string;
  kind: AstTreeNode["kind"];
  line: number;
  x: number;
  y: number;
  width: number;
}

export interface TreeEdge {
  fromId: number;
  toId: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface TreeLayout {
  nodes: PositionedNode[];
  edges: TreeEdge[];
  width: number;
  height: number;
  depth: number;
}

const NODE_HEIGHT = 30;
const ROW_GAP = 68;
const NODE_GAP = 18;
const MAX_NODES = 150;
const MAX_DEPTH = 11;

function measure(label: string): number {
  return Math.min(248, Math.max(60, label.length * 6.3 + 24));
}

function expressionLabel(statement: string, expression: Parameters<typeof emitExpression>[0]): string {
  return `${statement} ${emitExpression(expression)}`;
}

export function buildAstTree(program: Program): AstTreeNode {
  let syntheticId = 100_000;
  let budget = MAX_NODES;

  const buildBody = (body: Statement[], depth: number): AstTreeNode[] => {
    if (depth > MAX_DEPTH) return [];
    return body.map((statement) => buildStatement(statement, depth));
  };

  const buildStatement = (statement: Statement, depth: number): AstTreeNode => {
    budget -= 1;
    const canExpand = budget > 0 && depth <= MAX_DEPTH;

    switch (statement.kind) {
      case "Assign":
        return {
          id: statement.id,
          label: expressionLabel(`SET ${statement.name} =`, statement.value),
          kind: "statement",
          line: statement.line,
          children: [],
        };

      case "Display":
        return {
          id: statement.id,
          label: `DISPLAY ${statement.args.map((argument) => emitExpression(argument)).join(", ")}`,
          kind: "statement",
          line: statement.line,
          children: [],
        };

      case "Input":
        return {
          id: statement.id,
          label: `INPUT ${statement.name}`,
          kind: "statement",
          line: statement.line,
          children: [],
        };

      case "Return":
        return {
          id: statement.id,
          label: statement.value ? expressionLabel("RETURN", statement.value) : "RETURN",
          kind: "statement",
          line: statement.line,
          children: [],
        };

      case "ExpressionStatement":
        return {
          id: statement.id,
          label: emitExpression(statement.expression),
          kind: "statement",
          line: statement.line,
          children: [],
        };

      case "While":
        return {
          id: statement.id,
          label: expressionLabel("WHILE", statement.condition),
          kind: "control",
          line: statement.line,
          children: canExpand ? buildBody(statement.body, depth + 1) : [],
        };

      case "For":
        return {
          id: statement.id,
          label: `FOR ${statement.variable} FROM ${emitExpression(statement.from)} TO ${emitExpression(statement.to)}`,
          kind: "control",
          line: statement.line,
          children: canExpand ? buildBody(statement.body, depth + 1) : [],
        };

      case "Function":
        return {
          id: statement.id,
          label: `FUNCTION ${statement.name}(${statement.params.join(", ")})`,
          kind: "function",
          line: statement.line,
          children: canExpand ? buildBody(statement.body, depth + 1) : [],
        };

      case "If": {
        const children: AstTreeNode[] = [];

        if (canExpand) {
          statement.branches.forEach((branch, index) => {
            children.push({
              id: syntheticId++,
              label:
                index === 0
                  ? "THEN"
                  : `ELSE IF ${emitExpression(branch.condition)}`,
              kind: "branch",
              line: statement.line,
              children: buildBody(branch.body, depth + 2),
            });
          });

          if (statement.elseBody) {
            children.push({
              id: syntheticId++,
              label: "ELSE",
              kind: "branch",
              line: statement.line,
              children: buildBody(statement.elseBody, depth + 2),
            });
          }
        }

        return {
          id: statement.id,
          label: expressionLabel("IF", statement.branches[0].condition),
          kind: "control",
          line: statement.line,
          children,
        };
      }
    }
  };

  return {
    id: program.id,
    label: `PROGRAM · ${program.body.length} statement${program.body.length === 1 ? "" : "s"}`,
    kind: "program",
    line: 1,
    children: buildBody(program.body, 0),
  };
}

interface Item {
  ast: AstTreeNode;
  width: number;
  subWidth: number;
  childWidth: number;
  children: Item[];
  x: number;
  y: number;
  depth: number;
}

function buildItem(node: AstTreeNode, depth: number): Item {
  const children = depth >= MAX_DEPTH ? [] : node.children.map((child) => buildItem(child, depth + 1));
  const width = measure(node.label);
  return {
    ast: node,
    width,
    subWidth: width,
    childWidth: 0,
    children,
    x: 0,
    y: 0,
    depth,
  };
}

function computeWidth(item: Item): number {
  const childWidth =
    item.children.length === 0
      ? 0
      : item.children.reduce((total, child) => total + child.subWidth, 0) +
        NODE_GAP * (item.children.length - 1);
  item.childWidth = childWidth;
  item.subWidth = Math.max(item.width, childWidth);
  item.children.forEach(computeWidth);
  return item.subWidth;
}

function assignPositions(item: Item, left: number, depth: number) {
  item.depth = depth;
  item.y = depth * ROW_GAP + NODE_HEIGHT / 2;

  if (item.children.length === 0) {
    item.x = left + item.subWidth / 2;
    return;
  }

  let cursor = left + (item.subWidth - item.childWidth) / 2;
  for (const child of item.children) {
    assignPositions(child, cursor, depth + 1);
    cursor += child.subWidth + NODE_GAP;
  }

  const first = item.children[0];
  const last = item.children[item.children.length - 1];
  item.x = (first.x + last.x) / 2;
}

export function layoutTree(root: AstTreeNode): TreeLayout {
  const item = buildItem(root, 0);
  const width = computeWidth(item);
  assignPositions(item, 0, 0);

  const nodes: PositionedNode[] = [];
  const edges: TreeEdge[] = [];
  let maxDepth = 0;

  const walk = (current: Item, parent: Item | null) => {
    maxDepth = Math.max(maxDepth, current.depth);
    nodes.push({
      id: current.ast.id,
      parentId: parent ? parent.ast.id : null,
      label: current.ast.label,
      kind: current.ast.kind,
      line: current.ast.line,
      x: current.x,
      y: current.y,
      width: current.width,
    });

    if (parent) {
      edges.push({
        fromId: parent.ast.id,
        toId: current.ast.id,
        fromX: parent.x,
        fromY: parent.y + NODE_HEIGHT / 2,
        toX: current.x,
        toY: current.y - NODE_HEIGHT / 2,
      });
    }

    current.children.forEach((child) => walk(child, current));
  };

  walk(item, null);

  return {
    nodes,
    edges,
    width,
    height: maxDepth * ROW_GAP + NODE_HEIGHT,
    depth: maxDepth,
  };
}

export { NODE_HEIGHT };
