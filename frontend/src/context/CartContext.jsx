// ============================================================
//  src/context/CartContext.jsx
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";

const CartContext = createContext(null);

const load = () => { try { return JSON.parse(localStorage.getItem("archive_cart")) || []; } catch { return []; } };

function reducer(state, { type, payload }) {
  switch (type) {
    case "ADD":    { const ex = state.find(i => i.id === payload.id); return ex ? state.map(i => i.id === payload.id ? { ...i, qty: i.qty + (payload.qty||1) } : i) : [...state, { ...payload, qty: payload.qty||1 }]; }
    case "REMOVE": return state.filter(i => i.id !== payload);
    case "UPDATE": return state.map(i => i.id === payload.id ? { ...i, qty: Math.max(1, payload.qty) } : i);
    case "CLEAR":  return [];
    default:       return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(reducer, [], load);
  const [toast, setToast] = useState(null);

  useEffect(() => { localStorage.setItem("archive_cart", JSON.stringify(cart)); }, [cart]);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); }, []);

  const addToCart     = useCallback((p, qty=1) => { dispatch({ type:"ADD",    payload:{ ...p, qty } }); showToast(`"${p.name}" added to cart`); }, [showToast]);
  const removeFromCart= useCallback((id)       => dispatch({ type:"REMOVE", payload: id }), []);
  const updateQty     = useCallback((id, qty)  => dispatch({ type:"UPDATE", payload:{ id, qty } }), []);
  const clearCart     = useCallback(()         => dispatch({ type:"CLEAR" }), []);

  const itemCount  = cart.reduce((s,i) => s + i.qty, 0);
  const subtotal   = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const shipping   = subtotal > 500 ? 0 : 99;   // Free delivery above ₹500, else ₹99
  const tax        = Math.round(subtotal * 0.18); // 18% GST
  const orderTotal = subtotal + shipping + tax;

  return (
    <CartContext.Provider value={{ cart, itemCount, subtotal, shipping, tax, orderTotal, toast, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => { const ctx = useContext(CartContext); if (!ctx) throw new Error("useCart must be inside CartProvider"); return ctx; };
