const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slot.controller");
const { authMiddleware, requireDoctor, requireUser } = require("../middleware/role.middleware");

// Doctor routes (create and manage slots)
router.post("/", authMiddleware, requireDoctor, slotController.createSlot);
router.get("/my-slots", authMiddleware, requireDoctor, slotController.getDoctorSlots);
router.put("/:id", authMiddleware, requireDoctor, slotController.updateSlot);
router.delete("/:id", authMiddleware, requireDoctor, slotController.deleteSlot);

// Public/User routes (view available slots)
router.get("/available", authMiddleware, requireUser, slotController.getAvailableSlots);

module.exports = router;
