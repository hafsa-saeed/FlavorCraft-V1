const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── Vendor Application (submitted during onboarding) ─────────────────────────
const vendorApplicationSchema = new mongoose.Schema({
  kitchenName: { type: String, trim: true },
  city: { type: String, trim: true },
  cnic: { type: String, trim: true },
  businessScale: {
    type: String,
    enum: ["home_chef", "small_kitchen", "medium_kitchen", "professional"],
  },
  businessMotive: { type: String, trim: true },
  submittedAt: { type: Date, default: Date.now },
});

// ── Vendor Shop Profile (filled AFTER approval) ───────────────────────────────
const vendorProfileSchema = new mongoose.Schema({
  shopName: { type: String, trim: true, default: "" },
  bio: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
  phone: { type: String, trim: true, default: "" },
  coverImage: { type: String, default: "" }, // Cloudinary URL or local path
  profileImage: { type: String, default: "" }, // Cloudinary URL or local path
  cuisineTypes: { type: [String], default: [] }, // e.g. ["Pakistani", "BBQ"]
  isProfileComplete: { type: Boolean, default: false },
  completedAt: { type: Date },
});

// ── Main User Schema ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "customer";
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },

    /**
     * status lifecycle:
     *  not_applicable → customers & admins (no approval needed)
     *  pending        → vendor submitted application, awaiting admin decision
     *  approved       → admin approved; vendor may access dashboard
     *  rejected       → admin rejected; vendor cannot log in to dashboard
     */
    status: {
      type: String,
      enum: ["not_applicable", "pending", "approved", "rejected"],
      default: "not_applicable",
    },

    vendorApplication: vendorApplicationSchema,
    vendorProfile: vendorProfileSchema,

    adminNote: { type: String, trim: true },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true },
);

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.virtual("isApprovedVendor").get(function () {
  return this.role === "vendor" && this.status === "approved";
});

// Strip password from all JSON responses automatically
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
