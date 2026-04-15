// src/pages/Cart.jsx — INR currency
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

const BASE = "http://localhost:5000";
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

function CartItem({ item }) {
  const { updateQty, removeFromCart } = useCart();
  const imgSrc = item.image ? (item.image.startsWith("http") ? item.image : `${BASE}${item.image}`) : null;
  return (
    <div className="cart-item">
      <div className="cart-item__img-wrap">
        {imgSrc ? <img src={imgSrc} alt={item.name} className="cart-item__img"/> : <span style={{fontSize:"2rem"}}>📦</span>}
      </div>
      <div className="cart-item__details">
        <Link to={`/product/${item.id}`} className="cart-item__name">{item.name?.length>55?item.name.slice(0,53)+"…":item.name}</Link>
        <span className="cart-item__category">{item.category}</span>
        <span className="cart-item__unit-price">{inr(item.price)} each</span>
      </div>
      <div className="cart-item__controls">
        <div className="qty-ctrl">
          <button className="qty-btn" onClick={()=>updateQty(item.id,item.qty-1)} disabled={item.qty<=1}>−</button>
          <span className="qty-val">{item.qty}</span>
          <button className="qty-btn" onClick={()=>updateQty(item.id,item.qty+1)}>+</button>
        </div>
        <button className="cart-item__remove" onClick={()=>removeFromCart(item.id)}>Remove</button>
      </div>
      <div className="cart-item__line-total">{inr(item.price*item.qty)}</div>
    </div>
  );
}

function OrderSummary() {
  const { subtotal, shipping, tax, orderTotal, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="order-summary">
      <h2 className="order-summary__title">Order Summary</h2>
      <div className="summary-row"><span>Subtotal ({itemCount} item{itemCount!==1?"s":""})</span><span>{inr(subtotal)}</span></div>
      <div className="summary-row"><span>Delivery</span><span className={shipping===0?"summary-free":""}>{shipping===0?"Free":`${inr(shipping)}`}</span></div>
      {shipping>0 && subtotal<500 && <p className="summary-ship-note">Add {inr(500-subtotal)} more for free delivery</p>}
      <div className="summary-row"><span>GST (18%)</span><span>{inr(tax)}</span></div>
      <hr className="summary-divider"/>
      <div className="summary-total"><span>Total</span><span>{inr(orderTotal)}</span></div>
      <button className="checkout-btn" onClick={()=>user?navigate("/checkout"):navigate("/login",{state:{from:{pathname:"/checkout"}}})}>
        {user?"Proceed to Checkout →":"Sign In to Checkout →"}
      </button>
      <Link to="/" className="continue-link">← Continue Shopping</Link>
    </aside>
  );
}

function Cart() {
  const { cart, clearCart } = useCart();
  if (cart.length===0) return (
    <div className="page-wrapper">
      <div className="cart-empty">
        <div className="cart-empty__icon">🛍️</div>
        <h2 className="cart-empty__title">Your cart is empty</h2>
        <p className="cart-empty__sub">Discover our collection of carefully curated goods.</p>
        <Link to="/" className="shop-btn">Browse the Shop</Link>
      </div>
    </div>
  );
  return (
    <div className="page-wrapper">
      <div className="cart-header">
        <h1 className="section-title">Your Cart <span className="cart-count">{cart.length} item{cart.length!==1?"s":""}</span></h1>
        <button className="clear-btn" onClick={clearCart}>Clear All</button>
      </div>
      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-cols-header"><span>Product</span><span>Quantity</span><span>Total</span></div>
          {cart.map(item=><CartItem key={item.id} item={item}/>)}
        </div>
        <OrderSummary/>
      </div>
    </div>
  );
}
export default Cart;
