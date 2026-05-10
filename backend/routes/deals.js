const express = require("express");
const router = express.Router();
const Deal = require("../models/Deal");
const Dish = require("../models/Dish");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("vendor"));

const requireApproved = (req, res, next) => {
  if (req.user.status !== "approved")
    return res
      .status(403)
      .json({ status: "fail", message: "Account not yet approved." });
  next();
};
router.use(requireApproved);

// ── GET /api/deals ────────────────────────────────────────────────────────────
// routes/deals.js mein GET "/" ko replace karein
router.get("/", async (req, res) => {
  try {
    // Model mein vendorId hai, isliye yahan vendorId hi likhna hai
    const deals = await Deal.find({ vendorId: req.user._id })
      .populate("items.dish")
      .sort("-createdAt");

    // Agar deals khali hain toh [] bhejien
    res.json({
      status: "success",
      deals: deals || [],
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ── POST /api/deals ───────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, description, items, dealPrice, expiresAt, image } = req.body;

    if (!title?.trim() || !items?.length || !dealPrice) {
      return res.status(400).json({
        status: "fail",
        message: "Title, at least one dish item, and deal price are required.",
      });
    }

    // Verify all dishes belong to this vendor and compute original price
    const dishIds = items.map((i) => i.dish);
    const dishes = await Dish.find({
      _id: { $in: dishIds },
      vendorId: req.user._id,
    });

    if (dishes.length !== new Set(dishIds.map(String)).size) {
      return res.status(400).json({
        status: "fail",
        message: "One or more dishes are invalid or don't belong to your menu.",
      });
    }

    const dishMap = Object.fromEntries(
      dishes.map((d) => [d._id.toString(), d]),
    );
    const originalPrice = items.reduce((sum, item) => {
      const dish = dishMap[item.dish.toString()];
      return sum + (dish ? dish.price * (item.quantity || 1) : 0);
    }, 0);

    const deal = await Deal.create({
      title: title.trim(),
      description: description?.trim() || "",
      items,
      dealPrice: Number(dealPrice),
      originalPrice,
      expiresAt: expiresAt || null,
      image: image || "",
      vendorId: req.user._id,
    });

    const populated = await deal.populate(
      "items.dish",
      "name price image category",
    );
    res
      .status(201)
      .json({ status: "success", message: "Deal created!", deal: populated });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

// ── PATCH /api/deals/:id ──────────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    const allowed = [
      "title",
      "description",
      "items",
      "dealPrice",
      "expiresAt",
      "isActive",
      "image",
    ];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    // Recompute originalPrice if items changed
    if (updates.items) {
      const dishIds = updates.items.map((i) => i.dish);
      const dishes = await Dish.find({
        _id: { $in: dishIds },
        vendorId: req.user._id,
      });
      const dishMap = Object.fromEntries(
        dishes.map((d) => [d._id.toString(), d]),
      );
      updates.originalPrice = updates.items.reduce((sum, item) => {
        const dish = dishMap[item.dish?.toString?.() || item.dish];
        return sum + (dish ? dish.price * (item.quantity || 1) : 0);
      }, 0);
    }

    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user._id },
      updates,
      { new: true, runValidators: true },
    ).populate("items.dish", "name price image category");

    if (!deal)
      return res
        .status(404)
        .json({ status: "fail", message: "Deal not found." });
    res.json({ status: "success", deal });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

// ── PATCH /api/deals/:id/toggle ───────────────────────────────────────────────
router.patch("/:id/toggle", async (req, res) => {
  try {
    const deal = await Deal.findOne({
      _id: req.params.id,
      vendorId: req.user._id,
    });
    if (!deal)
      return res
        .status(404)
        .json({ status: "fail", message: "Deal not found." });
    deal.isActive = !deal.isActive;
    await deal.save();
    res.json({ status: "success", deal });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ── DELETE /api/deals/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.user._id,
    });
    if (!deal)
      return res
        .status(404)
        .json({ status: "fail", message: "Deal not found." });
    res.json({ status: "success", message: "Deal removed." });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
