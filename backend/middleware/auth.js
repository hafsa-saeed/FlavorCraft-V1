const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── protect ─────────────────────────────────────────────────────────────────
// Validates JWT and attaches req.user
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res
        .status(401)
        .json({ status: "fail", message: "You are not logged in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ status: "fail", message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ status: "fail", message: "Invalid or expired token." });
  }
};

// ─── tryOptionalAuth ─────────────────────────────────────────────────────────
/** Optional JWT: sets req.optionalUser (any role) or leaves null — never sends 401. */
exports.tryOptionalAuth = async (req, res, next) => {
  req.optionalUser = null;
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "name email role vendorProfile",
    );
    if (user) req.optionalUser = user;
  } catch {
    /* invalid / expired token — treat as anonymous */
  }
  next();
};

// ─── tryCustomer ─────────────────────────────────────────────────────────────
// If a valid Bearer token belongs to a customer, sets req.user (minimal fields).
// Otherwise continues without req.user — for optional auth on public routes.
exports.tryCustomer = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role favorites");
    if (user && user.role === "customer") req.user = user;
  } catch {
    // treat as guest
  }
  next();
};

// ─── restrictTo ──────────────────────────────────────────────────────────────
// Role-based access control
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};
