const { FeeRecord, Student } = require("../models");
const { Op } = require("sequelize");

async function createFeeRecord(req, res) {
  try {
    const record = await FeeRecord.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: "Could not create fee record", error: err.message });
  }
}

async function getFeeRecords(req, res) {
  try {
    const { studentId, month, status, className } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (month) where.month = month;
    if (status) where.status = status;

    const include = [{ model: Student, attributes: ["fullName", "rollNumber", "className", "section"] }];
    if (className) include[0].where = { className };

    const records = await FeeRecord.findAll({ where, include, order: [["month", "DESC"]] });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch fee records", error: err.message });
  }
}

// Record a payment against an existing fee record
async function payFee(req, res) {
  try {
    const record = await FeeRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Fee record not found" });

    const amountPaid = parseFloat(req.body.amountPaid || 0);
    const newPaid = parseFloat(record.amountPaid) + amountPaid;
    let status = "partial";
    if (newPaid >= parseFloat(record.amountDue)) status = "paid";

    await record.update({
      amountPaid: newPaid,
      status,
      paidDate: new Date(),
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Could not update payment", error: err.message });
  }
}

// Mark overdue records automatically (dueDate passed and not fully paid)
async function markOverdue(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [count] = await FeeRecord.update(
      { status: "overdue" },
      { where: { dueDate: { [Op.lt]: today }, status: { [Op.in]: ["unpaid", "partial"] } } }
    );
    res.json({ updated: count });
  } catch (err) {
    res.status(500).json({ message: "Could not update overdue records", error: err.message });
  }
}

// Summary report: totals by status, optionally filtered by month
async function feeSummaryReport(req, res) {
  try {
    const { month } = req.query;
    const where = {};
    if (month) where.month = month;

    const records = await FeeRecord.findAll({ where });
    const summary = { totalDue: 0, totalPaid: 0, paidCount: 0, unpaidCount: 0, partialCount: 0, overdueCount: 0 };
    for (const r of records) {
      summary.totalDue += parseFloat(r.amountDue);
      summary.totalPaid += parseFloat(r.amountPaid);
      summary[`${r.status}Count`] = (summary[`${r.status}Count`] || 0) + 1;
    }
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Could not build fee summary", error: err.message });
  }
}

module.exports = { createFeeRecord, getFeeRecords, payFee, markOverdue, feeSummaryReport };
