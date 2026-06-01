from pydantic import BaseModel, Field
from typing import Literal, Optional

class TransactionRequest(BaseModel):
    transaction_id: Optional[str] = None
    type: str = Field(..., description="Transaction type (e.g., TRANSFER, CASH_OUT, PAYMENT)")
    amount: float = Field(..., description="Amount of the transaction in local currency")
    oldbalanceOrg: float = Field(..., description="Initial balance before the transaction")
    newbalanceOrig: float = Field(..., description="New balance after the transaction")
    oldbalanceDest: float = Field(..., description="Initial balance recipient before the transaction")
    newbalanceDest: float = Field(..., description="New balance recipient after the transaction")

class AnalystReport(BaseModel):
    risk_level: str
    primary_red_flag: str
    detailed_analysis: str
    recommended_action: str

class RecommendedAction(BaseModel):
    id: str
    title: str
    description: str
    priority: Literal["critical", "high", "medium", "low"]
    category: Literal["freeze_account", "escalate", "manual_review", "monitor", "approve", "block"]
    confidence_score: float
    expected_impact: str
    estimated_savings: float

class AnalysisResponse(BaseModel):
    transaction_id: str
    risk_score: float
    analyst_report: AnalystReport
    recommended_actions: list[RecommendedAction]
