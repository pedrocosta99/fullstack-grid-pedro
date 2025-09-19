"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sheet } from "@/types";

export default function HomePage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [newSheetName, setNewSheetName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const response = await fetch("/api/sheets");
      if (response.ok) {
        const data = await response.json();
        setSheets(data);
      }
    } catch (error) {
      console.error("Failed to fetch sheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSheet = async () => {
    if (!newSheetName.trim()) return;

    try {
      const response = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSheetName,
          rows: 20,
          cols: 10,
        }),
      });

      if (response.ok) {
        const sheet = await response.json();
        setSheets([...sheets, sheet]);
        setNewSheetName("");
      }
    } catch (error) {
      console.error("Failed to create sheet:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-neutral-600 font-medium">Loading sheets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto py-16 px-6">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl mb-8 shadow-liquid-purple">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-neutral-900 via-primary-800 to-accent-700 bg-clip-text text-transparent mb-6 py-2">
            TinyGrid
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            A beautifully crafted spreadsheet experience with intuitive formulas and seamless collaboration
          </p>
        </div>

        {/* Create New Sheet Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-liquid-lg border border-neutral-200/60 p-8 mb-12 animate-slide-up">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mr-4 shadow-liquid-orange">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900">Create New Sheet</h2>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder="Enter sheet name..."
              className="flex-1 px-6 py-4 bg-white/70 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 transition-all placeholder:text-neutral-400 text-neutral-900 font-medium"
            />
            <button
              onClick={createSheet}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-2xl transition-all duration-200 shadow-liquid-purple hover:shadow-liquid-lg active:scale-95"
            >
              Create Sheet
            </button>
          </div>
        </div>

        {/* Your Sheets Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-liquid-lg border border-neutral-200/60 p-8 animate-slide-up">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mr-4 shadow-liquid-purple">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900">Your Sheets</h2>
          </div>

          {sheets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-neutral-500 text-lg">No sheets yet. Create your first sheet above!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sheets.map((sheet, index) => (
                <Link
                  key={sheet.id}
                  href={`/s/${sheet.id}`}
                  className="group block p-6 bg-white/60 backdrop-blur-xs border border-neutral-200/80 rounded-2xl hover:bg-white/80 hover:shadow-liquid hover:border-primary-200/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-tech-blue/20 to-tech-indigo/20 rounded-xl flex items-center justify-center group-hover:from-primary-500/20 group-hover:to-accent-500/20 transition-all">
                      <svg className="w-5 h-5 text-tech-blue group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                    <span className="text-sm font-mono text-neutral-500 bg-neutral-100/80 px-3 py-1 rounded-lg">
                      {sheet.rows} × {sheet.cols}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 text-lg mb-2 group-hover:text-primary-800 transition-colors">
                    {sheet.name}
                  </h3>
                  <p className="text-neutral-500 text-sm">Click to open and edit</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
