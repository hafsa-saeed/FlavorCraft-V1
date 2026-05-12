const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const SupportMessage = require("../models/SupportMessage");
const SiteSettings = require("../models/SiteSettings");
const { protect, restrictTo } = require("../middleware/auth");

// Every route in this file requires admin auth
router.use(protect, restrictTo("admin"));

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// Dashboard summary counts
// ─────────────────────────────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 86400000);
    const [pending, approved, rejected, customers, orderAgg, unreadContact] =
      await Promise.all([
        User.countDocuments({ role: "vendor", status: "pending" }),
        User.countDocuments({ role: "vendor", status: "approved" }),
        User.countDocuments({ role: "vendor", status: "rejected" }),
        User.countDocuments({ role: "customer" }),
        Order.aggregate([
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: null,
              ordersLast30: { $sum: 1 },
              revenueLast30: { $sum: "$totalAmount" },
            },
          },
        ]),
        SupportMessage.countDocuments({ read: false }),
      ]);

    const o = orderAgg[0] || { ordersLast30: 0, revenueLast30: 0 };

    res.json({
      status: "success",
      stats: {
        pending,
        approved,
        rejected,
        customers,
        totalVendors: pending + approved + rejected,
        ordersLast30: o.ordersLast30 || 0,
        revenueLast30: Math.round(Number(o.revenueLast30) || 0),
        unreadContactMessages: unreadContact,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// GET /api/admin/contact-messages — public contact form submissions
router.get("/contact-messages", async (req, res) => {
  try {
    const limit = Math.min(500, Math.max(1, parseInt(String(req.query.limit), 10) || 100));
    const messages = await SupportMessage.find()
      .sort("-createdAt")
      .limit(limit)
      .lean();
    res.json({ status: "success", count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

const SUPPORT_STATUSES = new Set([
  "received",
  "in_progress",
  "resolved",
  "closed",
]);

// PATCH /api/admin/contact-messages/:id — status + admin reply note + read
router.patch("/contact-messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "fail", message: "Invalid id." });
    }
    const updates = {};
    if (req.body.status !== undefined) {
      if (!SUPPORT_STATUSES.has(String(req.body.status))) {
        return res.status(400).json({ status: "fail", message: "Invalid status." });
      }
      updates.status = req.body.status;
    }
    if (req.body.adminNote !== undefined) {
      updates.adminNote = String(req.body.adminNote).slice(0, 2000);
    }
    if (req.body.read !== undefined) {
      updates.read = Boolean(req.body.read);
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Provide status, adminNote, and/or read.",
      });
    }
    const doc = await SupportMessage.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();
    if (!doc) {
      return res.status(404).json({ status: "fail", message: "Message not found." });
    }
    res.json({ status: "success", data: doc });
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

// PATCH /api/admin/site-settings — public contact strip (email, phone, address…)
router.patch("/site-settings", async (req, res) => {
  try {
    const allowed = [
      "contactEmail",
      "contactPhone",
      "contactPhoneHref",
      "officeAddress",
      "officeHours",
      "responseNote",
    ];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) {
        updates[k] = String(req.body[k]).trim().slice(0, 500);
      }
    });
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No valid fields to update.",
      });
    }
    const doc = await SiteSettings.findOneAndUpdate(
      { _id: "global" },
      { $set: updates },
      { new: true, upsert: true },
    );
    res.json({ status: "success", settings: doc });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
