// ============================================================
//  backend/utils/jwt.js
//  Sign and verify JWT tokens
// ============================================================

const jwt = require("jsonwebtoken");

const SECRET  = process.env.JWT_SECRET  || "fallback_secret";
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

/** Generate a signed JWT for a user */
const signToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES });

/** Verify a JWT — returns decoded payload or throws */
const verifyToken = (token) => jwt.verify(token, SECRET);

module.exports = { signToken, verifyToken };
