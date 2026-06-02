from __future__ import annotations

from hashlib import sha1
from typing import Any

from schemas.prediction import RecommendedAction, TransactionRequest


PRIORITY_RANK = {"critical": 0, "high": 1, "medium": 2, "low": 3}


def _action_id(prefix: str, title: str, index: int) -> str:
    digest = sha1(f"{prefix}:{title}:{index}".encode("utf-8")).hexdigest()[:8]
    return f"{prefix}-{digest}"


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def _priority_from_score(risk_score: float, amount: float = 0) -> str:
    if risk_score >= 90 or amount >= 500000:
        return "critical"
    if risk_score >= 70 or amount >= 150000:
        return "high"
    if risk_score >= 40:
        return "medium"
    return "low"


def _build_action(
    prefix: str,
    index: int,
    title: str,
    description: str,
    priority: str,
    category: str,
    confidence_score: float,
    expected_impact: str,
    estimated_savings: float,
) -> RecommendedAction:
    return RecommendedAction(
        id=_action_id(prefix, title, index),
        title=title,
        description=description,
        priority=priority,
        category=category,
        confidence_score=round(_clamp(confidence_score, 0, 100), 1),
        expected_impact=expected_impact,
        estimated_savings=round(max(0, estimated_savings), 2),
    )


def _sort_actions(actions: list[RecommendedAction]) -> list[RecommendedAction]:
    return sorted(
        actions,
        key=lambda action: (
            PRIORITY_RANK[action.priority],
            -action.estimated_savings,
            -action.confidence_score,
        ),
    )


def generate_transaction_actions(
    request: TransactionRequest,
    risk_score: float,
    analyst_report: dict[str, Any],
) -> list[RecommendedAction]:
    prefix = request.transaction_id or "txn-auto"
    amount = float(request.amount)
    origin_drained = request.oldbalanceOrg > 0 and request.newbalanceOrig <= max(1, request.oldbalanceOrg * 0.05)
    high_risk_type = request.type in {"TRANSFER", "CASH_OUT"}
    base_priority = _priority_from_score(risk_score, amount)
    confidence = 60 + (risk_score * 0.35)
    actions: list[RecommendedAction] = []

    if risk_score >= 85 and origin_drained:
        actions.append(
            _build_action(
                prefix,
                len(actions),
                "Freeze origin account",
                "The origin balance is nearly depleted after a high-risk transfer pattern. Freeze the account before additional outbound movement occurs.",
                "critical",
                "freeze_account",
                confidence + 5,
                "Stops likely account-drain activity before funds move further.",
                amount,
            )
        )

    if risk_score >= 70:
        actions.append(
            _build_action(
                prefix,
                len(actions),
                "Escalate to fraud investigation",
                analyst_report.get(
                    "recommended_action",
                    "Send this transaction to a senior analyst with the model score and AI rationale attached.",
                ),
                base_priority,
                "escalate",
                confidence,
                "Prioritizes analyst time on the highest-value risk event.",
                amount * (risk_score / 100),
            )
        )

    if risk_score >= 50 or high_risk_type:
        actions.append(
            _build_action(
                prefix,
                len(actions),
                "Trigger manual review",
                "Review customer history, destination behavior, and recent transaction velocity before final approval.",
                "high" if risk_score >= 70 else "medium",
                "manual_review",
                confidence - 4,
                "Adds human verification for suspicious transaction mechanics.",
                amount * max(risk_score, 35) / 100,
            )
        )

    if risk_score >= 90:
        actions.append(
            _build_action(
                prefix,
                len(actions),
                "Block destination transfer path",
                "Temporarily block additional transfers to this destination while related activity is reviewed.",
                "critical",
                "block",
                confidence - 2,
                "Prevents repeat movement through a suspected risky destination.",
                amount * 0.8,
            )
        )

    if not actions:
        actions.append(
            _build_action(
                prefix,
                0,
                "Approve with light monitoring",
                "The score and balance movement fit normal behavior. Approve while keeping this account in standard monitoring.",
                "low",
                "approve",
                92 - risk_score * 0.2,
                "Keeps analyst queue focused on higher-risk work.",
                amount * max(risk_score, 5) / 500,
            )
        )
        if risk_score >= 25:
            actions.append(
                _build_action(
                    prefix,
                    1,
                    "Monitor for repeat pattern",
                    "Watch for repeated transfers, sudden balance drains, or rapid destination changes over the next review window.",
                    "medium",
                    "monitor",
                    68 + risk_score * 0.2,
                    "Catches developing risk without blocking a currently moderate transaction.",
                    amount * risk_score / 200,
                )
            )

    return _sort_actions(actions)


