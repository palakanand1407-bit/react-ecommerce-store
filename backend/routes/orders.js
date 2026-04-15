// ============================================================
//  backend/routes/orders.js
// ============================================================

const router = require("express").Router();
const ctrl   = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");
const { orderRules, handleValidation } = require("../middleware/validate");

// All protected
router.post("/",    protect, orderRules, handleValidation, ctrl.createOrder);
router.get( "/",    protect, ctrl.getMyOrders);
router.get( "/all", protect, adminOnly, ctrl.getAllOrders);
router.get( "/:id", protect, ctrl.getOrder);
router.put( "/:id/status", protect, adminOnly, ctrl.updateOrderStatus);

module.exports = router;
