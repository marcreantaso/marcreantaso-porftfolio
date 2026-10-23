export type TokenType = "number" | "string" | "identifier" | "keyword" | "operator" | "eof";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface Program {
  kind: "Program";
  id: number;
  line: number;
  body: Statement[];
}

export interface AssignStatement {
  kind: "Assign";
  id: number;
  line: number;
  name: string;
  value: Expression;
  keyword: boolean;
}

export interface DisplayStatement {
  kind: "Display";
  id: number;
  line: number;
  args: Expression[];
}

export interface InputStatement {
  kind: "Input";
  id: number;
  line: number;
  name: string;
}

export interface IfBranch {
  condition: Expression;
  body: Statement[];
}

export interface IfStatement {
  kind: "If";
  id: number;
  line: number;
  branches: IfBranch[];
  elseBody: Statement[] | null;
}

export interface WhileStatement {
  kind: "While";
  id: number;
  line: number;
  condition: Expression;
  body: Statement[];
}

export interface ForStatement {
  kind: "For";
  id: number;
  line: number;
  variable: string;
  from: Expression;
  to: Expression;
  step: Expression | null;
  body: Statement[];
}

export interface FunctionStatement {
  kind: "Function";
  id: number;
  line: number;
  name: string;
  params: string[];
  body: Statement[];
}

export interface ReturnStatement {
  kind: "Return";
  id: number;
  line: number;
  value: Expression | null;
}

export interface ExpressionStatement {
  kind: "ExpressionStatement";
  id: number;
  line: number;
  expression: Expression;
}

export type Statement =
  | AssignStatement
  | DisplayStatement
  | InputStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | FunctionStatement
  | ReturnStatement
  | ExpressionStatement;

export interface NumberLiteral {
  kind: "Number";
  id: number;
  line: number;
  value: number;
  raw: string;
}

export interface StringLiteral {
  kind: "String";
  id: number;
  line: number;
  value: string;
}

export interface BooleanLiteral {
  kind: "Boolean";
  id: number;
  line: number;
  value: boolean;
}

export interface Variable {
  kind: "Variable";
  id: number;
  line: number;
  name: string;
}

export interface UnaryExpression {
  kind: "Unary";
  id: number;
  line: number;
  operator: "-" | "+" | "NOT";
  operand: Expression;
}

export interface BinaryExpression {
  kind: "Binary";
  id: number;
  line: number;
  operator: string;
  left: Expression;
  right: Expression;
}

export interface CallExpression {
  kind: "Call";
  id: number;
  line: number;
  callee: string;
  args: Expression[];
}

export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | Variable
  | UnaryExpression
  | BinaryExpression
  | CallExpression;

export class CompileError extends Error {
  line: number;
  column: number;

  constructor(message: string, line: number, column: number) {
    super(message);
    this.name = "CompileError";
    this.line = line;
    this.column = column;
  }
}
