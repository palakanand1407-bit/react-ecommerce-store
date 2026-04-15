// ============================================================
//  backend/middleware/auth.js
//  JWT authentication guard for protected routes
// ============================================================

const { verifyToken } = require("../utils/jwt");
const { error }       = require("../utils/response");
const db              = require("../config/db");

/** Require a valid JWT in the Authorization header */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "Access denied. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const user    = db.getUserById(decoded.id);

    if (!user) {
      return error(res, "User belonging to this token no longer exists.", 401);
    }

    // Attach user to request (exclude password)
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, "Token has expired. Please log in again.", 401);
    }
    return error(res, "Invalid token.", 401);
  }
};

/** Require admin role */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return error(res, "Access denied. Admins only.", 403);
  }
  next();
};

module.exports = { protect, adminOnly };
