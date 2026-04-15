// ============================================================
//  backend/routes/auth.js
// ============================================================

const router = require("express").Router();
const ctrl   = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const {
  registerRules,
  loginRules,
  handleValidation,
} = require("../middleware/validate");

// Public
router.post("/register", registerRules, handleValidation, ctrl.register);
router.post("/login",    loginRules,    handleValidation, ctrl.login);

// Protected
router.get( "/me",      protect, ctrl.getMe);
router.put( "/profile", protect, ctrl.updateProfile);
router.post("/avatar",  protect, uploadAvatar, ctrl.uploadAvatar);

module.exports = router;
