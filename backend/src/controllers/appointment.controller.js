const pool = require("../db");
const emailService = require("../services/email.service");

/**
 * Book an appointment (User)
 * Implements optimistic locking and transaction handling
 */
const bookAppointment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { slot_id, reason } = req.body;
    const userId = req.user.id;

    if (!slot_id) {
      return res.status(400).json({ message: "Slot ID is required" });
    }

    await client.query('BEGIN');

    // Get slot with optimistic locking (FOR UPDATE)
    const slotResult = await client.query(
      `SELECT s.*, s.version as slot_version,
              d.id as doctor_id, d.user_id as doctor_user_id,
              u.full_name as doctor_name, u.email as doctor_email,
              d.specialization
       FROM slots s
       JOIN doctors d ON s.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE s.id = $1
       FOR UPDATE`,
      [slot_id]
    );

    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Slot not found" });
    }

    const slot = slotResult.rows[0];

    // Check slot availability
    if (!slot.is_available || slot.current_bookings >= slot.max_bookings) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        message: "Slot is no longer available" 
      });
    }

    // Check if slot is in the past
    const slotDateTime = new Date(`${slot.slot_date} ${slot.start_time}`);
    if (slotDateTime < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Cannot book past slots" });
    }

    // Check if user already has appointment in this slot
    const existingBooking = await client.query(
      `SELECT id FROM appointments 
       WHERE user_id = $1 AND slot_id = $2 AND status NOT IN ('cancelled')`,
      [userId, slot_id]
    );

    if (existingBooking.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        message: "You already have an appointment in this slot" 
      });
    }

    // Create appointment
    const appointmentResult = await client.query(
      `INSERT INTO appointments 
       (user_id, doctor_id, slot_id, appointment_date, start_time, end_time, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [userId, slot.doctor_id, slot_id, slot.slot_date, slot.start_time, slot.end_time, reason]
    );

    const appointment = appointmentResult.rows[0];

    // Update slot bookings count (with version check for optimistic locking)
    const updateResult = await client.query(
      `UPDATE slots 
       SET current_bookings = current_bookings + 1,
           version = version + 1
       WHERE id = $1 AND version = $2
       RETURNING *`,
      [slot_id, slot.slot_version]
    );

    if (updateResult.rows.length === 0) {
      // Version mismatch - concurrent booking detected
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        message: "Slot was just booked by someone else. Please try again." 
      });
    }

    // Log appointment history
    await client.query(
      `INSERT INTO appointment_history 
       (appointment_id, action, new_status, changed_by)
       VALUES ($1, 'created', 'pending', $2)`,
      [appointment.id, userId]
    );

    await client.query('COMMIT');

    // Get user details for email
    const userResult = await pool.query(
      "SELECT full_name, email FROM users WHERE id = $1",
      [userId]
    );
    const user = userResult.rows[0];

    // Send confirmation email
    await emailService.sendAppointmentConfirmation(user.email, {
      userName: user.full_name || user.email,
      doctorName: slot.doctor_name,
      specialization: slot.specialization,
      date: slot.slot_date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      status: 'pending'
    });

    // Notify doctor
    await emailService.sendDoctorNotification(slot.doctor_email, {
      userName: user.full_name || user.email,
      doctorName: slot.doctor_name,
      date: slot.slot_date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      reason: reason
    });

    return res.status(201).json({
      message: "Appointment booked successfully. Awaiting admin approval.",
      appointment: appointment
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Book appointment error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Get user's appointments
 */
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT a.*,
             u.full_name as doctor_name,
             d.specialization,
             d.consultation_fee
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.user_id = $1
    `;
    const params = [userId];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY a.appointment_date DESC, a.start_time DESC`;

    const result = await pool.query(query, params);

    return res.json({ appointments: result.rows });

  } catch (error) {
    console.error("Get user appointments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get doctor's appointments
 */
const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, date } = req.query;

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
      SELECT a.*,
             u.full_name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      WHERE a.doctor_id = $1
    `;
    const params = [doctorId];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    if (date) {
      query += ` AND a.appointment_date = $${params.length + 1}`;
      params.push(date);
    }

    query += ` ORDER BY a.appointment_date, a.start_time`;

    const result = await pool.query(query, params);

    return res.json({ appointments: result.rows });

  } catch (error) {
    console.error("Get doctor appointments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all appointments (Admin only)
 */
const getAllAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;

    let query = `
      SELECT a.*,
             u1.full_name as patient_name,
             u1.email as patient_email,
             u2.full_name as doctor_name,
             d.specialization
      FROM appointments a
      JOIN users u1 ON a.user_id = u1.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u2 ON d.user_id = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    if (date) {
      query += ` AND a.appointment_date = $${params.length + 1}`;
      params.push(date);
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);

    return res.json({ appointments: result.rows });

  } catch (error) {
    console.error("Get all appointments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Approve appointment (Admin only)
 */
const approveAppointment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const adminId = req.user.id;

    await client.query('BEGIN');

    // Get appointment details
    const appointmentResult = await client.query(
      `SELECT a.*, u.email as user_email, u.full_name as user_name,
              u2.full_name as doctor_name, d.specialization
       FROM appointments a
       JOIN users u ON a.user_id = u.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u2 ON d.user_id = u2.id
       WHERE a.id = $1`,
      [id]
    );

    if (appointmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Cannot approve appointment with status: ${appointment.status}` 
      });
    }

    // Update appointment
    await client.query(
      `UPDATE appointments 
       SET status = 'approved',
           admin_notes = $1,
           approved_by = $2,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $3`,
      [admin_notes, adminId, id]
    );

    // Log history
    await client.query(
      `INSERT INTO appointment_history 
       (appointment_id, action, old_status, new_status, changed_by, change_reason)
       VALUES ($1, 'approved', 'pending', 'approved', $2, $3)`,
      [id, adminId, admin_notes]
    );

    await client.query('COMMIT');

    // Send approval email
    await emailService.sendAppointmentApproval(appointment.user_email, {
      userName: appointment.user_name || appointment.user_email,
      doctorName: appointment.doctor_name,
      date: appointment.appointment_date,
      startTime: appointment.start_time,
      endTime: appointment.end_time
    });

    return res.json({ message: "Appointment approved successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Approve appointment error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Approve appointment by Doctor (Doctor can approve their own appointments)
 */
const approveAppointmentByDoctor = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const doctorUserId = req.user.id;

    await client.query('BEGIN');

    // Get doctor ID from user ID
    const doctorResult = await client.query(
      `SELECT id FROM doctors WHERE user_id = $1`,
      [doctorUserId]
    );

    if (doctorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: "Doctor profile not found" });
    }

    const doctorId = doctorResult.rows[0].id;

    // Get appointment details and verify it belongs to this doctor
    const appointmentResult = await client.query(
      `SELECT a.*, u.email as user_email, u.full_name as user_name,
              u2.full_name as doctor_name, d.specialization
       FROM appointments a
       JOIN users u ON a.user_id = u.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u2 ON d.user_id = u2.id
       WHERE a.id = $1 AND a.doctor_id = $2`,
      [id, doctorId]
    );

    if (appointmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Appointment not found or you don't have permission to approve it" });
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Cannot approve appointment with status: ${appointment.status}` 
      });
    }

    // Update appointment
    await client.query(
      `UPDATE appointments 
       SET status = 'approved',
           admin_notes = $1,
           approved_by = $2,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $3`,
      [admin_notes, doctorUserId, id]
    );

    // Log history
    await client.query(
      `INSERT INTO appointment_history 
       (appointment_id, action, old_status, new_status, changed_by, change_reason)
       VALUES ($1, 'approved', 'pending', 'approved', $2, $3)`,
      [id, doctorUserId, admin_notes]
    );

    await client.query('COMMIT');

    // Send approval email
    await emailService.sendAppointmentApproval(appointment.user_email, {
      userName: appointment.user_name || appointment.user_email,
      doctorName: appointment.doctor_name,
      date: appointment.appointment_date,
      startTime: appointment.start_time,
      endTime: appointment.end_time
    });

    return res.json({ message: "Appointment approved successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Approve appointment by doctor error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Cancel appointment
 * User can cancel their own, Doctor can cancel their appointments, Admin can cancel any
 */
const cancelAppointment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    await client.query('BEGIN');

    // Get appointment with authorization check
    let appointmentQuery = `
      SELECT a.*, u.email as user_email, u.full_name as user_name,
             u2.full_name as doctor_name, d.specialization, d.user_id as doctor_user_id
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u2 ON d.user_id = u2.id
      WHERE a.id = $1
    `;
    
    // Add authorization check based on role
    if (userRole === 'user') {
      appointmentQuery += ` AND a.user_id = $2`;
    } else if (userRole === 'doctor') {
      appointmentQuery += ` AND d.user_id = $2`;
    }
    // Admin can cancel any appointment

    const params = userRole === 'admin' ? [id] : [id, userId];
    const appointmentResult = await client.query(appointmentQuery, params);

    if (appointmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: "Appointment not found or unauthorized" 
      });
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Appointment already cancelled" });
    }

    if (appointment.status === 'completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Cannot cancel completed appointment" });
    }

    // Check cancellation policy (e.g., cannot cancel within 24 hours)
    const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.start_time}`);
    const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < 24 && userRole === 'user') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: "Cannot cancel appointment within 24 hours. Please contact support." 
      });
    }

    // Update appointment
    await client.query(
      `UPDATE appointments 
       SET status = 'cancelled',
           cancellation_reason = $1,
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [cancellation_reason, id]
    );

    // Free up the slot
    if (appointment.slot_id) {
      await client.query(
        `UPDATE slots 
         SET current_bookings = GREATEST(0, current_bookings - 1)
         WHERE id = $1`,
        [appointment.slot_id]
      );
    }

    // Log history
    await client.query(
      `INSERT INTO appointment_history 
       (appointment_id, action, old_status, new_status, changed_by, change_reason)
       VALUES ($1, 'cancelled', $2, 'cancelled', $3, $4)`,
      [id, appointment.status, userId, cancellation_reason]
    );

    await client.query('COMMIT');

    // Send cancellation email
    await emailService.sendAppointmentCancellation(appointment.user_email, {
      userName: appointment.user_name || appointment.user_email,
      doctorName: appointment.doctor_name,
      date: appointment.appointment_date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      reason: cancellation_reason
    });

    return res.json({ message: "Appointment cancelled successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Cancel appointment error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Reschedule appointment
 */
const rescheduleAppointment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { new_slot_id } = req.body;
    const userId = req.user.id;

    if (!new_slot_id) {
      return res.status(400).json({ message: "New slot ID is required" });
    }

    await client.query('BEGIN');

    // Get current appointment
    const appointmentResult = await client.query(
      `SELECT * FROM appointments WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (appointmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Appointment not found or unauthorized" });
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Cannot reschedule ${appointment.status} appointment` 
      });
    }

    // Check rescheduling policy
    const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.start_time}`);
    const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < 48) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: "Cannot reschedule appointment within 48 hours" 
      });
    }

    // Get new slot with locking
    const slotResult = await client.query(
      `SELECT * FROM slots WHERE id = $1 FOR UPDATE`,
      [new_slot_id]
    );

    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "New slot not found" });
    }

    const newSlot = slotResult.rows[0];

    if (!newSlot.is_available || newSlot.current_bookings >= newSlot.max_bookings) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: "New slot is not available" });
    }

    // Free up old slot
    if (appointment.slot_id) {
      await client.query(
        `UPDATE slots 
         SET current_bookings = GREATEST(0, current_bookings - 1)
         WHERE id = $1`,
        [appointment.slot_id]
      );
    }

    // Update appointment
    await client.query(
      `UPDATE appointments 
       SET slot_id = $1,
           appointment_date = $2,
           start_time = $3,
           end_time = $4,
           status = 'pending',
           updated_at = NOW()
       WHERE id = $5`,
      [new_slot_id, newSlot.slot_date, newSlot.start_time, newSlot.end_time, id]
    );

    // Book new slot
    await client.query(
      `UPDATE slots 
       SET current_bookings = current_bookings + 1
       WHERE id = $1`,
      [new_slot_id]
    );

    // Log history
    await client.query(
      `INSERT INTO appointment_history 
       (appointment_id, action, old_status, new_status, changed_by, change_reason)
       VALUES ($1, 'rescheduled', $2, 'pending', $3, 'Appointment rescheduled')`,
      [id, appointment.status, userId]
    );

    await client.query('COMMIT');

    return res.json({ message: "Appointment rescheduled successfully. Awaiting approval." });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Reschedule appointment error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Get appointment history
 */
const getAppointmentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ah.*, u.full_name as changed_by_name
       FROM appointment_history ah
       LEFT JOIN users u ON ah.changed_by = u.id
       WHERE ah.appointment_id = $1
       ORDER BY ah.created_at DESC`,
      [id]
    );

    return res.json({ history: result.rows });

  } catch (error) {
    console.error("Get appointment history error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  bookAppointment,
  getUserAppointments,
  getDoctorAppointments,
  getAllAppointments,
  approveAppointment,
  approveAppointmentByDoctor,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentHistory
};
