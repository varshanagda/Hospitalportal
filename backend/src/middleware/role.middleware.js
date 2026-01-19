const jwt = require("jsonwebtoken");
const pool = require("../db");

// Basic auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Role-based middleware factory
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!allowedRoles || allowedRoles.length === 0) {
        return res.status(500).json({ message: "Invalid role configuration" });
      }

      // Get full user data from database
      const result = await pool.query(
        "SELECT id, email, role FROM users WHERE id = $1",
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = result.rows[0];
      
      if (!user.role) {
        return res.status(500).json({ message: "User role not set" });
      }
      
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("database")) {
        return res.status(503).json({ message: "Service temporarily unavailable" });
      }
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
