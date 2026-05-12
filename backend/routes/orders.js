const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const router = express.Router();
const Order = require("../models/Order");
const { protect, restrictTo } = require("../middleware/auth");

const ORDER_CREATE_FIELDS = [
  "vendorId",
  "vendorName",
  "items",
  "deliveryAddress",
  "paymentMethod",
  "paymentStatus",
  "subtotal",
  "deliveryFee",
  "platformFee",
  "promoCode",
  "promoDiscount",
  "totalAmount",
  "customizations",
  "notes",
  "customerPhone",
  "estimatedDeliveryTime",
];

const ORDER_STATUSES = new Set([
  "pending",
  "confirmed",
  "preparing",
  "on_way",
  "delivered",
  "cancelled",
]);

function makeTrackingId() {
  return `FC-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function statusTimestampFields(status) {
  const now = new Date();
  const patch = {};
  switch (status) {
    case "confirmed":
      patch.confirmedAt = now;
      break;
    case "preparing":
      patch.preparingAt = now;
      break;
    case "on_way":
      patch.onWayAt = now;
      break;
    case "delivered":
      patch.deliveredAt = now;
      break;
    case "cancelled":
      patch.cancelledAt = now;
      break;
    default:
      break;
  }
  return patch;
}

function sanitizeOrderItems(items) {
  if (!Array.isArray(items) || !items.length) return null;
  const out = [];
  for (const raw of items) {
    if (!raw?.dishId || !mongoose.Types.ObjectId.isValid(String(raw.dishId))) {
      return null;
    }
    const addons = Array.isArray(raw.addons)
      ? raw.addons
          .filter((a) => a && a.name)
          .map((a) => ({
            name: String(a.name).slice(0, 120),
            price: Math.max(0, Number(a.price) || 0),
          }))
      : [];
    const removals = Array.isArray(raw.removals)
      ? raw.removals.map((r) => String(r).slice(0, 120)).filter(Boolean)
      : [];
    const tastePrefs = Array.isArray(raw.tastePrefs)
      ? raw.tastePrefs.map((t) => String(t).slice(0, 80)).filter(Boolean)
      : [];
    const allowedSpice = ["mild", "medium", "hot", "extra-hot"];
    const spiceRaw = raw.spiceLevel || "medium";
    const spiceLevel = allowedSpice.includes(spiceRaw) ? spiceRaw : "medium";
    const line = {
      dishId: new mongoose.Types.ObjectId(String(raw.dishId)),
      dishName: String(raw.dishName || "Dish").slice(0, 200),
      dishImage: String(raw.dishImage || "").slice(0, 2000),
      basePrice: Math.max(0, Number(raw.basePrice) || 0),
      quantity: Math.max(1, Math.min(99, parseInt(String(raw.quantity), 10) || 1)),
      addons,
      removals,
      spiceLevel,
      tastePrefs,
      specialNote: String(raw.specialNote || "").slice(0, 300),
      addonTotal: Math.max(0, Number(raw.addonTotal) || 0),
      lineTotal: Math.max(0, Number(raw.lineTotal) || 0),
    };
    if (raw.extras != null && typeof raw.extras === "object" && !Array.isArray(raw.extras)) {
      line.extras = raw.extras;
    }
    out.push(line);
  }
  return out;
}

// 1. Create New Order (Customer Only) — always persisted as status: pending
router.post("/", protect, restrictTo("customer"), async (req, res) => {
  try {
    const body = {};
    ORDER_CREATE_FIELDS.forEach((k) => {
      if (req.body[k] !== undefined) body[k] = req.body[k];
    });

    if (!body.vendorId || !mongoose.Types.ObjectId.isValid(String(body.vendorId))) {
      return res.status(400).json({ status: "fail", message: "Invalid or missing vendorId." });
    }
    body.vendorId = new mongoose.Types.ObjectId(String(body.vendorId));

    const items = sanitizeOrderItems(body.items);
    if (!items) {
      return res.status(400).json({ status: "fail", message: "Order must include valid items." });
    }
    body.items = items;

    body.status = "pending";
    body.customerId = req.user._id;
    body.customerName = req.user.name || "Customer";
    body.customerEmail = req.user.email;
    if (!body.customerPhone && req.user.phone) {
      body.customerPhone = req.user.phone;
    }

    let lastErr;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      body.trackingId = makeTrackingId();
      try {
        const newOrder = await Order.create(body);
        return res.status(201).json({ status: "success", data: newOrder });
      } catch (e) {
        lastErr = e;
        if (e && e.code === 11000 && String(e.message || "").includes("trackingId")) {
          continue;
        }
        throw e;
      }
    }
    throw lastErr || new Error("Could not assign tracking id.");
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
});

// 2. Customer order history (customerId === authenticated user)
const customerOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort(
      "-createdAt",
    );
    res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
router.get("/my-orders", protect, restrictTo("customer"), customerOrderHistory);
router.get("/history", protect, restrictTo("customer"), customerOrderHistory);

// 3. Get All Orders for a Vendor (Vendor Dashboard Overview & Menu)
router.get(
  "/vendor-orders",
  protect,
  restrictTo("vendor"),
  async (req, res) => {
    try {
      const orders = await Order.find({ vendorId: req.user._id }).sort(
        "-createdAt",
      );
      res.status(200).json({ status: "success", data: orders });
    } catch (err) {
      res.status(400).json({ status: "fail", message: err.message });
    }
  },
);

// Single order (customer owns order OR vendor owns order)
router.get("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: "fail", message: "Invalid order id." });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found." });
    }

    const uid = String(req.user._id);
    const isCustomer =
      req.user.role === "customer" && String(order.customerId) === uid;
    const isVendor =
      req.user.role === "vendor" && String(order.vendorId) === uid;
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({ status: "fail", message: "Access denied." });
    }

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
});

// 4. Update Order Status (Vendor only - e.g. "pending" to "preparing")
router.patch("/:id/status", protect, restrictTo("vendor"), async (req, res) => {
  try {
    const nextStatus = req.body.status;
    if (!nextStatus || !ORDER_STATUSES.has(nextStatus)) {
      return res.status(400).json({ status: "fail", message: "Invalid status." });
    }

    const ts = statusTimestampFields(nextStatus);
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user._id },
      { $set: { status: nextStatus, ...ts } },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
});

module.exports = router;
