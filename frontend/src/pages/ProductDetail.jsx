// src/pages/ProductDetail.jsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import { fetchProductById } from "../services/api";
import "./ProductDetail.css";

const BASE = "http://localhost:5000";
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

function Stars({ rating }) {
  return <span className="stars">{Array.from({length:5},(_,i)=>i<Math.round(rating)?"★":"☆")}</span>;
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { data, loading, error } = useFetch(() => fetchProductById(id), [id]);
  const product = data?.data?.product;

  const handleAdd = () => {
    if (!user) { navigate("/login"); return; }
    addToCart({ ...product, id: product.id }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner-ring" /></div>;
  if (error || !product) return (
    <div className="page-wrapper">
      <div className="error-box">Product not found. <button className="inline-link" onClick={() => navigate("/")}>← Back to shop</button></div>
    </div>
  );

  const imgSrc = product.image
    ? (product.image.startsWith("http") ? product.image : `${BASE}${product.image}`)
    : null;

  return (
    <div className="page-wrapper">
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb__link">Shop</Link>
        <span className="breadcrumb__sep">/</span>
        <span className="breadcrumb__link" onClick={() => navigate(`/?category=${product.category}`)} style={{cursor:"pointer"}}>{product.category}</span>
        <span className="breadcrumb__sep">/</span>
        <span className="breadcrumb__current">{product.name?.slice(0,30)}</span>
      </nav>

      <div className="detail-grid">
        <div className="detail-img-wrap">
          {imgSrc
            ? <img src={imgSrc} alt={product.name} className="detail-img" />
            : <span style={{fontSize:"7rem"}}>📦</span>
          }
        </div>

        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-rating">
            <Stars rating={product.rating||0} />
            <span className="detail-rating-text">{product.rating||0} rating</span>
          </div>
          <div className="detail-price">{inr(product.price)}</div>
          <p className="detail-desc">{product.description}</p>
          <div className="detail-stock">
            {product.stock > 0
              ? <span className="in-stock">✓ In stock ({product.stock} available)</span>
              : <span className="out-stock">✗ Out of stock</span>
            }
          </div>
          <hr className="detail-divider" />
          <div className="detail-qty-row">
            <label className="detail-qty-label">Quantity</label>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q-1))} disabled={qty<=1}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q+1))} disabled={qty>=product.stock}>+</button>
            </div>
          </div>
          <div className="detail-actions">
            <button
              className={`add-to-cart-btn ${added?"add-to-cart-btn--added":""}`}
              onClick={handleAdd}
              disabled={product.stock===0}
            >
              {added ? "✓ Added to Cart" : product.stock===0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button className="go-cart-btn" onClick={() => navigate("/cart")}>View Cart</button>
          </div>
          {!user && <p className="login-prompt"><Link to="/login">Sign in</Link> to add items to cart</p>}
          <ul className="trust-list">
            <li>✦ Free delivery on orders above ₹500</li>
            <li>✦ 30-day hassle-free returns</li>
            <li>✦ Secure checkout — Card, UPI or COD</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
