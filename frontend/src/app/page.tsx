"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  BrainCircuit,
  Building2,
  DatabaseZap,
  FileBarChart,
  Gauge,
  LockKeyhole,
  Network,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import BatchResultsDashboard from "@/components/BatchResultsDashboard";
import BatchUploadForm from "@/components/BatchUploadForm";
import TransactionForm from "@/components/TransactionForm";
import type { BatchResults } from "@/lib/api";

const navItems = ["Dashboard", "Investigations", "Alerts", "Transactions", "Models", "Reports"];

const trustMetrics = [
  { label: "Model accuracy", value: "98.7%" },
  { label: "Review time cut", value: "42%" },
  { label: "Fraud blocked", value: "$12.8M" },
];

const platformMetrics = [
  { label: "Transactions monitored", value: "2.4M", trend: "+18.2%", tone: "text-sky-700" },
  { label: "High-risk queue", value: "316", trend: "-9.4%", tone: "text-red-700" },
  { label: "Estimated savings", value: "$842K", trend: "+24.8%", tone: "text-emerald-700" },
  { label: "Avg review time", value: "4m 12s", trend: "-31.0%", tone: "text-amber-700" },
];

const features = [
  {
    icon: BrainCircuit,
    title: "Explainable AI scoring",
    desc: "Risk factors, confidence bands, and analyst-ready reasoning make every flag defensible.",
  },
  {
    icon: Activity,
    title: "Real-time monitoring",
    desc: "Watch transaction velocity, suspicious patterns, and queue health in one operational view.",
  },
  {
    icon: Network,
    title: "Entity relationships",
    desc: "Surface links between accounts, destinations, transaction types, and repeating behavior.",
  },
  {
    icon: LockKeyhole,
    title: "Enterprise controls",
    desc: "Role-aware workflows, audit trails, and security-first patterns for regulated teams.",
  },
];

const workflow = [
  "Ingest transaction stream",
  "Score with ML model",
  "Explain risk drivers",
  "Route to analyst queue",
  "Resolve and report",
];

const faqs = [
  {
    q: "Can analysts see why a transaction was flagged?",
    a: "Yes. Each result highlights red flags, confidence, risk factors, and recommended next actions.",
  },
  {
    q: "Does it support single checks and batch review?",
    a: "The workspace supports both: quick single-transaction scoring and CSV batch analysis with PDF export.",
  },
  {
    q: "Is this designed for executive reporting?",
    a: "The dashboard turns operational signals into KPI summaries, trends, savings, and AI-generated findings.",
  },
];

