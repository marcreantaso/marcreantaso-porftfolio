import { analyzeComplexity, type ComplexityAnalysis } from "./bigO";
import { generatePython } from "./codegen";
import { lex } from "./lexer";
import { parseTokens } from "./parser";
import { CompileError, type Program, type Token } from "./types";

const MAX_SOURCE_LENGTH = 6000;
const MAX_TOKENS = 4000;

export interface CompileErrorInfo {
  message: string;
  line: number;
  column: number;
}

export interface CompileSuccess {
  ok: true;
  tokens: Token[];
  program: Program;
  python: string;
  pythonLines: string[];
  lineMap: Record<number, number>;
  analysis: ComplexityAnalysis;
  stats: {
    tokens: number;
    statements: number;
    durationMs: number;
  };
}

export interface CompileFailure {
  ok: false;
  error: CompileErrorInfo;
  durationMs: number;
}

export type CompileResult = CompileSuccess | CompileFailure;

function countStatements(program: Program): number {
  let count = 0;

  const walk = (body: Program["body"]) => {
    body.forEach((statement) => {
      count += 1;
      if (statement.kind === "If") {
        statement.branches.forEach((branch) => walk(branch.body));
        if (statement.elseBody) walk(statement.elseBody);
      } else if (statement.kind === "While" || statement.kind === "For" || statement.kind === "Function") {
        walk(statement.body);
      }
    });
  };

  walk(program.body);
  return count;
}

export function compile(source: string): CompileResult {
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();

  const fail = (error: CompileErrorInfo): CompileFailure => ({
    ok: false,
    error,
    durationMs: Math.max(0.1, (typeof performance !== "undefined" ? performance.now() : Date.now()) - started),
  });

  if (source.trim().length === 0) {
    return fail({ message: "Write some pseudocode to translate.", line: 1, column: 1 });
  }

  if (source.length > MAX_SOURCE_LENGTH) {
    return fail({
      message: `Input is limited to ${MAX_SOURCE_LENGTH.toLocaleString()} characters.`,
      line: 1,
      column: 1,
    });
  }

  try {
    const tokens = lex(source);

    if (tokens.length > MAX_TOKENS) {
      return fail({
        message: `Token limit exceeded (${MAX_TOKENS.toLocaleString()} max). Break the program into smaller parts.`,
        line: 1,
        column: 1,
      });
    }

    const program = parseTokens(tokens);
    const generated = generatePython(program);
    const analysis = analyzeComplexity(program);

    return {
      ok: true,
      tokens,
      program,
      python: generated.code,
      pythonLines: generated.lines,
      lineMap: generated.lineMap,
      analysis,
      stats: {
        tokens: tokens.length - 1,
        statements: countStatements(program),
        durationMs: Math.max(
          0.1,
          (typeof performance !== "undefined" ? performance.now() : Date.now()) - started,
        ),
      },
    };
  } catch (error) {
    if (error instanceof CompileError) {
      return fail({ message: error.message, line: error.line, column: error.column });
    }

    if (error instanceof RangeError) {
      return fail({
        message: "The program exceeds the parser's nesting limit. Simplify the expression or block structure.",
        line: 1,
        column: 1,
      });
    }

    return fail({
      message: error instanceof Error ? error.message : "Unknown compilation error.",
      line: 1,
      column: 1,
    });
  }
}
