'use client';

import { useState, useRef, useEffect } from 'react';
import { Cell as CellType, CellAddress, Sheet } from '@/types';
import { engine } from '@/lib/engine';

interface CellProps {
  address: CellAddress;
  cell: CellType | undefined;
  sheet: Sheet;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (address: CellAddress) => void;
  onEdit: (address: CellAddress) => void;
  onUpdate: (address: CellAddress, value: string) => void;
  onStopEdit: () => void;
}

export default function Cell({
  address,
  cell,
  sheet,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onUpdate,
  onStopEdit
}: CellProps) {
  const [editValue, setEditValue] = useState('');
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Use setTimeout to ensure the input is rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      // Set initial edit value based on cell type
      if (cell?.kind === 'formula') {
        setEditValue(cell.src);
        setShowFormulaTooltip(cell.src.startsWith('='));
      } else if (cell?.kind === 'literal') {
        setEditValue(String(cell.value));
        setShowFormulaTooltip(false);
      } else {
        setEditValue('');
        setShowFormulaTooltip(false);
      }
    } else {
      setShowFormulaTooltip(false);
    }
  }, [isEditing]);

  const handleClick = () => {
    onSelect(address);
  };

  const handleDoubleClick = () => {
    onEdit(address);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editValue !== getCellEditValue()) {
        onUpdate(address, editValue);
      }
      onStopEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onStopEdit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (editValue !== getCellEditValue()) {
        onUpdate(address, editValue);
      }
      onStopEdit();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't lose focus if clicking on the dropdown
    if (e.relatedTarget && (e.relatedTarget as Element).closest('.formula-dropdown')) {
      return;
    }

    if (editValue !== getCellEditValue()) {
      onUpdate(address, editValue);
    }
    setShowFormulaTooltip(false);
    onStopEdit();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditValue(value);
    setShowFormulaTooltip(value.startsWith('='));
  };

  const getCellEditValue = () => {
    if (cell?.kind === 'formula') {
      return cell.src;
    } else if (cell?.kind === 'literal') {
      return String(cell.value);
    }
    return '';
  };

  const getCellDisplay = () => {
    if (!cell) return '';

    switch (cell.kind) {
      case 'literal':
        return String(cell.value);
      case 'formula':
        // Check if AST is null (parsing failed)
        if (cell.ast === null) {
          return '#PARSE!';
        }
        try {
          const result = engine.evaluateCell(sheet, address);
          if (result.error) {
            return `#${result.error.code}!`;
          }
          return String(result.value ?? '');
        } catch (error) {
          console.error('Formula evaluation error:', error);
          return '#ERROR!';
        }
      case 'error':
        return `#${cell.code}!`;
      default:
        return '';
    }
  };

  const getCellStyles = () => {
    let baseStyles = 'w-100% h-10 border border-neutral-200/60 text-xs px-0 flex items-center cursor-pointer hover:bg-primary-50/30 hover:border-primary-200/60 relative transition-all duration-200';

    if (isSelected) {
      baseStyles += ' ring-2 ring-primary-500/50 bg-primary-50/60 border-primary-300/80';
    }

    if (cell?.kind === 'error') {
      baseStyles += ' bg-red-50/80 text-red-700 border-red-200/60';
    }

    if (cell?.kind === 'formula') {
      baseStyles += ' bg-accent-50/30 text-neutral-700 font-medium';
    }

    return baseStyles;
  };

  const availableFormulas = [
    { name: 'SUM', description: 'Add values in a range', template: '=SUM(A1:A10)' },
    { name: 'AVERAGE', description: 'Calculate average of values', template: '=AVERAGE(A1:A10)' },
    { name: 'COUNT', description: 'Count non-empty cells', template: '=COUNT(A1:A10)' },
    { name: 'MIN', description: 'Find minimum value', template: '=MIN(A1:A10)' },
    { name: 'MAX', description: 'Find maximum value', template: '=MAX(A1:A10)' },
    { name: 'IF', description: 'Conditional logic', template: '=IF(A1>10,"High","Low")' },
    { name: 'CONCAT', description: 'Combine text values', template: '=CONCAT(A1," ",B1)' }
  ];

  const handleFormulaSelect = (template: string) => {
    setEditValue(template);
    setShowFormulaTooltip(false);
    if (inputRef.current) {
      inputRef.current.focus();
      // Position cursor at the end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(template.length, template.length);
        }
      }, 0);
    }
  };

  if (isEditing) {
    return (
      <div className={getCellStyles()}>
        <input
          ref={inputRef}
          data-cell={address}
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full h-full outline-none bg-white/90 border-none text-xs px-1 font-medium"
        />

        {/* Formula Dropdown */}
        {showFormulaTooltip && (
          <div className="formula-dropdown absolute top-full left-0 z-50 mt-2 bg-white/95 backdrop-blur-sm border border-neutral-200/60 rounded-2xl shadow-liquid-lg w-80">
            <div className="p-4 border-b border-neutral-200/60 bg-gradient-to-r from-primary-50/50 to-accent-50/50 rounded-t-2xl">
              <div className="text-sm font-semibold text-neutral-800 flex items-center">
                <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Select a Formula:
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {availableFormulas.map((formula) => (
                <button
                  key={formula.name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormulaSelect(formula.template);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 border-b border-neutral-100/80 last:border-b-0 transition-all duration-200 group"
                >
                  <div className="font-semibold text-primary-700 text-sm mb-1 group-hover:text-primary-800">{formula.name}</div>
                  <div className="text-xs text-neutral-600 mb-2">{formula.description}</div>
                  <div className="text-xs text-neutral-500 font-mono bg-neutral-100/80 px-2 py-1 rounded-lg border border-neutral-200/60 group-hover:bg-neutral-50">
                    {formula.template}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 text-xs text-neutral-500 bg-gradient-to-r from-neutral-50/80 to-neutral-100/60 rounded-b-2xl border-t border-neutral-200/60">
              Click a formula to insert it with example values
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={getCellStyles()}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="truncate w-full">
        {getCellDisplay()}
      </span>
    </div>
  );
}