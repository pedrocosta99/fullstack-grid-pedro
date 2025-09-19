import { Sheet, Cell, CellAddress, toCellAddress } from '@/types';
import { parseFormula } from './parser';

// Create the seed sheet with initial data
export function createSeedSheet(): Sheet {
  const sheet: Sheet = {
    id: 'seed-sheet-1',
    name: 'Budget Calculator',
    rows: 20,
    cols: 10,
    cells: {},
    updatedAt: new Date()
  };

  // Add headers
  sheet.cells[toCellAddress('A1')] = { kind: 'literal', value: 'Revenue' };
  sheet.cells[toCellAddress('B1')] = { kind: 'literal', value: 'Cost' };
  sheet.cells[toCellAddress('C1')] = { kind: 'literal', value: 'Profit' };

  // Add data rows
  sheet.cells[toCellAddress('A3')] = { kind: 'literal', value: 1000 };
  sheet.cells[toCellAddress('B3')] = { kind: 'literal', value: 300 };
  sheet.cells[toCellAddress('C3')] = {
    kind: 'formula',
    src: '=A3-B3',
    ast: parseFormula('=A3-B3')
  };

  sheet.cells[toCellAddress('A4')] = { kind: 'literal', value: 2000 };
  sheet.cells[toCellAddress('B4')] = { kind: 'literal', value: 1250 };
  sheet.cells[toCellAddress('C4')] = {
    kind: 'formula',
    src: '=A4-B4',
    ast: parseFormula('=A4-B4')
  };

  // Add sum row
  sheet.cells[toCellAddress('A5')] = {
    kind: 'formula',
    src: '=SUM(A3:A4)',
    ast: parseFormula('=SUM(A3:A4)')
  };
  sheet.cells[toCellAddress('B5')] = {
    kind: 'formula',
    src: '=SUM(B3:B4)',
    ast: parseFormula('=SUM(B3:B4)')
  };
  sheet.cells[toCellAddress('C5')] = {
    kind: 'formula',
    src: '=SUM(C3:C4)',
    ast: parseFormula('=SUM(C3:C4)')
  };

  // Add subtle trap: absolute reference
  sheet.cells[toCellAddress('D3')] = {
    kind: 'formula',
    src: '=A3-B$3',  // Absolute row reference
    ast: parseFormula('=A3-B$3')
  };

  // Hidden cycle trap (out of initial viewport)
  sheet.cells[toCellAddress('C6')] = {
    kind: 'formula',
    src: '=C7+1',
    ast: parseFormula('=C7+1')
  };
  sheet.cells[toCellAddress('C7')] = {
    kind: 'formula',
    src: '=C6+1',  // Creates a cycle with C6
    ast: parseFormula('=C6+1')
  };

  // Formula test area - testing all 7 functions
  sheet.cells[toCellAddress('F1')] = { kind: 'literal', value: 'Formula Tests' };

  // Test data for formulas
  sheet.cells[toCellAddress('E3')] = { kind: 'literal', value: 10 };
  sheet.cells[toCellAddress('E4')] = { kind: 'literal', value: 20 };
  sheet.cells[toCellAddress('E5')] = { kind: 'literal', value: 30 };
  sheet.cells[toCellAddress('E6')] = { kind: 'literal', value: 5 };

  // SUM test
  sheet.cells[toCellAddress('F3')] = { kind: 'literal', value: 'SUM:' };
  sheet.cells[toCellAddress('G3')] = {
    kind: 'formula',
    src: '=SUM(E3:E5)',
    ast: parseFormula('=SUM(E3:E5)')
  };

  // AVERAGE test
  sheet.cells[toCellAddress('F4')] = { kind: 'literal', value: 'AVG:' };
  sheet.cells[toCellAddress('G4')] = {
    kind: 'formula',
    src: '=AVERAGE(E3:E5)',
    ast: parseFormula('=AVERAGE(E3:E5)')
  };

  // COUNT test
  sheet.cells[toCellAddress('F5')] = { kind: 'literal', value: 'COUNT:' };
  sheet.cells[toCellAddress('G5')] = {
    kind: 'formula',
    src: '=COUNT(E3:E6)',
    ast: parseFormula('=COUNT(E3:E6)')
  };

  // MIN test
  sheet.cells[toCellAddress('F6')] = { kind: 'literal', value: 'MIN:' };
  sheet.cells[toCellAddress('G6')] = {
    kind: 'formula',
    src: '=MIN(E3:E6)',
    ast: parseFormula('=MIN(E3:E6)')
  };

  // MAX test
  sheet.cells[toCellAddress('F7')] = { kind: 'literal', value: 'MAX:' };
  sheet.cells[toCellAddress('G7')] = {
    kind: 'formula',
    src: '=MAX(E3:E6)',
    ast: parseFormula('=MAX(E3:E6)')
  };

  // IF test
  sheet.cells[toCellAddress('F8')] = { kind: 'literal', value: 'IF:' };
  sheet.cells[toCellAddress('G8')] = {
    kind: 'formula',
    src: '=IF(E3>15,"High","Low")',
    ast: parseFormula('=IF(E3>15,"High","Low")')
  };

  // CONCAT test
  sheet.cells[toCellAddress('F9')] = { kind: 'literal', value: 'CONCAT:' };
  sheet.cells[toCellAddress('E9')] = { kind: 'literal', value: 'Hello' };
  sheet.cells[toCellAddress('E10')] = { kind: 'literal', value: 'World' };
  sheet.cells[toCellAddress('G9')] = {
    kind: 'formula',
    src: '=CONCAT(E9," ",E10)',
    ast: parseFormula('=CONCAT(E9," ",E10)')
  };

  return sheet;
}

// Test cases for the engine
export const testCases = [
  {
    name: 'Basic arithmetic with precedence',
    formulas: [
      { input: '=1+2*3', expected: 7 },
      { input: '=(1+2)*3', expected: 9 },
      { input: '=2^3*4', expected: 32 }, // 8 * 4
      { input: '=2^(3*4)', expected: 4096 } // 2^12
    ]
  },
  {
    name: 'Functions',
    formulas: [
      { input: '=SUM(1,2,3)', expected: 6 },
      { input: '=AVG(10,20,30)', expected: 20 },
      { input: '=MIN(5,3,7)', expected: 3 },
      { input: '=MAX(5,3,7)', expected: 7 },
      { input: '=COUNT(1,2,"text",3)', expected: 4 }
    ]
  },
  {
    name: 'Conditionals',
    formulas: [
      { input: '=IF(1>0,"yes","no")', expected: 'yes' },
      { input: '=IF(5=5,10,20)', expected: 10 },
      { input: '=IF(3<>3,1,2)', expected: 2 }
    ]
  },
  {
    name: 'Error handling',
    formulas: [
      { input: '=1/0', expectedError: 'DIV0' },
      { input: '=SUM(Z99)', expectedError: 'REF' },
      { input: '=UNKNOWN()', expectedError: 'PARSE' }
    ]
  }
];