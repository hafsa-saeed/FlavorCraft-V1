const mongoose = require("mongoose");

/**
 * Contact / complaints to platform admin (separate from user-to-user chat).
 * Customers & vendors submit; admin updates status + adminNote.
 */
const supportMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: "", trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },

    fromRole: {
      type: String,
      enum: ["guest", "customer", "vendor"],
      default: "guest",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["received", "in_progress", "resolved", "closed"],
      default: "received",
      index: true,
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

supportMessageSchema.index({ createdAt: -1 });
supportMessageSchema.index({ read: 1, createdAt: -1 });
supportMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SupportMessage", supportMessageSchema);
