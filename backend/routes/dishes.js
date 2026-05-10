const express = require("express");
const router = express.Router();
const Dish = require("../models/Dish");
const { protect, restrictTo } = require("../middleware/auth");

// All dish routes require a logged-in, approved vendor
router.use(protect, restrictTo("vendor"));

const requireApproved = (req, res, next) => {
  if (req.user.status !== "approved") {
    return res.status(403).json({
      status: "fail",
      message: "Your account must be approved before you can manage dishes.",
    });
  }
  next();
};
router.use(requireApproved);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dishes
// Fetch all dishes for the logged-in vendor
// Query: ?category=Desi&available=true&search=chicken
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = { vendorId: req.user._id };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.available)
      filter.isAvailable = req.query.available === "true";

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const dishes = await Dish.find(filter).sort("-createdAt");

    res.json({
      status: "success",
      count: dishes.length,
      dishes,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dishes/stats
// Aggregated stats for vendor dashboard header
// ─────────────────────────────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [total, available, byCategory] = await Promise.all([
      Dish.countDocuments({ vendorId: req.user._id }),
      Dish.countDocuments({ vendorId: req.user._id, isAvailable: true }),
      Dish.aggregate([
        { $match: { vendorId: req.user._id } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      status: "success",
      stats: { total, available, unavailable: total - available, byCategory },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dishes/:id
// Single dish (must belong to requesting vendor)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const dish = await Dish.findOne({
      _id: req.params.id,
      vendorId: req.user._id,
    });
    if (!dish)
      return res
        .status(404)
        .json({ status: "fail", message: "Dish not found." });
    res.json({ status: "success", dish });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/dishes
// Create a new dish
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      ingredients,
      nutrition,
    } = req.body;

    if (!name?.trim() || !price || !category) {
      return res.status(400).json({
        status: "fail",
        message: "Name, price, and category are required.",
      });
    }

    const dish = await Dish.create({
      name: name.trim(),
      description: description?.trim() || "",
      price: Number(price),
      category,
      image: image || "",
      ingredients: ingredients || [],
      nutrition: nutrition || {},
      vendorId: req.user._id,
    });

    res.status(201).json({
      status: "success",
      message: "Dish added to your menu!",
      dish,
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/dishes/:id
// Partial update (all fields optional)
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    const allowed = [
      "name",
      "description",
      "price",
      "category",
      "image",
      "ingredients",
      "nutrition",
      "isAvailable",
    ];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const dish = await Dish.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user._id },
      updates,
      { new: true, runValidators: true },
    );

    if (!dish)
      return res
        .status(404)
        .json({ status: "fail", message: "Dish not found." });

    res.json({ status: "success", message: "Dish updated.", dish });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/dishes/:id/toggle
// Quick availability toggle
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/toggle", async (req, res) => {
  try {
    const dish = await Dish.findOne({
      _id: req.params.id,
      vendorId: req.user._id,
    });
    if (!dish)
      return res
        .status(404)
        .json({ status: "fail", message: "Dish not found." });

    dish.isAvailable = !dish.isAvailable;
    await dish.save();

    res.json({
      status: "success",
      message: `Dish is now ${dish.isAvailable ? "available" : "unavailable"}.`,
      dish,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/dishes/:id
// Hard-delete a dish
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const dish = await Dish.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.user._id,
    });
    if (!dish)
      return res
        .status(404)
        .json({ status: "fail", message: "Dish not found." });
    res.json({ status: "success", message: "Dish removed from your menu." });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
