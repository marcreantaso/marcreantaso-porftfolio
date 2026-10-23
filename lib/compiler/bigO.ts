import type { Expression, Program, Statement } from "./types";

export interface ComplexityAnalysis {
  label: string;
  maxLoopDepth: number;
  loops: number;
  recursive: boolean;
  functions: number;
  nodeCount: number;
  notes: string[];
}

function containsHalving(expression: Expression): boolean {
  switch (expression.kind) {
    case "Binary": {
      if (expression.operator === "/" && expression.right.kind === "Number" && expression.right.value === 2) {
        return true;
      }
      if (expression.operator === "*" && expression.right.kind === "Number" && expression.right.value === 0.5) {
        return true;
      }
      return containsHalving(expression.left) || containsHalving(expression.right);
    }
    case "Unary":
      return containsHalving(expression.operand);
    case "Call":
      return expression.args.some(containsHalving);
    default:
      return false;
  }
}

function callsFunction(expression: Expression, name: string): boolean {
  switch (expression.kind) {
    case "Call":
      return expression.callee === name || expression.args.some((argument) => callsFunction(argument, name));
    case "Binary":
      return callsFunction(expression.left, name) || callsFunction(expression.right, name);
    case "Unary":
      return callsFunction(expression.operand, name);
    default:
      return false;
  }
}

function bodyCallsFunction(body: Statement[], name: string): boolean {
  return body.some((statement) => statementCallsFunction(statement, name));
}

function statementCallsFunction(statement: Statement, name: string): boolean {
  switch (statement.kind) {
    case "Assign":
      return callsFunction(statement.value, name);
    case "Display":
      return statement.args.some((argument) => callsFunction(argument, name));
    case "Return":
      return statement.value ? callsFunction(statement.value, name) : false;
    case "ExpressionStatement":
      return callsFunction(statement.expression, name);
    case "If":
      return (
        statement.branches.some(
          (branch) => callsFunction(branch.condition, name) || bodyCallsFunction(branch.body, name),
        ) ||
        (statement.elseBody ? bodyCallsFunction(statement.elseBody, name) : false)
      );
    case "While":
      return callsFunction(statement.condition, name) || bodyCallsFunction(statement.body, name);
    case "For":
      return (
        callsFunction(statement.from, name) ||
        callsFunction(statement.to, name) ||
        bodyCallsFunction(statement.body, name)
      );
    case "Function":
      return bodyCallsFunction(statement.body, name);
    default:
      return false;
  }
}

function countNodes(program: Program): number {
  let count = 1;

  const countExpression = (expression: Expression) => {
    count += 1;
    if (expression.kind === "Binary") {
      countExpression(expression.left);
      countExpression(expression.right);
    } else if (expression.kind === "Unary") {
      countExpression(expression.operand);
    } else if (expression.kind === "Call") {
      expression.args.forEach(countExpression);
    }
  };

  const walk = (body: Statement[]) => {
    body.forEach((statement) => {
      count += 1;
      switch (statement.kind) {
        case "Assign":
          countExpression(statement.value);
          break;
        case "Display":
          statement.args.forEach(countExpression);
          break;
        case "Return":
          if (statement.value) countExpression(statement.value);
          break;
        case "ExpressionStatement":
          countExpression(statement.expression);
          break;
        case "If":
          statement.branches.forEach((branch) => {
            countExpression(branch.condition);
            walk(branch.body);
          });
          if (statement.elseBody) walk(statement.elseBody);
          break;
        case "While":
          countExpression(statement.condition);
          walk(statement.body);
          break;
        case "For":
          countExpression(statement.from);
          countExpression(statement.to);
          if (statement.step) countExpression(statement.step);
          walk(statement.body);
          break;
        case "Function":
          walk(statement.body);
          break;
        default:
          break;
      }
    });
  };

  walk(program.body);
  return count;
}

export function analyzeComplexity(program: Program): ComplexityAnalysis {
  let maxLoopDepth = 0;
  let loops = 0;
  let recursive = false;
  let functions = 0;
  let halving = false;

  const walk = (body: Statement[], depth: number) => {
    for (const statement of body) {
      if (statement.kind === "While") {
        loops += 1;
        const nextDepth = depth + 1;
        maxLoopDepth = Math.max(maxLoopDepth, nextDepth);
        if (containsHalving(statement.condition) || containsHalvingBody(statement.body)) halving = true;
        walk(statement.body, nextDepth);
      } else if (statement.kind === "For") {
        loops += 1;
        const nextDepth = depth + 1;
        maxLoopDepth = Math.max(maxLoopDepth, nextDepth);
        walk(statement.body, nextDepth);
      } else if (statement.kind === "If") {
        statement.branches.forEach((branch) => walk(branch.body, depth));
        if (statement.elseBody) walk(statement.elseBody, depth);
      } else if (statement.kind === "Function") {
        functions += 1;
        if (bodyCallsFunction(statement.body, statement.name)) recursive = true;
        walk(statement.body, 0);
      }
    }
  };

  const containsHalvingBody = (body: Statement[]): boolean => {
    return body.some((statement) => {
      if (statement.kind === "Assign") return containsHalving(statement.value);
      if (statement.kind === "While") {
        return (
          containsHalving(statement.condition) ||
          containsHalvingBody(statement.body)
        );
      }
      if (statement.kind === "If") {
        return (
          statement.branches.some((branch) => containsHalvingBody(branch.body)) ||
          (statement.elseBody ? containsHalvingBody(statement.elseBody) : false)
        );
      }
      return false;
    });
  };

  walk(program.body, 0);

  let label: string;
  if (maxLoopDepth === 0) {
    label = recursive ? "T(n)" : "O(1)";
  } else if (maxLoopDepth === 1) {
    label = halving ? "O(log n)" : "O(n)";
  } else if (maxLoopDepth === 2) {
    label = "O(n²)";
  } else {
    label = "O(n³+)";
  }

  const notes: string[] = [];
  if (loops === 0 && !recursive) {
    notes.push("No loops or recursive calls — the body runs in constant time.");
  }
  if (loops > 0) {
    notes.push(
      `${loops} loop${loops === 1 ? "" : "s"} detected, maximum nesting depth ${maxLoopDepth}.`,
    );
  }
  if (maxLoopDepth > 1) {
    notes.push("Nested loops multiply their iteration counts.");
  }
  if (halving) {
    notes.push("A loop divides its state, which suggests logarithmic growth.");
  }
  if (recursive) {
    notes.push("A function calls itself; the true recurrence depends on how the argument shrinks.");
  }

  return {
    label,
    maxLoopDepth,
    loops,
    recursive,
    functions,
    nodeCount: countNodes(program),
    notes,
  };
}
