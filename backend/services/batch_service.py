import pandas as pd
import io
import base64
import re
import json
import tempfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from fpdf import FPDF
from services.action_service import generate_batch_actions
from services.ml_service import get_pipeline
from services.llm_service import OPENROUTER_API_KEY
import httpx

def sanitize_text(text: str) -> str:
    replacements = {
        '\u2014': '--', '\u2013': '-', '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"', '\u2026': '...', '\u00a0': ' ',
        '\u2022': '-', '\u2212': '-',
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    return text.encode('latin-1', errors='ignore').decode('latin-1')

async def generate_batch_insight(metrics: dict, high_risk_percentage: float) -> dict:
    fallback = {
        "key_anomalies": ["No API key configured. Please set OPENROUTER_API_KEY in your .env file."],
        "trend_shifts": "Analysis unavailable.",
        "recommended_actions": ["Configure your OpenRouter API key to enable AI insights."]
    }
    if not OPENROUTER_API_KEY:
        return fallback

    prompt = f"""You are an expert fraud risk analyst at a major fintech platform.

A batch of transactions was run through our ML fraud detection model. Summary metrics:
- Total Transactions: {metrics['total']:,}
- High-Risk Transactions (>50% risk): {metrics['high_risk_count']:,} ({high_risk_percentage:.2f}%)
- Estimated Exposure (sum of flagged amounts): ${metrics['estimated_exposure']:,.2f}
- Average Transaction Amount: ${metrics['avg_amount']:,.2f}
- Max Transaction Amount: ${metrics['max_amount']:,.2f}
- Top Transaction Types: {metrics['top_types']}

Return a JSON object with EXACTLY these three keys and nothing else:
{{
  "key_anomalies": ["string bullet 1", "string bullet 2", "string bullet 3"],
  "trend_shifts": "A single sentence describing the most notable trend or pattern shift in this data.",
  "recommended_actions": ["Short action directive 1", "Short action directive 2", "Short action directive 3"]
}}

Rules:
- key_anomalies: array of 3-5 concise strings, each describing one specific anomaly
- trend_shifts: a single string sentence
- recommended_actions: array of 3-4 short imperative action strings for the risk ops team
- Return ONLY raw JSON. No markdown fences, no <think> tags, no explanation text.
"""

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Fraud Sentinel AI",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "qwen/qwen3-235b-a22b-2507",
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers, json=payload, timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            content = result['choices'][0]['message']['content']

            # Strip thinking tags if model outputs them
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()

            # Try direct JSON parse
            try:
                parsed = json.loads(content)
                if all(k in parsed for k in ['key_anomalies', 'trend_shifts', 'recommended_actions']):
                    return parsed
            except json.JSONDecodeError:
                pass

            # Fallback: extract JSON block from text
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
                if all(k in parsed for k in ['key_anomalies', 'trend_shifts', 'recommended_actions']):
                    return parsed

            return fallback
        except Exception as e:
            return {
                "key_anomalies": [f"LLM connection error: {str(e)}"],
                "trend_shifts": "Could not generate trend analysis.",
                "recommended_actions": ["Review flagged transactions manually based on ML scores."]
            }


def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_str


async def process_batch_upload(file_contents: bytes) -> dict:
    df = pd.read_csv(io.BytesIO(file_contents))

    required_cols = ['type', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
    if not all(col in df.columns for col in required_cols):
        raise ValueError(f"CSV must contain columns: {required_cols}")

    # Run ML model
    pipeline = get_pipeline()
    if pipeline is not None:
        X = df[required_cols]
        probabilities = pipeline.predict_proba(X)[:, 1]
        df['risk_score'] = (probabilities * 100).round(2)
    else:
        df['risk_score'] = ((df['amount'] > 100000).astype(int) * 90 + 5).astype(float)

    # --- Compute Metrics ---
    total = len(df)
    high_risk_df = df[df['risk_score'] > 50]
    high_risk_count = len(high_risk_df)
    high_risk_percentage = (high_risk_count / total) * 100 if total > 0 else 0
    estimated_exposure = float(high_risk_df['amount'].sum())
    auto_cleared = total - high_risk_count
    analyst_hours_saved = round((auto_cleared * 5) / 60, 1)

    metrics = {
        "total": total,
        "high_risk_count": high_risk_count,
        "high_risk_percentage": round(high_risk_percentage, 2),
        "avg_amount": round(float(df['amount'].mean()), 2),
        "max_amount": round(float(df['amount'].max()), 2),
        "top_types": df['type'].value_counts().head(3).to_dict(),
        "estimated_exposure": round(estimated_exposure, 2),
        "analyst_hours_saved": analyst_hours_saved,
    }

    # --- Chart Data (JSON for Recharts frontend) ---
    type_counts = df['type'].value_counts().reset_index()
    type_counts.columns = ['type', 'count']
    chart_data_types = type_counts.to_dict(orient='records')

    bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 101]
    labels = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100']
    df['risk_bucket'] = pd.cut(df['risk_score'], bins=bins, labels=labels, include_lowest=True)
    risk_dist = df['risk_bucket'].value_counts().sort_index().reset_index()
    risk_dist.columns = ['bucket', 'count']
    chart_data_risk = risk_dist.to_dict(orient='records')

    # --- Transaction Samples for Drill-Down ---
    sample_cols = ['type', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest', 'risk_score']
    transaction_samples = {}
    for txn_type in df['type'].unique():
        type_df = df[df['type'] == txn_type][sample_cols].head(100)
        transaction_samples[str(txn_type)] = type_df.to_dict(orient='records')
    transaction_samples['__high_risk__'] = (
        high_risk_df[sample_cols].sort_values('risk_score', ascending=False).head(100).to_dict(orient='records')
    )

    # --- AI Insights (Structured JSON) ---
    ai_insights = await generate_batch_insight(metrics, high_risk_percentage)
    recommended_actions = generate_batch_actions(metrics, ai_insights)

    # --- PDF Generation (uses matplotlib charts) ---
    sns.set_theme(style="whitegrid")
    fig1, ax1 = plt.subplots(figsize=(8, 5))
    type_order = df['type'].value_counts().index
    sns.countplot(data=df, x='type', hue='type', order=type_order, palette='viridis', ax=ax1, legend=False)
    ax1.set_title('Transaction Volume by Type')
    img1_b64 = fig_to_base64(fig1)

    fig2, ax2 = plt.subplots(figsize=(8, 5))
    sns.histplot(data=df, x='risk_score', bins=20, color='teal', kde=True, ax=ax2)
    ax2.set_title('Risk Score Distribution')
    img2_b64 = fig_to_base64(fig2)

    pdf_summary = "Key Anomalies:\n"
    for a in ai_insights.get('key_anomalies', []):
        pdf_summary += f"- {a}\n"
    pdf_summary += f"\nTrend: {ai_insights.get('trend_shifts', '')}\n\nRecommended Actions:\n"
    for r in ai_insights.get('recommended_actions', []):
        pdf_summary += f"- {r}\n"

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=16, style='B')
    pdf.cell(200, 10, txt="Fraud Sentinel AI - Batch Analysis Report", ln=1, align='C')
    pdf.ln(10)
    pdf.set_font("Arial", size=12, style='B')
    pdf.cell(200, 10, txt="1. Executive Summary", ln=1)
    pdf.set_font("Arial", size=11)
    pdf.multi_cell(0, 8, txt=sanitize_text(pdf_summary))
    pdf.ln(10)
    pdf.set_font("Arial", size=12, style='B')
    pdf.cell(200, 10, txt="2. Key Metrics", ln=1)
    pdf.set_font("Arial", size=11)
    pdf.cell(200, 8, txt=f"- Total Transactions: {metrics['total']:,}", ln=1)
    pdf.cell(200, 8, txt=f"- High-Risk: {metrics['high_risk_count']:,} ({metrics['high_risk_percentage']}%)", ln=1)
    pdf.cell(200, 8, txt=f"- Estimated Exposure: ${metrics['estimated_exposure']:,.2f}", ln=1)
    pdf.cell(200, 8, txt=f"- Analyst Hours Saved: {metrics['analyst_hours_saved']}h", ln=1)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp1, \
         tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp2:
        tmp1.write(base64.b64decode(img1_b64))
        tmp2.write(base64.b64decode(img2_b64))
        tmp1.flush()
        tmp2.flush()
        pdf.add_page()
        pdf.set_font("Arial", size=12, style='B')
        pdf.cell(200, 10, txt="3. Visualizations", ln=1)
        pdf.image(tmp1.name, x=10, y=30, w=180)
        pdf.image(tmp2.name, x=10, y=140, w=180)

    pdf_b64 = base64.b64encode(bytes(pdf.output())).decode('utf-8')

    return {
        "metrics": metrics,
        "insights": ai_insights,
        "chart_data": {
            "type_counts": chart_data_types,
            "risk_distribution": chart_data_risk,
        },
        "transaction_samples": transaction_samples,
        "recommended_actions": [action.dict() for action in recommended_actions],
        "pdf_report": pdf_b64,
    }
