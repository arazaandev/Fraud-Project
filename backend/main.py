import os

from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, UploadFile, File

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from schemas.prediction import TransactionRequest, AnalysisResponse
from services.ml_service import analyze_transaction_risk
from services.llm_service import generate_analyst_report
from services.batch_service import process_batch_upload
from services.action_service import generate_transaction_actions

app = FastAPI(title="Fraud Sentinel AI API", version="1.0.0")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-transaction", response_model=AnalysisResponse)
async def analyze_transaction(request: TransactionRequest):
    try:
        # 1. Get risk probability from XGBoost model
        risk_probability = analyze_transaction_risk(request)
        risk_score = risk_probability * 100

        # 2. If risk exceeds 50%, generate LLM insights
        if risk_score > 50:
            report = await generate_analyst_report(request, risk_score)
        else:
            report = {
                "risk_level": "Low",
                "primary_red_flag": "None",
                "detailed_analysis": "This transaction matches normal behavioral patterns. The predictive model has determined a very low probability of fraud based on historical data.",
                "recommended_action": "Approve Transaction"
            }
        
        return AnalysisResponse(
            transaction_id=request.transaction_id or "TXN-AUTO",
            risk_score=round(risk_score, 2),
            analyst_report=report,
            recommended_actions=generate_transaction_actions(request, risk_score, report)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-batch")
async def analyze_batch(file: UploadFile = File(...)):
    try:
        if not file.filename or not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
        contents = await file.read()
        result = await process_batch_upload(contents)
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
