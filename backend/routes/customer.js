const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const Dish = require("../models/Dish");
const Deal = require("../models/Deal");
const SupportMessage = require("../models/SupportMessage");
const { protect, restrictTo, tryCustomer } = require("../middleware/auth");

// ═══════════════════════════════════════════════════════════════════════════
// Public browsing (no login required) — used by home feed, vendor page, customize
// ═══════════════════════════════════════════════════════════════════════════

router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid vendor id.",
      });
    }

    const vendor = await User.findOne({
      _id: vendorId,
      role: "vendor",
      status: "approved",
    }).select("vendorProfile vendorApplication email createdAt");

    if (!vendor) {
      return res.status(404).json({
        status: "fail",
        message: "Vendor not found or not approved.",
      });
    }

    const dishes = await Dish.find({
      vendorId: vendor._id,
      isAvailable: true,
    }).sort("-createdAt");

    const deals = await Deal.find({
      vendorId: vendor._id,
      isActive: true,
    })
      .populate("items.dish", "name price image category")
      .sort("-createdAt");

    const stats = {
      totalDishes: dishes.length,
      totalDeals: deals.length,
      rating: vendor.vendorProfile?.rating || 4.5,
      totalOrders: vendor.vendorProfile?.totalOrders || 0,
      totalReviews: vendor.vendorProfile?.totalReviews || 0,
    };

    res.json({
      status: "success",
      vendor,
      dishes,
      deals,
      stats,
    });
  } catch (err) {
    console.error("Get vendor profile error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

router.get("/vendors", async (req, res) => {
  try {
    const { city, cuisine, search } = req.query;

    const filter = {
      role: "vendor",
      status: "approved",
      "vendorProfile.isProfileComplete": true,
    };

    if (city) {
      filter["vendorProfile.city"] = new RegExp(city, "i");
    }

    if (cuisine) {
      filter["vendorProfile.cuisineTypes"] = cuisine;
    }

    if (search) {
      filter.$or = [
        { "vendorProfile.shopName": new RegExp(search, "i") },
        { "vendorProfile.bio": new RegExp(search, "i") },
      ];
    }

    const vendors = await User.find(filter)
      .select("vendorProfile vendorApplication email createdAt")
      .sort("-createdAt")
      .limit(50);

    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const dishCount = await Dish.countDocuments({
          vendorId: vendor._id,
          isAvailable: true,
        });

        return {
          ...vendor.toObject(),
          dishCount,
        };
      }),
    );

    res.json({
      status: "success",
      count: vendorsWithStats.length,
      vendors: vendorsWithStats,
    });
  } catch (err) {
    console.error("Get vendors error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

router.get("/dish/:dishId", tryCustomer, async (req, res) => {
  try {
    const { dishId } = req.params;

    const dish = await Dish.findOne({
      _id: dishId,
      isAvailable: true,
    }).populate("vendorId", "vendorProfile email");

    if (!dish) {
      return res.status(404).json({
        status: "fail",
        message: "Dish not found or unavailable.",
      });
    }

    let isFavorite = false;
    if (req.user?.favorites?.length) {
      isFavorite = req.user.favorites.some(
        (id) => id.toString() === dishId.toString(),
      );
    }

    res.json({
      status: "success",
      dish,
      isFavorite,
    });
  } catch (err) {
    console.error("Get dish error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Customer-only (authenticated)
// ═══════════════════════════════════════════════════════════════════════════
router.use(protect, restrictTo("customer"));

router.post("/favorites/toggle", async (req, res) => {
  try {
    const { dishId } = req.body;

    if (!dishId) {
      return res.status(400).json({
        status: "fail",
        message: "Dish ID is required.",
      });
    }

    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({
        status: "fail",
        message: "Dish not found.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.findIndex(
      (id) => id.toString() === dishId.toString(),
    );

    let action;
    if (index !== -1) {
      user.favorites.splice(index, 1);
      action = "removed";
    } else {
      user.favorites.push(dishId);
      action = "added";
    }

    await user.save();

    res.json({
      status: "success",
      message: `Dish ${action} ${action === "added" ? "to" : "from"} favorites.`,
      favorites: user.favorites,
      isFavorite: action === "added",
    });
  } catch (err) {
    console.error("Toggle favorites error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

router.get("/favorites", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      match: { isAvailable: true },
      populate: {
        path: "vendorId",
        select: "vendorProfile",
      },
    });

    const favorites = (user.favorites || []).filter(Boolean);

    res.json({
      status: "success",
      count: favorites.length,
      favorites,
    });
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json({
      status: "success",
      user,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

router.patch("/profile", async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "address"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No valid fields to update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    res.json({
      status: "success",
      message: "Profile updated successfully.",
      user,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
});

// ── Contact / complaints to platform admin (customer) ───────────────────────

router.post("/support", async (req, res) => {
  try {
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();
    if (!message) {
      return res.status(400).json({
        status: "fail",
        message: "Message is required.",
      });
    }
    const u = await User.findById(req.user._id).select("name email");
    const doc = await SupportMessage.create({
      name: String(u.name || u.email || "Customer").slice(0, 120),
      email: String(u.email || "").toLowerCase().slice(0, 200),
      subject: subject.slice(0, 200),
      message: message.slice(0, 5000),
      fromRole: "customer",
      userId: req.user._id,
      status: "received",
      read: false,
    });
    res.status(201).json({ status: "success", data: doc });
  } catch (err) {
    console.error("Customer support error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/support-tickets", async (req, res) => {
  try {
    const tickets = await SupportMessage.find({ userId: req.user._id })
      .sort("-createdAt")
      .limit(100)
      .lean();
    res.json({ status: "success", count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
