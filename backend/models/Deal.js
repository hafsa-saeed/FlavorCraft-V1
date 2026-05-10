const mongoose = require("mongoose");

const dealItemSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: [true, "Dish reference is required"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  { _id: false },
);

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Deal title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [400, "Description cannot exceed 400 characters"],
      default: "",
    },
    items: {
      type: [dealItemSchema],
      validate: {
        validator: (arr) => arr && arr.length > 0,
        message: "A deal must include at least one dish.",
      },
    },
    dealPrice: {
      type: Number,
      required: [true, "Deal price is required"],
      min: [0, "Deal price cannot be negative"],
    },
    // Stored for displaying "you save ₨X" badge
    originalPrice: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    image: { type: String, default: "" },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

dealSchema.index({ vendorId: 1, isActive: 1 });

dealSchema.virtual("savings").get(function () {
  return Math.max(0, this.originalPrice - this.dealPrice);
});
dealSchema.virtual("savingsPercent").get(function () {
  if (!this.originalPrice) return 0;
  return Math.round(
    ((this.originalPrice - this.dealPrice) / this.originalPrice) * 100,
  );
});

module.exports = mongoose.model("Deal", dealSchema);
