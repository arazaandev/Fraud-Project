import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export type AnalystReport = {
  risk_level: string;
  primary_red_flag: string;
  detailed_analysis: string;
  recommended_action: string;
};

export type ActionPriority = "critical" | "high" | "medium" | "low";

export type ActionCategory =
  | "freeze_account"
  | "escalate"
  | "manual_review"
  | "monitor"
  | "approve"
  | "block";

export type ActionStatus = "open" | "in_review" | "done";

export type RecommendedAction = {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  category: ActionCategory;
  confidence_score: number;
  expected_impact: string;
  estimated_savings: number;
  status?: ActionStatus;
};

export type AnalysisResponse = {
  transaction_id: string;
  risk_score: number;
  analyst_report: AnalystReport;
  recommended_actions: RecommendedAction[];
};

export type BatchInsights = {
  key_anomalies: string[];
  trend_shifts: string;
  recommended_actions: string[];
};

export type BatchMetrics = {
  total: number;
  high_risk_count: number;
  high_risk_percentage: number;
  avg_amount: number;
  max_amount: number;
  top_types: Record<string, number>;
  estimated_exposure: number;
  analyst_hours_saved: number;
};

export type TransactionSample = {
  type: string;
  amount: number;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  oldbalanceDest: number;
  newbalanceDest: number;
  risk_score: number;
};

export type BatchResults = {
  metrics: BatchMetrics;
  insights: BatchInsights;
  recommended_actions: RecommendedAction[];
  chart_data: {
    type_counts: Array<{ type: string; count: number }>;
    risk_distribution: Array<{ bucket: string; count: number }>;
  };
  transaction_samples: Record<string, TransactionSample[]>;
  pdf_report: string;
};
