'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Sheet, CellAddress, formatCellAddress } from '@/types';
import { colToLetter, getNeighbor } from '@/lib/grid';
import Cell from './Cell';

interface GridProps {
  sheet: Sheet;
  onCellUpdate: (address: CellAddress, value: string) => void;
  selectedCell: CellAddress | null;
  onCellSelect: (address: CellAddress) => void;
  onExtendSheet?: (direction: 'row' | 'col') => void;
}

export default function Grid({
  sheet,
  onCellUpdate,
  selectedCell,
  onCellSelect,
  onExtendSheet
}: GridProps) {
  const [editingCell, setEditingCell] = useState<CellAddress | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleCellSelect = useCallback((address: CellAddress) => {
    onCellSelect(address);
    setEditingCell(null);
  }, [onCellSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || editingCell) return;

      // Don't handle keyboard events if formula bar is focused
      const activeElement = document.activeElement;
      const isFormulaBarFocused = activeElement && activeElement.classList.contains('formula-bar-input');
      if (isFormulaBarFocused) return;

      let newCell: CellAddress | null = null;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newCell = getNeighbor(selectedCell, 'up', sheet.rows, sheet.cols);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newCell = getNeighbor(selectedCell, 'down', sheet.rows, sheet.cols);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newCell = getNeighbor(selectedCell, 'left', sheet.rows, sheet.cols);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newCell = getNeighbor(selectedCell, 'right', sheet.rows, sheet.cols);
          break;
        case 'Tab':
          e.preventDefault();
          newCell = e.shiftKey
            ? getNeighbor(selectedCell, 'left', sheet.rows, sheet.cols)
            : getNeighbor(selectedCell, 'right', sheet.rows, sheet.cols);
          break;
        case 'Enter':
          e.preventDefault();
          if (e.shiftKey) {
            newCell = getNeighbor(selectedCell, 'up', sheet.rows, sheet.cols);
          } else {
            newCell = getNeighbor(selectedCell, 'down', sheet.rows, sheet.cols);
          }
          break;
        case 'F2':
          e.preventDefault();
          setEditingCell(selectedCell);
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onCellUpdate(selectedCell, '');
          break;
        default:
          // Start editing if user types a visible character, but not if formula bar is focused
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const activeElement = document.activeElement;
            const isFormulaBarFocused = activeElement && activeElement.classList.contains('formula-bar-input');

            if (!isFormulaBarFocused) {
              e.preventDefault();
              setEditingCell(selectedCell);
            }
          }
          break;
      }

      if (newCell) {
        onCellSelect(newCell);
      }
    };

    // Focus the grid container to receive keyboard events
    if (gridRef.current) {
      gridRef.current.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, editingCell, sheet.rows, sheet.cols, onCellSelect]);

  // Focus grid when selectedCell changes, but not if formula bar is focused
  useEffect(() => {
    if (gridRef.current && !editingCell) {
      const activeElement = document.activeElement;
      const isFormulaBarFocused = activeElement && activeElement.classList.contains('formula-bar-input');

      if (!isFormulaBarFocused) {
        gridRef.current.focus();
      }
    }
  }, [selectedCell, editingCell]);

  const handleCellEdit = useCallback((address: CellAddress) => {
    setEditingCell(address);
  }, []);

  const handleCellUpdate = useCallback((address: CellAddress, value: string) => {
    onCellUpdate(address, value);
  }, [onCellUpdate]);

  const handleStopEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const renderColumnHeaders = () => {
    const headers = [];
    headers.push(
      <th key="corner" className="w-12 h-10 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/60 text-xs font-semibold text-neutral-600"></th>
    );

    for (let col = 0; col < Math.min(sheet.cols, 20); col++) {
      headers.push(
        <th
          key={col}
          className="w-20 h-10 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/60 text-xs font-semibold text-center text-neutral-700 hover:from-primary-50/50 hover:to-primary-100/50 transition-all duration-200"
        >
          {colToLetter(col)}
        </th>
      );
    }

    // Add column extend button
    if (onExtendSheet) {
      headers.push(
        <th key="add-col" className="w-10 h-10 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/60">
          <button
            onClick={() => onExtendSheet('col')}
            className="w-full h-full flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 rounded-sm"
            title="Add column"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </th>
      );
    }

    return headers;
  };

  const renderRows = () => {
    const rows = [];

    for (let row = 0; row < Math.min(sheet.rows, 30); row++) {
      const cells = [];

      // Row header
      cells.push(
        <td
          key="header"
          className="w-12 h-10 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/60 text-xs font-semibold text-center text-neutral-700 hover:from-primary-50/50 hover:to-primary-100/50 transition-all duration-200"
        >
          {row + 1}
        </td>
      );

      // Data cells
      for (let col = 0; col < Math.min(sheet.cols, 20); col++) {
        const address = formatCellAddress(col, row);
        const cell = sheet.cells[address];

        cells.push(
          <td key={col} className="p-0">
            <Cell
              address={address}
              cell={cell}
              sheet={sheet}
              isSelected={selectedCell === address}
              isEditing={editingCell === address}
              onSelect={handleCellSelect}
              onEdit={handleCellEdit}
              onUpdate={handleCellUpdate}
              onStopEdit={handleStopEdit}
            />
          </td>
        );
      }

      // Add empty cell for column extend button column
      if (onExtendSheet) {
        cells.push(
          <td key="spacer" className="w-10 h-10 bg-gradient-to-br from-neutral-50/50 to-neutral-100/50 border border-neutral-200/40"></td>
        );
      }

      rows.push(
        <tr key={row}>
          {cells}
        </tr>
      );
    }

    // Add row extend button row
    if (onExtendSheet) {
      const extendRowCells = [];

      // Row extend button
      extendRowCells.push(
        <td key="add-row" className="w-12 h-10 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/60">
          <button
            onClick={() => onExtendSheet('row')}
            className="w-full h-full flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 rounded-sm"
            title="Add row"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </td>
      );

      // Empty cells for each column
      for (let col = 0; col < Math.min(sheet.cols, 20); col++) {
        extendRowCells.push(
          <td key={col} className="w-20 h-10 bg-gradient-to-br from-neutral-50/50 to-neutral-100/50 border border-neutral-200/40"></td>
        );
      }

      // Corner cell for both extend buttons
      extendRowCells.push(
        <td key="corner" className="w-10 h-10 bg-gradient-to-br from-neutral-50/50 to-neutral-100/50 border border-neutral-200/40"></td>
      );

      rows.push(
        <tr key="add-row">
          {extendRowCells}
        </tr>
      );
    }

    return rows;
  };

  return (
    <div
      ref={gridRef}
      tabIndex={0}
      className="overflow-auto border border-neutral-200/60 bg-white/90 backdrop-blur-sm rounded-2xl shadow-liquid focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-300 transition-all duration-200"
    >
      <table className="border-collapse w-full">
        <thead>
          <tr>
            {renderColumnHeaders()}
          </tr>
        </thead>
        <tbody>
          {renderRows()}
        </tbody>
      </table>
    </div>
  );
}