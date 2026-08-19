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
const recognitionRoutes = require("./routes/recognitionRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const datesheetRoutes = require("./routes/datesheetRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

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
app.use("/api/recognitions", recognitionRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/datesheet", datesheetRoutes);
app.use("/api/certificates", certificateRoutes);

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

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

    // WhatsApp client starts in the background; scan the QR from the
    // admin panel's WhatsApp tab the first time it runs.
    initWhatsApp();
  } catch (err) {
    console.error("Failed to start server. Full error:", err);
    process.exit(1);
  }
}

start();
