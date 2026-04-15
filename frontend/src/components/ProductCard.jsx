// src/components/ProductCard.jsx — INR currency, real images
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

const BASE = "http://localhost:5000";

function Stars({ rating }) {
  return <span className="stars">{Array.from({length:5},(_,i)=>i<Math.round(rating)?"★":"☆")}</span>;
}

// Format INR
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const short = product.name?.length > 48 ? product.name.slice(0,46)+"…" : product.name;
  const imgSrc = product.image
    ? (product.image.startsWith("http") ? product.image : `${BASE}${product.image}`)
    : null;

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
      tabIndex={0}
      onKeyDown={e => e.key==="Enter" && navigate(`/product/${product.id}`)}
    >
      <div className="product-card__img-wrap">
        {imgSrc
          ? <img src={imgSrc} alt={product.name} className="product-card__img" loading="lazy" />
          : <span className="product-card__placeholder">📦</span>
        }
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__title">{short}</h3>
        <div className="product-card__meta">
          <Stars rating={product.rating||0}/>
          <span className="product-card__reviews">({product.rating||0})</span>
        </div>
        <div className="product-card__footer">
          <span className="product-card__price">{inr(product.price)}</span>
          <button
            className="product-card__add-btn"
            onClick={e => { e.stopPropagation(); addToCart(product, 1); }}
            aria-label={`Add ${product.name} to cart`}
          >+ Add</button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
