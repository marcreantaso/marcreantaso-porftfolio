import { describe, expect, it } from "vitest";
import { compile } from "./index";
import { lex } from "./lexer";
import { analyzeComplexity } from "./bigO";
import { parse, parseTokens } from "./parser";
import { generatePython } from "./codegen";
import { PRESETS } from "./presets";
import { buildAstTree, layoutTree } from "./tree";
import { CompileError } from "./types";

function python(source: string): string {
  return generatePython(parse(source)).code;
}

describe("lexer", () => {
  it("tokenizes keywords, identifiers, numbers, and operators", () => {
    const tokens = lex("SET total TO 10\nDISPLAY total + 2");
    expect(tokens.map((token) => token.value)).toEqual([
      "SET",
      "total",
      "TO",
      "10",
      "DISPLAY",
      "total",
      "+",
      "2",
      "",
    ]);
    expect(tokens[0].type).toBe("keyword");
    expect(tokens[1].type).toBe("identifier");
    expect(tokens[3].type).toBe("number");
  });

  it("normalizes ** to ^", () => {
    const tokens = lex("SET x TO 2 ** 8");
    expect(tokens.some((token) => token.value === "^")).toBe(true);
  });

  it("ignores both comment styles", () => {
    const tokens = lex("# hash comment\nSET x TO 1 // inline\nDISPLAY x");
    expect(tokens.map((token) => token.value)).toEqual(["SET", "x", "TO", "1", "DISPLAY", "x", ""]);
  });

  it("reports unterminated strings with a line number", () => {
    expect(() => lex('DISPLAY "hello')).toThrow(CompileError);
    try {
      lex('DISPLAY "hello');
    } catch (error) {
      expect((error as CompileError).line).toBe(1);
    }
  });
});

describe("parser and code generation", () => {
  it("translates assignment", () => {
    expect(python("SET x TO 5")).toBe("x = 5");
    expect(python("x <- 5 + 2")).toBe("x = 5 + 2");
  });

  it("translates DISPLAY into print", () => {
    expect(python('DISPLAY "value:", 42')).toBe('print("value:", 42)');
  });

  it("translates if / elseif / else", () => {
    const result = python(`IF n MOD 2 == 0 THEN
  DISPLAY "even"
ELSE IF n > 10 THEN
  DISPLAY "big odd"
ELSE
  DISPLAY "odd"
ENDIF`);
    expect(result).toBe(`if n % 2 == 0:
    print("even")
elif n > 10:
    print("big odd")
else:
    print("odd")`);
  });

  it("translates a for loop with an inclusive bound", () => {
    expect(python("FOR i FROM 1 TO 5 DO\n  DISPLAY i\nENDFOR")).toBe(
      "for i in range(1, 5 + 1):\n    print(i)",
    );
  });

  it("translates a descending for loop", () => {
    expect(python("FOR i FROM 10 TO 1 STEP -1 DO\n  DISPLAY i\nENDFOR")).toBe(
      "for i in range(10, 1 - 1, -1):\n    print(i)",
    );
  });

  it("translates while loops", () => {
    expect(python("SET n TO 10\nWHILE n > 0 DO\n  SET n TO n / 2\nENDWHILE")).toBe(
      "n = 10\nwhile n > 0:\n    n = n / 2",
    );
  });

  it("translates functions and returns", () => {
    const result = python(`FUNCTION square(n)
  RETURN n * n
ENDFUNCTION
DISPLAY square(7)`);
    expect(result).toBe("def square(n):\n    return n * n\n\nprint(square(7))");
  });

  it("adds pass to empty blocks", () => {
    expect(python("FUNCTION noop()\nENDFUNCTION")).toBe("def noop():\n    pass");
  });

  it("preserves precedence and removes redundant parentheses", () => {
    expect(python("SET x TO 1 + 2 * 3")).toBe("x = 1 + 2 * 3");
    expect(python("SET x TO (1 + 2) * 3")).toBe("x = (1 + 2) * 3");
    expect(python("SET x TO 2 ^ 3 ^ 2")).toBe("x = 2 ** 3 ** 2");
  });

  it("keeps unary minus below exponentiation", () => {
    expect(python("SET x TO -2 ^ 2")).toBe("x = -(2 ** 2)");
  });

  it("translates boolean operators", () => {
    expect(python("IF NOT (a == 1 AND b OR c) THEN\n  DISPLAY TRUE\nENDIF")).toBe(
      "if not (a == 1 and b or c):\n    print(True)",
    );
  });

  it("escapes strings for Python", () => {
    expect(python('DISPLAY "line\\nbreak"')).toBe('print("line\\nbreak")');
  });

  it("reports the line of a syntax error", () => {
    const result = compile("SET x TO 5\nIF x > 1\n  DISPLAY x\nENDIF");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBe(3);
      expect(result.error.message).toContain("THEN");
    }
  });

  it("rejects reserved Python identifiers", () => {
    const result = compile("SET class TO 1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("reserved");
  });
});

