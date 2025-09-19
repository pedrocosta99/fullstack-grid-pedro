import { Sheet, Cell, CellAddress, CellValue, formatCellAddress } from '@/types';
import { engine } from './engine';

export interface SortOptions {
  startRow: number;
  endRow: number;
  sortColumn: number;
  ascending: boolean;
}

export function sortRange(sheet: Sheet, options: SortOptions): Sheet {
  const { startRow, endRow, sortColumn, ascending } = options;

  // Get all rows in the range
  const rows: Array<{ rowIndex: number; cells: Record<number, Cell>; sortValue: CellValue }> = [];

  for (let row = startRow; row <= endRow; row++) {
    const rowCells: Record<number, Cell> = {};
    let sortValue: CellValue = null;

    // Collect all cells in this row
    for (let col = 0; col < sheet.cols; col++) {
      const address = formatCellAddress(col, row);
      const cell = sheet.cells[address];

      if (cell) {
        rowCells[col] = cell;

        // Get the sort value from the sort column
        if (col === sortColumn) {
          if (cell.kind === 'literal') {
            sortValue = cell.value;
          } else if (cell.kind === 'formula') {
            try {
              const result = engine.evaluateCell(sheet, address);
              sortValue = result.value;
            } catch (error) {
              sortValue = null;
            }
          }
        }
      }
    }

    rows.push({ rowIndex: row, cells: rowCells, sortValue });
  }

  // Sort the rows based on the sort value
  rows.sort((a, b) => {
    const aVal = a.sortValue;
    const bVal = b.sortValue;

    // Handle null values (put them at the end)
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return ascending ? 1 : -1;
    if (bVal === null) return ascending ? -1 : 1;

    // Compare values
    let comparison = 0;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      // Convert to strings for comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      comparison = aStr.localeCompare(bStr);
    }

    return ascending ? comparison : -comparison;
  });

  // Create new sheet with sorted data
  const newSheet = { ...sheet };

  // Clear the sorted range first
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < sheet.cols; col++) {
      const address = formatCellAddress(col, row);
      delete newSheet.cells[address];
    }
  }

  // Place sorted rows back
  rows.forEach((sortedRow, index) => {
    const newRowIndex = startRow + index;

    Object.entries(sortedRow.cells).forEach(([colStr, cell]) => {
      const col = parseInt(colStr);
      const address = formatCellAddress(col, newRowIndex);
      newSheet.cells[address] = cell;
    });
  });

  newSheet.updatedAt = new Date();
  return newSheet;
}

export function detectDataRange(sheet: Sheet): { startRow: number; endRow: number; startCol: number; endCol: number } {
  let startRow = 0;
  let endRow = 0;
  let startCol = 0;
  let endCol = 0;

  let hasData = false;

  // Find the bounds of data
  for (let row = 0; row < sheet.rows; row++) {
    for (let col = 0; col < sheet.cols; col++) {
      const address = formatCellAddress(col, row);
      if (sheet.cells[address]) {
        if (!hasData) {
          startRow = endRow = row;
          startCol = endCol = col;
          hasData = true;
        } else {
          startRow = Math.min(startRow, row);
          endRow = Math.max(endRow, row);
          startCol = Math.min(startCol, col);
          endCol = Math.max(endCol, col);
        }
      }
    }
  }

  return { startRow, endRow, startCol, endCol };
}