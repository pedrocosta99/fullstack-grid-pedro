// Branded type for cell addresses
export type CellAddress = string & { __brand: 'CellAddress' };

// Helper functions for CellAddress
export const toCellAddress = (addr: string): CellAddress => {
  // TODO: Validate format (e.g., A1, B12, AA99)
  return addr as CellAddress;
};

export const parseCellAddress = (addr: CellAddress): { col: number; row: number } => {
  const match = addr.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell address: ${addr}`);
  }

  const [, letters, rowStr] = match;
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 65 + 1);
  }

  return {
    col: col - 1,
    row: parseInt(rowStr) - 1
  };
};

export const formatCellAddress = (col: number, row: number): CellAddress => {
  let result = '';
  let colIndex = col;
  while (colIndex >= 0) {
    result = String.fromCharCode(65 + (colIndex % 26)) + result;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return toCellAddress(result + (row + 1));
};

// Cell types (discriminated union)
export type Cell = LiteralCell | FormulaCell | ErrorCell;

export interface LiteralCell {
  kind: 'literal';
  value: number | string | boolean;
}

export interface FormulaCell {
  kind: 'formula';
  src: string;
  ast: FormulaAst;
}

export interface ErrorCell {
  kind: 'error';
  message: string;
  code: 'CYCLE' | 'REF' | 'PARSE' | 'DIV0';
}

// Formula AST nodes
export type FormulaAst =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | CellRef
  | RangeRef
  | FunctionCall
  | BinaryOp
  | UnaryOp;

export interface NumberLiteral {
  type: 'number';
  value: number;
}

export interface StringLiteral {
  type: 'string';
  value: string;
}

export interface BooleanLiteral {
  type: 'boolean';
  value: boolean;
}

export interface CellRef {
  type: 'ref';
  address: CellAddress;
  absolute: { col: boolean; row: boolean };
}

export interface RangeRef {
  type: 'range';
  start: CellAddress;
  end: CellAddress;
}

export interface FunctionCall {
  type: 'function';
  name: string;
  args: FormulaAst[];
}

export interface BinaryOp {
  type: 'binary';
  op: '+' | '-' | '*' | '/' | '^' | '<' | '<=' | '>' | '>=' | '=' | '<>';
  left: FormulaAst;
  right: FormulaAst;
}

export interface UnaryOp {
  type: 'unary';
  op: '-';
  operand: FormulaAst;
}

// Sheet type
export interface Sheet {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: Record<CellAddress, Cell>;
  updatedAt: Date;
}

// Type guard
export const isFormula = (cell: Cell): cell is FormulaCell => {
  return cell.kind === 'formula';
};

// Evaluation result types
export type CellValue = number | string | boolean | null;

export interface EvalResult {
  value: CellValue;
  error?: { code: string; message: string };
}

export interface ExplainTrace {
  cell: CellAddress;
  formula?: string;
  dependencies: CellAddress[];
  ranges: Array<{ start: CellAddress; end: CellAddress }>;
  value: CellValue;
}

// API types
export interface CellEdit {
  addr: CellAddress;
  kind: 'literal' | 'formula' | 'clear';
  value?: string | number | boolean;
  formula?: string;
}

export interface SheetCreateRequest {
  name: string;
  rows: number;
  cols: number;
}

export interface EvalRequest {
  id: string;
  addr: CellAddress;
}

// Database indexing notes:
// For a multi-sheet, multi-user Postgres implementation, consider these indices:
// 1. Primary: (sheet_id, row, col) - for direct cell lookups
// 2. (sheet_id, updated_at DESC) - for recent changes/activity
// 3. (user_id, sheet_id) - for user's sheets
// 4. (sheet_id, cell_type) WHERE cell_type = 'formula' - for dependency rebuilding
// 5. Full-text index on formula src for searching formulas