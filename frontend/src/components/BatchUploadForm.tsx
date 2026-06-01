"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { api, type BatchResults } from "@/lib/api";

export default function BatchUploadForm({ onResults }: { onResults: (data: BatchResults) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post<BatchResults>("/analyze-batch", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onResults(response.data);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(detail || "An error occurred during batch analysis. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Batch operations</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Dataset risk analysis</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Upload a CSV dataset to generate KPI summaries, AI insights, visual risk distribution, drill-down samples, and a PDF report.
        </p>
      </div>

      <form onSubmit={handleUpload} className="p-5">
        {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="relative flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-cyan-400 hover:bg-cyan-50/40">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            required
          />
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
            {file ? <FileSpreadsheet className="h-7 w-7" /> : <UploadCloud className="h-7 w-7" />}
          </div>
          {file ? (
            <>
              <p className="text-base font-semibold text-slate-950">{file.name}</p>
              <p className="mt-2 text-sm text-slate-500">Ready to process through the fraud model.</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-slate-950">Drop a transaction CSV here</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Include transaction type, amount, origin balances, destination balances, and related fields.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Risk distribution", "AI findings", "PDF export"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              {item}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-100 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing dataset
            </>
          ) : (
            "Analyze dataset"
          )}
        </button>
      </form>
    </div>
  );
}
