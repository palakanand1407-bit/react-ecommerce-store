// src/components/Shared.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function ProtectedRoute({ children, adminOnly=false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="spinner-wrapper"><div className="spinner-ring"/></div>;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace/>;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace/>;
  return children;
}

export function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}

export function Footer() {
  return (
    <footer style={{ background:"var(--ink)", color:"rgba(255,255,255,.45)", marginTop:"auto" }}>
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"2.5rem 2rem", display:"flex", alignItems:"center", flexWrap:"wrap", gap:"1.5rem" }}>
        <span style={{ fontFamily:"var(--ff-display)", fontSize:"1.1rem", color:"white" }}>
          Arch<em style={{color:"var(--accent2)",fontStyle:"italic"}}>ive</em>
        </span>
        <nav style={{ display:"flex", gap:"1.25rem", marginLeft:"auto" }}>
          {[{to:"/",label:"Shop"},{to:"/cart",label:"Cart"},{to:"/orders",label:"Orders"},{to:"/profile",label:"Profile"}].map(l=>(
            <Link key={l.to} to={l.to} style={{ fontSize:".82rem", color:"rgba(255,255,255,.5)", transition:"color var(--transition)" }}
              onMouseOver={e=>e.target.style.color="white"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,.5)"}>
              {l.label}
            </Link>
          ))}
        </nav>
        <p style={{ width:"100%", fontSize:".75rem", borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:"1rem", textAlign:"center" }}>
          © {new Date().getFullYear()} Archive · React + Node.js + JWT + Multer
        </p>
      </div>
    </footer>
  );
}
