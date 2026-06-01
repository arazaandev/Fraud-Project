# Fraud Sentinel AI

Fraud Sentinel AI is a local fraud analysis prototype with:

- A FastAPI backend for single-transaction and batch fraud scoring.
- An XGBoost pipeline trained from PaySim-style transaction data.
- A Next.js frontend for transaction review, batch dashboards, drill-down samples, and PDF export.
- Optional OpenRouter-powered analyst summaries when `OPENROUTER_API_KEY` is configured.

## Project Layout

```text
backend/      FastAPI app, Pydantic schemas, ML/LLM/batch services
frontend/     Next.js app and UI components
model/        Training script and saved model artifact
*.csv         Local PaySim datasets, ignored by Git
venv/         Local Python environment, ignored by Git
```

## Backend

```bash
cd backend
python -m venv ../venv
../venv/Scripts/pip install -r requirements.txt
../venv/Scripts/uvicorn main:app --reload
```

Create `backend/.env` from `backend/.env.example` to enable LLM reports.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` if the backend is not running on `http://localhost:8000`.

## Model Training

Place `paysim.csv` in the project root, then run:

```bash
../venv/Scripts/python model/train_model.py
```

The training script writes `model/fraud_model.joblib`.
