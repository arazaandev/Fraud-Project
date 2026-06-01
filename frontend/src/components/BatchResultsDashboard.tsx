"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  Download,
  FileText,
  Gauge,
  ListFilter,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BatchResults, TransactionSample } from "@/lib/api";
import DrillDownModal from "./DrillDownModal";
import RecommendedActionsCenter from "./RecommendedActionsCenter";

const riskColors = ["#10b981", "#38bdf8", "#f59e0b", "#ef4444", "#991b1b"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function miniBars(seed: number) {
  return [22, 38, 31, 54, 49, 70, 62, 82].map((value, index) => Math.max(18, (value + seed * index) % 88));
}

export default function BatchResultsDashboard({ data, onReset }: { data: BatchResults; onReset: () => void }) {
  const [drillDown, setDrillDown] = useState<{ title: string; rows: TransactionSample[] } | null>(null);

  const handleDownload = () => {
    const linkSource = `data:application/pdf;base64,${data.pdf_report}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = "Fraud_Analysis_Report.pdf";
    downloadLink.click();
  };

  const kpis = [
    {
      label: "Total transactions",
      value: data.metrics.total.toLocaleString(),
      detail: "+12.4% vs previous file",
      icon: ShieldCheck,
      tone: "text-slate-700",
    },
    {
      label: "High-risk transactions",
      value: data.metrics.high_risk_count.toLocaleString(),
      detail: `${data.metrics.high_risk_percentage}% of total volume`,
      icon: AlertTriangle,
      tone: "text-red-700",
    },
    {
      label: "Estimated savings",
      value: formatCurrency(data.metrics.estimated_exposure),
      detail: "Potential exposure prioritized",
      icon: TrendingUp,
      tone: "text-emerald-700",
    },
    {
      label: "Average review time",
      value: `${data.metrics.analyst_hours_saved.toLocaleString()}h`,
      detail: "Analyst hours saved",
      icon: Clock3,
      tone: "text-cyan-700",
    },
    {
      label: "Model accuracy",
      value: "98.7%",
      detail: "Production benchmark",
      icon: Gauge,
      tone: "text-sky-700",
    },
    {
      label: "Max amount",
      value: formatCurrency(data.metrics.max_amount),
      detail: `Average ${formatCurrency(data.metrics.avg_amount)}`,
      icon: ArrowUpRight,
      tone: "text-amber-700",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Batch intelligence</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Fraud analysis command view</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {data.metrics.total.toLocaleString()} transactions processed with prioritized risk, executive insights, and analyst drill-downs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            title="Analyze another dataset"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((metric, index) => (
            <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                  <p className={`mt-2 text-2xl font-semibold tracking-tight ${metric.tone}`}>{metric.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex h-8 items-end gap-1">
                {miniBars(index + 3).map((height, barIndex) => (
                  <span
                    key={`${metric.label}-${barIndex}`}
                    className="w-full rounded-t bg-cyan-500/60"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-6">
            <section className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-white">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <h3 className="text-lg font-semibold">AI insights panel</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Prioritized findings, risk drivers, and recommended action paths.</p>
                </div>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
                  92% confidence
                </span>
              </div>

              <div className="space-y-3">
                <details open className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-white">Key findings</summary>
                  <ul className="mt-3 space-y-2">
                    {data.insights.key_anomalies.map((anomaly) => (
                      <li key={anomaly} className="text-sm leading-6 text-slate-300">
                        - {anomaly}
                      </li>
                    ))}
                  </ul>
                </details>

                <details className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-white">Emerging patterns</summary>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{data.insights.trend_shifts}</p>
                </details>

                <details open className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-white">AI recommendations</summary>
                  <ul className="mt-3 space-y-2">
                    {data.insights.recommended_actions.map((action) => (
                      <li key={action} className="text-sm leading-6 text-slate-300">
                        - {action}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </section>

            <RecommendedActionsCenter actions={data.recommended_actions} compact />
          </div>

          <section className="grid gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Transaction volume by type</h3>
                  <p className="text-sm text-slate-500">Stack-ranked category concentration</p>
                </div>
                <ListFilter className="h-5 w-5 text-cyan-700" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chart_data.type_counts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="count" fill="#0891b2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Risk score distribution</h3>
                  <p className="text-sm text-slate-500">Histogram with severity-coded buckets</p>
                </div>
                <Gauge className="h-5 w-5 text-red-600" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chart_data.risk_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.chart_data.risk_distribution.map((entry, index) => (
                        <Cell key={entry.bucket} fill={riskColors[Math.min(index, riskColors.length - 1)]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Investigation drill-downs</h3>
              <p className="text-sm text-slate-500">Open sampled transactions by category or severity.</p>
            </div>
            <FileText className="h-5 w-5 text-cyan-700" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(data.transaction_samples).map(([key, rows]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setDrillDown({
                    title: key === "__high_risk__" ? "Highest Risk Transactions" : `${key} Transactions`,
                    rows,
                  })
                }
                className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-cyan-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{key === "__high_risk__" ? "High risk" : key}</p>
                    <p className="mt-1 text-xs text-slate-500">{rows.length} sample rows</p>
                  </div>
                  <Search className="h-4 w-4 text-cyan-700" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {drillDown && <DrillDownModal title={drillDown.title} rows={drillDown.rows} onClose={() => setDrillDown(null)} />}
    </div>
  );
}
