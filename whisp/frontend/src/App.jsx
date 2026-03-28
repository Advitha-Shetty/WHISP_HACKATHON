import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiGet } from './api/client';
import { DISTRICTS } from './data/districts.js';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import GovernmentDashboard from './pages/GovernmentDashboard.jsx';
import Login from './pages/Login.jsx';

function ProtectedGov({ children }) {
  const { token, isGovernment } = useAuth();
  if (!token || !isGovernment) {
    return <Navigate to="/gov/login" replace />;
  }
  return children;
}

function Shell({ children, variant }) {
  const { logout, user, isGovernment } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-whisp-surface">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-whisp-primary shadow-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-white">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight">WHISP</span>
            <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase sm:inline">
              Women&apos;s Health Information &amp; Support
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              to="/"
              className={`rounded-lg px-3 py-1.5 font-semibold ${
                variant === 'citizen' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Citizen
            </Link>
            {isGovernment ? (
              <Link
                to="/gov"
                className={`rounded-lg px-3 py-1.5 font-semibold ${
                  variant === 'gov' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Government
              </Link>
            ) : (
              <Link to="/gov/login" className="rounded-lg px-3 py-1.5 font-semibold hover:bg-white/10">
                Gov login
              </Link>
            )}
            {user && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  nav('/');
                }}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Log out
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

function CitizenPage() {
  const [districts, setDistricts] = useState(DISTRICTS);
  const [selectedId, setSelectedId] = useState(DISTRICTS[0].id);

  const load = useCallback(async () => {
    try {
      const data = await apiGet('/districts?nocache=0');
      if (Array.isArray(data) && data.length) {
        setDistricts(data);
        setSelectedId((id) => (data.some((d) => d.id === id) ? id : data[0].id));
      }
    } catch {
      /* seed fallback */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = districts.find((d) => d.id === selectedId) || districts[0];

  return (
    <Shell variant="citizen">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Citizen dashboard</h1>
          <p className="text-sm text-slate-600">District health score, programmes, maps, anonymous reporting.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-500">District</label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}, Karnataka
              </option>
            ))}
          </select>
        </div>
      </div>
      <CitizenDashboard
        selectedDistrict={selected}
        districts={districts}
        onSelectDistrict={(d) => setSelectedId(d.id)}
      />
    </Shell>
  );
}

function GovPage() {
  const [districts, setDistricts] = useState(DISTRICTS);
  const [selectedId, setSelectedId] = useState(DISTRICTS[0].id);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet('/districts?nocache=1');
        if (Array.isArray(data) && data.length) {
          setDistricts(data);
          setSelectedId((id) => (data.some((d) => d.id === id) ? id : data[0].id));
        }
      } catch {
        /* seed */
      }
    })();
  }, []);

  const selected = districts.find((d) => d.id === selectedId) || districts[0];

  return (
    <Shell variant="gov">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Government dashboard</h1>
          <p className="text-sm text-slate-600">Funds, WHI, TRI, leakage heuristics, interventions.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Focus district</label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm"
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <GovernmentDashboard
        districts={districts}
        selectedDistrict={selected}
        setSelectedDistrict={(d) => setSelectedId(d.id)}
      />
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<CitizenPage />} />
        <Route path="/gov/login" element={<Login />} />
        <Route
          path="/gov"
          element={
            <ProtectedGov>
              <GovPage />
            </ProtectedGov>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