def generate_batch_actions(metrics: dict[str, Any], insights: dict[str, Any]) -> list[RecommendedAction]:
    total = int(metrics.get("total", 0) or 0)
    high_risk_count = int(metrics.get("high_risk_count", 0) or 0)
    high_risk_percentage = float(metrics.get("high_risk_percentage", 0) or 0)
    exposure = float(metrics.get("estimated_exposure", 0) or 0)
    max_amount = float(metrics.get("max_amount", 0) or 0)
    avg_amount = float(metrics.get("avg_amount", 0) or 0)
    top_types = metrics.get("top_types", {}) or {}
    dominant_type = next(iter(top_types.keys()), "flagged transactions")
    confidence = _clamp(70 + high_risk_percentage * 0.8 + min(high_risk_count, 50) * 0.2, 60, 98)
    actions: list[RecommendedAction] = []

    if high_risk_count > 0:
        priority = "critical" if high_risk_percentage >= 20 or exposure >= 500000 else "high"
        actions.append(
            _build_action(
                "batch",
                len(actions),
                "Prioritize high-risk queue",
                f"Review the top {min(high_risk_count, 100):,} high-risk transactions first, starting with the largest exposure items.",
                priority,
                "manual_review",
                confidence,
                "Focuses analyst capacity on transactions with the highest expected loss.",
                exposure,
            )
        )

    if exposure >= 100000:
        actions.append(
            _build_action(
                "batch",
                len(actions),
                "Escalate exposure cluster",
                f"Escalate {dominant_type} activity with {high_risk_percentage:.2f}% high-risk concentration and {exposure:,.0f} estimated exposure.",
                "critical" if exposure >= 500000 else "high",
                "escalate",
                confidence - 2,
                "Moves material financial exposure into senior review immediately.",
                exposure * 0.75,
            )
        )

    if high_risk_percentage >= 10:
        actions.append(
            _build_action(
                "batch",
                len(actions),
                "Increase monitoring threshold",
                "Temporarily raise monitoring intensity for transaction types with elevated high-risk concentration.",
                "high",
                "monitor",
                confidence - 6,
                "Improves coverage while the spike is investigated.",
                exposure * 0.35,
            )
        )

    if max_amount >= max(avg_amount * 5, 100000):
        actions.append(
            _build_action(
                "batch",
                len(actions),
                "Review largest transaction outliers",
                "Inspect max-amount transactions against customer history and destination behavior.",
                "medium" if high_risk_count == 0 else "high",
                "manual_review",
                76,
                "Catches large outliers that can dominate total loss exposure.",
                max_amount * 0.4,
            )
        )

    for recommendation in insights.get("recommended_actions", [])[:2]:
        actions.append(
            _build_action(
                "batch-ai",
                len(actions),
                str(recommendation).rstrip("."),
                "AI-generated batch recommendation included for analyst follow-up.",
                "medium",
                "monitor",
                72,
                "Preserves analyst context from the executive summary.",
                exposure * 0.15,
            )
        )

    if not actions:
        actions.append(
            _build_action(
                "batch",
                0,
                "Approve batch with standard monitoring",
                f"No high-risk concentration was detected across {total:,} transactions. Continue normal monitoring.",
                "low",
                "approve",
                90,
                "Keeps the queue clear while maintaining baseline controls.",
                0,
            )
        )

    return _sort_actions(actions)
