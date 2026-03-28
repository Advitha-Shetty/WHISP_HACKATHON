import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { apiPost } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'whisp_jwt';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const e = localStorage.getItem('whisp_email');
    const r = localStorage.getItem('whisp_role');
    return e ? { email: e, role: r } : null;
  });

  const login = useCallback(async (email, password) => {
    const data = await apiPost('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem('whisp_email', data.email);
    localStorage.setItem('whisp_role', data.role);
    setToken(data.token);
    setUser({ email: data.email, role: data.role });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('whisp_email');
    localStorage.removeItem('whisp_role');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isGovernment: user?.role === 'government' || user?.role === 'admin',
    }),
    [token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
