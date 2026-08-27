require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");
const { initWhatsApp } = require("./whatsapp/whatsappService");
const { startBirthdayNotifier } = require("./birthdayNotifier");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const feeRoutes = require("./routes/feeRoutes");
const resultRoutes = require("./routes/resultRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const reportRoutes = require("./routes/reportRoutes");
const classRoutes = require("./routes/classRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const frontdeskRoutes = require("./routes/frontdeskRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const recognitionRoutes = require("./routes/recognitionRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const datesheetRoutes = require("./routes/datesheetRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const exportRoutes = require("./routes/exportRoutes");
const galleryRoutes = require("./routes/galleryRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Uploaded gallery photos are served as static files from here.
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(path.join(uploadsDir, "gallery"), { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/frontdesk", frontdeskRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/recognitions", recognitionRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/datesheet", datesheetRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/", (req, res) => res.json({ status: "ok", service: "Avicenna APL backend" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    console.log("Attempting DB connection with:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      ssl: process.env.DB_SSL,
    });

    await sequelize.authenticate();
    console.log("Database connected.");

    // In production use migrations instead of sync({ alter: true }).
    await sequelize.sync({ alter: true });
    console.log("Models synced.");

    // Auto-create the default admin account if no admin exists yet.
    // This means a fresh deployment never needs a manual `node seed.js` step.
    const { User } = require("./models");
    const bcrypt = require("bcryptjs");
    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({ name: "School Admin", username: "admin", password: hashed, role: "admin" });
      console.log("No admin found - created default admin (username: admin, password: admin123). Change this password after logging in.");
    }

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

    // WhatsApp client starts in the background; scan the QR from the
    // admin panel's WhatsApp tab the first time it runs.
    initWhatsApp();
    startBirthdayNotifier();
  } catch (err) {
    console.error("Failed to start server. Full error:", err);
    process.exit(1);
  }
}

start();
