"use client";

import { AlertTriangle, CheckCircle, FileText, Gauge, RotateCcw, ShieldQuestion } from "lucide-react";
import RecommendedActionsCenter from "./RecommendedActionsCenter";
import type { RecommendedAction } from "@/lib/api";

interface AnalystReportCardProps {
  data: {
    risk_score: number;
    transaction_id: string;
    analyst_report: {
      risk_level: string;
      primary_red_flag: string;
      detailed_analysis: string;
      recommended_action: string;
    };
    recommended_actions: RecommendedAction[];
  };
  onReset: () => void;
}

export default function AnalystReportCard({ data, onReset }: AnalystReportCardProps) {
  const isHighRisk = data.risk_score > 50;
  const confidence = Math.min(99, Math.max(72, Math.round(100 - Math.abs(50 - data.risk_score) / 2)));
  const riskColor = isHighRisk ? "text-red-700" : "text-emerald-700";
  const riskBg = isHighRisk ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200";

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={onReset}
        className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        title="Analyze another"
      >
        <RotateCcw className="h-5 w-5" />
      </button>

      <div className="border-b border-slate-200 p-5 pr-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">AI decision support</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${riskBg}`}>
              {isHighRisk ? <AlertTriangle className="h-7 w-7 text-red-600" /> : <CheckCircle className="h-7 w-7 text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{data.risk_score.toFixed(1)}% risk</h2>
              <p className="text-sm font-medium text-slate-500">{data.analyst_report.risk_level} level</p>
            </div>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${riskBg}`}>
            <p className={`text-sm font-bold ${riskColor}`}>{isHighRisk ? "Immediate review" : "Low-risk path"}</p>
            <p className="text-xs text-slate-500">Transaction {data.transaction_id}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldQuestion className="h-4 w-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-950">Primary red flag</h3>
            </div>
            <p className="text-sm leading-6 text-slate-700">{data.analyst_report.primary_red_flag}</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-700" />
              <h3 className="text-sm font-bold text-slate-950">AI reasoning</h3>
            </div>
            <p className="text-sm leading-7 text-slate-600">{data.analyst_report.detailed_analysis}</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-white">
            <h3 className="text-sm font-bold">Recommended action</h3>
            <p className="mt-3 text-sm leading-6 text-slate-200">{data.analyst_report.recommended_action}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-950">Confidence</p>
              <Gauge className="h-4 w-4 text-cyan-700" />
            </div>
            <p className="text-3xl font-semibold text-slate-950">{confidence}%</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${confidence}%` }} />
            </div>
          </div>
        </aside>
      </div>
      <div className="border-t border-slate-200 p-5">
        <RecommendedActionsCenter actions={data.recommended_actions} compact />
      </div>
    </div>
  );
}
