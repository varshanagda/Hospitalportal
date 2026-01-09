const jwt = require("jsonwebtoken");
const pool = require("../db");

// Basic auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role-based middleware factory
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Get full user data from database
      const result = await pool.query(
        "SELECT id, email, role FROM users WHERE id = $1",
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = result.rows[0];
      
      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: "Access denied. Insufficient permissions.",
          requiredRole: allowedRoles,
          userRole: user.role
        });
      }

      // Attach full user data to request
      req.user = user;
      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};

// Specific role middlewares
const requireDoctor = requireRole('doctor', 'admin');
const requireAdmin = requireRole('admin');
const requireUser = requireRole('user', 'doctor', 'admin');

module.exports = {
  authMiddleware,
  requireRole,
  requireDoctor,
  requireAdmin,
  requireUser
};
