import React from 'react';

// components/UI.jsx — Shared WHISP UI Components

// ── MiniBar Progress ──────────────────────────────────────────────────────
export function MiniBar({ value, color, max = 100 }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 99, height: 7, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 99, transition: "width .8s ease" }} />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────
export function KPICard({ label, value, sub, color, icon, trend }) {
  return (
    <div className="card-whisp" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1.2, marginTop: 4, fontFamily: "Fraunces,serif" }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ fontSize: 11, color: trend > 0 ? "#22c55e" : "#ef4444", marginTop: 8, fontWeight: 600 }}>
          {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

// ── Score Gauge ────────────────────────────────────────────────────────────
export function DistrictScoreGauge({ score, risk }) {
  const color = risk === "High" ? "#ef4444" : risk === "Moderate" ? "#f59e0b" : "#22c55e";
  const cx = 90, cy = 85, r = 70;
  const toRad = a => a * Math.PI / 180;
  const arcEnd = (ang) => ({
    x: cx + r * Math.cos(toRad(ang - 90)),
    y: cy + r * Math.sin(toRad(ang - 90))
  });
  const end = arcEnd(score / 100 * 180);
  const large = score > 50 ? 1 : 0;
  return (
    <svg width="180" height="100">
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
      <path d={`M${cx - r},${cy} A${r},${r} 0 ${large} 1 ${end.x},${end.y}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + 55 * Math.cos(toRad(score / 100 * 180 - 90))} y2={cy + 55 * Math.sin(toRad(score / 100 * 180 - 90))} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f172a" fontFamily="Fraunces,serif">{score}</text>
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="DM Sans">/100</text>
    </svg>
  );
}

// ── Section Tab Bar ────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {tabs.map(([key, label]) => (
        <button key={key} onClick={() => onChange(key)} style={{
          padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
          fontWeight: 600, fontSize: 12,
          background: active === key ? "linear-gradient(135deg,#7c3aed,#e91e8c)" : "#f1f5f9",
          color: active === key ? "white" : "#475569"
        }}>
          {label}
        </button>
      ))}
    </div>
  );
}
