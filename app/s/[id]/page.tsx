"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sheet, CellAddress, toCellAddress } from "@/types";
import Grid from "@/components/Grid";
import FormulaBar from "@/components/FormulaBar";
import SortModal from "@/components/SortModal";

export default function SheetPage() {
  const params = useParams();
  const router = useRouter();
  const sheetId = params.id as string;

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<CellAddress | null>(
    toCellAddress("A1")
  );
  const [editingCell, setEditingCell] = useState<CellAddress | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    fetchSheet();
  }, [sheetId]);

  const fetchSheet = async () => {
    try {
      const response = await fetch(`/api/sheets/${sheetId}`);
      if (response.ok) {
        const data = await response.json();
        setSheet(data);
      }
    } catch (error) {
      console.error("Failed to fetch sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellUpdate = useCallback(
    async (address: CellAddress, value: string) => {
      if (!sheet) return;

      try {
        const isFormula = value.startsWith("=");
        const isEmpty = value === "";

        const edit = isEmpty
          ? { addr: address, kind: "clear" as const }
          : isFormula
          ? { addr: address, kind: "formula" as const, formula: value }
          : {
              addr: address,
              kind: "literal" as const,
              value: isNaN(Number(value)) ? value : Number(value),
            };

        const response = await fetch(`/api/sheets/${sheetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            edits: [edit],
          }),
        });

        if (response.ok) {
          const updatedSheet = await response.json();
          setSheet(updatedSheet);
        }
      } catch (error) {
        console.error("Failed to update cell:", error);
      }
    },
    [sheet, sheetId]
  );

  const handleCellSelect = useCallback((address: CellAddress) => {
    setSelectedCell(address);
  }, []);

  const handleCellEdit = useCallback((address: CellAddress) => {
    setEditingCell(address);
  }, []);

  const handleStopEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleExtendSheet = useCallback(
    async (direction: "row" | "col") => {
      if (!sheet) return;

      try {
        const updatedSheet = {
          ...sheet,
          rows: direction === "row" ? sheet.rows + 5 : sheet.rows,
          cols: direction === "col" ? sheet.cols + 5 : sheet.cols,
        };

        const response = await fetch(`/api/sheets/${sheetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: updatedSheet.rows,
            cols: updatedSheet.cols,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setSheet(result);
        }
      } catch (error) {
        console.error("Failed to extend sheet:", error);
      }
    },
    [sheet, sheetId]
  );

  const handleSort = useCallback(
    async (column: number, ascending: boolean) => {
      if (!sheet) return;

      try {
        const response = await fetch(`/api/sheets/${sheetId}/sort`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            column,
            ascending,
          }),
        });

        if (response.ok) {
          const sortedSheet = await response.json();
          setSheet(sortedSheet);
        }
      } catch (error) {
        console.error("Failed to sort sheet:", error);
      }
    },
    [sheet, sheetId]
  );

  const handleExportCSV = useCallback(async () => {
    if (!sheet) return;

    try {
      const response = await fetch(`/api/sheets/${sheetId}/export/csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sheet.name}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  }, [sheet, sheetId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-neutral-600 font-medium">Loading sheet...</span>
        </div>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-lg text-neutral-600">Sheet not found</p>
        </div>
      </div>
    );
  }

  const selectedCellData = selectedCell ? sheet.cells[selectedCell] : undefined;

  return (
    <div className="min-h-screen">
      {/* Header Toolbar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-neutral-200/60 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200 group"
              title="Back to home"
            >
              <svg
                className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-liquid-green">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {sheet.name}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSortModal(true)}
              className="px-5 py-3 bg-white/80 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-white hover:border-neutral-300 hover:shadow-liquid transition-all duration-200 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
              <span>Sort</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-5 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-liquid-orange hover:shadow-liquid-lg active:scale-95 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formula Bar */}
      <FormulaBar
        selectedCell={selectedCell}
        cell={selectedCellData}
        onCellUpdate={handleCellUpdate}
      />

      {/* Main Grid */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Grid
            sheet={sheet}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
            onCellUpdate={handleCellUpdate}
            onExtendSheet={handleExtendSheet}
          />
        </div>
      </div>

      {/* Sort Modal */}
      <SortModal
        isOpen={showSortModal}
        onClose={() => setShowSortModal(false)}
        onSort={handleSort}
        maxColumns={sheet.cols}
      />
    </div>
  );
}
