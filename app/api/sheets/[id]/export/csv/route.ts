import { NextRequest, NextResponse } from 'next/server';
import { sheetStore } from '@/lib/state';
import { engine } from '@/lib/engine';
import { formatCellAddress } from '@/types';

// GET /api/sheets/[id]/export/csv - Export sheet as CSV
export async function GET(
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

    // Build CSV content
    const csvRows: string[] = [];

    for (let row = 0; row < sheet.rows; row++) {
      const csvCells: string[] = [];

      for (let col = 0; col < sheet.cols; col++) {
        const address = formatCellAddress(col, row);
        const cell = sheet.cells[address];

        let value = '';
        if (cell) {
          if (cell.kind === 'literal') {
            value = String(cell.value ?? '');
          } else if (cell.kind === 'formula') {
            try {
              const result = engine.evaluateCell(sheet, address);
              if (result.error) {
                value = `#${result.error.code}!`;
              } else {
                value = String(result.value ?? '');
              }
            } catch (error) {
              value = '#ERROR!';
            }
          }
        }

        // Escape value for CSV (wrap in quotes if contains comma, quote, or newline)
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }

        csvCells.push(value);
      }

      csvRows.push(csvCells.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${sheet.name}.csv"`
      }
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}