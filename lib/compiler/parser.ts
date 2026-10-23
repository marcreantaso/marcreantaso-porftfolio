import { lex } from "./lexer";
import {
  CompileError,
  type AssignStatement,
  type BinaryExpression,
  type CallExpression,
  type DisplayStatement,
  type Expression,
  type ExpressionStatement,
  type ForStatement,
  type FunctionStatement,
  type IfStatement,
  type InputStatement,
  type Program,
  type ReturnStatement,
  type Statement,
  type Token,
  type UnaryExpression,
  type WhileStatement,
} from "./types";

const COMPARISON_OPERATORS = new Set(["==", "!=", "<", "<=", ">", ">="]);

function startsExpression(token: Token): boolean {
  if (token.type === "number" || token.type === "string" || token.type === "identifier") {
    return true;
  }
  if (token.type === "operator" && (token.value === "-" || token.value === "+" || token.value === "(")) {
    return true;
  }
  return token.type === "keyword" && (token.value === "TRUE" || token.value === "FALSE" || token.value === "NOT");
}

class Parser {
  private tokens: Token[];
  private position = 0;
  private nextId = 1;

  constructor(source: Token[] | string) {
    this.tokens = typeof source === "string" ? lex(source) : source;
  }

  private id(): number {
    return this.nextId++;
  }

  private peek(offset = 0): Token {
    const index = Math.min(this.position + offset, this.tokens.length - 1);
    return this.tokens[index];
  }

  private advance(): Token {
    const token = this.peek();
    if (token.type !== "eof") this.position += 1;
    return token;
  }

  private checkKeyword(value: string): boolean {
    const token = this.peek();
    return token.type === "keyword" && token.value === value;
  }

