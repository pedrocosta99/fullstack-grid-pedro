import { CellAddress, toCellAddress } from '@/types';

// Convert column index to letter(s) (0 -> A, 25 -> Z, 26 -> AA)
export function colToLetter(col: number): string {
  let result = '';
  while (col >= 0) {
    result = String.fromCharCode(65 + (col % 26)) + result;
    col = Math.floor(col / 26) - 1;
  }
  return result;
}

// Convert letter(s) to column index (A -> 0, Z -> 25, AA -> 26)
export function letterToCol(letters: string): number {
  let result = 0;
  const upperLetters = letters.toUpperCase();
  for (let i = 0; i < upperLetters.length; i++) {
    result = result * 26 + (upperLetters.charCodeAt(i) - 65 + 1);
  }
  return result - 1;
}

// Parse a cell address with absolute/relative refs ($A$1, A$1, $A1, A1)
export function parseAddress(addr: string): {
  col: number;
  row: number;
  absoluteCol: boolean;
  absoluteRow: boolean;
} {
  const match = addr.match(/^(\$?)([A-Za-z]+)(\$?)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell address: ${addr}`);
  }

  const [, dollarCol, letters, dollarRow, rowStr] = match;
  return {
    col: letterToCol(letters),
    row: parseInt(rowStr) - 1,
    absoluteCol: dollarCol === '$',
    absoluteRow: dollarRow === '$'
  };
}

// Format a cell address with absolute/relative refs
export function formatAddress(
  col: number,
  row: number,
  absoluteCol: boolean = false,
  absoluteRow: boolean = false
): CellAddress {
  const colStr = (absoluteCol ? '$' : '') + colToLetter(col);
  const rowStr = (absoluteRow ? '$' : '') + (row + 1);
  return toCellAddress(colStr + rowStr);
}

// Parse a range (A1:B3)
export function parseRange(range: string): {
  start: CellAddress;
  end: CellAddress;
} {
  // TODO: Parse range string into start and end addresses
  throw new Error('Not implemented');
}

// Get all cells in a range
export function getCellsInRange(
  startAddr: CellAddress,
  endAddr: CellAddress
): CellAddress[] {
  const start = parseAddress(startAddr);
  const end = parseAddress(endAddr);

  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  const cells: CellAddress[] = [];

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      cells.push(formatAddress(col, row));
    }
  }

  return cells;
}

// Adjust a cell reference when rows/columns are inserted or deleted
export function adjustReference(
  addr: CellAddress,
  insertedAt: { row?: number; col?: number },
  deletedAt: { row?: number; col?: number },
  isAbsolute: { col: boolean; row: boolean }
): CellAddress {
  // TODO: Adjust cell reference based on insert/delete operations
  // Respect absolute references (don't adjust if absolute)
  throw new Error('Not implemented');
}

// Transform a formula when copying/pasting (relative refs change, absolute don't)
export function transformFormula(
  formula: string,
  fromCell: CellAddress,
  toCell: CellAddress
): string {
  // TODO: Transform formula references based on relative offset
  // Parse formula, adjust all relative refs, preserve absolute refs
  throw new Error('Not implemented');
}

// Check if a cell address is valid for given sheet dimensions
export function isValidAddress(
  addr: CellAddress,
  maxRows: number,
  maxCols: number
): boolean {
  // TODO: Validate that address is within sheet bounds
  throw new Error('Not implemented');
}

// Get neighboring cell address (for arrow key navigation)
export function getNeighbor(
  addr: CellAddress,
  direction: 'up' | 'down' | 'left' | 'right',
  maxRows: number,
  maxCols: number
): CellAddress | null {
  const { col, row } = parseAddress(addr);

  let newCol = col;
  let newRow = row;

  switch (direction) {
    case 'up':
      newRow = row - 1;
      break;
    case 'down':
      newRow = row + 1;
      break;
    case 'left':
      newCol = col - 1;
      break;
    case 'right':
      newCol = col + 1;
      break;
  }

  if (newCol < 0 || newCol >= maxCols || newRow < 0 || newRow >= maxRows) {
    return null;
  }

  return formatAddress(newCol, newRow);
}