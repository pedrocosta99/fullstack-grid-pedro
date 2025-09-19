'use client';

import { useState, useEffect, useRef } from 'react';
import { CellAddress, Cell } from '@/types';

interface FormulaBarProps {
  selectedCell: CellAddress | null;
  cell: Cell | undefined;
  onCellUpdate: (address: CellAddress, value: string) => void;
}

export default function FormulaBar({
  selectedCell,
  cell,
  onCellUpdate
}: FormulaBarProps) {
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Always update when cell changes, unless we're actively editing this input
    if (!isEditing) {
      if (cell?.kind === 'formula') {
        setValue(cell.src);
        setShowFormulaTooltip(false);
      } else if (cell?.kind === 'literal') {
        setValue(String(cell.value));
        setShowFormulaTooltip(false);
      } else if (cell?.kind === 'error') {
        setValue(`#${cell.code}!`);
        setShowFormulaTooltip(false);
      } else {
        setValue('');
        setShowFormulaTooltip(false);
      }
    }
  }, [cell, selectedCell, isEditing]);

  const handleFocus = () => {
    setIsEditing(true);
    setShowFormulaTooltip(value.startsWith('='));
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't lose focus if clicking on the dropdown
    if (e.relatedTarget && (e.relatedTarget as Element).closest('.formula-dropdown')) {
      return;
    }
    setIsEditing(false);
    setShowFormulaTooltip(false);
    if (selectedCell && value !== getCellDisplayValue()) {
      onCellUpdate(selectedCell, value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setShowFormulaTooltip(newValue.startsWith('='));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedCell && value !== getCellDisplayValue()) {
        onCellUpdate(selectedCell, value);
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      // Reset to original value
      if (cell?.kind === 'formula') {
        setValue(cell.src);
      } else if (cell?.kind === 'literal') {
        setValue(String(cell.value));
      } else {
        setValue('');
      }
    }
  };

  const getCellDisplayValue = () => {
    if (cell?.kind === 'formula') {
      return cell.src;
    } else if (cell?.kind === 'literal') {
      return String(cell.value);
    } else if (cell?.kind === 'error') {
      return `#${cell.code}!`;
    }
    return '';
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
    setValue(template);
    setShowFormulaTooltip(false);
    // Keep focus on input after selecting formula
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(template.length, template.length);
      }
    }, 0);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm border-b border-neutral-200/60 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-tech-blue/20 to-tech-indigo/20 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 text-tech-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-neutral-700 min-w-[80px] bg-neutral-100/80 px-3 py-2 rounded-xl border border-neutral-200/60">
          {selectedCell || 'A1'}
        </span>
        <div className="w-px h-8 bg-neutral-300/60"></div>
      </div>

      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Enter value or formula (start with =)"
          className="formula-bar-input w-full px-4 py-3 text-sm bg-white/70 border border-neutral-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 transition-all placeholder:text-neutral-400 font-medium"
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
    </div>
  );
}