  private matchKeyword(...values: string[]): boolean {
    for (const value of values) {
      if (this.checkKeyword(value)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private expectKeyword(value: string): Token {
    const token = this.peek();
    if (token.type === "keyword" && token.value === value) return this.advance();
    throw new CompileError(
      `Expected ${value} but found ${this.describe(token)}`,
      token.line,
      token.column,
    );
  }

  private checkOperator(value: string): boolean {
    const token = this.peek();
    return token.type === "operator" && token.value === value;
  }

  private matchOperator(value: string): boolean {
    if (this.checkOperator(value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private expectOperator(value: string): Token {
    const token = this.peek();
    if (token.type === "operator" && token.value === value) return this.advance();
    throw new CompileError(
      `Expected "${value}" but found ${this.describe(token)}`,
      token.line,
      token.column,
    );
  }

  private expectIdentifier(context: string): Token {
    const token = this.peek();
    if (token.type === "identifier") return this.advance();
    throw new CompileError(
      `Expected ${context} but found ${this.describe(token)}`,
      token.line,
      token.column,
    );
  }

  private describe(token: Token): string {
    if (token.type === "eof") return "end of input";
    return `"${token.value}"`;
  }

  parse(): Program {
    const body: Statement[] = [];
    while (this.peek().type !== "eof") {
      body.push(this.parseStatement());
    }
    return { kind: "Program", id: this.id(), line: 1, body };
  }

  private parseBlock(terminators: string[]): Statement[] {
    const body: Statement[] = [];
    const terminatorSet = new Set(terminators);

    while (this.peek().type !== "eof") {
      const token = this.peek();
      if (token.type === "keyword" && terminatorSet.has(token.value)) break;
      body.push(this.parseStatement());
    }

    return body;
  }

  private parseStatement(): Statement {
    const token = this.peek();

    if (token.type === "keyword") {
      switch (token.value) {
        case "SET":
          return this.parseSet();
        case "DISPLAY":
        case "PRINT":
          return this.parseDisplay();
        case "INPUT":
          return this.parseInput();
        case "IF":
          return this.parseIf();
        case "WHILE":
          return this.parseWhile();
        case "FOR":
          return this.parseFor();
        case "FUNCTION":
          return this.parseFunction();
        case "RETURN":
          return this.parseReturn();
        default:
          break;
      }
    }

    if (token.type === "identifier") {
      const next = this.peek(1);
      if (next.type === "operator" && (next.value === "<-" || next.value === "=")) {
        const name = this.advance().value;
        this.advance();
        const value = this.parseExpression();
        return {
          kind: "Assign",
          id: this.id(),
          line: token.line,
          name,
          value,
          keyword: false,
        } satisfies AssignStatement;
      }
    }

    if (startsExpression(token)) {
      const expression = this.parseExpression();
      return {
        kind: "ExpressionStatement",
        id: this.id(),
        line: token.line,
        expression,
      } satisfies ExpressionStatement;
    }

    throw new CompileError(
      `Unexpected ${this.describe(token)} at the start of a statement`,
      token.line,
      token.column,
    );
  }

  private parseSet(): AssignStatement {
    const token = this.expectKeyword("SET");
    const name = this.expectIdentifier("a variable name after SET").value;
    this.expectKeyword("TO");
    const value = this.parseExpression();
    return {
      kind: "Assign",
      id: this.id(),
      line: token.line,
      name,
      value,
      keyword: true,
    };
  }

  private parseDisplay(): DisplayStatement {
    const token = this.advance();
    const args: Expression[] = [this.parseExpression()];
    while (this.matchOperator(",")) {
      args.push(this.parseExpression());
    }
    return { kind: "Display", id: this.id(), line: token.line, args };
  }

  private parseInput(): InputStatement {
    const token = this.expectKeyword("INPUT");
    const name = this.expectIdentifier("a variable name after INPUT").value;
    return { kind: "Input", id: this.id(), line: token.line, name };
  }

  private parseIf(): IfStatement {
    const token = this.expectKeyword("IF");
    const condition = this.parseExpression();
    this.expectKeyword("THEN");
    const body = this.parseBlock(["ELSEIF", "ELSE", "ENDIF"]);
    const branches = [{ condition, body }];
    let elseBody: Statement[] | null = null;

    while (true) {
      if (this.checkKeyword("ELSEIF")) {
        this.advance();
        const branchCondition = this.parseExpression();
        this.expectKeyword("THEN");
        const branchBody = this.parseBlock(["ELSEIF", "ELSE", "ENDIF"]);
        branches.push({ condition: branchCondition, body: branchBody });
        continue;
      }

      if (this.checkKeyword("ELSE")) {
        const next = this.peek(1);
        if (next.type === "keyword" && next.value === "IF") {
          this.advance();
          this.advance();
          const branchCondition = this.parseExpression();
          this.expectKeyword("THEN");
          const branchBody = this.parseBlock(["ELSEIF", "ELSE", "ENDIF"]);
          branches.push({ condition: branchCondition, body: branchBody });
          continue;
        }
        this.advance();
        elseBody = this.parseBlock(["ENDIF"]);
      }

      break;
    }

    this.expectKeyword("ENDIF");
    return { kind: "If", id: this.id(), line: token.line, branches, elseBody };
  }

  private parseWhile(): WhileStatement {
    const token = this.expectKeyword("WHILE");
    const condition = this.parseExpression();
    this.expectKeyword("DO");
    const body = this.parseBlock(["ENDWHILE"]);
    this.expectKeyword("ENDWHILE");
    return { kind: "While", id: this.id(), line: token.line, condition, body };
  }

  private parseFor(): ForStatement {
    const token = this.expectKeyword("FOR");
    const variable = this.expectIdentifier("a loop variable after FOR").value;
    this.expectKeyword("FROM");
    const from = this.parseExpression();
    this.expectKeyword("TO");
    const to = this.parseExpression();
    let step: Expression | null = null;
    if (this.matchKeyword("STEP")) {
      step = this.parseExpression();
    }
    this.expectKeyword("DO");
    const body = this.parseBlock(["ENDFOR"]);
    this.expectKeyword("ENDFOR");
    return { kind: "For", id: this.id(), line: token.line, variable, from, to, step, body };
  }

  private parseFunction(): FunctionStatement {
    const token = this.expectKeyword("FUNCTION");
    const name = this.expectIdentifier("a function name after FUNCTION").value;
    this.expectOperator("(");
    const params: string[] = [];

    if (!this.checkOperator(")")) {
      params.push(this.expectIdentifier("a parameter name").value);
      while (this.matchOperator(",")) {
        params.push(this.expectIdentifier("a parameter name").value);
      }
    }

    this.expectOperator(")");
    const body = this.parseBlock(["ENDFUNCTION"]);
    this.expectKeyword("ENDFUNCTION");
    return { kind: "Function", id: this.id(), line: token.line, name, params, body };
  }

  private parseReturn(): ReturnStatement {
    const token = this.expectKeyword("RETURN");
    const value = startsExpression(this.peek()) ? this.parseExpression() : null;
    return { kind: "Return", id: this.id(), line: token.line, value };
  }

  private parseExpression(): Expression {
    return this.parseOr();
  }

  private parseOr(): Expression {
    let left = this.parseAnd();
    while (this.matchKeyword("OR")) {
      const token = this.peek();
      const right = this.parseAnd();
      left = {
        kind: "Binary",
        id: this.id(),
        line: token.line,
        operator: "OR",
        left,
        right,
      } satisfies BinaryExpression;
    }
    return left;
  }

  private parseAnd(): Expression {
    let left = this.parseNot();
    while (this.matchKeyword("AND")) {
      const token = this.peek();
      const right = this.parseNot();
      left = {
        kind: "Binary",
        id: this.id(),
        line: token.line,
        operator: "AND",
        left,
        right,
      } satisfies BinaryExpression;
    }
    return left;
  }

  private parseNot(): Expression {
    if (this.checkKeyword("NOT")) {
      const token = this.advance();
      return {
        kind: "Unary",
        id: this.id(),
        line: token.line,
        operator: "NOT",
        operand: this.parseNot(),
      } satisfies UnaryExpression;
    }
    return this.parseComparison();
  }

  private parseComparison(): Expression {
    let left = this.parseAdditive();
    while (this.peek().type === "operator" && COMPARISON_OPERATORS.has(this.peek().value)) {
      const operator = this.advance().value;
      const right = this.parseAdditive();
      left = {
        kind: "Binary",
        id: this.id(),
        line: this.peek().line,
        operator,
        left,
        right,
      } satisfies BinaryExpression;
    }
    return left;
  }

  private parseAdditive(): Expression {
    let left = this.parseMultiplicative();
    while (this.checkOperator("+") || this.checkOperator("-")) {
      const operator = this.advance().value;
      const right = this.parseMultiplicative();
      left = {
        kind: "Binary",
        id: this.id(),
        line: this.peek().line,
        operator,
        left,
        right,
      } satisfies BinaryExpression;
    }
    return left;
  }

  private parseMultiplicative(): Expression {
    let left = this.parseUnary();
    while (
      this.checkOperator("*") ||
      this.checkOperator("/") ||
      this.checkOperator("%") ||
      this.checkKeyword("MOD")
    ) {
      const token = this.advance();
      const operator = token.type === "keyword" ? "MOD" : token.value;
      const right = this.parseUnary();
      left = {
        kind: "Binary",
        id: this.id(),
        line: token.line,
        operator,
        left,
        right,
      } satisfies BinaryExpression;
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.checkOperator("-") || this.checkOperator("+")) {
      const token = this.advance();
      return {
        kind: "Unary",
        id: this.id(),
        line: token.line,
        operator: token.value as "-" | "+",
        operand: this.parseUnary(),
      } satisfies UnaryExpression;
    }
    return this.parsePower();
  }

  private parsePower(): Expression {
    const left = this.parsePrimary();
    if (this.matchOperator("^")) {
      const right = this.parseUnary();
      return {
        kind: "Binary",
        id: this.id(),
        line: this.peek().line,
        operator: "^",
        left,
        right,
      } satisfies BinaryExpression;
    }
    return left;
  }

  private parsePrimary(): Expression {
    const token = this.peek();

    if (token.type === "number") {
      this.advance();
      const value = Number(token.value);
      if (!Number.isFinite(value)) {
        throw new CompileError(`Invalid number "${token.value}"`, token.line, token.column);
      }
      return { kind: "Number", id: this.id(), line: token.line, value, raw: token.value };
    }

    if (token.type === "string") {
      this.advance();
      return { kind: "String", id: this.id(), line: token.line, value: token.value };
    }

    if (token.type === "keyword" && (token.value === "TRUE" || token.value === "FALSE")) {
      this.advance();
      return { kind: "Boolean", id: this.id(), line: token.line, value: token.value === "TRUE" };
    }

    if (token.type === "identifier") {
      this.advance();
      if (this.matchOperator("(")) {
        const args: Expression[] = [];
        if (!this.checkOperator(")")) {
          args.push(this.parseExpression());
          while (this.matchOperator(",")) {
            args.push(this.parseExpression());
          }
        }
        this.expectOperator(")");
        return {
          kind: "Call",
          id: this.id(),
          line: token.line,
          callee: token.value,
          args,
        } satisfies CallExpression;
      }
      return { kind: "Variable", id: this.id(), line: token.line, name: token.value };
    }

    if (this.matchOperator("(")) {
      const expression = this.parseExpression();
      this.expectOperator(")");
      return expression;
    }

    throw new CompileError(
      `Expected an expression but found ${this.describe(token)}`,
      token.line,
      token.column,
    );
  }
}

export function parse(source: string): Program {
  return new Parser(source).parse();
}

export function parseTokens(tokens: Token[]): Program {
  return new Parser(tokens).parse();
}
