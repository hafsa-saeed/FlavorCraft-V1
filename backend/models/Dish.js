const mongoose = require("mongoose");

// ── Ingredient sub-schema (Customization Engine) ──────────────────────────────
const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ingredient name is required"],
      trim: true,
    },
    extraPrice: {
      type: Number,
      default: 0,
      min: [0, "Extra price cannot be negative"],
    },
    isRemovable: {
      type: Boolean,
      default: true, // Customer can ask to remove it (e.g. no onions)
    },
  },
  { _id: true },
);

// ── Nutrition sub-schema (Nutrition Tracker) ──────────────────────────────────
const nutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 0, min: 0 }, // kcal
    protein: { type: Number, default: 0, min: 0 }, // grams
    fats: { type: Number, default: 0, min: 0 }, // grams
    carbs: { type: Number, default: 0, min: 0 }, // grams
  },
  { _id: false },
);

// ── Main Dish Schema ──────────────────────────────────────────────────────────
const dishSchema = new mongoose.Schema(
  {
    // ── Core fields ───────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Dish name is required"],
      trim: true,
      maxlength: [120, "Dish name cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [600, "Description cannot exceed 600 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Desi",
        "BBQ & Grill",
        "Fast Food",
        "Biryani",
        "Chinese",
        "Continental",
        "Seafood",
        "Desserts",
        "Beverages",
        "Breakfast",
        "Healthy",
        "Vegan",
        "Baked Goods",
        "Other",
      ],
    },

    // ── Image ─────────────────────────────────────────────────────────────────
    // Store as a URL string (Cloudinary, AWS S3, or base64 for dev)
    image: {
      type: String,
      default: "",
    },

    // ── Customization Engine ──────────────────────────────────────────────────
    ingredients: {
      type: [ingredientSchema],
      default: [],
    },

    // ── Nutrition Tracker ─────────────────────────────────────────────────────
    nutrition: {
      type: nutritionSchema,
      default: () => ({}),
    },

    // ── Availability ──────────────────────────────────────────────────────────
    isAvailable: {
      type: Boolean,
      default: true, // Vendor can toggle a dish off without deleting it
    },

    // ── Linked vendor ─────────────────────────────────────────────────────────
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor ID is required"],
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
dishSchema.index({ vendorId: 1, category: 1 });
dishSchema.index({ vendorId: 1, isAvailable: 1 });
dishSchema.index({ name: "text", description: "text" }); // text search

// ── Virtual: total max price (base + all extras) ──────────────────────────────
dishSchema.virtual("maxPrice").get(function () {
  const extras = this.ingredients.reduce(
    (sum, i) => sum + (i.extraPrice || 0),
    0,
  );
  return this.price + extras;
});

module.exports = mongoose.model("Dish", dishSchema);
