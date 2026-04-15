// ============================================================
//  backend/controllers/authController.js
//  Register, Login, Get Profile, Update Profile, Upload Avatar
// ============================================================

const bcrypt           = require("bcryptjs");
const { signToken }    = require("../utils/jwt");
const { success, error } = require("../utils/response");
const db               = require("../config/db");
const path             = require("path");

// ── Helper: safe user (no password) ──────────────────────────
const safeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check duplicate email
    if (db.getUserByEmail(email)) {
      return error(res, "An account with this email already exists.", 409);
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Create user
    const user  = db.createUser({ name, email: email.toLowerCase(), password: hashed });
    const token = signToken({ id: user.id, role: user.role });

    return success(
      res,
      { user: safeUser(user), token },
      "Account created successfully",
      201
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.getUserByEmail(email);
    if (!user) {
      return error(res, "Invalid email or password.", 401);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return error(res, "Invalid email or password.", 401);
    }

    const token = signToken({ id: user.id, role: user.role });

    return success(res, { user: safeUser(user), token }, "Login successful");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
const getMe = (req, res) => {
  return success(res, { user: req.user });
};

// ── PUT /api/auth/profile ─────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, address, currentPassword, newPassword } = req.body;

    const user = db.getUserById(req.user.id);
    const updates = {};

    if (name)    updates.name    = name.trim();
    if (address) updates.address = { ...user.address, ...address };

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return error(res, "Current password required to set a new password.", 400);
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return error(res, "Current password is incorrect.", 401);
      }
      if (newPassword.length < 6) {
        return error(res, "New password must be at least 6 characters.", 400);
      }
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = db.updateUser(req.user.id, updates);
    return success(res, { user: safeUser(updated) }, "Profile updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── POST /api/auth/avatar ─────────────────────────────────────
const uploadAvatar = (req, res) => {
  try {
    if (!req.file) {
      return error(res, "No file uploaded.", 400);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated   = db.updateUser(req.user.id, { avatar: avatarUrl });

    return success(res, { avatar: avatarUrl, user: safeUser(updated) }, "Avatar uploaded");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { register, login, getMe, updateProfile, uploadAvatar };
