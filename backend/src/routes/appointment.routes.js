const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");
const { authMiddleware, requireUser, requireDoctor, requireAdmin } = require("../middleware/role.middleware");

// User routes
router.post("/book", authMiddleware, requireUser, appointmentController.bookAppointment);
router.get("/my-appointments", authMiddleware, requireUser, appointmentController.getUserAppointments);
router.put("/:id/reschedule", authMiddleware, requireUser, appointmentController.rescheduleAppointment);

// Doctor routes
router.get("/doctor-appointments", authMiddleware, requireDoctor, appointmentController.getDoctorAppointments);

// Admin routes
router.get("/all", authMiddleware, requireAdmin, appointmentController.getAllAppointments);
router.put("/:id/approve", authMiddleware, requireAdmin, appointmentController.approveAppointment);

// Shared routes (user, doctor, or admin can cancel based on authorization)
router.put("/:id/cancel", authMiddleware, appointmentController.cancelAppointment);

// History (any authenticated user for their own appointments)
router.get("/:id/history", authMiddleware, appointmentController.getAppointmentHistory);

module.exports = router;
