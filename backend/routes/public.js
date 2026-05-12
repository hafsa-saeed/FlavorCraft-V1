const express = require("express");
const router = express.Router();
const Dish = require("../models/Dish");
const User = require("../models/User");
const Deal = require("../models/Deal");
const SiteSettings = require("../models/SiteSettings");
const SupportMessage = require("../models/SupportMessage");
const { tryOptionalAuth } = require("../middleware/auth");

// POST /api/public/contact — guests (or unrecognized tokens) reach admin inbox
router.post("/contact", tryOptionalAuth, async (req, res) => {
  try {
    let name = String(req.body.name || "").trim();
    let email = String(req.body.email || "").trim().toLowerCase();
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();

    let fromRole = "guest";
    let userId = null;
    const ou = req.optionalUser;
    if (ou) {
      userId = ou._id;
      if (ou.role === "vendor") fromRole = "vendor";
      else if (ou.role === "customer") fromRole = "customer";
      if (!name) name = String(ou.name || "").trim() || ou.email?.split("@")[0] || "User";
      if (!email) email = String(ou.email || "").trim().toLowerCase();
    }

    if (!name || !email || !message) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and message are required.",
      });
    }

    const doc = await SupportMessage.create({
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      subject: subject.slice(0, 200),
      message: message.slice(0, 5000),
      fromRole,
      userId,
      status: "received",
      read: false,
    });
    res.status(201).json({ status: "success", data: doc });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// GET /api/public/site-settings — contact strip (admin-editable)
router.get("/site-settings", async (req, res) => {
  try {
    let doc = await SiteSettings.findById("global");
    if (!doc) {
      doc = await SiteSettings.create({ _id: "global" });
    }
    res.json({ status: "success", settings: doc });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// GET /api/public/feed?page=1&limit=20&category=Desi&search=...
router.get("/feed", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
    const skip = (page - 1) * limit;

    const approvedVendorIds = await User.find({
      role: "vendor",
      status: "approved",
    }).distinct("_id");

    if (!approvedVendorIds.length) {
      return res.json({
        status: "success",
        dishes: [],
        deals: [],
        page: 1,
        pages: 1,
        total: 0,
      });
    }

    const filter = {
      isAvailable: true,
      vendorId: { $in: approvedVendorIds },
    };

    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    const hasTextSearch = Boolean(req.query.search?.trim());
    if (hasTextSearch) {
      filter.$text = { $search: req.query.search.trim() };
    }

    const projection = hasTextSearch ? { score: { $meta: "textScore" } } : {};
    let dishQuery = Dish.find(filter, projection).populate({
      path: "vendorId",
      select: "vendorProfile status role",
    });

    if (hasTextSearch) {
      dishQuery = dishQuery.sort({ score: { $meta: "textScore" } });
    } else {
      dishQuery = dishQuery.sort("-createdAt");
    }

    const [total, dishesRaw, dealsRaw] = await Promise.all([
      Dish.countDocuments(filter),
      dishQuery.skip(skip).limit(limit),
      Deal.find({ isActive: true, vendorId: { $in: approvedVendorIds } })
        .populate({
          path: "vendorId",
          select: "vendorProfile status role",
        })
        .populate("items.dish", "name price image category")
        .sort("-createdAt")
        .limit(24),
    ]);

    const dishes = dishesRaw.filter((d) => d.vendorId);
    const deals = (dealsRaw || []).filter((d) => d.vendorId);

    const pages = Math.max(1, Math.ceil(total / limit));

    res.json({
      status: "success",
      dishes,
      deals,
      page,
      pages,
      total,
    });
  } catch (err) {
    console.error("Public feed error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// GET /api/public/reviews/:vendorId — placeholder until Review model exists
router.get("/reviews/:vendorId", async (req, res) => {
  try {
    const vendor = await User.findOne({
      _id: req.params.vendorId,
      role: "vendor",
      status: "approved",
    }).select("_id");
    if (!vendor) {
      return res.status(404).json({ status: "fail", message: "Vendor not found." });
    }
    res.json({ status: "success", reviews: [] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
