import { 
  Sheet, 
  Cell, 
  CellAddress, 
  FormulaAst, 
  CellValue, 
  EvalResult,
  ExplainTrace,
  ErrorCell
} from '@/types';
import { parseFormula } from './parser';
import { getCellsInRange } from './grid';

// Dependency graph for cycle detection
export class DependencyGraph {
  private dependencies: Map<CellAddress, Set<CellAddress>> = new Map();
  private dependents: Map<CellAddress, Set<CellAddress>> = new Map();

  addDependency(from: CellAddress, to: CellAddress): void {
    if (!this.dependencies.has(from)) {
      this.dependencies.set(from, new Set());
    }
    if (!this.dependents.has(to)) {
      this.dependents.set(to, new Set());
    }

    this.dependencies.get(from)!.add(to);
    this.dependents.get(to)!.add(from);
  }

  removeDependencies(cell: CellAddress): void {
    // Remove all outgoing dependencies
    const deps = this.dependencies.get(cell);
    if (deps) {
      for (const dep of deps) {
        this.dependents.get(dep)?.delete(cell);
      }
      this.dependencies.delete(cell);
    }

    // Remove all incoming dependencies
    const dependents = this.dependents.get(cell);
    if (dependents) {
      for (const dependent of dependents) {
        this.dependencies.get(dependent)?.delete(cell);
      }
      this.dependents.delete(cell);
    }
  }

  getDependencies(cell: CellAddress): Set<CellAddress> {
    return this.dependencies.get(cell) || new Set();
  }

  getDependents(cell: CellAddress): Set<CellAddress> {
    return this.dependents.get(cell) || new Set();
  }

  hasCycle(from: CellAddress, to: CellAddress): boolean {
    // Check if adding from -> to would create a cycle by seeing if 'from' is reachable from 'to'
    const visited = new Set<CellAddress>();
    const stack = [to];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === from) {
        return true; // Cycle detected
      }

      if (visited.has(current)) {
        continue;
      }
      visited.add(current);

      const deps = this.dependencies.get(current);
      if (deps) {
        stack.push(...deps);
      }
    }

    return false;
  }

  getEvaluationOrder(cells: CellAddress[]): CellAddress[] {
    // TODO: Topological sort for evaluation order (Kahn's algorithm)
    throw new Error('Not implemented');
  }
}

// Formula evaluation context
export interface EvalContext {
  sheet: Sheet;
  currentCell: CellAddress;
  visited: Set<CellAddress>;
  trace: ExplainTrace[];
}

// Main evaluation engine
export class FormulaEngine {
  private depGraph: DependencyGraph = new DependencyGraph();

  evaluateSheet(sheet: Sheet): Map<CellAddress, EvalResult> {
    // TODO: Evaluate all formulas in dependency order
    // 1. Build dependency graph
    // 2. Get topological order
    // 3. Evaluate in order
    throw new Error('Not implemented');
  }

  evaluateCell(
    sheet: Sheet,
    address: CellAddress,
    trace: boolean = false
  ): EvalResult & { explain?: ExplainTrace[] } {
    const cell = sheet.cells[address];

    if (!cell) {
      return { value: null };
    }

    if (cell.kind === 'literal') {
      return { value: cell.value };
    }

    if (cell.kind === 'error') {
      return {
        value: null,
        error: { code: cell.code, message: cell.message }
      };
    }

    if (cell.kind === 'formula') {
      try {
        const ctx: EvalContext = {
          sheet,
          currentCell: address,
          visited: new Set(),
          trace: []
        };

        const value = this.evaluateAst(cell.ast, ctx);

        const result: EvalResult & { explain?: ExplainTrace[] } = { value };
        if (trace) {
          result.explain = ctx.trace;
        }

        return result;
      } catch (error) {
        console.error(`Formula evaluation error in ${address}:`, error);
        return {
          value: null,
          error: {
            code: 'EVAL',
            message: error instanceof Error ? error.message : 'Evaluation error'
          }
        };
      }
    }

    return { value: null };
  }

  private evaluateAst(ast: FormulaAst, ctx: EvalContext): CellValue {
    switch (ast.type) {
      case 'number':
        return ast.value;
      case 'string':
        return ast.value;
      case 'boolean':
        return ast.value;
      case 'ref':
        return this.evaluateCellRef(ast.address, ctx);
      case 'range':
        throw new Error('Range cannot be evaluated directly');
      case 'function':
        return this.evaluateFunction(ast.name, ast.args, ctx);
      case 'binary':
        return this.evaluateBinaryOp(ast.op, ast.left, ast.right, ctx);
      case 'unary':
        const operand = this.evaluateAst(ast.operand, ctx);
        if (ast.op === '-') {
          return typeof operand === 'number' ? -operand : 0;
        }
        return operand;
      default:
        throw new Error('Unknown AST node type');
    }
  }

