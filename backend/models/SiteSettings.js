const mongoose = require("mongoose");

/**
 * Singleton-style document for public-facing contact copy (admin-editable).
 */
const siteSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "global" },
    contactEmail: { type: String, default: "hello@flavorcraft.pk", trim: true },
    contactPhone: { type: String, default: "+92 300 FLAVOR (352867)", trim: true },
    contactPhoneHref: {
      type: String,
      default: "tel:+923003528676",
      trim: true,
    },
    officeAddress: {
      type: String,
      default: "Gulberg III, Lahore, Pakistan",
      trim: true,
    },
    officeHours: {
      type: String,
      default: "Mon–Sat: 9 AM – 6 PM PKT",
      trim: true,
    },
    responseNote: {
      type: String,
      default: "Response time: within 24 hours",
      trim: true,
    },
  },
  { collection: "sitesettings", minimize: false },
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
