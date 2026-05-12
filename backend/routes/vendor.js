const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const SupportMessage = require("../models/SupportMessage");
const { protect, restrictTo } = require("../middleware/auth");

// All routes require an approved vendor JWT
router.use(protect, restrictTo("vendor"));

// GET /api/vendor/orders — same scope as GET /api/orders/vendor-orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({ vendorId: req.user._id }).sort(
      "-createdAt",
    );
    res.status(200).json({ status: "success", data: orders });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
});

const requireApproved = (req, res, next) => {
  if (req.user.status !== "approved") {
    return res.status(403).json({
      status: "fail",
      message:
        "Your account is pending approval. You cannot edit your profile yet.",
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendor/profile
// Return the current vendor's full profile
// ─────────────────────────────────────────────────────────────────────────────
router.get("/profile", async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("-password");
    res.json({ status: "success", vendor });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendor/profile/setup
// Initial profile completion (unlocks dashboard features)
// Body: { shopName, bio, city, phone, cuisineTypes[], coverImage?, profileImage? }
// ─────────────────────────────────────────────────────────────────────────────
router.put("/profile/setup", requireApproved, async (req, res) => {
  try {
    const {
      shopName,
      bio,
      city,
      phone,
      cuisineTypes,
      coverImage,
      profileImage,
    } = req.body;

    // Validate required fields
    if (!shopName?.trim() || !bio?.trim() || !city?.trim()) {
      return res.status(400).json({
        status: "fail",
        message:
          "Shop name, bio, and city are required to complete your profile.",
      });
    }

    const updatedProfile = {
      "vendorProfile.shopName": shopName.trim(),
      "vendorProfile.bio": bio.trim(),
      "vendorProfile.city": city.trim(),
      "vendorProfile.phone": phone?.trim() || "",
      "vendorProfile.cuisineTypes": Array.isArray(cuisineTypes)
        ? cuisineTypes
        : [],
      "vendorProfile.isProfileComplete": true,
      "vendorProfile.completedAt": new Date(),
    };

    // Only update image fields if URLs are provided (prevents clearing existing ones)
    if (coverImage) updatedProfile["vendorProfile.coverImage"] = coverImage;
    if (profileImage)
      updatedProfile["vendorProfile.profileImage"] = profileImage;

    const vendor = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedProfile },
      { new: true, runValidators: true },
    ).select("-password");

    res.json({
      status: "success",
      message: "Profile setup complete! You can now start adding your dishes.",
      vendor,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/vendor/profile
// Partial update of any profile fields after initial setup
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/profile", requireApproved, async (req, res) => {
  try {
    const allowedFields = [
      "shopName",
      "bio",
      "city",
      "phone",
      "cuisineTypes",
      "coverImage",
      "profileImage",
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[`vendorProfile.${field}`] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No valid fields provided for update.",
      });
    }

    const vendor = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    res.json({
      status: "success",
      message: "Profile updated successfully.",
      vendor,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// POST /api/vendor/support — complaint / message to platform admin
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
    const u = await User.findById(req.user._id).select("email vendorProfile");
    const shop = u.vendorProfile?.shopName || "Kitchen";
    const doc = await SupportMessage.create({
      name: shop.slice(0, 120),
      email: String(u.email || "").toLowerCase().slice(0, 200),
      subject: subject.slice(0, 200),
      message: message.slice(0, 5000),
      fromRole: "vendor",
      userId: req.user._id,
      status: "received",
      read: false,
    });
    res.status(201).json({ status: "success", data: doc });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// GET /api/vendor/support-tickets — vendor's messages to admin + status
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
