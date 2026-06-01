"use client";

import { useState } from "react";
import AnalystReportCard from "./AnalystReportCard";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { api, type AnalysisResponse } from "@/lib/api";

export default function TransactionForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "TRANSFER",
    amount: "150000",
    oldbalanceOrg: "150000",
    newbalanceOrig: "0",
    oldbalanceDest: "0",
    newbalanceDest: "0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post<AnalysisResponse>("/analyze-transaction", {
        type: formData.type,
        amount: parseFloat(formData.amount),
        oldbalanceOrg: parseFloat(formData.oldbalanceOrg),
        newbalanceOrig: parseFloat(formData.newbalanceOrig),
        oldbalanceDest: parseFloat(formData.oldbalanceDest),
        newbalanceDest: parseFloat(formData.newbalanceDest),
      });
      setResult(response.data);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(detail || "An error occurred connecting to the backend.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <AnalystReportCard data={result} onReset={() => setResult(null)} />;
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Single transaction</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Risk scoring console</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Enter transaction details to generate an explainable score, red flag, and recommended decision.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Model online
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Transaction type</label>
            <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
              <option value="TRANSFER">TRANSFER</option>
              <option value="CASH_OUT">CASH_OUT</option>
              <option value="CASH_IN">CASH_IN</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="DEBIT">DEBIT</option>
            </select>
          </div>
          {[
            ["Amount", "amount"],
            ["Old balance: origin", "oldbalanceOrg"],
            ["New balance: origin", "newbalanceOrig"],
            ["Old balance: destination", "oldbalanceDest"],
            ["New balance: destination", "newbalanceDest"],
          ].map(([label, name]) => (
            <div key={name}>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
              <input
                type="number"
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Output includes risk level, AI reasoning, and recommended action for analyst review.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                Run AI analysis
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
