import { CompileError, type Expression, type Program, type Statement } from "./types";

const PRECEDENCE: Record<string, number> = {
  OR: 1,
  AND: 2,
  "==": 4,
  "!=": 4,
  "<": 4,
  "<=": 4,
  ">": 4,
  ">=": 4,
  "+": 5,
  "-": 5,
  "*": 6,
  "/": 6,
  "%": 6,
  MOD: 6,
  "^": 7,
};

const PYTHON_OPERATOR: Record<string, string> = {
  OR: "or",
  AND: "and",
  MOD: "%",
  "^": "**",
};

const PYTHON_RESERVED = new Set([
  "class",
  "def",
  "lambda",
  "import",
  "from",
  "as",
  "with",
  "try",
  "except",
  "finally",
  "raise",
  "yield",
  "global",
  "nonlocal",
  "assert",
  "del",
  "pass",
  "break",
  "continue",
  "elif",
  "in",
  "is",
  "None",
  "True",
  "False",
  "match",
  "case",
]);

export function emitExpression(expression: Expression, parentPrecedence = 0): string {
  switch (expression.kind) {
    case "Number":
      return expression.raw.includes(".") ? expression.raw : String(expression.value);

    case "String":
      return JSON.stringify(expression.value);

    case "Boolean":
      return expression.value ? "True" : "False";

    case "Variable":
      return expression.name;

    case "Call":
      return `${expression.callee}(${expression.args.map((argument) => emitExpression(argument)).join(", ")})`;

    case "Unary": {
      if (expression.operator === "NOT") {
        return `not ${emitExpression(expression.operand, 3)}`;
      }
      return `${expression.operator}${emitExpression(expression.operand, 8)}`;
    }

    case "Binary": {
      const precedence = PRECEDENCE[expression.operator] ?? 5;
      const isPower = expression.operator === "^";
      const left = emitExpression(expression.left, precedence + (isPower ? 1 : 0));
      const right = emitExpression(expression.right, precedence + (isPower ? 0 : 1));
      const operator = PYTHON_OPERATOR[expression.operator] ?? expression.operator;
      const text = `${left} ${operator} ${right}`;
      return precedence < parentPrecedence ? `(${text})` : text;
    }

    default:
      return "";
  }
}

export interface CodegenResult {
  code: string;
  lines: string[];
  lineMap: Record<number, number>;
}

function indent(level: number): string {
  return "    ".repeat(level);
}

function ensureSafeName(name: string, line: number): void {
  if (!PYTHON_RESERVED.has(name)) return;
  // Throwing here keeps generated Python valid; callers surface it as a diagnostic.
  throw new CompileError(`"${name}" is reserved in Python`, line, 1);
}

export function generatePython(program: Program): CodegenResult {
  const lines: string[] = [];
  const lineMap: Record<number, number> = {};

  const push = (text: string, nodeId?: number) => {
    lines.push(text);
    if (nodeId !== undefined) lineMap[nodeId] = lines.length;
  };

  const emitBlock = (body: Statement[], level: number) => {
    if (body.length === 0) {
      push(`${indent(level)}pass`);
      return;
    }
    body.forEach((statement) => emitStatement(statement, level));
  };

  const emitStatement = (statement: Statement, level: number) => {
    const pad = indent(level);

    switch (statement.kind) {
      case "Assign": {
        ensureSafeName(statement.name, statement.line);
        push(`${pad}${statement.name} = ${emitExpression(statement.value)}`, statement.id);
        break;
      }

      case "Display": {
        push(`${pad}print(${statement.args.map((argument) => emitExpression(argument)).join(", ")})`, statement.id);
        break;
      }

      case "Input": {
        ensureSafeName(statement.name, statement.line);
        push(`${pad}${statement.name} = input()`, statement.id);
        break;
      }

      case "If": {
        statement.branches.forEach((branch, index) => {
          const keyword = index === 0 ? "if" : "elif";
          if (index === 0) {
            push(`${pad}${keyword} ${emitExpression(branch.condition)}:`, statement.id);
          } else {
            push(`${pad}${keyword} ${emitExpression(branch.condition)}:`);
          }
          emitBlock(branch.body, level + 1);
        });

        if (statement.elseBody) {
          push(`${pad}else:`);
          emitBlock(statement.elseBody, level + 1);
        }
        break;
      }

      case "While": {
        push(`${pad}while ${emitExpression(statement.condition)}:`, statement.id);
        emitBlock(statement.body, level + 1);
        break;
      }

      case "For": {
        ensureSafeName(statement.variable, statement.line);
        const start = emitExpression(statement.from);
        const end = emitExpression(statement.to);
        const stepIsNegative =
          statement.step?.kind === "Number"
            ? statement.step.value < 0
            : statement.step?.kind === "Unary" && statement.step.operator === "-";
        const endExpression = `${end} ${stepIsNegative ? "-" : "+"} 1`;
        const args = statement.step
          ? `${start}, ${endExpression}, ${emitExpression(statement.step)}`
          : `${start}, ${endExpression}`;
        push(`${pad}for ${statement.variable} in range(${args}):`, statement.id);
        emitBlock(statement.body, level + 1);
        break;
      }

      case "Function": {
        ensureSafeName(statement.name, statement.line);
        statement.params.forEach((param) => ensureSafeName(param, statement.line));
        push(`${pad}def ${statement.name}(${statement.params.join(", ")}):`, statement.id);
        emitBlock(statement.body, level + 1);
        lines.push("");
        break;
      }

      case "Return": {
        push(`${pad}return${statement.value ? ` ${emitExpression(statement.value)}` : ""}`, statement.id);
        break;
      }

      case "ExpressionStatement": {
        push(`${pad}${emitExpression(statement.expression)}`, statement.id);
        break;
      }
    }
  };

  program.body.forEach((statement) => emitStatement(statement, 0));

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return {
    code: lines.join("\n"),
    lines,
    lineMap,
  };
}
