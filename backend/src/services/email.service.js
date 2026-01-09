const pool = require("../db");

/**
 * Email notification service
 * In production, integrate with SendGrid, AWS SES, or Nodemailer
 */

// Queue an email notification
const queueEmail = async (recipientEmail, subject, body) => {
  try {
    const result = await pool.query(
      `INSERT INTO email_notifications (recipient_email, subject, body, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id`,
      [recipientEmail, subject, body]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error queuing email:", error);
    throw error;
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (userEmail, appointmentDetails) => {
  const subject = "Appointment Booking Confirmation";
  const body = `
    Dear ${appointmentDetails.userName},
    
    Your appointment has been booked successfully!
    
    Details:
    - Doctor: Dr. ${appointmentDetails.doctorName}
    - Specialization: ${appointmentDetails.specialization}
    - Date: ${appointmentDetails.date}
    - Time: ${appointmentDetails.startTime} - ${appointmentDetails.endTime}
    - Status: ${appointmentDetails.status}
    
    ${appointmentDetails.status === 'pending' ? 'Your appointment is pending admin approval.' : ''}
    
    Thank you for choosing our service!
    
    Best regards,
    Medical Appointment System
  `;
  
  return await queueEmail(userEmail, subject, body);
};

// Send appointment approval email
const sendAppointmentApproval = async (userEmail, appointmentDetails) => {
  const subject = "Appointment Approved";
  const body = `
    Dear ${appointmentDetails.userName},
    
    Your appointment has been approved!
    
    Details:
    - Doctor: Dr. ${appointmentDetails.doctorName}
    - Date: ${appointmentDetails.date}
    - Time: ${appointmentDetails.startTime} - ${appointmentDetails.endTime}
    
    Please arrive 10 minutes before your scheduled time.
    
    Best regards,
    Medical Appointment System
  `;
  
  return await queueEmail(userEmail, subject, body);
};

// Send appointment cancellation email
const sendAppointmentCancellation = async (userEmail, appointmentDetails) => {
  const subject = "Appointment Cancelled";
  const body = `
    Dear ${appointmentDetails.userName},
    
    Your appointment has been cancelled.
    
    Details:
    - Doctor: Dr. ${appointmentDetails.doctorName}
    - Date: ${appointmentDetails.date}
    - Time: ${appointmentDetails.startTime} - ${appointmentDetails.endTime}
    - Reason: ${appointmentDetails.reason || 'Not specified'}
    
    You can book a new appointment anytime through our system.
    
    Best regards,
    Medical Appointment System
  `;
  
  return await queueEmail(userEmail, subject, body);
};

// Send appointment reminder (1 day before)
const sendAppointmentReminder = async (userEmail, appointmentDetails) => {
  const subject = "Appointment Reminder - Tomorrow";
  const body = `
    Dear ${appointmentDetails.userName},
    
    This is a reminder for your appointment tomorrow!
    
    Details:
    - Doctor: Dr. ${appointmentDetails.doctorName}
    - Date: ${appointmentDetails.date}
    - Time: ${appointmentDetails.startTime} - ${appointmentDetails.endTime}
    
    Please arrive 10 minutes before your scheduled time.
    
    Best regards,
    Medical Appointment System
  `;
  
  return await queueEmail(userEmail, subject, body);
};

// Send notification to doctor about new appointment
const sendDoctorNotification = async (doctorEmail, appointmentDetails) => {
  const subject = "New Appointment Booking";
  const body = `
    Dear Dr. ${appointmentDetails.doctorName},
    
    A new appointment has been booked:
    
    Patient: ${appointmentDetails.userName}
    Date: ${appointmentDetails.date}
    Time: ${appointmentDetails.startTime} - ${appointmentDetails.endTime}
    Reason: ${appointmentDetails.reason || 'Not specified'}
    
    Best regards,
    Medical Appointment System
  `;
  
  return await queueEmail(doctorEmail, subject, body);
};

// Process pending emails (would run as a cron job in production)
const processPendingEmails = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM email_notifications 
       WHERE status = 'pending' AND attempt_count < 3
       ORDER BY created_at ASC
       LIMIT 10`
    );

    for (const email of result.rows) {
      try {
        // In production, actually send the email here
        // await actualEmailSender.send(email);
        
        console.log(`[EMAIL] To: ${email.recipient_email}, Subject: ${email.subject}`);
        
        // Mark as sent
        await pool.query(
          `UPDATE email_notifications 
           SET status = 'sent', sent_at = NOW()
           WHERE id = $1`,
          [email.id]
        );
      } catch (error) {
        // Mark as failed and increment attempt count
        await pool.query(
          `UPDATE email_notifications 
           SET status = 'failed', 
               attempt_count = attempt_count + 1,
               error_message = $1
           WHERE id = $2`,
          [error.message, email.id]
        );
      }
    }
  } catch (error) {
    console.error("Error processing emails:", error);
  }
};

module.exports = {
  queueEmail,
  sendAppointmentConfirmation,
  sendAppointmentApproval,
  sendAppointmentCancellation,
  sendAppointmentReminder,
  sendDoctorNotification,
  processPendingEmails
};
