import { FormulaAst, CellAddress, toCellAddress } from '@/types';

// Token types for lexer
export type TokenType = 
  | 'NUMBER'
  | 'STRING'
  | 'CELL_REF'
  | 'RANGE'
  | 'FUNCTION'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'COLON'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

// Tokenizer/Lexer
export class Lexer {
  private input: string;
  private pos: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  nextToken(): Token {
    this.skipWhitespace();

    if (this.pos >= this.input.length) {
      return { type: 'EOF', value: '', pos: this.pos };
    }

    const char = this.input[this.pos];

    // Numbers
    if (this.isDigit(char) || char === '.') {
      return this.readNumber();
    }

    // Strings
    if (char === '"') {
      return this.readString();
    }

    // Cell references and functions
    if (this.isLetter(char)) {
      return this.readIdentifier();
    }

    // Operators and punctuation
    switch (char) {
      case '+':
      case '-':
      case '*':
      case '/':
      case '^':
        return this.readOperator();
      case '(':
        this.pos++;
        return { type: 'LPAREN', value: '(', pos: this.pos - 1 };
      case ')':
        this.pos++;
        return { type: 'RPAREN', value: ')', pos: this.pos - 1 };
      case ',':
        this.pos++;
        return { type: 'COMMA', value: ',', pos: this.pos - 1 };
      case ':':
        this.pos++;
        return { type: 'COLON', value: ':', pos: this.pos - 1 };
      case '=':
        return this.readComparison();
      case '<':
        return this.readComparison();
      case '>':
        return this.readComparison();
      default:
        throw new Error(`Unexpected character: ${char} at position ${this.pos}`);
    }
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isLetter(char: string): boolean {
    return /[A-Za-z]/.test(char);
  }

  private readNumber(): Token {
    const start = this.pos;
    let hasDot = false;

    while (this.pos < this.input.length) {
      const char = this.input[this.pos];
      if (this.isDigit(char)) {
        this.pos++;
      } else if (char === '.' && !hasDot) {
        hasDot = true;
        this.pos++;
      } else {
        break;
      }
    }

    return {
      type: 'NUMBER',
      value: this.input.slice(start, this.pos),
      pos: start
    };
  }

  private readString(): Token {
    const start = this.pos;
    this.pos++; // Skip opening quote

    while (this.pos < this.input.length && this.input[this.pos] !== '"') {
      this.pos++;
    }

    if (this.pos >= this.input.length) {
      throw new Error('Unterminated string');
    }

    this.pos++; // Skip closing quote

    return {
      type: 'STRING',
      value: this.input.slice(start + 1, this.pos - 1),
      pos: start
    };
  }

  private readIdentifier(): Token {
    const start = this.pos;

    // Read letters and numbers for cell refs or function names
    while (this.pos < this.input.length &&
           (this.isLetter(this.input[this.pos]) ||
            this.isDigit(this.input[this.pos]) ||
            this.input[this.pos] === '$')) {
      this.pos++;
    }

    const value = this.input.slice(start, this.pos);

    // Check if this looks like a cell reference (e.g., A1, a1, $A$1)
    if (/^(\$?[A-Za-z]+\$?\d+)$/.test(value)) {
      return { type: 'CELL_REF', value: value.toUpperCase(), pos: start };
    }

    // Otherwise it's a function name
    return { type: 'FUNCTION', value: value.toUpperCase(), pos: start };
  }

  private readOperator(): Token {
    const start = this.pos;
    const char = this.input[this.pos];
    this.pos++;

    return {
      type: 'OPERATOR',
      value: char,
      pos: start
    };
  }

  private readComparison(): Token {
    const start = this.pos;
    const char = this.input[this.pos];
    this.pos++;

    // Check for two-character operators
    if (char === '<' && this.pos < this.input.length && this.input[this.pos] === '>') {
      this.pos++;
      return { type: 'OPERATOR', value: '<>', pos: start };
    }
    if (char === '<' && this.pos < this.input.length && this.input[this.pos] === '=') {
      this.pos++;
      return { type: 'OPERATOR', value: '<=', pos: start };
    }
    if (char === '>' && this.pos < this.input.length && this.input[this.pos] === '=') {
      this.pos++;
      return { type: 'OPERATOR', value: '>=', pos: start };
    }

    return { type: 'OPERATOR', value: char, pos: start };
  }

  peek(): Token {
    const savedPos = this.pos;
    const token = this.nextToken();
    this.pos = savedPos;
    return token;
  }
}

// Parser (Pratt parser or Shunting-yard recommended)
export class Parser {
  private lexer: Lexer;
  private current: Token;

  constructor(input: string) {
    this.lexer = new Lexer(input);
    this.current = this.lexer.nextToken();
  }

