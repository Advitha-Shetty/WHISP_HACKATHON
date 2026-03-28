import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@whisp.gov');
  const [password, setPassword] = useState('Admin@123');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'government' || data.role === 'admin') nav('/gov');
      else nav('/');
    } catch {
      setErr('Invalid credentials. Use admin@whisp.gov / Admin@123 for the demo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-whisp-surface via-white to-purple-50 px-4">
      <div className="w-full max-w-md rounded-card border border-slate-200 bg-white p-8 shadow-card-lg">
        <div className="mb-6 text-center">
          <div className="font-display text-2xl font-bold text-whisp-primary">WHISP</div>
          <p className="mt-1 text-sm text-slate-600">Government dashboard sign-in</p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-whisp-primary focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-whisp-primary focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          <button type="submit" disabled={loading} className="btn-whisp w-full disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="font-semibold text-whisp-primary hover:underline">
            ← Citizen dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
