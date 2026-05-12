const mongoose = require("mongoose");

// ── Order Item sub-schema (each dish in the order) ───────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
    dishName: {
      type: String,
      required: true,
    },
    dishImage: {
      type: String,
      default: "",
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // ── CUSTOMIZATIONS ──────────────────────────────────────────────────────
    // Add-ons (extra ingredients)
    addons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],

    // Removals (ingredients removed)
    removals: [String],

    // Spice level
    spiceLevel: {
      type: String,
      enum: ["mild", "medium", "hot", "extra-hot"],
      default: "medium",
    },

    // Taste preferences
    tastePrefs: [String],

    // Special health instructions
    specialNote: {
      type: String,
      maxlength: 300,
      default: "",
    },

    /** Full per-line snapshot (ingredients, extras) from checkout — optional */
    extras: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },

    // Price calculations
    addonTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

// ── Main Order Schema ─────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── CUSTOMER ────────────────────────────────────────────────────────────
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      default: "",
    },

    /** Human-readable tracking reference for customers (unique when set) */
    trackingId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      index: true,
    },

    // ── VENDOR ──────────────────────────────────────────────────────────────
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor ID is required"],
      index: true,
    },
    vendorName: {
      type: String,
      required: true,
    },

    // ── ORDER ITEMS ─────────────────────────────────────────────────────────
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr && arr.length > 0,
        message: "Order must contain at least one item.",
      },
    },

    // ── DELIVERY ────────────────────────────────────────────────────────────
    deliveryAddress: {
      type: {
        type: String,
        enum: ["Home", "Office", "Other"],
        default: "Home",
      },
      addressLine: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        default: "",
      },
      instructions: {
        type: String,
        default: "",
      },
    },

    // ── PAYMENT ─────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "jazz", "easypaisa"],
      required: true,
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // ── PRICING ─────────────────────────────────────────────────────────────
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 150,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 25,
      min: 0,
    },
    promoCode: {
      type: String,
      default: "",
    },
    promoDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ── STATUS ──────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "on_way",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // Status timestamps
    confirmedAt: Date,
    preparingAt: Date,
    onWayAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,

    cancellationReason: {
      type: String,
      default: "",
    },

    // ── METADATA ────────────────────────────────────────────────────────────
    estimatedDeliveryTime: {
      type: Number,
      default: 30, // minutes
    },
    notes: {
      type: String,
      default: "",
    },

    /** Full snapshot of per-line customizations from checkout (mirrors cart + items) */
    customizations: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// ── Pre-save hook to update status timestamps ─────────────────────────────────
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();
    switch (this.status) {
      case "confirmed":
        this.confirmedAt = now;
        break;
      case "preparing":
        this.preparingAt = now;
        break;
      case "on_way":
        this.onWayAt = now;
        break;
      case "delivered":
        this.deliveredAt = now;
        break;
      case "cancelled":
        this.cancelledAt = now;
        break;
    }
  }
  next();
});

// ── Static method: Get customer order stats ───────────────────────────────────
orderSchema.statics.getCustomerStats = async function (customerId) {
  const result = await this.aggregate([
    { $match: { customerId: mongoose.Types.ObjectId(customerId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
      },
    },
  ]);
  return result[0] || { totalOrders: 0, totalSpent: 0, deliveredOrders: 0 };
};

// ── Static method: Get vendor order stats ─────────────────────────────────────
orderSchema.statics.getVendorStats = async function (vendorId) {
  const result = await this.aggregate([
    { $match: { vendorId: mongoose.Types.ObjectId(vendorId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$subtotal" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        preparingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "preparing"] }, 1, 0] },
        },
      },
    },
  ]);
  return (
    result[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      preparingOrders: 0,
    }
  );
};

module.exports = mongoose.model("Order", orderSchema);
