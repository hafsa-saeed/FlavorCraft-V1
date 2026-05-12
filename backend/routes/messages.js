const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// POST /api/messages  { to: userId, body: string }
router.post("/", protect, async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body?.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Recipient (to) and message body are required.",
      });
    }

    if (String(to) === String(req.user._id)) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot message yourself.",
      });
    }

    const recipient = await User.findById(to).select("role status");
    if (!recipient) {
      return res.status(404).json({ status: "fail", message: "Recipient not found." });
    }

    const me = req.user.role;
    const them = recipient.role;
    const pairOk =
      (me === "customer" && them === "vendor") || (me === "vendor" && them === "customer");
    if (!pairOk) {
      return res.status(403).json({
        status: "fail",
        message: "Messages are only supported between customers and vendors.",
      });
    }

    if (them === "vendor" && recipient.status !== "approved") {
      return res.status(403).json({
        status: "fail",
        message: "That vendor is not available for messages.",
      });
    }

    const msg = await Message.create({
      from: req.user._id,
      to,
      body: body.trim(),
    });

    const populated = await Message.findById(msg._id)
      .populate("from", "name email role vendorProfile.shopName")
      .populate("to", "name email role vendorProfile.shopName");

    res.status(201).json({ status: "success", data: populated });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
});

// GET /api/messages/conversation/:userId — messages between me and :userId
router.get("/conversation/:userId", protect, async (req, res) => {
  try {
    const other = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(other)) {
      return res.status(400).json({ status: "fail", message: "Invalid user id." });
    }

    const list = await Message.find({
      $or: [
        { from: req.user._id, to: other },
        { from: other, to: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(300)
      .populate("from", "name email role vendorProfile.shopName")
      .populate("to", "name email role vendorProfile.shopName");

    await Message.updateMany(
      { from: other, to: req.user._id, read: false },
      { $set: { read: true } },
    );

    res.json({ status: "success", results: list.length, data: list });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
});

module.exports = router;
