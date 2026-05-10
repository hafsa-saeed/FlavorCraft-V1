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
