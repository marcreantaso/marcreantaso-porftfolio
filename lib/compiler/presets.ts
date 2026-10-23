export interface CompilerPreset {
  id: string;
  label: string;
  description: string;
  code: string;
}

export const PRESETS: CompilerPreset[] = [
  {
    id: "sum",
    label: "sum 1…n",
    description: "A counted loop that accumulates a total.",
    code: `SET total TO 0
FOR i FROM 1 TO 10 DO
  SET total TO total + i
ENDFOR
DISPLAY "sum =", total`,
  },
  {
    id: "parity",
    label: "parity",
    description: "Branching with MOD and an ELSE IF.",
    code: `SET n TO 27
IF n MOD 2 == 0 THEN
  DISPLAY n, "is even"
ELSE IF n MOD 3 == 0 THEN
  DISPLAY n, "is odd and divisible by 3"
ELSE
  DISPLAY n, "is odd"
ENDIF`,
  },
  {
    id: "gcd",
    label: "euclid",
    description: "The Euclidean algorithm with a halving-free while loop.",
    code: `SET a TO 1071
SET b TO 462
WHILE b != 0 DO
  SET remainder TO a MOD b
  SET a TO b
  SET b TO remainder
ENDWHILE
DISPLAY "gcd =", a`,
  },
  {
    id: "halving",
    label: "log n",
    description: "A loop that halves its state with logarithmic growth.",
    code: `SET n TO 1024
SET steps TO 0
WHILE n > 1 DO
  SET n TO n / 2
  SET steps TO steps + 1
ENDWHILE
DISPLAY 'halvings =', steps`,
  },
  {
    id: "function",
    label: "function",
    description: "A reusable function and a call expression.",
    code: `FUNCTION square(n)
  RETURN n * n
ENDFUNCTION

SET base TO 7
DISPLAY "7 squared =", square(base)
DISPLAY "phi approx =", (1 + 5 ^ 0.5) / 2`,
  },
  {
    id: "factorial",
    label: "recursion",
    description: "A recursive factorial where the analyzer flags the self-call.",
    code: `FUNCTION factorial(n)
  IF n <= 1 THEN
    RETURN 1
  ENDIF
  RETURN n * factorial(n - 1)
ENDFUNCTION

DISPLAY "6! =", factorial(6)
DISPLAY "10! =", factorial(10)`,
  },
  {
    id: "nested",
    label: "nested",
    description: "A quadratic scan detected from loop nesting.",
    code: `SET count TO 0
FOR row FROM 1 TO 5 DO
  FOR column FROM 1 TO 5 DO
    IF row == column THEN
      SET count TO count + 1
    ENDIF
  ENDFOR
ENDFOR
DISPLAY "diagonal cells =", count`,
  },
];
