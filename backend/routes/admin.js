const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, restrictTo } = require("../middleware/auth");

// Every route in this file requires admin auth
router.use(protect, restrictTo("admin"));

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// Dashboard summary counts
// ─────────────────────────────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [pending, approved, rejected, customers] = await Promise.all([
      User.countDocuments({ role: "vendor", status: "pending" }),
      User.countDocuments({ role: "vendor", status: "approved" }),
      User.countDocuments({ role: "vendor", status: "rejected" }),
      User.countDocuments({ role: "customer" }),
    ]);

    res.json({
      status: "success",
      stats: {
        pending,
        approved,
        rejected,
        customers,
        totalVendors: pending + approved + rejected,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/vendors
// List vendors — optional ?status=pending|approved|rejected  ?search=query
// ─────────────────────────────────────────────────────────────────────────────
router.get("/vendors", async (req, res) => {
  try {
    const filter = { role: "vendor" };
    if (req.query.status) filter.status = req.query.status;

    // Basic text search on kitchen name / email
    if (req.query.search) {
      const re = new RegExp(req.query.search, "i");
      filter.$or = [
        { email: re },
        { "vendorApplication.kitchenName": re },
        { "vendorApplication.city": re },
      ];
    }

    const vendors = await User.find(filter)
      .select("-password")
      .sort("-createdAt");

    res.json({ status: "success", count: vendors.length, vendors });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/vendors/:id
// Single vendor detail
// ─────────────────────────────────────────────────────────────────────────────
router.get("/vendors/:id", async (req, res) => {
  try {
    const vendor = await User.findOne({
      _id: req.params.id,
      role: "vendor",
    }).select("-password");
    if (!vendor)
      return res
        .status(404)
        .json({ status: "fail", message: "Vendor not found." });
    res.json({ status: "success", vendor });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/vendors/:id/approve
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/vendors/:id/approve", async (req, res) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: "vendor" },
      {
        status: "approved",
        approvedAt: new Date(),
        adminNote: "",
        // Initialise an empty vendorProfile so the vendor can fill it in
        $setOnInsert: {},
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!vendor)
      return res
        .status(404)
        .json({ status: "fail", message: "Vendor not found." });

    // TODO: fire approval email here (nodemailer / SendGrid)

    res.json({
      status: "success",
      message: `${vendor.email} has been approved. They can now set up their shop profile.`,
      vendor,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/vendors/:id/reject
// Body: { reason?: string }
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/vendors/:id/reject", async (req, res) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: "vendor" },
      {
        status: "rejected",
        rejectedAt: new Date(),
        adminNote:
          req.body.reason?.trim() ||
          "Application did not meet our requirements.",
      },
      { new: true },
    ).select("-password");

    if (!vendor)
      return res
        .status(404)
        .json({ status: "fail", message: "Vendor not found." });

    // TODO: fire rejection email here

    res.json({
      status: "success",
      message: `${vendor.email} has been rejected.`,
      vendor,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/vendors/:id
// Hard-delete a vendor account
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/vendors/:id", async (req, res) => {
  try {
    const vendor = await User.findOneAndDelete({
      _id: req.params.id,
      role: "vendor",
    });
    if (!vendor)
      return res
        .status(404)
        .json({ status: "fail", message: "Vendor not found." });
    res.json({
      status: "success",
      message: "Vendor account permanently deleted.",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
