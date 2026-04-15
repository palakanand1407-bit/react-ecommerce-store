// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">Arch<span>ive</span></Link>
        <div className="navbar-links">
          <NavLink to="/" end className={({isActive})=>isActive?"nav-link nav-link--active":"nav-link"}>Shop</NavLink>
          {isAdmin && <NavLink to="/admin" className={({isActive})=>isActive?"nav-link nav-link--active":"nav-link"}>Admin</NavLink>}
          <button className="cart-btn" onClick={()=>navigate("/cart")} aria-label={`Cart ${itemCount} items`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Cart</span>
            {itemCount > 0 && <span className="cart-badge">{itemCount > 99?"99+":itemCount}</span>}
          </button>
          {user ? (
            <div className="user-menu-wrap">
              <button className="user-avatar-btn" onClick={()=>setMenuOpen(o=>!o)}>
                {user.avatar
                  ? <img src={`http://localhost:5000${user.avatar}`} alt={user.name} className="user-avatar-img"/>
                  : <span className="user-avatar-initials">{user.name?.charAt(0).toUpperCase()}</span>
                }
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header"><strong>{user.name}</strong><small>{user.email}</small></div>
                  <Link to="/profile" className="dropdown-item" onClick={()=>setMenuOpen(false)}>My Profile</Link>
                  <Link to="/orders"  className="dropdown-item" onClick={()=>setMenuOpen(false)}>My Orders</Link>
                  <hr className="dropdown-divider"/>
                  <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
