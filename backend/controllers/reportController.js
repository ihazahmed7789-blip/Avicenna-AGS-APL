const { Student, Employee, FeeRecord, SalaryPayment, Admission, Complaint, AdmissionInquiry, Recognition } = require("../models");
const { Op } = require("sequelize");

// One combined snapshot for the admin dashboard landing page
async function dashboardSummary(req, res) {
  try {
    const totalStudents = await Student.count({ where: { status: "active" } });
    const totalEmployees = await Employee.count({ where: { status: "active" } });
    const pendingAdmissions = await Admission.count({ where: { status: "pending" } });

    const unpaidFees = await FeeRecord.count({ where: { status: "unpaid" } });
    const overdueFees = await FeeRecord.count({ where: { status: "overdue" } });

    const openComplaints = await Complaint.count({ where: { status: { [Op.ne]: "resolved" } } });
    const newInquiries = await AdmissionInquiry.count({ where: { status: "new" } });

    // Student of the Week and Student of the Month are tracked separately so
    // the overview can show both at once, not just whichever was added last.
    const latestRecognitionWeek = await Recognition.findOne({
      where: { type: "week" },
      order: [["createdAt", "DESC"]],
      include: [{ model: Student, attributes: ["fullName"] }],
    });
    const latestRecognitionMonth = await Recognition.findOne({
      where: { type: "month" },
      order: [["createdAt", "DESC"]],
      include: [{ model: Student, attributes: ["fullName"] }],
    });

    // Birthdays today - same month/day match the birthday WhatsApp notifier uses,
    // just surfaced here for a visible in-panel notification too.
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const studentsWithDob = await Student.findAll({
      where: { status: "active", dateOfBirth: { [Op.ne]: null } },
      attributes: ["fullName", "className", "section", "dateOfBirth"],
    });
    const employeesWithDob = await Employee.findAll({
      where: { status: "active", dateOfBirth: { [Op.ne]: null } },
      attributes: ["fullName", "designation", "dateOfBirth"],
    });
    const birthdaysToday = [
      ...studentsWithDob
        .filter((s) => String(s.dateOfBirth).slice(5, 10) === `${mm}-${dd}`)
        .map((s) => ({ name: s.fullName, type: "student", detail: `${s.className}${s.section ? " - " + s.section : ""}` })),
      ...employeesWithDob
        .filter((e) => String(e.dateOfBirth).slice(5, 10) === `${mm}-${dd}`)
        .map((e) => ({ name: e.fullName, type: "staff", detail: e.designation || "" })),
    ];

    res.json({
      totalStudents, totalEmployees, pendingAdmissions, unpaidFees, overdueFees,
      openComplaints, newInquiries,
      latestRecognitionWeek: latestRecognitionWeek
        ? { name: latestRecognitionWeek.Student?.fullName, periodLabel: latestRecognitionWeek.periodLabel, reason: latestRecognitionWeek.reason }
        : null,
      latestRecognitionMonth: latestRecognitionMonth
        ? { name: latestRecognitionMonth.Student?.fullName, periodLabel: latestRecognitionMonth.periodLabel, reason: latestRecognitionMonth.reason }
        : null,
      birthdaysToday,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not build dashboard summary", error: err.message });
  }
}

async function salaryReport(req, res) {
  try {
    const { month } = req.query;
    const where = {};
    if (month) where.month = month;
    const payments = await SalaryPayment.findAll({
      where,
      include: [{ model: Employee, attributes: ["fullName", "designation", "department"] }],
    });
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);
    res.json({ totalPaid, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: "Could not build salary report", error: err.message });
  }
}

module.exports = { dashboardSummary, salaryReport };
