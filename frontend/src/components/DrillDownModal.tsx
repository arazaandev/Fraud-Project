"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import type { TransactionSample } from "@/lib/api";

interface DrillDownModalProps {
  title: string;
  rows: TransactionSample[];
  onClose: () => void;
}

const COLS: Array<{ key: keyof TransactionSample; label: string }> = [
  { key: "type", label: "Type" },
  { key: "amount", label: "Amount" },
  { key: "oldbalanceOrg", label: "Old Bal. (Org)" },
  { key: "newbalanceOrig", label: "New Bal. (Org)" },
  { key: "oldbalanceDest", label: "Old Bal. (Dest)" },
  { key: "newbalanceDest", label: "New Bal. (Dest)" },
  { key: "risk_score", label: "Risk Score" },
];

function fmt(val: string | number | null | undefined, key: keyof TransactionSample) {
  if (val == null) return "—";
  if (key === "risk_score") return `${Number(val).toFixed(1)}%`;
  if (key === "type") return String(val);
  return `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function DrillDownModal({ title, rows, onClose }: DrillDownModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-white font-serif">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{rows.length} transactions shown (max 100)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
              <tr>
                {COLS.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row, i) => {
                const risk = Number(row.risk_score);
                return (
                  <tr key={i} className="hover:bg-slate-800/60 transition-colors">
                    {COLS.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-2.5 whitespace-nowrap font-mono text-xs ${
                          col.key === "risk_score"
                            ? risk > 75 ? "text-red-400 font-bold" : risk > 50 ? "text-orange-400 font-bold" : "text-green-400"
                            : "text-slate-300"
                        }`}
                      >
                        {fmt(row[col.key], col.key)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
