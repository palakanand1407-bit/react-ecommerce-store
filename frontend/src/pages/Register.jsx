// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form,    setForm]    = useState({ name:"", email:"", password:"", confirm:"" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6)      { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">Arch<span>ive</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join Archive and start shopping</p>

        {error && <div className="error-box" style={{ marginBottom:"1rem" }}>{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label className="field__label">Full Name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Your full name" required autoFocus />
          </div>
          <div className="field">
            <label className="field__label">Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="Enter your email" required />
          </div>
          <div className="field">
            <label className="field__label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Minimum 6 characters" required />
          </div>
          <div className="field">
            <label className="field__label">Confirm Password</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handle} placeholder="Repeat your password" required />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in →</Link></p>
      </div>
    </div>
  );
}

export default Register;
