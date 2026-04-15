// ============================================================
//  backend/controllers/orderController.js
//  Place orders, view order history, admin order management
// ============================================================

const { success, error } = require("../utils/response");
const db = require("../config/db");

// ── POST /api/orders ──────────────────────────────────────────
const createOrder = (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;

    // Validate products exist and have enough stock
    const resolvedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = db.getProductById(item.productId);
      if (!product) {
        return error(res, `Product "${item.productId}" not found.`, 404);
      }
      if (product.stock < item.qty) {
        return error(
          res,
          `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          400
        );
      }

      const lineTotal = product.price * item.qty;
      subtotal += lineTotal;
      resolvedItems.push({
        productId:   product.id,
        name:        product.name,
        image:       product.image,
        price:       product.price,
        qty:         item.qty,
        lineTotal,
      });
    }

    const shipping    = subtotal > 500 ? 0 : 99;   // Free above ₹500
    const tax         = Math.round(subtotal * 0.18); // 18% GST
    const orderTotal  = subtotal + shipping + tax;

    const order = db.createOrder({
      userId:          req.user.id,
      userName:        req.user.name,
      items:           resolvedItems,
      paymentMethod,
      paymentStatus:   "unpaid",
      shippingAddress: { ...req.user.address, ...shippingAddress },
      status:          "pending",
      totals:          { subtotal, shipping, tax, orderTotal },
    });

    // Deduct stock (optimistic update)
    for (const item of items) {
      const p = db.getProductById(item.productId);
      db.updateProduct(item.productId, { stock: p.stock - item.qty });
    }

    return success(res, { order }, "Order placed successfully", 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── GET /api/orders — current user's orders ───────────────────
const getMyOrders = (req, res) => {
  const orders = db.getOrdersByUser(req.user.id);
  // Sort newest first
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return success(res, { count: orders.length, orders });
};

// ── GET /api/orders/:id ───────────────────────────────────────
const getOrder = (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return error(res, "Order not found.", 404);
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return error(res, "Access denied.", 403);
  }
  return success(res, { order });
};

// ── PUT /api/orders/:id/status (admin) ───────────────────────
const updateOrderStatus = (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!status || !allowed.includes(status)) {
    return error(res, `Status must be one of: ${allowed.join(", ")}`, 400);
  }

  const order = db.getOrderById(req.params.id);
  if (!order) return error(res, "Order not found.", 404);

  const updated = db.updateOrderStatus(req.params.id, status);
  return success(res, { order: updated }, "Order status updated");
};

// ── GET /api/orders/all (admin) ───────────────────────────────
const getAllOrders = (req, res) => {
  const orders = db.getOrders();
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return success(res, { count: orders.length, orders });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
};
