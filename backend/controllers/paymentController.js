// ============================================================
//  backend/controllers/paymentController.js
//  Mock Payment Gateway — supports Card, UPI, COD
//  Simulates real gateway behaviour (success / failure / pending)
// ============================================================

const { v4: uuidv4 }     = require("uuid");
const { success, error } = require("../utils/response");
const db                 = require("../config/db");

// ── Simulate async gateway delay ─────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Mock gateway logic per method ────────────────────────────
const processGateway = async (method, details, amount) => {
  await delay(800); // Simulate network call

  switch (method) {

    case "card": {
      const { number, expiry, cvv, nameOnCard } = details;

      // Strip spaces from card number
      const clean = (number || "").replace(/\s/g, "");

      // Simulate card decline for test numbers
      if (clean.startsWith("4000000000000002")) {
        return { status: "failed", reason: "Card declined by issuer." };
      }
      if (clean.startsWith("4000000000009995")) {
        return { status: "failed", reason: "Insufficient funds." };
      }

      // Validate expiry is in the future
      const [mm, yy] = (expiry || "").split("/");
      const exp = new Date(`20${yy}`, parseInt(mm) - 1, 1);
      if (exp < new Date()) {
        return { status: "failed", reason: "Card has expired." };
      }

      return {
        status: "success",
        transactionId: `TXN-CARD-${uuidv4().slice(0, 12).toUpperCase()}`,
        last4: clean.slice(-4),
        method: "card",
        processedAt: new Date().toISOString(),
      };
    }

    case "upi": {
      const { upiId } = details;

      // Simulate failure for specific test UPI
      if (upiId === "fail@upi") {
        return { status: "failed", reason: "UPI ID not registered." };
      }

      return {
        status: "success",
        transactionId: `TXN-UPI-${uuidv4().slice(0, 12).toUpperCase()}`,
        upiId,
        method: "upi",
        processedAt: new Date().toISOString(),
      };
    }

    case "cod": {
      // COD is always pending (collected on delivery)
      return {
        status: "pending",
        transactionId: `TXN-COD-${uuidv4().slice(0, 12).toUpperCase()}`,
        method: "cod",
        note: "Payment will be collected on delivery.",
        processedAt: new Date().toISOString(),
      };
    }

    default:
      return { status: "failed", reason: "Unsupported payment method." };
  }
};

// ── POST /api/payments/process ────────────────────────────────
/**
 * Body:
 *  {
 *    orderId: "uuid",
 *    method: "card" | "upi" | "cod",
 *    amount: 349.99,
 *    cardDetails: { number, expiry, cvv, nameOnCard },  // for card
 *    upiId: "name@upi",                                  // for upi
 *  }
 */
const processPayment = async (req, res) => {
  try {
    const { orderId, method, amount, cardDetails, upiId } = req.body;

    // Verify order belongs to user
    const order = db.getOrderById(orderId);
    if (!order) return error(res, "Order not found.", 404);
    if (order.userId !== req.user.id) return error(res, "Access denied.", 403);
    if (order.paymentStatus === "paid") {
      return error(res, "This order has already been paid.", 400);
    }

    // Build gateway-specific details
    const details = method === "upi" ? { upiId } : (cardDetails || {});

    // Process via mock gateway
    const result = await processGateway(method, details, amount);

    if (result.status === "failed") {
      return error(res, result.reason || "Payment failed.", 402);
    }

    // Update order payment status
    const paymentStatus = result.status === "success" ? "paid" : "pending";
    db.updateOrderStatus(orderId, order.status); // keep order status
    // Store payment info on order
    const updated = db.updateUser; // reuse update pattern
    const updatedOrder = db.getOrderById(orderId);
    // Patch payment fields directly
    updatedOrder.paymentStatus  = paymentStatus;
    updatedOrder.paymentMethod  = method;
    updatedOrder.paymentResult  = result;
    updatedOrder.paidAt         = result.status === "success" ? new Date().toISOString() : null;

    // If paid, move order to processing
    if (paymentStatus === "paid") {
      updatedOrder.status = "processing";
    }

    return success(
      res,
      {
        paymentResult: result,
        order: updatedOrder,
      },
      result.status === "success"
        ? "Payment successful"
        : "COD order placed — payment on delivery"
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── GET /api/payments/methods ─────────────────────────────────
const getPaymentMethods = (req, res) => {
  const methods = [
    {
      id:          "card",
      label:       "Credit / Debit Card",
      description: "Visa, Mastercard, Amex, Rupay",
      icon:        "💳",
      fields:      ["number", "expiry", "cvv", "nameOnCard"],
    },
    {
      id:          "upi",
      label:       "UPI",
      description: "GPay, PhonePe, Paytm, BHIM & any UPI app",
      icon:        "📲",
      fields:      ["upiId"],
    },
    {
      id:          "cod",
      label:       "Cash on Delivery",
      description: "Pay in cash when your order arrives",
      icon:        "💵",
      fields:      [],
    },
  ];

  return success(res, { methods });
};

module.exports = { processPayment, getPaymentMethods };
