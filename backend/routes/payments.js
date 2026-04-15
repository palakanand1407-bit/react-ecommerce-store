// ============================================================
//  backend/routes/payments.js
// ============================================================

const router = require("express").Router();
const ctrl   = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const { paymentRules, handleValidation } = require("../middleware/validate");

router.get( "/methods",  ctrl.getPaymentMethods);                         // Public
router.post("/process",  protect, paymentRules, handleValidation, ctrl.processPayment);

module.exports = router;
