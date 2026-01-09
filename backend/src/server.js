require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

// Import routes
const authRoutes = require("./routes/auth.routes");
const doctorRoutes = require("./routes/doctor.routes");
const slotRoutes = require("./routes/slot.routes");
const appointmentRoutes = require("./routes/appointment.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("backend is running");
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (_error) {
    res.status(500).json({ status: "unhealthy", database: "disconnected" });
  }
});

// Mount routes
app.use("/auth", authRoutes);
app.use("/doctors", doctorRoutes);
app.use("/slots", slotRoutes);
app.use("/appointments", appointmentRoutes);

const PORT = process.env.PORT || 5001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
