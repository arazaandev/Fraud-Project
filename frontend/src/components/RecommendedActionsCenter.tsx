"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock3,
  Eye,
  Filter,
  Flame,
  ShieldAlert,
  Snowflake,
} from "lucide-react";
import type { ActionPriority, ActionStatus, RecommendedAction } from "@/lib/api";

const priorityOrder: Record<ActionPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const priorityStyles: Record<ActionPriority, { label: string; chip: string; border: string; icon: typeof AlertTriangle }> = {
  critical: {
    label: "Critical",
    chip: "bg-red-100 text-red-800 border-red-200",
    border: "border-l-red-500",
    icon: Flame,
  },
  high: {
    label: "High",
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    border: "border-l-amber-500",
    icon: AlertTriangle,
  },
  medium: {
    label: "Medium",
    chip: "bg-cyan-100 text-cyan-800 border-cyan-200",
    border: "border-l-cyan-500",
    icon: Eye,
  },
  low: {
    label: "Low",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    border: "border-l-emerald-500",
    icon: CheckCircle2,
  },
};

const statusLabels: Record<ActionStatus, string> = {
  open: "Open",
  in_review: "In Review",
  done: "Done",
};

const statusIcons: Record<ActionStatus, typeof CircleDot> = {
  open: CircleDot,
  in_review: Clock3,
  done: CheckCircle2,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function categoryLabel(category: RecommendedAction["category"]) {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function sortActions(actions: RecommendedAction[]) {
  return [...actions].sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      b.estimated_savings - a.estimated_savings ||
      b.confidence_score - a.confidence_score,
  );
}

export default function RecommendedActionsCenter({
  actions,
  compact = false,
}: {
  actions: RecommendedAction[];
  compact?: boolean;
}) {
  const sortedActions = useMemo(() => sortActions(actions), [actions]);
  const [selectedPriority, setSelectedPriority] = useState<ActionPriority | "all">("all");
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>(() =>
    Object.fromEntries(sortedActions.map((action) => [action.id, action.status ?? "open"])),
  );

  const visibleActions = sortedActions.filter((action) => selectedPriority === "all" || action.priority === selectedPriority);
  const totalSavings = sortedActions.reduce((sum, action) => sum + action.estimated_savings, 0);
  const criticalCount = sortedActions.filter((action) => action.priority === "critical" || action.priority === "high").length;

  if (!sortedActions.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-cyan-700" />
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">Recommended Actions Center</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ranked next steps by priority, expected impact, savings, and model confidence.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">High priority</p>
            <p className="font-semibold text-slate-950">{criticalCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Est. savings</p>
            <p className="font-semibold text-slate-950">{formatCurrency(totalSavings)}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </span>
          {(["all", "critical", "high", "medium", "low"] as const).map((priority) => (
            <button
              key={priority}
              type="button"
              onClick={() => setSelectedPriority(priority)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                selectedPriority === priority
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-400 hover:text-slate-950"
              }`}
            >
              {priority === "all" ? "All" : priorityStyles[priority].label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-3 p-4 ${compact ? "" : "xl:grid-cols-2"}`}>
        {visibleActions.map((action) => {
          const style = priorityStyles[action.priority];
          const PriorityIcon = style.icon;
          const currentStatus = statuses[action.id] ?? "open";
          const StatusIcon = statusIcons[currentStatus];

          return (
            <article
              key={action.id}
              className={`rounded-xl border border-l-4 border-slate-200 ${style.border} bg-slate-50 p-4`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${style.chip}`}>
                      <PriorityIcon className="h-3.5 w-3.5" />
                      {style.label}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {categoryLabel(action.category)}
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-semibold text-slate-950">{action.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                </div>
                <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="font-semibold text-slate-950">{action.confidence_score.toFixed(1)}%</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-[1fr_140px]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Expected impact</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{action.expected_impact}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-xs text-slate-500">Savings</p>
                  <p className="font-semibold text-slate-950">{formatCurrency(action.estimated_savings)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(["open", "in_review", "done"] as ActionStatus[]).map((status) => {
                  const Icon = statusIcons[status];
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatuses((current) => ({ ...current, [action.id]: status }))}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                        currentStatus === status
                          ? "border-cyan-500 bg-cyan-50 text-cyan-800"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {statusLabels[status]}
                    </button>
                  );
                })}
                <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <StatusIcon className="h-3.5 w-3.5" />
                  Session only
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {visibleActions.length === 0 && (
        <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
          <Snowflake className="h-4 w-4" />
          No actions match this priority filter.
        </div>
      )}
    </section>
  );
}
