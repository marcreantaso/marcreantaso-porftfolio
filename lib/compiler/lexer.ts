import { CompileError, type Token } from "./types";

const KEYWORDS = new Set([
  "SET",
  "TO",
  "DISPLAY",
  "PRINT",
  "INPUT",
  "IF",
  "THEN",
  "ELSE",
  "ELSEIF",
  "ENDIF",
  "WHILE",
  "DO",
  "ENDWHILE",
  "FOR",
  "FROM",
  "STEP",
  "ENDFOR",
  "FUNCTION",
  "ENDFUNCTION",
  "RETURN",
  "AND",
  "OR",
  "NOT",
  "TRUE",
  "FALSE",
  "MOD",
]);

const TWO_CHAR_OPERATORS = new Set(["<-", "==", "!=", "<=", ">=", "**"]);
const ONE_CHAR_OPERATORS = new Set(["+", "-", "*", "/", "%", "^", "(", ")", ",", "<", ">", "="]);

export interface LexResult {
  tokens: Token[];
}

export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let column = 1;

  const advance = () => {
    const character = source[index];
    index += 1;
    if (character === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
    return character;
  };

  const error = (message: string): never => {
    throw new CompileError(message, line, column);
  };

  while (index < source.length) {
    const character = source[index];

    if (character === " " || character === "\t" || character === "\r" || character === "\n") {
      advance();
      continue;
    }

    if (character === "#" || (character === "/" && source[index + 1] === "/")) {
      while (index < source.length && source[index] !== "\n") advance();
      continue;
    }

    if (character === '"' || character === "'") {
      const quote = character;
      const startLine = line;
      const startColumn = column;
      advance();
      let value = "";

      while (index < source.length && source[index] !== quote) {
        if (source[index] === "\n") {
          throw new CompileError("Unterminated string literal", startLine, startColumn);
        }
        if (source[index] === "\\") {
          advance();
          const escaped = source[index];
          if (escaped === undefined) {
            throw new CompileError("Unterminated string literal", startLine, startColumn);
          }
          const map: Record<string, string> = {
            n: "\n",
            t: "\t",
            r: "\r",
            "\\": "\\",
            '"': '"',
            "'": "'",
          };
          value += map[escaped] ?? escaped;
          advance();
        } else {
          value += advance();
        }
      }

      if (index >= source.length) {
        throw new CompileError("Unterminated string literal", startLine, startColumn);
      }

      advance();
      tokens.push({ type: "string", value, line: startLine, column: startColumn });
      continue;
    }

    if (/[0-9]/.test(character)) {
      const startLine = line;
      const startColumn = column;
      let raw = "";

      while (index < source.length && /[0-9]/.test(source[index])) raw += advance();

      if (source[index] === "." && /[0-9]/.test(source[index + 1] ?? "")) {
        raw += advance();
        while (index < source.length && /[0-9]/.test(source[index])) raw += advance();
      }

      tokens.push({ type: "number", value: raw, line: startLine, column: startColumn });
      continue;
    }

    if (/[A-Za-z_]/.test(character)) {
      const startLine = line;
      const startColumn = column;
      let raw = "";

      while (index < source.length && /[A-Za-z0-9_]/.test(source[index])) raw += advance();

      const upper = raw.toUpperCase();
      tokens.push({
        type: KEYWORDS.has(upper) ? "keyword" : "identifier",
        value: KEYWORDS.has(upper) ? upper : raw,
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    const pair = source.slice(index, index + 2);
    if (TWO_CHAR_OPERATORS.has(pair)) {
      tokens.push({
        type: "operator",
        value: pair === "**" ? "^" : pair,
        line,
        column,
      });
      advance();
      advance();
      continue;
    }

    if (ONE_CHAR_OPERATORS.has(character)) {
      tokens.push({ type: "operator", value: character, line, column });
      advance();
      continue;
    }

    error(`Unexpected character "${character}"`);
  }

  tokens.push({ type: "eof", value: "", line, column });
  return tokens;
}
