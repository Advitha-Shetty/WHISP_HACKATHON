/**
 * WHISP analytics core — Women's Health Index (WHI), TRI, leakage, citizen-report adjustment.
 * Metric fields are 0–100 performance scores (higher = better outcomes / coverage).
 */

function calcWHI(d) {
  const norm = (v) => Math.min(100, Math.max(0, Number(v) || 0));
  return Math.round(
    norm(d.anaemia) * 0.4 +
      norm(d.menstrualHygiene) * 0.3 +
      norm(d.awareness) * 0.2 +
      norm(d.menopauseSupport) * 0.1
  );
}

function calcTRI(d) {
  const scores = [
    Number(d.anaemia) || 0,
    Number(d.menstrualHygiene) || 0,
    Number(d.awareness) || 0,
    Number(d.menopauseSupport) || 0,
  ];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  return Math.round(Math.sqrt(variance));
}

function detectLeakage(d) {
  const allocated = Number(d.allocated) || 0;
  const utilized = Number(d.utilized) || 0;
  if (allocated <= 0) return false;
  const utilRatio = utilized / allocated;
  return utilRatio < 0.65 && Number(d.funding) > 20;
}

function countOpenReportsForDistrict(reports, districtName) {
  return reports.filter(
    (r) =>
      r.district === districtName &&
      (r.status === 'Open' || r.status === 'Investigating')
  ).length;
}

/** Raw WHI from metrics; adjusted downward from unresolved citizen signals (caps at -15). */
function calcAdjustedWHI(d, reports) {
  const base = calcWHI(d);
  const n = countOpenReportsForDistrict(reports, d.name);
  const penalty = Math.min(15, n * 2);
  const adjusted = Math.max(0, base - penalty);
  return { baseWHI: base, adjustedWHI: adjusted, openReportCount: n, penaltyPoints: penalty };
}

function explainRisk(d, reports) {
  const reasons = [];
  if (d.anaemia > 60) {
    reasons.push(
      `Anaemia programme coverage or control score at ${d.anaemia}% — above intervention threshold`
    );
  }
  if (d.awareness < 55) {
    reasons.push(`Awareness at ${d.awareness}% — menstrual health literacy programmes insufficient`);
  }
  if (d.menstrualHygiene < 55) {
    reasons.push(`Menstrual hygiene / pad access score at ${d.menstrualHygiene}% — access gaps likely`);
  }
  if (d.menopauseSupport < 40) {
    reasons.push(
      `Menopause support at ${d.menopauseSupport}% — thematic neglect vs other dimensions (TRI driver)`
    );
  }
  if ((d.padCenters || 0) < 20) {
    reasons.push(
      `Only ${d.padCenters} pad distribution points for ~${Math.round((d.population || 0) / 1000)}K population`
    );
  }
  if (detectLeakage(d)) {
    reasons.push(
      `Fund utilization ${Math.round((d.utilized / d.allocated) * 100)}% with high sanction — inefficiency or misuse suspected`
    );
  }
  const open = countOpenReportsForDistrict(reports, d.name);
  if (open > 0) {
    reasons.push(
      `${open} open citizen report(s) for this district — live feedback may indicate service gaps`
    );
  }
  return reasons;
}

function simulateWHI(d, extraFunding = 0, extraPrograms = 0) {
  const base = calcWHI(d);
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
    menopauseGain: Math.round(extraPrograms * 1.2),
    model: 'rule-based-regression-v1',
  };
}

module.exports = {
  calcWHI,
  calcTRI,
  detectLeakage,
  calcAdjustedWHI,
  explainRisk,
  simulateWHI,
  countOpenReportsForDistrict,
};
