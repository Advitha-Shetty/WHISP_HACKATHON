# ml/analytics_service.py — WHISP ML & Analytics FastAPI Service

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math

app = FastAPI(title="WHISP Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ────────────────────────────────────────────────────────────────

class DistrictMetrics(BaseModel):
    id: int
    name: str
    anaemia: float
    menstrualHygiene: float
    awareness: float
    menopauseSupport: float
    funding: float
    allocated: float
    utilized: float
    population: int

class SimulationRequest(BaseModel):
    district_id: int
    current_whi: float
    extra_funding: float = 0
    extra_programs: int = 0
    target_metric: Optional[str] = None  # 'anaemia' | 'awareness' | 'menopause'

class MenopauseRequest(BaseModel):
    hot_flashes: bool = False
    mood_swings: bool = False
    sleep_issues: bool = False
    fatigue: bool = False
    joint_pain: bool = False
    irregular_periods: bool = False
    weight_changes: bool = False

# ── Core Algorithms ───────────────────────────────────────────────────────

def calc_whi(d: DistrictMetrics) -> float:
    """Women's Health Index: weighted composite score."""
    return round(
        d.anaemia * 0.4 +
        d.menstrualHygiene * 0.3 +
        d.awareness * 0.2 +
        d.menopauseSupport * 0.1,
        2
    )

def calc_tri(d: DistrictMetrics) -> float:
    """Thematic Resource Imbalance Index: std deviation of scores."""
    scores = [d.anaemia, d.menstrualHygiene, d.awareness, d.menopauseSupport]
    mean = sum(scores) / len(scores)
    variance = sum((x - mean) ** 2 for x in scores) / len(scores)
    return round(math.sqrt(variance), 2)

def detect_leakage(d: DistrictMetrics) -> dict:
    """Fund leakage detection with severity scoring."""
    util_ratio = d.utilized / d.allocated if d.allocated > 0 else 1.0
    leakage_amount = d.allocated - d.utilized
    is_leakage = util_ratio < 0.65 and d.funding > 20
    severity = "Critical" if util_ratio < 0.5 else "High" if util_ratio < 0.65 else "Normal"
    return {
        "detected": is_leakage,
        "util_ratio": round(util_ratio, 3),
        "leakage_amount_cr": leakage_amount,
        "severity": severity,
        "recommendation": "Immediate audit required" if is_leakage else "Normal"
    }

def simulate_impact(base_whi: float, extra_funding: float, extra_programs: int) -> dict:
    """
    Rule-based regression simulation.
    Each ₹1Cr funding ≈ +0.8 WHI pts | Each program ≈ +1.5 WHI pts
    Capped at +15 pts max per intervention cycle.
    """
    raw_gain = extra_funding * 0.8 + extra_programs * 1.5
    improvement = min(15.0, raw_gain)
    new_score = min(100.0, base_whi + improvement)
    return {
        "base_whi": base_whi,
        "projected_whi": round(new_score, 1),
        "delta": round(new_score - base_whi, 1),
        "breakdown": {
            "awareness_gain": round(extra_programs * 2.5, 1),
            "hygiene_gain": round(extra_funding * 1.1, 1),
            "anaemia_reduction": round(extra_funding * 0.7, 1),
            "menopause_gain": round(extra_programs * 1.2, 1)
        },
        "model_version": "rule-based-v1"
    }

def generate_recommendations(d: DistrictMetrics) -> List[dict]:
    """Generate prioritized policy recommendations."""
    recs = []
    whi = calc_whi(d)
    tri = calc_tri(d)

    if d.anaemia > 60:
        recs.append({
            "priority": "urgent",
            "category": "anaemia",
            "issue": f"Anaemia prevalence {d.anaemia}% exceeds threshold",
            "action": "Deploy iron+folic acid supplementation in schools and PHCs",
            "estimated_impact": "+12–16% WHI improvement in 6 months"
        })

    if d.awareness < 55:
        recs.append({
            "priority": "high",
            "category": "awareness",
            "issue": f"Awareness score only {d.awareness}%",
            "action": "Launch monthly menstrual health workshops in rural blocks",
            "estimated_impact": "+8–12% awareness in 3 months"
        })

    if d.menopauseSupport < 40:
        recs.append({
            "priority": "moderate",
            "category": "menopause",
            "issue": f"Menopause support at critical {d.menopauseSupport}%",
            "action": "Train ASHA workers on menopause counselling; add PHC clinics",
            "estimated_impact": "+10–15% menopause score in 6 months"
        })

    if detect_leakage(d)["detected"]:
        recs.append({
            "priority": "urgent",
            "category": "fund_leakage",
            "issue": f"Fund utilization at {round(d.utilized/d.allocated*100)}% — leakage suspected",
            "action": "Initiate district-level financial audit; engage vigilance committee",
            "estimated_impact": f"₹{d.allocated - d.utilized:.0f}Cr recovery potential"
        })

    if tri > 15:
        min_metric = min(
            [("Anaemia", d.anaemia), ("Hygiene", d.menstrualHygiene),
             ("Awareness", d.awareness), ("Menopause", d.menopauseSupport)],
            key=lambda x: x[1]
        )
        recs.append({
            "priority": "moderate",
            "category": "imbalance",
            "issue": f"High Thematic Resource Imbalance (TRI={tri}). {min_metric[0]} critically neglected.",
            "action": f"Redirect 20% of existing budget toward {min_metric[0].lower()} programs",
            "estimated_impact": "TRI reduction by 8–12 points"
        })

    return recs

# ── Routes ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"service": "WHISP Analytics", "version": "1.0.0", "status": "healthy"}

@app.post("/analytics/whi")
def get_whi(d: DistrictMetrics):
    whi = calc_whi(d)
    tri = calc_tri(d)
    leakage = detect_leakage(d)
    risk = "High" if whi < 55 else "Moderate" if whi < 70 else "Low"
    return {
        "district": d.name,
        "whi": whi,
        "tri": tri,
        "risk": risk,
        "leakage": leakage,
        "scores": {
            "anaemia": d.anaemia,
            "menstrual_hygiene": d.menstrualHygiene,
            "awareness": d.awareness,
            "menopause_support": d.menopauseSupport
        }
    }

@app.post("/analytics/whi/batch")
def get_whi_batch(districts: List[DistrictMetrics]):
    return [
        {
            "id": d.id, "name": d.name,
            "whi": calc_whi(d), "tri": calc_tri(d),
            "leakage_detected": detect_leakage(d)["detected"]
        }
        for d in districts
    ]

@app.post("/analytics/simulate")
def simulate(req: SimulationRequest):
    result = simulate_impact(req.current_whi, req.extra_funding, req.extra_programs)
    return {"district_id": req.district_id, **result}

@app.post("/analytics/recommendations")
def get_recommendations(d: DistrictMetrics):
    recs = generate_recommendations(d)
    return {"district": d.name, "total": len(recs), "recommendations": recs}

@app.post("/analytics/menopause/assess")
def assess_menopause(req: MenopauseRequest):
    symptoms = [req.hot_flashes, req.mood_swings, req.sleep_issues,
                req.fatigue, req.joint_pain, req.irregular_periods, req.weight_changes]
    count = sum(symptoms)
    if count >= 5:
        level, message = "High", "Strong indicators of perimenopause/menopause. Recommend gynecologist consultation immediately."
    elif count >= 3:
        level, message = "Moderate", "Moderate symptom load. Recommend monitoring and consulting a doctor if symptoms persist."
    elif count >= 1:
        level, message = "Low-Moderate", "Some symptoms present. Regular health monitoring advised."
    else:
        level, message = "Low", "No significant symptoms. Continue routine health check-ups."
    return {
        "likelihood": level,
        "symptom_count": count,
        "message": message,
        "recommend_specialist": count >= 3
    }

@app.post("/analytics/leakage")
def check_leakage(d: DistrictMetrics):
    return {"district": d.name, **detect_leakage(d)}

if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
