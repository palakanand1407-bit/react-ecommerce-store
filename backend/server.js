// ============================================================
//  backend/server.js
//  Express application — entry point
// ============================================================

require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const authRoutes     = require("./routes/auth");
const productRoutes  = require("./routes/products");
const orderRoutes    = require("./routes/orders");
const paymentRoutes  = require("./routes/payments");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────
app.use(
  cors({
    origin:      process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ── Body Parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files (uploaded images) ───────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Veloria API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/payments", paymentRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Archive API running at http://localhost:${PORT}`);
  console.log(`📦  Products  → http://localhost:${PORT}/api/products`);
  console.log(`🔑  Auth      → http://localhost:${PORT}/api/auth`);
  console.log(`📋  Orders    → http://localhost:${PORT}/api/orders`);
  console.log(`💳  Payments  → http://localhost:${PORT}/api/payments\n`);
  console.log(`🧪  Seed accounts:`);
  console.log(`    user:  aryan@example.com  / password123`);
  console.log(`    admin: admin@example.com  / admin123\n`);
});

module.exports = app;
