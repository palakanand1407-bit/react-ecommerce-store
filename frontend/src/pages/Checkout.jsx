// ============================================================
//  src/pages/Checkout.jsx
//  Full checkout: shipping form + Card / UPI / COD payment
// ============================================================

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, processPayment } from "../services/api";
import "./Checkout.css";

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const BASE = "http://localhost:5000";

function Field({ label, error, children }) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      {children}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

function PaymentMethodSelector({ selected, onChange }) {
  const methods = [
    { id:"card", label:"Credit / Debit Card", icon:"💳", desc:"Visa, Mastercard, Amex, RuPay" },
    { id:"upi",  label:"UPI",                 icon:"📲", desc:"GPay, PhonePe, Paytm, BHIM" },
    { id:"cod",  label:"Cash on Delivery",    icon:"💵", desc:"Pay when your order arrives" },
  ];
  return (
    <div className="payment-method-list">
      {methods.map(m => (
        <button key={m.id} type="button"
          className={`payment-method-btn ${selected===m.id?"payment-method-btn--active":""}`}
          onClick={() => onChange(m.id)}>
          <span className="pm-icon">{m.icon}</span>
          <div className="pm-info"><strong>{m.label}</strong><small>{m.desc}</small></div>
          <span className="pm-radio">{selected===m.id?"●":"○"}</span>
        </button>
      ))}
    </div>
  );
}

function CardFields({ card, setCard, errors }) {
  const fmtCard   = v => v.replace(/\D/g,"").slice(0,16).match(/.{1,4}/g)?.join(" ")||v.replace(/\D/g,"").slice(0,16);
  const fmtExpiry = v => { let r=v.replace(/\D/g,"").slice(0,4); return r.length>=3?r.slice(0,2)+"/"+r.slice(2):r; };
  return (
    <div className="payment-fields">
      <Field label="Name on Card">
        <input value={card.nameOnCard} onChange={e=>setCard(c=>({...c,nameOnCard:e.target.value}))} placeholder="Name as on card" />
      </Field>
      <Field label="Card Number" error={errors?.cardNumber}>
        <input value={card.number} onChange={e=>setCard(c=>({...c,number:fmtCard(e.target.value)}))} placeholder="1234 5678 9012 3456" maxLength={19} className={errors?.cardNumber?"input--error":""} />
      </Field>
      <div className="form-row">
        <Field label="Expiry" error={errors?.expiry}>
          <input value={card.expiry} onChange={e=>setCard(c=>({...c,expiry:fmtExpiry(e.target.value)}))} placeholder="MM/YY" maxLength={5} className={errors?.expiry?"input--error":""} />
        </Field>
        <Field label="CVV" error={errors?.cvv}>
          <input value={card.cvv} onChange={e=>setCard(c=>({...c,cvv:e.target.value.replace(/\D/g,"").slice(0,4)}))} placeholder="•••" type="password" maxLength={4} className={errors?.cvv?"input--error":""} />
        </Field>
      </div>
      <p className="secure-note">🔒 Your card details are encrypted and never stored.</p>
    </div>
  );
}

function UpiFields({ upiId, setUpiId, error }) {
  return (
    <div className="payment-fields">
      <Field label="UPI ID" error={error}>
        <input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="yourname@upi" className={error?"input--error":""} />
      </Field>
      <div className="upi-logos">
        {["GPay","PhonePe","Paytm","BHIM","Any UPI"].map(u=>(
          <span key={u} className="upi-logo">{u}</span>
        ))}
      </div>
      <p className="secure-note">📲 You'll receive a payment request on your UPI app.</p>
    </div>
  );
}

function CodInfo() {
  return (
    <div className="payment-fields">
      <div className="cod-info">
        <span className="cod-icon">💵</span>
        <div>
          <strong>Cash on Delivery</strong>
          <p>Pay in cash when your order is delivered. Our delivery partner will collect the exact amount.</p>
        </div>
      </div>
      <p className="secure-note">⚠️ Please keep exact change ready at the time of delivery.</p>
    </div>
  );
}

