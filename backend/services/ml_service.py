import joblib
import pandas as pd
import os
import time
from schemas.prediction import TransactionRequest

# Load model globally to avoid loading on every request
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml/fraud_model.joblib'))

pipeline = None


def load_pipeline():
    global pipeline
    start = time.perf_counter()
    if os.path.exists(MODEL_PATH):
        pipeline = joblib.load(MODEL_PATH)
        elapsed = time.perf_counter() - start
        print(f"Successfully loaded XGBoost model from {MODEL_PATH} in {elapsed:.2f}s")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}. It might still be training.")
    return pipeline


def get_pipeline():
    global pipeline
    if pipeline is None:
        try:
            return load_pipeline()
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    return pipeline


get_pipeline()

def analyze_transaction_risk(request: TransactionRequest) -> float:
    active_pipeline = get_pipeline()

    if active_pipeline is None:
        # Fallback or dummy response if model isn't trained yet
        if request.amount > 100000 and request.newbalanceOrig == 0:
            return 0.95
        return 0.12

    # Convert request to DataFrame for pipeline
    data = {
        'type': [request.type],
        'amount': [request.amount],
        'oldbalanceOrg': [request.oldbalanceOrg],
        'newbalanceOrig': [request.newbalanceOrig],
        'oldbalanceDest': [request.oldbalanceDest],
        'newbalanceDest': [request.newbalanceDest]
    }
    df = pd.DataFrame(data)
    
    # Predict probabilities
    probabilities = active_pipeline.predict_proba(df)
    return float(probabilities[0][1])