  private evaluateCellRef(address: CellAddress, ctx: EvalContext): CellValue {
    // Check for cycles
    if (ctx.visited.has(address)) {
      throw new Error(`Circular reference detected: ${address}`);
    }

    ctx.visited.add(address);

    try {
      const cell = ctx.sheet.cells[address];
      if (!cell) {
        return null;
      }

      if (cell.kind === 'literal') {
        return cell.value;
      }

      if (cell.kind === 'error') {
        throw new Error(`Error in ${address}: ${cell.message}`);
      }

      if (cell.kind === 'formula') {
        return this.evaluateAst(cell.ast, ctx);
      }

      return null;
    } finally {
      ctx.visited.delete(address);
    }
  }

  private evaluateRange(start: CellAddress, end: CellAddress, ctx: EvalContext): CellValue[] {
    const cellAddresses = getCellsInRange(start, end);
    return cellAddresses.map(addr => this.evaluateCellRef(addr, ctx));
  }

  private evaluateFunction(name: string, args: FormulaAst[], ctx: EvalContext): CellValue {
    // TODO: Evaluate built-in functions
    const upperName = name.toUpperCase();
    
    switch (upperName) {
      case 'SUM':
        return this.evaluateSum(args, ctx);
      case 'AVG':
      case 'AVERAGE':
        return this.evaluateAverage(args, ctx);
      case 'MIN':
        return this.evaluateMin(args, ctx);
      case 'MAX':
        return this.evaluateMax(args, ctx);
      case 'COUNT':
        return this.evaluateCount(args, ctx);
      case 'IF':
        return this.evaluateIf(args, ctx);
      case 'CONCAT':
        return this.evaluateConcat(args, ctx);
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }

  private evaluateSum(args: FormulaAst[], ctx: EvalContext): number {
    let sum = 0;

    for (const arg of args) {
      if (arg.type === 'range') {
        // Sum all values in the range
        const values = this.evaluateRange(arg.start, arg.end, ctx);
        for (const value of values) {
          if (typeof value === 'number' && !isNaN(value)) {
            sum += value;
          }
        }
      } else {
        // Evaluate the argument and add if it's a number
        const value = this.evaluateAst(arg, ctx);
        if (typeof value === 'number' && !isNaN(value)) {
          sum += value;
        }
      }
    }

    return sum;
  }

  private evaluateAverage(args: FormulaAst[], ctx: EvalContext): number {
    let sum = 0;
    let count = 0;

    for (const arg of args) {
      if (arg.type === 'range') {
        // Average all values in the range
        const values = this.evaluateRange(arg.start, arg.end, ctx);
        for (const value of values) {
          if (typeof value === 'number' && !isNaN(value)) {
            sum += value;
            count++;
          }
        }
      } else {
        // Evaluate the argument and add if it's a number
        const value = this.evaluateAst(arg, ctx);
        if (typeof value === 'number' && !isNaN(value)) {
          sum += value;
          count++;
        }
      }
    }

    if (count === 0) {
      return 0; // Return 0 instead of throwing error for empty ranges
    }

    return sum / count;
  }

  private evaluateCount(args: FormulaAst[], ctx: EvalContext): number {
    let count = 0;

    for (const arg of args) {
      if (arg.type === 'range') {
        // Count all non-null values in the range
        const values = this.evaluateRange(arg.start, arg.end, ctx);
        for (const value of values) {
          if (value !== null && value !== undefined && value !== '') {
            count++;
          }
        }
      } else {
        // Evaluate the argument and count if it's not null
        const value = this.evaluateAst(arg, ctx);
        if (value !== null && value !== undefined && value !== '') {
          count++;
        }
      }
    }

    return count;
  }

  private evaluateMin(args: FormulaAst[], ctx: EvalContext): number {
    let min: number | null = null;

    for (const arg of args) {
      if (arg.type === 'range') {
        // Find minimum in the range
        const values = this.evaluateRange(arg.start, arg.end, ctx);
        for (const value of values) {
          if (typeof value === 'number' && !isNaN(value)) {
            if (min === null || value < min) {
              min = value;
            }
          }
        }
      } else {
        // Evaluate the argument and check if it's smaller
        const value = this.evaluateAst(arg, ctx);
        if (typeof value === 'number' && !isNaN(value)) {
          if (min === null || value < min) {
            min = value;
          }
        }
      }
    }

    if (min === null) {
      return 0; // Return 0 instead of throwing error for empty ranges
    }

    return min;
  }

  private evaluateMax(args: FormulaAst[], ctx: EvalContext): number {
    let max: number | null = null;

    for (const arg of args) {
      if (arg.type === 'range') {
        // Find maximum in the range
        const values = this.evaluateRange(arg.start, arg.end, ctx);
        for (const value of values) {
          if (typeof value === 'number' && !isNaN(value)) {
            if (max === null || value > max) {
              max = value;
            }
          }
        }
      } else {
        // Evaluate the argument and check if it's larger
        const value = this.evaluateAst(arg, ctx);
        if (typeof value === 'number' && !isNaN(value)) {
          if (max === null || value > max) {
            max = value;
          }
        }
      }
    }

    if (max === null) {
      return 0; // Return 0 instead of throwing error for empty ranges
    }

    return max;
  }

  private evaluateIf(args: FormulaAst[], ctx: EvalContext): CellValue {
    if (args.length < 2 || args.length > 3) {
      throw new Error('IF function requires 2 or 3 arguments: IF(condition, true_value, false_value)');
    }

    const condition = this.evaluateAst(args[0], ctx);
    const trueValue = this.evaluateAst(args[1], ctx);
    const falseValue = args.length === 3 ? this.evaluateAst(args[2], ctx) : false;

    // Convert condition to boolean
    let conditionResult: boolean;
    if (typeof condition === 'boolean') {
      conditionResult = condition;
    } else if (typeof condition === 'number') {
      conditionResult = condition !== 0;
    } else if (typeof condition === 'string') {
      conditionResult = condition !== '';
    } else {
      conditionResult = condition !== null && condition !== undefined;
    }

    return conditionResult ? trueValue : falseValue;
  }

  private evaluateConcat(args: FormulaAst[], ctx: EvalContext): string {
    let result = '';

    for (const arg of args) {
      if (arg.type === 'range') {
        // Concatenate all values in the range
        const values = this.evaluateRange(arg.start, arg.end, ctx);
        for (const value of values) {
          if (value !== null && value !== undefined) {
            result += String(value);
          }
        }
      } else {
        // Evaluate the argument and convert to string
        const value = this.evaluateAst(arg, ctx);
        if (value !== null && value !== undefined) {
          result += String(value);
        }
      }
    }

    return result;
  }

  private evaluateBinaryOp(
    op: string,
    left: FormulaAst,
    right: FormulaAst,
    ctx: EvalContext
  ): CellValue {
    const leftVal = this.evaluateAst(left, ctx);
    const rightVal = this.evaluateAst(right, ctx);

    // Convert to numbers for arithmetic operations
    const leftNum = this.toNumber(leftVal);
    const rightNum = this.toNumber(rightVal);

    switch (op) {
      case '+':
        return leftNum + rightNum;
      case '-':
        return leftNum - rightNum;
      case '*':
        return leftNum * rightNum;
      case '/':
        if (rightNum === 0) {
          throw new Error('Division by zero');
        }
        return leftNum / rightNum;
      case '^':
        return Math.pow(leftNum, rightNum);
      case '=':
        return leftVal === rightVal;
      case '<>':
        return leftVal !== rightVal;
      case '<':
        return leftNum < rightNum;
      case '<=':
        return leftNum <= rightNum;
      case '>':
        return leftNum > rightNum;
      case '>=':
        return leftNum >= rightNum;
      default:
        throw new Error(`Unknown operator: ${op}`);
    }
  }

  private toNumber(value: CellValue): number {
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return 0;
  }

  updateCell(sheet: Sheet, address: CellAddress, cell: Cell): Sheet {
    // TODO: Update a cell and recalculate affected cells
    // 1. Update cell in sheet
    // 2. Update dependency graph
    // 3. Find affected cells (dependents)
    // 4. Recalculate in dependency order
    throw new Error('Not implemented');
  }

  // Helper to create error cells
  private createError(code: ErrorCell['code'], message: string): ErrorCell {
    return {
      kind: 'error',
      code,
      message
    };
  }
}

// Singleton instance
export const engine = new FormulaEngine();