'use client';

import { useState } from 'react';
import { colToLetter } from '@/lib/grid';

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSort: (column: number, ascending: boolean) => void;
  maxColumns: number;
}

export default function SortModal({
  isOpen,
  onClose,
  onSort,
  maxColumns
}: SortModalProps) {
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [ascending, setAscending] = useState(true);

  if (!isOpen) return null;

  const handleSort = () => {
    onSort(selectedColumn, ascending);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 w-[480px] max-w-full mx-4 shadow-liquid-lg border border-neutral-200/60 animate-slide-up">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mr-4 shadow-liquid-purple">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Sort Data</h2>
        </div>

        <div className="space-y-6">
          {/* Column Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Sort by Column
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/70 border border-neutral-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 transition-all text-neutral-900 font-medium"
            >
              {Array.from({ length: Math.min(maxColumns, 10) }, (_, i) => (
                <option key={i} value={i}>
                  Column {colToLetter(i)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Direction */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Sort Order
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-white/60 border border-neutral-200/60 rounded-xl hover:bg-white/80 hover:border-primary-200/60 transition-all cursor-pointer group">
                <input
                  type="radio"
                  name="sortOrder"
                  checked={ascending}
                  onChange={() => setAscending(true)}
                  className="mr-3 w-4 h-4 text-primary-600 bg-white border-neutral-300 focus:ring-primary-500 focus:ring-2"
                />
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-tech-emerald group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4l9 16 9-16H3z" />
                  </svg>
                  <span className="text-sm text-neutral-700 font-medium">Ascending (A → Z, 1 → 9)</span>
                </div>
              </label>
              <label className="flex items-center p-3 bg-white/60 border border-neutral-200/60 rounded-xl hover:bg-white/80 hover:border-primary-200/60 transition-all cursor-pointer group">
                <input
                  type="radio"
                  name="sortOrder"
                  checked={!ascending}
                  onChange={() => setAscending(false)}
                  className="mr-3 w-4 h-4 text-primary-600 bg-white border-neutral-300 focus:ring-primary-500 focus:ring-2"
                />
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-tech-cyan group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16l-9-16-9 16h18z" />
                  </svg>
                  <span className="text-sm text-neutral-700 font-medium">Descending (Z → A, 9 → 1)</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-neutral-700 bg-white/80 border border-neutral-200 hover:bg-white hover:border-neutral-300 hover:shadow-liquid rounded-xl transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSort}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl transition-all duration-200 shadow-liquid-purple hover:shadow-liquid-lg active:scale-95 font-semibold"
          >
            Sort Data
          </button>
        </div>
      </div>
    </div>
  );
}