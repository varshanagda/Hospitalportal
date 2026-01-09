require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth.routes");
const doctorRoutes = require("./routes/doctor.routes");
const slotRoutes = require("./routes/slot.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const emailService = require("./services/email.service");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/doctors", doctorRoutes);
app.use("/slots", slotRoutes);
app.use("/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.send("Medical Appointment Booking System API is running");
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (_error) {
    res.status(500).json({ status: "unhealthy", database: "disconnected" });
  }
});

// Process pending emails every 5 minutes (in production, use a proper job scheduler)
setInterval(() => {
  emailService.processPendingEmails().catch(err => 
    console.error("Email processing error:", err)
  );
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
