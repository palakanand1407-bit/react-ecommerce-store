// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import { CartProvider }  from "./context/CartContext";
import { ProtectedRoute, Toast, Footer } from "./components/Shared";
import Navbar        from "./components/Navbar";
import ProductList   from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart          from "./pages/Cart";
import Checkout      from "./pages/Checkout";
import Orders        from "./pages/Orders";
import Profile       from "./pages/Profile";
import Login         from "./pages/Login";
import Register      from "./pages/Register";

function NotFound() {
  return (
    <div className="page-wrapper" style={{ textAlign:"center", padding:"6rem 2rem" }}>
      <h1 style={{ fontFamily:"var(--ff-display)", fontSize:"4rem", marginBottom:"1rem", color:"var(--ink)" }}>404</h1>
      <p style={{ color:"var(--ink3)", marginBottom:"1.5rem" }}>Page not found.</p>
      <a href="/" style={{ color:"var(--accent)", fontWeight:500 }}>← Back to shop</a>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
          <Navbar />
          <main style={{ flex:1 }}>
            <Routes>
              <Route path="/"            element={<ProductList />}   />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart"        element={<Cart />}          />
              <Route path="/login"       element={<Login />}         />
              <Route path="/register"    element={<Register />}      />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>}   />
              <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>}  />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toast />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
