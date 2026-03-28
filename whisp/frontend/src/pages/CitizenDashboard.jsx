import React, { useMemo, useState } from 'react';
import { NEARBY_SERVICES, AWARENESS_PROGRAMS } from '../data/districts.js';
import {
  calcWHI,
  calcTRI,
  riskBadgeClass,
  assessMenopauseSymptoms,
  riskColor,
} from '../utils/algorithms.js';
import { MiniBar, DistrictScoreGauge } from '../components/UI.jsx';
import ServiceMap from '../components/ServiceMap.jsx';
import KarnatakaMap from '../components/KarnatakaMap.jsx';
import { apiPost } from '../api/client';

export default function CitizenDashboard({ selectedDistrict, districts, onSelectDistrict }) {
  const [activeTab, setActiveTab] = useState('services');
  const [reportType, setReportType] = useState(null);
  const [reportForm, setReportForm] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [reported, setReported] = useState(false);
  const [reportErr, setReportErr] = useState('');
  const [symptoms, setSymptoms] = useState({
    hotFlashes: false,
    moodSwings: false,
    sleepIssues: false,
    fatigue: false,
    jointPain: false,
    irregularPeriods: false,
    weightChanges: false,
  });
  const [symptomResult, setSymptomResult] = useState(null);

  const d = selectedDistrict;
  const whiDisplay = typeof d.whi === 'number' ? d.whi : calcWHI(d);
  const tri = calcTRI(d);

  const getScore = useMemo(
    () => (x) => (typeof x.whi === 'number' ? x.whi : calcWHI(x)),
    []
  );

  const metricData = useMemo(
    () => [
      { name: 'Anaemia (weight 40%)', value: d.anaemia, color: '#e91e8c' },
      { name: 'Menstrual hygiene (30%)', value: d.menstrualHygiene, color: '#5D3EBC' },
      { name: 'Awareness (20%)', value: d.awareness, color: '#0d9488' },
      { name: 'Menopause support (10%)', value: d.menopauseSupport, color: '#f59e0b' },
    ],
    [d]
  );

  async function submitReport() {
    setReportErr('');
    try {
      await apiPost('/reports', {
        district: d.name,
        type: reportType,
        description: reportNote,
        location: 'Citizen app',
      });
      setReported(true);
      setTimeout(() => {
        setReportForm(false);
        setReported(false);
        setReportType(null);
        setReportNote('');
      }, 2400);
    } catch (e) {
      setReportErr(e.message || 'Could not submit. Is the API running?');
    }
  }

  async function checkSymptoms() {
    try {
      const res = await apiPost('/menopause/assess', symptoms);
      setSymptomResult({
        level: res.likelihood,
        message: res.message,
        color:
          res.likelihood === 'High'
            ? '#ef4444'
            : res.likelihood === 'Moderate' || res.likelihood === 'Low-Moderate'
              ? '#f59e0b'
              : '#22c55e',
      });
    } catch {
      setSymptomResult(assessMenopauseSymptoms(symptoms));
    }
  }

  const cityLabel = `${d.name} District, Karnataka`;
  const mapCenter = [d.lat, d.lng];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-gradient-to-r from-whisp-primary to-fuchsia-500 px-5 py-4 text-white shadow-card-lg">
        <div>
          <p className="text-sm opacity-90">Citizen view · stay informed</p>
          <h1 className="font-display text-xl font-bold">{cityLabel}</h1>
          {typeof d.whiBase === 'number' && d.whiBase !== whiDisplay && (
            <p className="mt-1 text-xs opacity-90">
              Live score {whiDisplay}/100 (base {d.whiBase}
              {d.openCitizenReports ? ` −${d.whiPenaltyFromReports} from open reports` : ''})
            </p>
          )}
        </div>
        <div className="text-right text-xs opacity-90">
          <p>Data layer: REST + optional MongoDB</p>
          <p>OpenStreetMap · services map</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="card-whisp text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">District health score</p>
          <DistrictScoreGauge score={whiDisplay} risk={d.risk} />
          <span className={`badge mt-2 inline-flex ${riskBadgeClass(d.risk)}`}>{d.risk} risk</span>
          <p className="mt-2 text-xs text-slate-400">WHI weights: anaemia, hygiene, awareness, menopause</p>
        </div>
        <div className="card-whisp">
          <h2 className="mb-3 font-display text-sm font-bold text-slate-900">Health metrics breakdown</h2>
          <div className="flex flex-col gap-3">
            {metricData.map((m) => (
              <div key={m.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{m.name}</span>
                  <span
                    className={`font-bold ${
                      m.value < 50 ? 'text-red-500' : m.value < 70 ? 'text-amber-500' : 'text-emerald-600'
                    }`}
                  >
                    {m.value}%
                  </span>
                </div>
                <MiniBar value={m.value} color={m.color} />
              </div>
            ))}
          </div>
          {tri > 15 && (
            <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Thematic resource imbalance (TRI {tri}): one dimension lags materially vs others — see menopause tab.
            </div>
          )}
        </div>
      </div>

      <div className="card-whisp">
        <h2 className="mb-2 font-display text-sm font-bold text-whisp-primary">State heatmap (illustrative)</h2>
        <div className="h-72 w-full">
          <KarnatakaMap
            districts={districts}
            selected={d}
            onSelect={onSelectDistrict}
            calcWHI={calcWHI}
            riskColor={riskColor}
            getScore={getScore}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pad centers', value: d.padCenters, icon: '🩸', color: '#e91e8c' },
          { label: "Women's clinics", value: d.clinics, icon: '🏥', color: '#5D3EBC' },
          { label: 'Awareness programmes', value: d.programs, icon: '📋', color: '#0d9488' },
          { label: 'Helpline', value: '104', icon: '📞', color: '#f59e0b' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-card border border-slate-100 bg-white p-4 text-center shadow-card"
            style={{ borderTopWidth: 3, borderTopColor: s.color }}
          >
            <div className="text-2xl">{s.icon}</div>
            <div className="font-display text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card-whisp">
        <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {[
            ['services', '📍 Nearby services'],
            ['programs', '📅 Awareness programmes'],
            ['menopause', '🌸 Menopause'],
          ].map(([t, l]) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === t
                  ? 'bg-gradient-to-r from-whisp-primary to-fuchsia-500 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {activeTab === 'services' && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900">Map & listings</h3>
              <span className="text-xs text-slate-500">Leaflet · OSM tiles</span>
            </div>
            <ServiceMap center={mapCenter} districtName={d.name} />
            <div className="mt-4 space-y-2">
              {NEARBY_SERVICES.map((s) => (
                <div
                  key={s.id}
                  className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                    {s.type === 'clinic' ? '🏥' : '🩸'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-500">
                      {s.dist} · {s.hours}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-whisp-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="button" className="btn-outline h-9 shrink-0 px-3 text-xs">
                    Directions
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="space-y-3">
            {AWARENESS_PROGRAMS.map((p, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="w-14 shrink-0 text-center">
                  <div className="font-display text-xl font-bold text-whisp-primary">{p.date.split(' ')[1]}</div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">{p.date.split(' ')[0]}</div>
                </div>
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.venue} · {p.time}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'menopause' && (
          <div>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 p-4">
                <div className="text-lg">🌸</div>
                <div className="font-semibold">District menopause support score</div>
                <div className="font-display text-3xl font-bold text-whisp-accent">{d.menopauseSupport}%</div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <div className="text-lg">🏥</div>
                <div className="font-semibold">Estimated specialist touchpoints</div>
                <div className="font-display text-3xl font-bold text-emerald-600">{Math.max(1, Math.floor(d.clinics * 0.35))}</div>
              </div>
            </div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Symptom checker (non-diagnostic)</p>
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {Object.keys(symptoms).map((key) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    symptoms[key] ? 'border-whisp-accent bg-pink-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={symptoms[key]}
                    onChange={(e) => setSymptoms({ ...symptoms, [key]: e.target.checked })}
                    className="accent-whisp-primary"
                  />
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              ))}
            </div>
            <button type="button" className="btn-whisp w-full sm:w-auto" onClick={checkSymptoms}>
              Analyse symptoms
            </button>
            {symptomResult && (
              <div
                className="mt-3 rounded-xl border-l-4 bg-pink-50 px-4 py-3 text-sm"
                style={{ borderColor: symptomResult.color }}
              >
                <strong>{symptomResult.level}</strong> — {symptomResult.message}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-whisp border-l-4 border-amber-400">
        <h3 className="font-semibold text-slate-900">Report an issue anonymously</h3>
        <p className="mt-1 text-sm text-slate-600">
          Feeds the live citizen data layer and can adjust district WHI when cases stay open.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            'No Pads Available',
            'No Awareness Program',
            'Clinic Not Working',
            'Wrong Location',
            'Other Issue',
          ].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setReportType(t);
                setReportForm(true);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                reportType === t ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {reportForm && !reported && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-semibold">Reporting: {reportType}</p>
            <textarea
              className="mb-3 w-full rounded-xl border border-slate-200 p-2 text-sm"
              rows={3}
              placeholder="Optional details (stay anonymous)"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
            />
            {reportErr && <p className="mb-2 text-xs text-red-600">{reportErr}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95"
                onClick={submitReport}
              >
                Report anonymously
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setReportForm(false);
                  setReportType(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {reported && (
          <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Report received — thank you. Officials see it in the government dashboard.
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">Anonymous · encrypted transport (HTTPS in production)</p>
      </div>
    </div>
  );
}
