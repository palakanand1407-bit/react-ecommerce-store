// src/pages/Orders.jsx — INR currency, dark blue
import React, { useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { fetchMyOrders } from "../services/api";
import "./Orders.css";

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

const STATUS_COLORS = {
  pending:    { bg:"rgba(232,160,32,.15)",  color:"#f0bc50" },
  processing: { bg:"rgba(74,144,217,.15)",  color:"#6aaee8" },
  shipped:    { bg:"rgba(147,112,219,.15)", color:"#c4a8f0" },
  delivered:  { bg:"rgba(34,197,94,.15)",   color:"#86efac" },
  cancelled:  { bg:"rgba(239,68,68,.15)",   color:"#fca5a5" },
};

const METHOD_LABELS = { card:"💳 Card", upi:"📲 UPI", cod:"💵 COD" };

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg:"var(--paper)", color:"var(--ink3)" };
  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric"
  });

  return (
    <div className="order-card">
      <div className="order-card__header" onClick={() => setOpen(o => !o)}>
        <div className="order-card__id">
          <span className="order-label">Order</span>
          <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
        </div>
        <div className="order-card__meta">
          <span className="order-date">{date}</span>
          <StatusBadge status={order.status} />
          <span className="order-payment">{METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
          <strong className="order-total">{inr(order.totals?.orderTotal)}</strong>
          <span className="order-toggle">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div className="order-card__body">
          {/* Items */}
          <div className="order-items">
            {order.items?.map((item, i) => (
              <div key={i} className="order-item">
                <span className="order-item__name">{item.name}</span>
                <span className="order-item__qty">×{item.qty}</span>
                <span className="order-item__price">{inr(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="order-totals">
            <div className="ot-row"><span>Subtotal</span><span>{inr(order.totals?.subtotal)}</span></div>
            <div className="ot-row">
              <span>Delivery</span>
              <span>{order.totals?.shipping === 0 ? "Free" : inr(order.totals?.shipping)}</span>
            </div>
            <div className="ot-row"><span>GST (18%)</span><span>{inr(order.totals?.tax)}</span></div>
            <div className="ot-row ot-row--total">
              <span>Total</span><span>{inr(order.totals?.orderTotal)}</span>
            </div>
          </div>

          {/* Address */}
          {order.shippingAddress && (
            <div className="order-address">
              <strong>Shipping to:</strong>
              <span>
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.zip}, {order.shippingAddress.country}
              </span>
            </div>
          )}

          {/* Transaction ID */}
          {order.paymentResult?.transactionId && (
            <div className="order-txn">
              <strong>Txn ID:</strong> {order.paymentResult.transactionId}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Orders() {
  const { data, loading, error } = useFetch(() => fetchMyOrders(), []);
  const orders = data?.data?.orders || [];

  return (
    <div className="page-wrapper">
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" }}>
        <h1 className="section-title">My Orders</h1>
        <Link to="/" className="btn-secondary" style={{ fontSize:".85rem", padding:".5rem 1.2rem" }}>
          Continue Shopping
        </Link>
      </div>

      {loading && <div className="spinner-wrapper"><div className="spinner-ring" /></div>}
      {error   && <div className="error-box">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <div style={{ fontSize:"3.5rem", marginBottom:"1rem" }}>📋</div>
          <h2>No orders yet</h2>
          <p>When you place orders, they'll appear here.</p>
          <Link to="/" className="btn-primary" style={{ marginTop:"1.5rem", display:"inline-block" }}>
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map(order => <OrderRow key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}

export default Orders;
