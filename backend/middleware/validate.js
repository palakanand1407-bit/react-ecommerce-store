// ============================================================
//  backend/middleware/validate.js
//  express-validator rule sets + handleValidation runner
// ============================================================

const { body, validationResult } = require("express-validator");

// ── Runner — call after rule arrays ──────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth rules ────────────────────────────────────────────────
const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").trim().notEmpty().isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── Product rules ─────────────────────────────────────────────
const productRules = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

// ── Order / Payment rules ─────────────────────────────────────
const orderRules = [
  body("items")
    .isArray({ min: 1 }).withMessage("Order must have at least one item"),
  body("items.*.productId")
    .notEmpty().withMessage("Each item must have a productId"),
  body("items.*.qty")
    .isInt({ min: 1 }).withMessage("Each item must have qty ≥ 1"),
  body("paymentMethod")
    .notEmpty().withMessage("Payment method is required")
    .isIn(["card", "upi", "cod"]).withMessage("Payment method must be card, upi, or cod"),
  body("shippingAddress.street").notEmpty().withMessage("Street address is required"),
  body("shippingAddress.city").notEmpty().withMessage("City is required"),
  body("shippingAddress.zip").notEmpty().withMessage("ZIP code is required"),
  body("shippingAddress.country").notEmpty().withMessage("Country is required"),
];

const paymentRules = [
  body("orderId").notEmpty().withMessage("orderId is required"),
  body("method")
    .isIn(["card", "upi", "cod"]).withMessage("Method must be card, upi, or cod"),

  // Card-specific
  body("cardDetails.number")
    .if(body("method").equals("card"))
    .notEmpty().withMessage("Card number is required for card payments")
    .isCreditCard().withMessage("Enter a valid card number"),
  body("cardDetails.expiry")
    .if(body("method").equals("card"))
    .matches(/^\d{2}\/\d{2}$/).withMessage("Expiry format: MM/YY"),
  body("cardDetails.cvv")
    .if(body("method").equals("card"))
    .matches(/^\d{3,4}$/).withMessage("CVV must be 3 or 4 digits"),

  // UPI-specific
  body("upiId")
    .if(body("method").equals("upi"))
    .notEmpty().withMessage("UPI ID is required for UPI payments")
    .matches(/^[\w.\-]+@[\w]+$/).withMessage("Enter a valid UPI ID (e.g. name@upi)"),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  productRules,
  orderRules,
  paymentRules,
};
