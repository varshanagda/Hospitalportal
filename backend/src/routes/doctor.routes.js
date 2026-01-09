const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctor.controller");
const { authMiddleware, requireDoctor, requireAdmin } = require("../middleware/role.middleware");

// Public routes (for users to view doctors)
router.get("/", authMiddleware, doctorController.getAllDoctors);
router.get("/:id", authMiddleware, doctorController.getDoctorById);

// Doctor routes
router.post("/profile", authMiddleware, doctorController.createDoctorProfile);
router.get("/profile/me", authMiddleware, requireDoctor, doctorController.getDoctorProfile);
router.get("/stats/me", authMiddleware, requireDoctor, doctorController.getDoctorStats);

// Admin routes
router.put("/:id/approve", authMiddleware, requireAdmin, doctorController.approveDoctor);

module.exports = router;
