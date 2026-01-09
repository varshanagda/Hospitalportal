const pool = require("../db");

/**
 * Create time slots (Doctor only)
 */
const createSlot = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { slot_date, start_time, end_time, max_bookings = 1 } = req.body;
    const userId = req.user.id;

    // Validation
    if (!slot_date || !start_time || !end_time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    await client.query('BEGIN');

    // Get doctor ID
    const doctorResult = await client.query(
      "SELECT id, is_approved FROM doctors WHERE user_id = $1",
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const doctor = doctorResult.rows[0];

    if (!doctor.is_approved) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: "Doctor profile not approved yet" });
    }

    // Check for conflicting slots
    const conflictCheck = await client.query(
      `SELECT id FROM slots 
       WHERE doctor_id = $1 AND slot_date = $2 
       AND (
         (start_time <= $3 AND end_time > $3) OR
         (start_time < $4 AND end_time >= $4) OR
         (start_time >= $3 AND end_time <= $4)
       )`,
      [doctor.id, slot_date, start_time, end_time]
    );

    if (conflictCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        message: "Slot conflicts with existing time slot" 
      });
    }

    // Create slot
    const result = await client.query(
      `INSERT INTO slots (doctor_id, slot_date, start_time, end_time, max_bookings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [doctor.id, slot_date, start_time, end_time, max_bookings]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: "Slot created successfully",
      slot: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Create slot error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Get all slots for logged-in doctor
 */
const getDoctorSlots = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, status } = req.query;

    // Get doctor ID
    const doctorResult = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const doctorId = doctorResult.rows[0].id;

    let query = `
      SELECT s.*, 
             COUNT(a.id) as total_appointments
      FROM slots s
      LEFT JOIN appointments a ON s.id = a.slot_id AND a.status != 'cancelled'
      WHERE s.doctor_id = $1
    `;
    const params = [doctorId];

    if (date) {
      query += ` AND s.slot_date = $${params.length + 1}`;
      params.push(date);
    }

    if (status) {
      query += ` AND s.is_available = $${params.length + 1}`;
      params.push(status === 'available');
    }

    query += ` GROUP BY s.id ORDER BY s.slot_date, s.start_time`;

    const result = await pool.query(query, params);

    return res.json({ slots: result.rows });

  } catch (error) {
    console.error("Get doctor slots error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get available slots (for users to book)
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctor_id, date, specialization } = req.query;

    let query = `
      SELECT s.*, 
             d.id as doctor_id,
             u.full_name as doctor_name,
             d.specialization,
             d.consultation_fee,
             d.qualification
      FROM slots s
      JOIN doctors d ON s.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE s.is_available = true 
        AND s.current_bookings < s.max_bookings
        AND s.slot_date >= CURRENT_DATE
        AND d.is_approved = true
    `;
    const params = [];

    if (doctor_id) {
      query += ` AND d.id = $${params.length + 1}`;
      params.push(doctor_id);
    }

    if (date) {
      query += ` AND s.slot_date = $${params.length + 1}`;
      params.push(date);
    }

    if (specialization) {
      query += ` AND d.specialization ILIKE $${params.length + 1}`;
      params.push(`%${specialization}%`);
    }

    query += ` ORDER BY s.slot_date, s.start_time`;

    const result = await pool.query(query, params);

    return res.json({ slots: result.rows });

  } catch (error) {
    console.error("Get available slots error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update slot availability
 */
const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available, max_bookings } = req.body;
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

    // Update slot
    const result = await pool.query(
      `UPDATE slots 
       SET is_available = COALESCE($1, is_available),
           max_bookings = COALESCE($2, max_bookings),
           version = version + 1
       WHERE id = $3 AND doctor_id = $4
       RETURNING *`,
      [is_available, max_bookings, id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Slot not found or unauthorized" });
    }

    return res.json({
      message: "Slot updated successfully",
      slot: result.rows[0]
    });

  } catch (error) {
    console.error("Update slot error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete slot (only if no bookings)
 */
const deleteSlot = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Get doctor ID
    const doctorResult = await client.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const doctorId = doctorResult.rows[0].id;

    // Check for existing bookings
    const bookingCheck = await client.query(
      "SELECT COUNT(*) as count FROM appointments WHERE slot_id = $1 AND status != 'cancelled'",
      [id]
    );

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: "Cannot delete slot with active bookings" 
      });
    }

    // Delete slot
    const result = await client.query(
      "DELETE FROM slots WHERE id = $1 AND doctor_id = $2 RETURNING id",
      [id, doctorId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Slot not found or unauthorized" });
    }

    await client.query('COMMIT');

    return res.json({ message: "Slot deleted successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Delete slot error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  createSlot,
  getDoctorSlots,
  getAvailableSlots,
  updateSlot,
  deleteSlot
};
