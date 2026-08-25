const XLSX = require("xlsx");
const { FeeRecord, Student, Result, Employee, SalaryPayment } = require("../models");
const { Op } = require("sequelize");

function sendExcel(res, filename, rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
}

async function exportFeeReport(req, res) {
  try {
    const { month, className } = req.query;
    const where = {};
    if (month) where.month = month;
    const include = [{ model: Student, attributes: ["fullName", "rollNumber", "className", "section"] }];
    if (className) include[0].where = { className };
    const records = await FeeRecord.findAll({ where, include });
    const rows = records.map((r) => ({
      "Roll No": r.Student?.rollNumber, "Student Name": r.Student?.fullName, "Class": r.Student?.className,
      "Section": r.Student?.section, "Month": r.month, "Amount Due": r.amountDue, "Amount Paid": r.amountPaid, "Status": r.status,
    }));
    sendExcel(res, "fee-report.xlsx", rows);
  } catch (err) {
    res.status(500).json({ message: "Could not export fee report", error: err.message });
  }
}

async function exportResultReport(req, res) {
  try {
    const { className, examName } = req.query;
    const studentWhere = { status: "active" };
    if (className) studentWhere.className = className;
    const students = await Student.findAll({ where: studentWhere });
    const studentIds = students.map((s) => s.id);
    const where = examName ? { examName, studentId: { [Op.in]: studentIds } } : { studentId: { [Op.in]: studentIds } };
    const results = await Result.findAll({ where, include: [{ model: Student, attributes: ["fullName", "rollNumber", "className", "section"] }] });
    const rows = results.map((r) => ({
      "Roll No": r.Student?.rollNumber, "Student Name": r.Student?.fullName, "Class": r.Student?.className,
      "Exam": r.examName, "Subject": r.subject, "Obtained": r.marksObtained, "Total": r.totalMarks, "Grade": r.grade,
    }));
    sendExcel(res, "results-report.xlsx", rows);
  } catch (err) {
    res.status(500).json({ message: "Could not export results", error: err.message });
  }
}

async function exportSalaryReport(req, res) {
  try {
    const { month } = req.query;
    const where = month ? { month } : {};
    const payments = await SalaryPayment.findAll({ where, include: [{ model: Employee, attributes: ["fullName", "designation", "department"] }] });
    const rows = payments.map((p) => ({
      "Employee": p.Employee?.fullName, "Designation": p.Employee?.designation, "Department": p.Employee?.department,
      "Month": p.month, "Amount Paid": p.amountPaid, "Deductions": p.deductions, "Status": p.status,
    }));
    sendExcel(res, "salary-report.xlsx", rows);
  } catch (err) {
    res.status(500).json({ message: "Could not export salary report", error: err.message });
  }
}

module.exports = { exportFeeReport, exportResultReport, exportSalaryReport };
