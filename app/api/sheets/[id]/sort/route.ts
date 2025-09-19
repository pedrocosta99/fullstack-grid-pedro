import { NextRequest, NextResponse } from 'next/server';
import { sheetStore } from '@/lib/state';
import { sortRange, detectDataRange } from '@/lib/sort';
import { toCellAddress } from '@/types';
import { z } from 'zod';

const SortRequestSchema = z.object({
  column: z.number().int().min(0),
  ascending: z.boolean().optional().default(true),
  range: z.object({
    startRow: z.number().int().min(0),
    endRow: z.number().int().min(0),
    startCol: z.number().int().min(0),
    endCol: z.number().int().min(0)
  }).optional()
});

// POST /api/sheets/[id]/sort - Sort a range in the sheet
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sheet = sheetStore.get(params.id);

    if (!sheet) {
      return NextResponse.json(
        { error: 'Sheet not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = SortRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid sort request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { column, ascending, range } = validation.data;

    // Use provided range or auto-detect data range
    const dataRange = range || detectDataRange(sheet);

    // Skip header row if it exists (start from row 1 if row 0 has data)
    const dataStartRow = dataRange.startRow === 0 && sheet.cells[toCellAddress('A1')] ? 1 : dataRange.startRow;

    const sortOptions = {
      startRow: dataStartRow,
      endRow: dataRange.endRow,
      sortColumn: column,
      ascending
    };

    const sortedSheet = sortRange(sheet, sortOptions);
    sheetStore.update(params.id, sortedSheet);

    return NextResponse.json(sortedSheet);
  } catch (error) {
    console.error('Sort error:', error);
    return NextResponse.json(
      { error: 'Failed to sort sheet' },
      { status: 500 }
    );
  }
}