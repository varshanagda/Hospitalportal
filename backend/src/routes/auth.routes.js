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
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user
    const result = await pool.query(
      "INSERT INTO users (email, password, role, full_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, full_name",
      [email, hashedPassword, role, full_name, phone]
    );

    return res.status(201).json({ 
      message: "User registered successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
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

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate JWT
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
    return res.status(500).json({ message: "Server error" });
  }
});


router.get("/profile", authMiddleware, async (req, res) => {
  return res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = router;
