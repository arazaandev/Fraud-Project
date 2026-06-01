import os
import json
import httpx
from models.prediction import TransactionRequest

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def generate_analyst_report(request: TransactionRequest, risk_score: float) -> dict:
    if not OPENROUTER_API_KEY:
        # Fallback if no API key is provided during dev
        return {
            "risk_level": "High (Simulated)",
            "primary_red_flag": "Large amount transfer with immediate account drain.",
            "detailed_analysis": f"The API key for OpenRouter was not found. However, this transaction of {request.amount} flagged the ML model with a risk score of {risk_score:.2f}%.",
            "recommended_action": "Manual Review Required."
        }

    prompt = f"""
    You are an expert fraud risk analyst at a major fintech platform.
    A transaction has been flagged by our machine learning model with a risk score of {risk_score:.2f}%.
    
    Transaction Details:
    - Type: {request.type}
    - Amount: {request.amount}
    - Origin Old Balance: {request.oldbalanceOrg}
    - Origin New Balance: {request.newbalanceOrig}
    - Destination Old Balance: {request.oldbalanceDest}
    - Destination New Balance: {request.newbalanceDest}
    
    Analyze these details and provide a professional, executive-level summary of WHY this transaction is suspicious and what mechanics might be at play (e.g., account takeover, money laundering, etc.).
    
    Return the analysis STRICTLY as a JSON object with the following keys:
    - "risk_level": (High or Critical)
    - "primary_red_flag": (A short 5-10 word summary of the main issue)
    - "detailed_analysis": (2-3 sentences explaining the mechanics of the suspected fraud based on the data points)
    - "recommended_action": (A short directive for the manual review team)
    """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Fraud Sentinel AI",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "qwen/qwen3-235b-a22b-2507", # Using the user's requested Qwen model
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=15.0
            )
            response.raise_for_status()
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Ensure it's valid JSON
            report = json.loads(content)
            return report
        except Exception as e:
            return {
                "risk_level": "Unknown Error",
                "primary_red_flag": "Failed to generate AI insight.",
                "detailed_analysis": f"Error communicating with LLM API: {str(e)}",
                "recommended_action": "Review ML Score Only."
            }
