require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");
const { initWhatsApp } = require("./whatsapp/whatsappService");

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
const academicRoutes = require("./routes/academicRoutes");

const app = express();
app.use(cors());
app.use(express.json());

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
app.use("/api/academic", academicRoutes);

app.get("/", (req, res) => res.json({ name: "School Management System API", status: "ok", health: "/api/health" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    let connected = false;
    let lastError;
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      try {
        await sequelize.authenticate();
        connected = true;
        console.log("Database connected.");
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Database connection attempt ${attempt}/10 failed: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(3000 * attempt, 15000)));
      }
    }
    if (!connected) throw lastError || new Error("Database connection failed");

    await sequelize.sync({ alter: true });
    console.log("Models synced.");

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
// initWhatsApp();
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