  parse(): FormulaAst {
    return this.parseExpression();
  }

  private parseExpression(minPrecedence: number = 0): FormulaAst {
    let left = this.parsePrimary();

    while (this.current.type === 'OPERATOR' && this.getOperatorPrecedence(this.current.value) >= minPrecedence) {
      const operator = this.current.value;
      const precedence = this.getOperatorPrecedence(operator);
      this.advance();

      const right = this.parseExpression(precedence + 1);

      left = {
        type: 'binary',
        op: operator as any,
        left,
        right
      };
    }

    return left;
  }

  private getOperatorPrecedence(op: string): number {
    return PRECEDENCE[op] || 0;
  }

  private parsePrimary(): FormulaAst {
    // Handle unary minus
    if (this.current.type === 'OPERATOR' && this.current.value === '-') {
      this.advance();
      const operand = this.parsePrimary();
      return {
        type: 'unary',
        op: '-',
        operand
      };
    }

    // Parenthesized expressions
    if (this.current.type === 'LPAREN') {
      this.advance();
      const expr = this.parseExpression();
      this.expect('RPAREN');
      return expr;
    }

    // Numbers
    if (this.current.type === 'NUMBER') {
      const value = parseFloat(this.current.value);
      this.advance();
      return {
        type: 'number',
        value
      };
    }

    // Strings
    if (this.current.type === 'STRING') {
      const value = this.current.value;
      this.advance();
      return {
        type: 'string',
        value
      };
    }

    // Cell references or ranges
    if (this.current.type === 'CELL_REF') {
      const cellRef = this.current.value;
      this.advance();

      // Check if this is a range (A1:B2)
      if (this.current.type === 'COLON') {
        this.advance();
        if (this.current.type !== 'CELL_REF') {
          throw new Error('Expected cell reference after colon');
        }
        const endRef = this.current.value;
        this.advance();

        return {
          type: 'range',
          start: toCellAddress(cellRef),
          end: toCellAddress(endRef)
        };
      }

      // Parse absolute/relative references
      const { col, row, absoluteCol, absoluteRow } = this.parseAddressWithAbsolute(cellRef);
      return {
        type: 'ref',
        address: toCellAddress(cellRef),
        absolute: { col: absoluteCol, row: absoluteRow }
      };
    }

    // Function calls
    if (this.current.type === 'FUNCTION') {
      const name = this.current.value;
      this.advance();
      return this.parseFunction(name);
    }

    throw new Error(`Unexpected token: ${this.current.type} (${this.current.value})`);
  }

  private parseAddressWithAbsolute(addr: string): {
    col: number;
    row: number;
    absoluteCol: boolean;
    absoluteRow: boolean;
  } {
    const match = addr.match(/^(\$?)([A-Z]+)(\$?)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid cell address: ${addr}`);
    }

    const [, dollarCol, letters, dollarRow, rowStr] = match;
    let col = 0;
    for (let i = 0; i < letters.length; i++) {
      col = col * 26 + (letters.charCodeAt(i) - 65 + 1);
    }

    return {
      col: col - 1,
      row: parseInt(rowStr) - 1,
      absoluteCol: dollarCol === '$',
      absoluteRow: dollarRow === '$'
    };
  }

  private parseFunction(name: string): FormulaAst {
    this.expect('LPAREN');

    const args: FormulaAst[] = [];

    // Handle empty function calls
    if (this.current.type === 'RPAREN') {
      this.advance();
      return {
        type: 'function',
        name,
        args
      };
    }

    // Parse arguments
    do {
      args.push(this.parseExpression());

      if (this.current.type === 'COMMA') {
        this.advance();
      } else {
        break;
      }
    } while (this.current.type !== 'RPAREN' && this.current.type !== 'EOF');

    this.expect('RPAREN');

    return {
      type: 'function',
      name,
      args
    };
  }

  private advance(): void {
    this.current = this.lexer.nextToken();
  }

  private expect(type: TokenType): void {
    if (this.current.type !== type) {
      throw new Error(`Expected ${type} but got ${this.current.type}`);
    }
    this.advance();
  }
}

// Operator precedence table
export const PRECEDENCE: Record<string, number> = {
  '=': 1,
  '<>': 1,
  '<': 2,
  '<=': 2,
  '>': 2,
  '>=': 2,
  '+': 3,
  '-': 3,
  '*': 4,
  '/': 4,
  '^': 5,
};

// Helper to parse a formula string
export function parseFormula(input: string): FormulaAst {
  // Remove leading = if present
  const cleanInput = input.startsWith('=') ? input.slice(1) : input;
  const parser = new Parser(cleanInput);
  return parser.parse();
}