describe("complexity analysis", () => {
  it("returns O(1) for straight-line code", () => {
    expect(analyzeComplexity(parse("SET x TO 1\nDISPLAY x")).label).toBe("O(1)");
  });

  it("returns O(n) for a single loop", () => {
    const analysis = analyzeComplexity(parse("FOR i FROM 1 TO 10 DO\n  DISPLAY i\nENDFOR"));
    expect(analysis.label).toBe("O(n)");
    expect(analysis.maxLoopDepth).toBe(1);
  });

  it("returns O(log n) for halving loops", () => {
    const analysis = analyzeComplexity(
      parse("SET n TO 64\nWHILE n > 1 DO\n  SET n TO n / 2\nENDWHILE"),
    );
    expect(analysis.label).toBe("O(log n)");
  });

  it("returns O(n²) for nested loops", () => {
    const analysis = analyzeComplexity(
      parse(
        "FOR i FROM 1 TO 10 DO\n  FOR j FROM 1 TO 10 DO\n    DISPLAY i, j\n  ENDFOR\nENDFOR",
      ),
    );
    expect(analysis.label).toBe("O(n²)");
    expect(analysis.maxLoopDepth).toBe(2);
  });

  it("detects recursive functions", () => {
    const analysis = analyzeComplexity(
      parse(
        "FUNCTION fact(n)\n  IF n <= 1 THEN\n    RETURN 1\n  ENDIF\n  RETURN n * fact(n - 1)\nENDFUNCTION",
      ),
    );
    expect(analysis.recursive).toBe(true);
    expect(analysis.label).toBe("T(n)");
  });
});

describe("ast tree", () => {
  it("builds and lays out a positioned tree", () => {
    const program = parse("IF x > 1 THEN\n  DISPLAY x\nELSE\n  DISPLAY 0\nENDIF");
    const tree = buildAstTree(program);
    const layout = layoutTree(tree);

    expect(tree.children.length).toBeGreaterThan(0);
    expect(layout.nodes.length).toBeGreaterThan(3);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
    expect(layout.edges.length).toBe(layout.nodes.length - 1);
  });

  it("parses from an existing token stream", () => {
    const tokens = lex("SET x TO 2");
    expect(parseTokens(tokens).body).toHaveLength(1);
  });
});

describe("compile pipeline", () => {
  it("returns code, tokens, analysis, and stats", () => {
    const result = compile("SET x TO 2\nDISPLAY x");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.python).toBe("x = 2\nprint(x)");
      expect(result.stats.tokens).toBeGreaterThan(0);
      expect(result.stats.statements).toBe(2);
      expect(result.analysis.label).toBe("O(1)");
      expect(result.pythonLines).toHaveLength(2);
      expect(result.lineMap[result.program.body[0].id]).toBe(1);
    }
  });

  it("fails gracefully on empty input", () => {
    const result = compile("   ");
    expect(result.ok).toBe(false);
  });

  it("enforces the source length limit", () => {
    const result = compile("SET x TO 1\n".repeat(700));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("limited");
  });
});

describe("sandbox presets", () => {
  it("ships only programs that compile", () => {
    for (const preset of PRESETS) {
      const result = compile(preset.code);
      expect(result.ok, `${preset.id} failed: ${result.ok ? "" : result.error.message}`).toBe(true);
    }
  });

  it("covers constant, linear, logarithmic, quadratic, and recursive shapes", () => {
    const labels = PRESETS.map((preset) => {
      const result = compile(preset.code);
      return result.ok ? result.analysis.label : "error";
    });

    expect(labels).toContain("O(1)");
    expect(labels).toContain("O(n)");
    expect(labels).toContain("O(log n)");
    expect(labels).toContain("O(n²)");
    expect(labels).toContain("T(n)");
  });
});
