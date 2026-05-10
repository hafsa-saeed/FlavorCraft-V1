const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, restrictTo } = require("../middleware/auth");

// ─── Helpers ────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

// ─── POST /api/auth/signup/customer ─────────────────────────────────────────
router.post("/signup/customer", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ status: "fail", message: "Email already in use." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "customer",
      status: "not_applicable",
    });

    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─── POST /api/auth/signup/vendor ────────────────────────────────────────────
// Step 1: Create vendor account (no application yet)
router.post("/signup/vendor", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email and password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ status: "fail", message: "Email already in use." });
    }

    const user = await User.create({
      email,
      password,
      role: "vendor",
      status: "pending", // Will remain pending until application + admin approval
    });

    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─── POST /api/auth/vendor/apply ─────────────────────────────────────────────
// Step 2: Submit vendor application form (requires auth token from step 1)
router.post(
  "/vendor/apply",
  protect,
  restrictTo("vendor"),
  async (req, res) => {
    try {
      const { kitchenName, city, cnic, businessScale, businessMotive } =
        req.body;

      if (!kitchenName || !city || !cnic || !businessScale || !businessMotive) {
        return res.status(400).json({
          status: "fail",
          message: "All application fields are required.",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          vendorApplication: {
            kitchenName,
            city,
            cnic,
            businessScale,
            businessMotive,
            submittedAt: new Date(),
          },
          status: "pending",
        },
        { new: true, runValidators: true },
      );

      res.status(200).json({
        status: "success",
        message:
          "Your application is under review. Our admin will notify you within 24-48 hours.",
        user,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid email or password." });
    }

    // Prevent unapproved vendors from logging in to dashboard
    if (user.role === "vendor" && user.status !== "approved") {
      const messages = {
        pending:
          "Your vendor application is still under review. Please wait 24-48 hours.",
        rejected: `Your application was rejected. Reason: ${user.adminNote || "Please contact support."}`,
        not_applicable: "Vendor account setup incomplete.",
      };
      return res.status(403).json({
        status: "fail",
        message: messages[user.status],
        vendorStatus: user.status,
      });
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.status(200).json({ status: "success", user: req.user });
});

module.exports = router;
