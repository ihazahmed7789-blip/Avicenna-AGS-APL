const XLSX = require("xlsx");
const { Employee } = require("../models");

async function createEmployee(req, res) {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: "Could not create employee", error: err.message });
  }
}

async function getEmployees(req, res) {
  try {
    const { department, status } = req.query;
    const where = {};
    if (department) where.department = department;
    if (status) where.status = status;
    const employees = await Employee.findAll({ where, order: [["fullName", "ASC"]] });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch employees", error: err.message });
  }
}

async function getEmployeeById(req, res) {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch employee", error: err.message });
  }
}

async function updateEmployee(req, res) {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    await employee.update(req.body);
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Could not update employee", error: err.message });
  }
}

async function deleteEmployee(req, res) {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    await employee.destroy();
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete employee", error: err.message });
  }
}

// Expected columns: employeeCode, fullName, designation, department, phone, email, joiningDate, monthlySalary
async function importFromExcel(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const created = [];
    const failed = [];
    for (const row of rows) {
      try {
        const emp = await Employee.create({
          employeeCode: String(row.employeeCode || "").trim(),
          fullName: row.fullName,
          designation: row.designation,
          department: row.department,
          phone: row.phone ? String(row.phone) : null,
          email: row.email,
          joiningDate: row.joiningDate,
          monthlySalary: row.monthlySalary || 0,
        });
        created.push(emp.employeeCode);
      } catch (rowErr) {
        failed.push({ row, error: rowErr.message });
      }
    }
    res.json({ importedCount: created.length, failedCount: failed.length, failed });
  } catch (err) {
    res.status(500).json({ message: "Import failed", error: err.message });
  }
}

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  importFromExcel,
};
