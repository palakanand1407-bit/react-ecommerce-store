// src/pages/Profile.jsx
import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const BASE = "http://localhost:5000";

function Profile() {
  const { user, updateUser, changeAvatar } = useAuth();
  const fileRef = useRef();

  const [form,    setForm]    = useState({ name: user?.name||"", currentPassword:"", newPassword:"" });
  const [address, setAddress] = useState(user?.address || {});
  const [msg,     setMsg]     = useState({ type:"", text:"" });
  const [saving,  setSaving]  = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const setFlash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type:"", text:"" }), 3000);
  };

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try { await changeAvatar(file); setFlash("success", "Avatar updated!"); }
    catch (err) { setFlash("error", err.message); }
    finally { setAvatarLoading(false); }
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, address };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword     = form.newPassword;
      }
      await updateUser(payload);
      setFlash("success", "Profile saved successfully!");
      setForm(f => ({ ...f, currentPassword:"", newPassword:"" }));
    } catch (err) {
      setFlash("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = user?.avatar
    ? (user.avatar.startsWith("http") ? user.avatar : `${BASE}${user.avatar}`)
    : null;

  return (
    <div className="page-wrapper">
      <h1 className="section-title" style={{ marginBottom:"2rem" }}>My Profile</h1>

      {msg.text && (
        <div className={msg.type==="success" ? "flash" : "error-box"} style={{ marginBottom:"1.5rem" }}>
          {msg.text}
        </div>
      )}

      <div className="profile-grid">
        {/* Avatar Card */}
        <div className="profile-avatar-card">
          <div className="avatar-wrap">
            {avatarSrc
              ? <img src={avatarSrc} alt={user?.name} className="avatar-img" />
              : <div className="avatar-placeholder">{user?.name?.charAt(0).toUpperCase()}</div>
            }
            {avatarLoading && (
              <div className="avatar-overlay"><div className="spinner-ring" /></div>
            )}
          </div>
          <button className="change-avatar-btn" onClick={() => fileRef.current?.click()} disabled={avatarLoading}>
            {avatarLoading ? "Uploading…" : "Change Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display:"none" }} onChange={handleAvatarChange} />
          <div className="profile-meta">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
            <span className={`role-badge ${user?.role==="admin"?"role-badge--admin":""}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} style={{ flex:1, display:"flex", flexDirection:"column", gap:"1.5rem" }}>
          {/* Personal Info */}
          <div className="form-card">
            <div className="form-card__title">
              <span className="form-card__step">1</span>Personal Info
            </div>
            <div className="field">
              <label className="field__label">Full Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                placeholder="Your full name" />
            </div>
            <div className="field">
              <label className="field__label">Email Address (read-only)</label>
              <input value={user?.email||""} readOnly
                style={{ opacity:.6, cursor:"default" }} />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="form-card">
            <div className="form-card__title">
              <span className="form-card__step">2</span>Shipping Address
            </div>
            <div className="field">
              <label className="field__label">Street Address</label>
              <input value={address.street||""} onChange={e=>setAddress(a=>({...a,street:e.target.value}))}
                placeholder="42 MG Road, Apartment 5B" />
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field__label">City</label>
                <input value={address.city||""} onChange={e=>setAddress(a=>({...a,city:e.target.value}))}
                  placeholder="Bengaluru" />
              </div>
              <div className="field">
                <label className="field__label">PIN Code</label>
                <input value={address.zip||""} onChange={e=>setAddress(a=>({...a,zip:e.target.value}))}
                  placeholder="560001" />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field__label">State</label>
                <input value={address.state||""} onChange={e=>setAddress(a=>({...a,state:e.target.value}))}
                  placeholder="Karnataka" />
              </div>
              <div className="field">
                <label className="field__label">Country</label>
                <select value={address.country||"IN"} onChange={e=>setAddress(a=>({...a,country:e.target.value}))}>
                  {["IN","US","CA","GB","AU","DE","FR","SG","AE"].map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="form-card">
            <div className="form-card__title">
              <span className="form-card__step">3</span>
              Change Password
              <span style={{ fontFamily:"var(--ff-body)", fontSize:".75rem", fontWeight:400, color:"var(--ink3)" }}>
                — optional
              </span>
            </div>
            <div className="field">
              <label className="field__label">Current Password</label>
              <input type="password" value={form.currentPassword}
                onChange={e=>setForm(f=>({...f,currentPassword:e.target.value}))}
                placeholder="Enter current password" />
            </div>
            <div className="field">
              <label className="field__label">New Password</label>
              <input type="password" value={form.newPassword}
                onChange={e=>setForm(f=>({...f,newPassword:e.target.value}))}
                placeholder="Min 6 characters" />
            </div>
          </div>

          <button type="submit" className="btn-primary"
            style={{ alignSelf:"flex-start", padding:".85rem 2.5rem" }} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
