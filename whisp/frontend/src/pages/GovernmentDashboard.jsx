import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MONTHS, CITIZEN_REPORTS, POLICY_RECOMMENDATIONS } from '../data/districts.js';
import {
  calcWHI,
  calcTRI,
  detectLeakage,
  riskBadgeClass,
  explainRisk,
  simulateImpact,
  riskColor,
} from '../utils/algorithms.js';
import { KPICard, MiniBar } from '../components/UI.jsx';
import KarnatakaMap from '../components/KarnatakaMap.jsx';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../api/client';

export default function GovernmentDashboard({ districts, selectedDistrict, setSelectedDistrict }) {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [simFunding, setSimFunding] = useState(0);
  const [simPrograms, setSimPrograms] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [simErr, setSimErr] = useState('');
  const [explain, setExplain] = useState(null);

  const totalFunds = districts.reduce((a, d) => a + d.funding, 0);
  const totalAllocated = districts.reduce((a, d) => a + d.allocated, 0);
  const totalUtilized = districts.reduce((a, d) => a + d.utilized, 0);

  const getScore = (x) => (typeof x.whi === 'number' ? x.whi : calcWHI(x));

  const fundData = districts.map((d) => ({
    name: d.name.replace(' Rural', '').replace('Uttara ', 'U.'),
    allocated: d.allocated,
    utilized: d.utilized,
    gap: d.allocated - d.utilized,
  }));

  const whiData = districts.map((d) => ({
    name: d.name.replace(' Rural', '').replace('Uttara ', 'U.'),
    whi: getScore(d),
  }));

  const trendData = MONTHS.map((m, i) => ({
    month: m,
    ...Object.fromEntries(districts.map((d) => [d.name.split(' ')[0], d.trend[i]])),
  }));

  useEffect(() => {
    if (!selectedDistrict?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet(`/health-score/${selectedDistrict.id}/explain`, token);
        if (!cancelled) setExplain(data);
      } catch {
        if (!cancelled)
          setExplain({
            reasons: explainRisk(selectedDistrict, CITIZEN_REPORTS),
            whi: getScore(selectedDistrict),
            district: selectedDistrict.name,
            risk: selectedDistrict.risk,
          });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict, token]);

  async function runSimulation() {
    setSimErr('');
    setSimResult(null);
    try {
      const data = await apiPost(
        '/simulation',
        { districtId: selectedDistrict.id, extraFunding: simFunding, extraPrograms: simPrograms },
        token
      );
      setSimResult(data);
    } catch {
      const local = simulateImpact(selectedDistrict, simFunding, simPrograms);
      setSimErr('API simulation unavailable — showing client-side model.');
      setSimResult({
        base: local.base,
        newScore: local.newScore,
        delta: local.delta,
        awarenessGain: local.awarenessGain,
        hygieneGain: local.hygieneGain,
        anaemiaGain: local.anaemiaGain,
        menopauseGain: local.menopauseGain,
        source: 'client-fallback',
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KPICard label="Total funds" value={`₹${totalFunds} Cr`} sub="FY 2024–25" color="#e91e8c" icon="💰" trend={12} />
        <KPICard
          label="Allocated"
          value={`₹${totalAllocated} Cr`}
          sub={`${totalFunds ? Math.round((totalAllocated / totalFunds) * 100) : 0}% of total`}
          color="#5D3EBC"
          icon="📊"
          trend={8}
        />
        <KPICard
          label="Utilized"
          value={`₹${totalUtilized} Cr`}
          sub={`${totalAllocated ? Math.round((totalUtilized / totalAllocated) * 100) : 0}% utilization`}
          color={totalUtilized / totalAllocated < 0.7 ? '#ef4444' : '#22c55e'}
          icon="📉"
          trend={-3}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['overview', '📊 Overview'],
          ['whi', '🏥 WHI analysis'],
          ['funds', '💰 Funds'],
          ['simulator', '🔮 Impact simulator'],
          ['recommendations', '📋 Policy'],
        ].map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setActiveSection(k)}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              activeSection === k
                ? 'bg-gradient-to-r from-whisp-primary to-fuchsia-500 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="card-whisp">
            <h3 className="mb-2 font-display text-sm font-bold text-whisp-primary">District heatmap</h3>
            <div className="h-64">
              <KarnatakaMap
                districts={districts}
                selected={selectedDistrict}
                onSelect={setSelectedDistrict}
                calcWHI={calcWHI}
                riskColor={riskColor}
                getScore={getScore}
              />
            </div>
          </div>
          <div className="card-whisp">
            <div className="mb-2 font-semibold text-slate-900">Women&apos;s Health Index — all districts</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={whiData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: '#64748b' }} />
                <YAxis domain={[0, 100]} fontSize={11} tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="whi" radius={[6, 6, 0, 0]}>
                  {whiData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.whi >= 70 ? '#22c55e' : entry.whi >= 55 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card-whisp">
            <div className="mb-2 font-semibold">Metric trends (6 months)</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} tick={{ fill: '#64748b' }} />
                <YAxis domain={[25, 80]} fontSize={11} tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                {districts.map((d, i) => (
                  <Line
                    key={d.id}
                    type="monotone"
                    dataKey={d.name.split(' ')[0]}
                    dot={false}
                    stroke={['#e91e8c', '#5D3EBC', '#0d9488', '#f59e0b', '#22c55e'][i]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeSection === 'whi' && (
        <div className="flex flex-col gap-4">
          <div className="card-whisp">
            <h3 className="mb-3 font-semibold">District scores & TRI</h3>
            {districts.map((d) => {
              const whi = getScore(d);
              const tri = calcTRI(d);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDistrict(d)}
                  className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                    selectedDistrict?.id === d.id ? 'border-whisp-primary bg-violet-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{d.name}</span>
                    <div className="flex flex-wrap gap-1">
                      <span className={`badge ${riskBadgeClass(d.risk)}`}>{d.risk}</span>
                      {detectLeakage(d) && <span className="badge badge-amber">Leakage</span>}
                      {tri > 15 && <span className="badge badge-violet">TRI {tri}</span>}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[
                      ['Anaemia', d.anaemia, '#e91e8c'],
                      ['Hygiene', d.menstrualHygiene, '#5D3EBC'],
                      ['Awareness', d.awareness, '#0d9488'],
                      ['Menopause', d.menopauseSupport, '#f59e0b'],
                    ].map(([l, v, c]) => (
                      <div key={l}>
                        <div className="text-[10px] text-slate-400">{l}</div>
                        <MiniBar value={v} color={c} />
                        <div className="text-xs font-semibold" style={{ color: c }}>
                          {v}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    WHI {whi}/100 · Util {d.allocated ? Math.round((d.utilized / d.allocated) * 100) : 0}%
                    {typeof d.openCitizenReports === 'number' && d.openCitizenReports > 0
                      ? ` · Open reports ${d.openCitizenReports}`
                      : ''}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="card-whisp border-l-4 border-whisp-primary">
            <h3 className="mb-2 font-display font-bold text-whisp-primary">Explainable view — {selectedDistrict.name}</h3>
            <div className="rounded-xl bg-violet-50 p-4 text-sm text-slate-700">
              <p className="font-bold text-whisp-primary">
                {explain?.risk || selectedDistrict.risk} risk · WHI {explain?.whi ?? getScore(selectedDistrict)}/100
              </p>
              <p className="mt-1 text-xs text-slate-500">{explain?.summary}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {(explain?.reasons || explainRisk(selectedDistrict, CITIZEN_REPORTS)).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'funds' && (
        <div className="flex flex-col gap-4">
          <div className="card-whisp">
            <h3 className="mb-2 font-semibold">Allocation vs utilization (₹ Cr)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fundData} barGap={4} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={11} tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="allocated" fill="#5D3EBC" radius={[4, 4, 0, 0]} name="Allocated" />
                <Bar dataKey="utilized" fill="#e91e8c" radius={[4, 4, 0, 0]} name="Utilized" />
                <Bar dataKey="gap" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Gap" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card-whisp border-l-4 border-red-500">
            <h3 className="mb-2 font-semibold text-red-700">Fund leakage heuristic</h3>
            <p className="mb-3 text-xs text-slate-600">
              Flags when utilization &lt; 65% and sanctioned funds &gt; ₹20 Cr — triggers audit workflow.
            </p>
            {districts.map((d) => {
              const leakage = detectLeakage(d);
              const util = d.allocated ? Math.round((d.utilized / d.allocated) * 100) : 0;
              return (
                <div
                  key={d.id}
                  className={`mb-2 flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                    leakage ? 'bg-red-50' : 'bg-emerald-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-slate-500">
                      ₹{d.funding}Cr sanctioned · {util}% utilized
                    </div>
                  </div>
                  <span className={`badge ${leakage ? 'badge-red' : 'badge-green'}`}>
                    {leakage ? 'Review' : 'OK'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSection === 'simulator' && (
        <div className="card-whisp">
          <h3 className="font-display text-lg font-bold text-slate-900">Impact simulator</h3>
          <p className="mt-1 text-sm text-slate-600">
            Uses FastAPI rule surface when <code className="rounded bg-slate-100 px-1">ML_SERVICE_URL</code> is set; otherwise
            Node fallback. Inputs: extra ₹ Cr and new programmes.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">
                Extra funding (₹ Cr): <span className="text-whisp-primary">{simFunding}</span>
              </label>
              <input
                type="range"
                min={0}
                max={20}
                value={simFunding}
                onChange={(e) => setSimFunding(+e.target.value)}
                className="mt-2 w-full accent-whisp-primary"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">
                New programmes: <span className="text-whisp-accent">{simPrograms}</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={simPrograms}
                onChange={(e) => setSimPrograms(+e.target.value)}
                className="mt-2 w-full accent-whisp-accent"
              />
            </div>
          </div>
          <button type="button" className="btn-whisp mt-4 w-full sm:w-auto" onClick={runSimulation}>
            Run simulation
          </button>
          {simErr && <p className="mt-2 text-xs text-amber-700">{simErr}</p>}
          {simResult && (
            <div className="mt-4 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 p-4">
              <div className="font-semibold text-whisp-primary">Projected outcome ({simResult.source || 'api'})</div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {[
                  ['Current', simResult.base, '#ef4444'],
                  ['Predicted', simResult.newScore, '#22c55e'],
                  ['Delta', `+${simResult.delta}`, '#5D3EBC'],
                ].map(([l, v, c]) => (
                  <div key={l} className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="text-[10px] uppercase text-slate-400">{l}</div>
                    <div className="font-display text-2xl font-bold" style={{ color: c }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-700">
                Awareness +{simResult.awarenessGain}% · Hygiene +{simResult.hygieneGain}% · Anaemia programme intensity +
                {simResult.anaemiaGain}% · Menopause +{simResult.menopauseGain}%
              </p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'recommendations' && (
        <div className="card-whisp">
          <h3 className="mb-3 font-semibold">Policy catalogue (seed) + citizen queue</h3>
          {POLICY_RECOMMENDATIONS.map((r, i) => (
            <div
              key={i}
              className={`mb-3 rounded-xl border-l-4 p-4 ${
                r.priority === 'urgent' ? 'border-red-500 bg-red-50/80' : 'border-amber-400 bg-amber-50/80'
              }`}
            >
              <div className="flex justify-between">
                <span className="font-bold">{r.district}</span>
                <span className={`badge ${r.priority === 'urgent' ? 'badge-red' : 'badge-amber'}`}>{r.priority}</span>
              </div>
              <p className="mt-1 text-sm">
                <strong>Issue:</strong> {r.issue}
              </p>
              <p className="text-sm">
                <strong>Action:</strong> {r.action}
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">Impact: {r.impact}</p>
            </div>
          ))}
          <h4 className="mb-2 mt-4 font-semibold">Citizen reports (demo list)</h4>
          {CITIZEN_REPORTS.map((r) => (
            <div
              key={r.id}
              className="mb-2 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <div>
                <div className="font-semibold">{r.type}</div>
                <div className="text-xs text-slate-500">
                  {r.district} · {r.location}
                </div>
              </div>
              <span
                className={`badge ${
                  r.status === 'Open' ? 'badge-red' : r.status === 'Investigating' ? 'badge-amber' : 'badge-green'
                }`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
