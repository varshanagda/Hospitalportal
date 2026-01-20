const pool = require("../db");
const bcrypt = require("bcrypt");

/**
 * Create/Update doctor profile
 */
const createDoctorProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { specialization, qualification, experience_years, consultation_fee, bio } = req.body;
    const userId = req.user.id;

    if (!specialization) {
      return res.status(400).json({ message: "Specialization is required" });
    }

    await client.query('BEGIN');

    // Check if doctor profile exists
    const existingDoctor = await client.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [userId]
    );

    let result;
    if (existingDoctor.rows.length > 0) {
      // Update existing profile
      result = await client.query(
        `UPDATE doctors 
         SET specialization = $1,
             qualification = $2,
             experience_years = $3,
             consultation_fee = $4,
             bio = $5
         WHERE user_id = $6
         RETURNING *`,
        [specialization, qualification, experience_years, consultation_fee, bio, userId]
      );
    } else {
      // Create new profile (requires admin approval)
      result = await client.query(
        `INSERT INTO doctors 
         (user_id, specialization, qualification, experience_years, consultation_fee, bio, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, false)
         RETURNING *`,
        [userId, specialization, qualification, experience_years, consultation_fee, bio]
      );

      // Update user role to doctor
      await client.query(
        "UPDATE users SET role = 'doctor' WHERE id = $1",
        [userId]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: existingDoctor.rows.length > 0 
        ? "Doctor profile updated successfully"
        : "Doctor profile created successfully. Awaiting admin approval.",
      doctor: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Create doctor profile error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Get doctor profile
 */
const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT d.*, u.full_name, u.email, u.phone
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    return res.json({ doctor: result.rows[0] });

  } catch (error) {
    console.error("Get doctor profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all doctors (with optional filters)
 */
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, approved_only } = req.query;

    let query = `
      SELECT d.*, u.full_name, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (specialization) {
      query += ` AND d.specialization ILIKE $${params.length + 1}`;
      params.push(`%${specialization}%`);
    }

    if (approved_only === 'true') {
      query += ` AND d.is_approved = true`;
    }

    query += ` ORDER BY d.created_at DESC`;

    const result = await pool.query(query, params);

    return res.json({ doctors: result.rows });

  } catch (error) {
    console.error("Get all doctors error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get doctor by ID (public info)
 */
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT d.id, d.specialization, d.qualification, d.experience_years, 
              d.consultation_fee, d.bio, d.is_approved,
              u.full_name, u.email
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1 AND d.is_approved = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found or not approved" });
    }

    return res.json({ doctor: result.rows[0] });

  } catch (error) {
    console.error("Get doctor by ID error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Approve doctor (Admin only)
 */
const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    const result = await pool.query(
      `UPDATE doctors 
       SET is_approved = $1
       WHERE id = $2
       RETURNING *`,
      [is_approved, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.json({
      message: `Doctor ${is_approved ? 'approved' : 'disapproved'} successfully`,
      doctor: result.rows[0]
    });

  } catch (error) {
    console.error("Approve doctor error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get doctor statistics
 */
const getDoctorStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get doctor ID
    const doctorResult = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const doctorId = doctorResult.rows[0].id;

    // Get statistics
    const stats = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_appointments,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_appointments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_appointments,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_appointments,
        COUNT(*) as total_appointments
       FROM appointments
       WHERE doctor_id = $1`,
      [doctorId]
    );

    const slotStats = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE is_available = true) as available_slots,
        COUNT(*) as total_slots,
        SUM(current_bookings) as total_bookings
       FROM slots
       WHERE doctor_id = $1`,
      [doctorId]
    );

    return res.json({
      appointments: stats.rows[0],
      slots: slotStats.rows[0]
    });

  } catch (error) {
    console.error("Get doctor stats error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Create doctor (Admin only) - Creates both user and doctor profile
 */
const createDoctor = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, full_name, phone, specialization, qualification, experience_years, consultation_fee } = req.body;

    // Validation
    if (!email || !password || !full_name || !specialization) {
      return res.status(400).json({ message: "Email, password, full_name, and specialization are required" });
    }

    await client.query('BEGIN');

    // Check if user already exists
    const userExists = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await client.query(
      "INSERT INTO users (email, password, role, full_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [email, hashedPassword, 'doctor', full_name, phone]
    );

    const userId = userResult.rows[0].id;

    // Create doctor profile (auto-approved when created by admin)
    const doctorResult = await client.query(
      `INSERT INTO doctors 
       (user_id, specialization, qualification, experience_years, consultation_fee, is_approved)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [userId, specialization, qualification || null, experience_years || 0, consultation_fee || 0]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: "Doctor created successfully",
      doctor: {
        ...doctorResult.rows[0],
        email,
        full_name,
        phone
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Create doctor error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  createDoctorProfile,
  getDoctorProfile,
  getAllDoctors,
  getDoctorById,
  approveDoctor,
  getDoctorStats,
  createDoctor
};
