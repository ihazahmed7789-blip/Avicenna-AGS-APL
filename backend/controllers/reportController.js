const { Student, Employee, FeeRecord, SalaryPayment, Admission, Complaint, AdmissionInquiry, Recognition } = require("../models");

// One combined snapshot for the admin dashboard landing page
async function dashboardSummary(req, res) {
  try {
    const totalStudents = await Student.count({ where: { status: "active" } });
    const totalEmployees = await Employee.count({ where: { status: "active" } });
    const pendingAdmissions = await Admission.count({ where: { status: "pending" } });

    const unpaidFees = await FeeRecord.count({ where: { status: "unpaid" } });
    const overdueFees = await FeeRecord.count({ where: { status: "overdue" } });

    const openComplaints = await Complaint.count({ where: { status: { [require("sequelize").Op.ne]: "resolved" } } });
    const newInquiries = await AdmissionInquiry.count({ where: { status: "new" } });

    const { Student: StudentModel } = require("../models");
    const latestRecognition = await Recognition.findOne({
      order: [["createdAt", "DESC"]],
      include: [{ model: StudentModel, attributes: ["fullName"] }],
    });

    res.json({
      totalStudents, totalEmployees, pendingAdmissions, unpaidFees, overdueFees,
      openComplaints, newInquiries,
      latestRecognition: latestRecognition ? { name: latestRecognition.Student?.fullName, type: latestRecognition.type } : null,
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