function DashboardPreview() {
  const alerts = [
    { label: "Velocity anomaly", score: 94, status: "Freeze", color: "bg-red-500" },
    { label: "Balance drain", score: 87, status: "Escalate", color: "bg-amber-500" },
    { label: "Known safe merchant", score: 12, status: "Approve", color: "bg-emerald-500" },
  ];

  return (
    <div className="dashboard-shell rounded-2xl border border-white/12 bg-slate-950/92 p-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Fraud Sentinel</p>
            <p className="text-xs text-slate-400">Live risk command center</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Live
        </div>
      </div>

      <div className="grid gap-4 pt-4 lg:grid-cols-[150px_1fr]">
        <aside className="hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 lg:block">
          <div className="mb-4 h-8 rounded-lg bg-white/8" />
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <div
                key={item}
                className={`rounded-lg px-3 py-2 text-xs ${
                  index === 0 ? "bg-cyan-400 text-slate-950" : "text-slate-400"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {platformMetrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] text-slate-400">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-xl font-semibold text-white">{metric.value}</p>
                  <p className={`text-xs font-semibold ${metric.tone}`}>{metric.trend}</p>
                </div>
                <div className="mt-3 flex h-8 items-end gap-1">
                  {[28, 44, 34, 58, 46, 72, 63, 84].map((height, index) => (
                    <span
                      key={`${metric.label}-${height}-${index}`}
                      className="w-full rounded-t bg-cyan-300/70"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Risk distribution</p>
                  <p className="text-xs text-slate-400">Last 24 hours</p>
                </div>
                <Gauge className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="grid grid-cols-8 gap-1">
                {[15, 20, 28, 38, 52, 67, 82, 95, 18, 26, 31, 49, 56, 74, 88, 93].map((risk, index) => (
                  <span
                    key={`${risk}-${index}`}
                    className={`h-9 rounded-md ${
                      risk > 80 ? "bg-red-500" : risk > 60 ? "bg-amber-400" : risk > 40 ? "bg-sky-400" : "bg-emerald-400"
                    }`}
                    style={{ opacity: 0.38 + risk / 170 }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Alert queue</p>
                <Bell className="h-5 w-5 text-amber-300" />
              </div>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.label} className="flex items-center justify-between rounded-lg bg-white/[0.05] p-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${alert.color}`} />
                      <div>
                        <p className="text-xs font-semibold text-white">{alert.label}</p>
                        <p className="text-[11px] text-slate-400">Score {alert.score}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300">
                      {alert.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-cyan-200" />
              <div>
                <p className="text-sm font-semibold text-white">AI insight</p>
                <p className="mt-1 text-xs leading-5 text-cyan-50/80">
                  Emerging pattern: high-value transfers followed by zeroed origin balances increased 19% across two regions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [batchResults, setBatchResults] = useState<BatchResults | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.18),transparent_32%),linear-gradient(135deg,#07111f_0%,#0f2a3b_44%,#0b3b34_100%)] px-5 pb-20 pt-6 text-white sm:px-8 lg:px-12">
        <header className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-wide">Fraud Sentinel AI</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
            {["Platform", "Workflow", "Security", "FAQ"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-white">
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#workspace"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:bg-cyan-100"
          >
            Open workspace
            <ArrowRight className="h-4 w-4" />
          </a>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-10 pb-8 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:pt-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              AI fraud operations
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stop fraud faster with explainable risk intelligence.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              Score transactions, surface the drivers behind every alert, and move analysts from noisy review queues to confident decisions.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#workspace"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-cyan-200"
              >
                Analyze transactions
                <Zap className="h-4 w-4" />
              </a>
              <a
                href="#workflow"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View workflow
                <Search className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {trustMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 text-xs leading-4 text-slate-300">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>

      <section id="workspace" className="mx-auto -mt-10 max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/80 sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Investigation workspace</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Analyze, explain, and route risk</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Run a single transaction check or upload a CSV to generate metrics, visualizations, AI findings, and a PDF report.
              </p>
            </div>
            <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab("single")}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "single" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <Zap className="h-4 w-4" />
                Single
              </button>
              <button
                onClick={() => setActiveTab("batch")}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "batch" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <FileBarChart className="h-4 w-4" />
                Batch
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
            <aside className="rounded-xl border border-slate-200 bg-slate-950 p-3 text-white">
              <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xs text-slate-400">Queue status</p>
                <p className="mt-1 text-xl font-semibold">SLA healthy</p>
              </div>
              <div className="space-y-1">
                {navItems.concat("Settings").map((item, index) => (
                  <button
                    key={item}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                      index === 0 ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {item}
                    {index === 2 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">18</span>}
                  </button>
                ))}
              </div>
            </aside>

            <div>
              {activeTab === "single" && <TransactionForm />}
              {activeTab === "batch" && !batchResults && <BatchUploadForm onResults={setBatchResults} />}
              {activeTab === "batch" && batchResults && (
                <BatchResultsDashboard data={batchResults} onReset={() => setBatchResults(null)} />
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="border-y border-slate-200 bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Operating model</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">A clear path from signal to decision</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The dashboard is structured around how fraud teams work: detect, explain, prioritize, investigate, and close the loop.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-sm font-bold text-cyan-800">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-semibold leading-5 text-slate-950">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto grid max-w-7xl gap-6 px-5 py-20 sm:px-8 lg:grid-cols-3 lg:px-12">
        {[
          { icon: Building2, title: "Executive ready", desc: "Savings, exposure, analyst hours, and model performance are packaged for leadership review." },
          { icon: DatabaseZap, title: "Batch intelligence", desc: "CSV analysis transforms raw transaction files into trend, anomaly, and drill-down views." },
          { icon: BadgeCheck, title: "Secure by design", desc: "High-contrast states, clear permissions language, and audit-friendly actions build trust." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <item.icon className="h-6 w-6 text-cyan-700" />
            <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
          </div>
        ))}
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Built for decision support</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer text-sm font-semibold text-slate-950">{faq.q}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
