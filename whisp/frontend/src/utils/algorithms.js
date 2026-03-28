// utils/algorithms.js — WHISP Core Analytics Engine

/**
 * Women's Health Index (WHI)
 * Weighted composite score across 4 health dimensions.
 * Weights: Anaemia(0.4) + MenstrualHygiene(0.3) + Awareness(0.2) + MenopauseSupport(0.1)
 * Returns: 0–100
 */
export function calcWHI(district) {
  const norm = v => Math.min(100, Math.max(0, v));
  return Math.round(
    norm(district.anaemia) * 0.4 +
    norm(district.menstrualHygiene) * 0.3 +
    norm(district.awareness) * 0.2 +
    norm(district.menopauseSupport) * 0.1
  );
}

/**
 * Thematic Resource Imbalance Index (TRI)
 * Measures standard deviation across health dimensions.
 * High TRI → one area is severely neglected despite others being OK.
 * Returns: 0–50 (higher = more imbalanced)
 */
export function calcTRI(district) {
  const scores = [
    district.anaemia,
    district.menstrualHygiene,
    district.awareness,
    district.menopauseSupport
  ];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  return Math.round(Math.sqrt(variance));
}

/**
 * Fund Leakage Detection
 * Flags districts where high funding exists but utilization is critically low.
 * Threshold: utilization < 65% AND funding > ₹20 Cr
 */
export function detectLeakage(district) {
  const utilRatio = district.utilized / district.allocated;
  return utilRatio < 0.65 && district.funding > 20;
}

/**
 * Risk Color Utility
 */
export function riskColor(risk) {
  if (risk === "High") return "#ef4444";
  if (risk === "Moderate") return "#f59e0b";
  return "#22c55e";
}

export function riskBadgeClass(risk) {
  if (risk === "High") return "badge-red";
  if (risk === "Moderate") return "badge-amber";
  return "badge-green";
}

/**
 * Impact Simulator
 * Rule-based regression: predicts WHI improvement from funding + programs.
 * Model: each ₹1Cr funding ≈ +0.8 pts; each new program ≈ +1.5 pts
 * Capped at 15 points max per simulation run.
 */
export function simulateImpact(district, extraFunding, extraPrograms) {
  const base = calcWHI(district);
  const rawGain = extraFunding * 0.8 + extraPrograms * 1.5;
  const improvement = Math.min(15, rawGain);
  const newScore = Math.min(100, base + Math.round(improvement));
  return {
    base,
    newScore,
    delta: newScore - base,
    awarenessGain: Math.round(extraPrograms * 2.5),
    hygieneGain: Math.round(extraFunding * 1.1),
    anaemiaGain: Math.round(extraFunding * 0.7),
    menopauseGain: Math.round(extraPrograms * 1.2)
  };
}

/**
 * Explainable AI — Natural language risk explanation
 */
export function explainRisk(district, reports = []) {
  const reasons = [];
  if (district.anaemia > 60)
    reasons.push(`Anaemia prevalence at ${district.anaemia}% — well above safe threshold (50%)`);
  if (district.awareness < 55)
    reasons.push(`Awareness score ${district.awareness}% — programs insufficient in rural blocks`);
  if (district.menstrualHygiene < 55)
    reasons.push(`Menstrual hygiene / pad access score ${district.menstrualHygiene}% — insufficient coverage`);
  if (district.menopauseSupport < 40)
    reasons.push(`Menopause support only ${district.menopauseSupport}% — critically under-resourced`);
  if (district.padCenters < 20)
    reasons.push(`Only ${district.padCenters} pad centers for ${(district.population / 1000).toFixed(0)}K population`);
  if (detectLeakage(district))
    reasons.push(`Fund utilization ${Math.round(district.utilized / district.allocated * 100)}% — possible misuse/leakage`);
  const open = reports.filter((r) => r.district === district.name && r.status === 'Open').length;
  if (open > 0)
    reasons.push(`${open} open citizen report(s) — thematic gaps reflected in live layer`);
  return reasons;
}

/**
 * Menopause Symptom Checker
 */
export function assessMenopauseSymptoms(symptoms) {
  const count = Object.values(symptoms).filter(Boolean).length;
  if (count >= 4) return { level: "High", message: "High likelihood of perimenopause/menopause. Strongly recommend visiting a gynecologist.", color: "#ef4444" };
  if (count >= 2) return { level: "Moderate", message: "Some symptoms present. Monitor closely and consult a doctor if they persist beyond 3 months.", color: "#f59e0b" };
  return { level: "Low", message: "Low symptom load. Continue regular health check-ups every 6 months.", color: "#22c55e" };
}