function OrderSuccess({ order, paymentResult }) {
  const navigate = useNavigate();
  return (
    <div className="success-screen">
      <div className="success-icon">{paymentResult?.method==="cod"?"📦":"✅"}</div>
      <h1 className="success-title">{paymentResult?.method==="cod"?"Order Placed!":"Payment Successful!"}</h1>
      <p className="success-sub">
        Order <strong>#{order?.id?.slice(0,8).toUpperCase()}</strong> confirmed.
        {paymentResult?.transactionId && <><br />Txn ID: <strong>{paymentResult.transactionId}</strong></>}
        {paymentResult?.method==="cod" && <><br />Pay on delivery: <strong>{inr(order?.totals?.orderTotal)}</strong></>}
      </p>
      <div style={{ display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap" }}>
        <button className="btn-primary" onClick={()=>navigate("/orders")}>View Orders</button>
        <button className="btn-secondary" onClick={()=>navigate("/")}>Continue Shopping</button>
      </div>
    </div>
  );
}

function Checkout() {
  const { cart, subtotal, shipping, tax, orderTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,      setStep]      = useState(1);
  const [method,    setMethod]    = useState("card");
  const [card,      setCard]      = useState({ nameOnCard:"", number:"", expiry:"", cvv:"" });
  const [upiId,     setUpiId]     = useState("");
  const [shippingAddr, setShippingAddr] = useState({
    street: user?.address?.street||"", city: user?.address?.city||"",
    state: user?.address?.state||"", zip: user?.address?.zip||"",
    country: user?.address?.country||"IN"
  });
  const [errors,    setErrors]    = useState({});
  const [submitting,setSubmitting]= useState(false);
  const [result,    setResult]    = useState(null);
  const [apiError,  setApiError]  = useState("");

  useEffect(() => {
    if (user?.address) setShippingAddr(a => ({ ...a, ...user.address }));
  }, [user]);

  if (cart.length===0 && !result) return (
    <div className="page-wrapper">
      <div className="error-box">Your cart is empty. <Link to="/" style={{color:"var(--accent)"}}>Browse shop →</Link></div>
    </div>
  );

  if (result) return <div className="page-wrapper"><OrderSuccess order={result.order} paymentResult={result.paymentResult} /></div>;

  const validateShipping = () => {
    const e={};
    if (!shippingAddr.street.trim()) e.street="Required";
    if (!shippingAddr.city.trim())   e.city="Required";
    if (!shippingAddr.zip.trim())    e.zip="Required";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const validatePayment = () => {
    const e={};
    if (method==="card") {
      if (!card.number.replace(/\s/g,"") || card.number.replace(/\s/g,"").length<16) e.cardNumber="Enter a 16-digit card number";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry="Format: MM/YY";
      if (!/^\d{3,4}$/.test(card.cvv)) e.cvv="3 or 4 digits";
    }
    if (method==="upi") {
      if (!upiId || !/^[\w.\-]+@[\w]+$/.test(upiId)) e.upiId="Enter a valid UPI ID (e.g. name@upi)";
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handlePlaceOrder = async () => {
    if (!validatePayment()) return;
    setSubmitting(true); setApiError("");
    try {
      const orderRes = await createOrder({
        items: cart.map(i=>({ productId:i.id, qty:i.qty })),
        paymentMethod: method,
        shippingAddress: shippingAddr,
      });
      const order = orderRes.data.data.order;

      const payPayload = { orderId:order.id, method, amount:order.totals.orderTotal };
      if (method==="card") payPayload.cardDetails = { number:card.number.replace(/\s/g,""), expiry:card.expiry, cvv:card.cvv, nameOnCard:card.nameOnCard };
      if (method==="upi")  payPayload.upiId = upiId;

      const payRes = await processPayment(payPayload);
      const paymentResult = payRes.data.data.paymentResult;
      clearCart();
      setResult({ order:payRes.data.data.order, paymentResult });
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <h1 className="section-title" style={{marginBottom:"2rem"}}>Checkout</h1>

      {/* Progress */}
      <div className="checkout-steps">
        <div className={`checkout-step ${step>=1?"active":""} ${step>1?"done":""}`} onClick={()=>step>1&&setStep(1)}>
          <span className="step-num">{step>1?"✓":"1"}</span><span className="step-label">Shipping</span>
        </div>
        <div className="step-line"/>
        <div className={`checkout-step ${step>=2?"active":""}`}>
          <span className="step-num">2</span><span className="step-label">Payment</span>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Left */}
        <div>
          {step===1 && (
            <div className="form-card">
              <div className="form-card__title"><span className="form-card__step">1</span>Shipping Information</div>
              <Field label="Street Address" error={errors.street}>
                <input value={shippingAddr.street} onChange={e=>setShippingAddr(s=>({...s,street:e.target.value}))} placeholder="House no., Street, Area" className={errors.street?"input--error":""} />
              </Field>
              <div className="form-row">
                <Field label="City" error={errors.city}>
                  <input value={shippingAddr.city} onChange={e=>setShippingAddr(s=>({...s,city:e.target.value}))} placeholder="Mumbai" className={errors.city?"input--error":""} />
                </Field>
                <Field label="State">
                  <input value={shippingAddr.state} onChange={e=>setShippingAddr(s=>({...s,state:e.target.value}))} placeholder="Maharashtra" />
                </Field>
              </div>
              <div className="form-row">
                <Field label="PIN Code" error={errors.zip}>
                  <input value={shippingAddr.zip} onChange={e=>setShippingAddr(s=>({...s,zip:e.target.value}))} placeholder="400001" className={errors.zip?"input--error":""} />
                </Field>
                <Field label="Country">
                  <select value={shippingAddr.country} onChange={e=>setShippingAddr(s=>({...s,country:e.target.value}))}>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </Field>
              </div>
              <button className="btn-primary" style={{width:"100%",marginTop:".5rem"}} onClick={()=>{if(validateShipping())setStep(2);}}>
                Continue to Payment →
              </button>
            </div>
          )}

          {step===2 && (
            <div className="form-card">
              <div className="form-card__title"><span className="form-card__step">2</span>Payment Method</div>
              <PaymentMethodSelector selected={method} onChange={m=>{setMethod(m);setErrors({});}} />
              <div style={{marginTop:"1.5rem"}}>
                {method==="card" && <CardFields card={card} setCard={setCard} errors={errors} />}
                {method==="upi"  && <UpiFields upiId={upiId} setUpiId={setUpiId} error={errors.upiId} />}
                {method==="cod"  && <CodInfo />}
              </div>
              {apiError && <div className="error-box" style={{marginTop:"1rem"}}>{apiError}</div>}
              <div style={{display:"flex",gap:".75rem",marginTop:"1.5rem"}}>
                <button className="btn-secondary" onClick={()=>setStep(1)}>← Back</button>
                <button className="btn-primary" style={{flex:1}} onClick={handlePlaceOrder} disabled={submitting}>
                  {submitting
                    ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem"}}><span className="btn-spinner"/>Processing…</span>
                    : method==="cod" ? `Place Order · ${inr(orderTotal)}` : `Pay ${inr(orderTotal)}`
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="order-review">
          <h2 className="order-review__title">Your Order</h2>
          <div className="review-items">
            {cart.map(item=>{
              const imgSrc = item.image?(item.image.startsWith("http")?item.image:`${BASE}${item.image}`):null;
              return (
                <div key={item.id} className="review-item">
                  <div className="review-item__img-wrap">
                    {imgSrc?<img src={imgSrc} alt={item.name} className="review-item__img"/>:<span>📦</span>}
                    <span className="review-item__qty">{item.qty}</span>
                  </div>
                  <div className="review-item__info">
                    <p className="review-item__name">{item.name?.slice(0,42)}</p>
                    <p className="review-item__price">{inr(item.price*item.qty)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <hr className="summary-divider"/>
          <div className="review-totals">
            <div className="summary-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="summary-row"><span>Delivery</span><span className={shipping===0?"summary-free":""}>{shipping===0?"Free":inr(shipping)}</span></div>
            <div className="summary-row"><span>GST (18%)</span><span>{inr(tax)}</span></div>
          </div>
          <hr className="summary-divider"/>
          <div className="review-total-row"><span>Total</span><span>{inr(orderTotal)}</span></div>
          <Link to="/cart" className="edit-cart-link">← Edit Cart</Link>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
