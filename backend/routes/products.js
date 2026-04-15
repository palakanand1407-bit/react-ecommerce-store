// ============================================================
//  backend/routes/products.js
// ============================================================

const router  = require("express").Router();
const ctrl    = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");
const { uploadProduct }      = require("../middleware/upload");
const { productRules, handleValidation } = require("../middleware/validate");

// Public
router.get("/",           ctrl.getAllProducts);
router.get("/categories", ctrl.getCategories);
router.get("/:id",        ctrl.getProduct);

// Admin only
router.post(
  "/",
  protect, adminOnly, uploadProduct, productRules, handleValidation,
  ctrl.createProduct
);
router.put(
  "/:id",
  protect, adminOnly, uploadProduct,
  ctrl.updateProduct
);
router.delete("/:id", protect, adminOnly, ctrl.deleteProduct);

module.exports = router;
