// ============================================================
//  src/context/AuthContext.jsx
//  Global auth state — user, token, login, logout, register
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, fetchMe, updateProfile, uploadAvatar } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true on first load
  const [error,   setError]   = useState(null);

  // ── Rehydrate from localStorage ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetchMe()
      .then((res) => setUser(res.data.data.user))
      .catch(() => { localStorage.removeItem("token"); })
      .finally(() => setLoading(false));
  }, []);

  // ── Register ─────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setError(null);
    const res = await registerUser({ name, email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem("token", token);
    setUser(u);
    return u;
  }, []);

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    const res = await loginUser({ email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem("token", token);
    setUser(u);
    return u;
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  // ── Update profile ───────────────────────────────────────
  const updateUser = useCallback(async (data) => {
    const res = await updateProfile(data);
    const updated = res.data.data.user;
    setUser(updated);
    return updated;
  }, []);

  // ── Upload avatar ────────────────────────────────────────
  const changeAvatar = useCallback(async (file) => {
    const form = new FormData();
    form.append("avatar", file);
    const res = await uploadAvatar(form);
    const { user: updated } = res.data.data;
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, updateUser, changeAvatar, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
