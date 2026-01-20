const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * POST /auth/register
 * body: { email, password, role, full_name, phone }
 */
router.post("/register", async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, role = 'user', full_name, phone } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validate role
    if (!['user', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 2. Check if user exists
    const userExists = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    await client.query('BEGIN');

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user
    const result = await client.query(
      "INSERT INTO users (email, password, role, full_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, full_name",
      [email, hashedPassword, role, full_name, phone]
    );

    if (!result.rows || result.rows.length === 0 || !result.rows[0].id) {
      await client.query('ROLLBACK');
      return res.status(500).json({ message: "Failed to create user" });
    }

    const userId = result.rows[0].id;

    // 5. If role is doctor, automatically create a basic doctor profile
    // Auto-approve self-registered doctors so they can use doctor features immediately
    if (role === 'doctor') {
      await client.query(
        `INSERT INTO doctors (user_id, specialization, is_approved) 
         VALUES ($1, $2, true)`,
        [userId, 'General Practice'] // Default specialization, can be updated later
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({ 
      message: "User registered successfully",
      user: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {
      // Ignore rollback errors
    });
    console.error("Register error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Don't expose internal error details to client
    if (errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint")) {
      return res.status(409).json({ message: "User already exists" });
    }
    if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("database")) {
      return res.status(503).json({ message: "Service temporarily unavailable" });
    }
    
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

/**
 * POST /auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (!user?.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (!user.id || !user.email || !user.role) {
      return res.status(500).json({ message: "Invalid user data" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    // Don't expose internal error details to client
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("database")) {
      return res.status(503).json({ message: "Service temporarily unavailable" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});


router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get fresh user data from database
    const result = await pool.query(
      "SELECT id, email, role, full_name, phone FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile retrieved successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("database")) {
      return res.status(503).json({ message: "Service temporarily unavailable" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
