const { SalaryPayment, Employee } = require("../models");

async function recordPayment(req, res) {
  try {
    const { employeeId, month, amountPaid, deductions, paidDate } = req.body;
    const payment = await SalaryPayment.create({
      employeeId,
      month,
      amountPaid,
      deductions: deductions || 0,
      paidDate: paidDate || new Date(),
      status: "paid",
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: "Could not record salary payment", error: err.message });
  }
}

async function getPayments(req, res) {
  try {
    const { employeeId, month } = req.query;
    const where = {};
    if (employeeId) where.employeeId = employeeId;
    if (month) where.month = month;
    const payments = await SalaryPayment.findAll({
      where,
      include: [{ model: Employee, attributes: ["fullName", "designation", "department"] }],
      order: [["month", "DESC"]],
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch payments", error: err.message });
  }
}

module.exports = { recordPayment, getPayments };
