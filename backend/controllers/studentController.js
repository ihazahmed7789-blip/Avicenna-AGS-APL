const XLSX = require("xlsx");
const { Student } = require("../models");
const { Op } = require("sequelize");

async function createStudent(req, res) {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: "Could not create student", error: err.message });
  }
}

async function getStudents(req, res) {
  try {
    const { className, section, status, search } = req.query;
    const where = {};
    if (className) where.className = className;
    if (section) where.section = section;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { rollNumber: { [Op.like]: `%${search}%` } },
      ];
    }
    const students = await Student.findAll({ where, order: [["className", "ASC"], ["fullName", "ASC"]] });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch students", error: err.message });
  }
}

async function getStudentById(req, res) {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch student", error: err.message });
  }
}

async function updateStudent(req, res) {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    await student.update(req.body);
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Could not update student", error: err.message });
  }
}

async function deleteStudent(req, res) {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    await student.destroy();
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete student", error: err.message });
  }
}

// Bulk import from an uploaded Excel sheet.
// Expected columns (header row): rollNumber, fullName, fatherName, dateOfBirth,
// gender, className, section, admissionDate, address, guardianName, guardianPhone, whatsappNumber
async function importFromExcel(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) return res.status(400).json({ message: "Excel sheet is empty" });

    const created = [];
    const failed = [];

    for (const row of rows) {
      try {
        const student = await Student.create({
          rollNumber: String(row.rollNumber || "").trim(),
          fullName: row.fullName,
          fatherName: row.fatherName,
          dateOfBirth: row.dateOfBirth,
          gender: row.gender,
          className: row.className,
          section: row.section,
          admissionDate: row.admissionDate,
          address: row.address,
          guardianName: row.guardianName,
          guardianPhone: row.guardianPhone ? String(row.guardianPhone) : null,
          whatsappNumber: row.whatsappNumber ? String(row.whatsappNumber) : String(row.guardianPhone || ""),
        });
        created.push(student.rollNumber);
      } catch (rowErr) {
        failed.push({ row, error: rowErr.message });
      }
    }

    res.json({ importedCount: created.length, failedCount: failed.length, failed });
  } catch (err) {
    res.status(500).json({ message: "Import failed", error: err.message });
  }
}

// Groups active students by familyNumber - powers the Family List screen
async function familyList(req, res) {
  try {
    const students = await Student.findAll({ where: { status: "active" } });
    const families = {};
    for (const s of students) {
      const key = s.familyNumber || `no-family-${s.id}`;
      if (!families[key]) {
        families[key] = {
          familyNumber: s.familyNumber || null,
          guardianName: s.guardianName,
          guardianPhone: s.guardianPhone,
          guardianCnic: s.guardianCnic,
          students: [],
        };
      }
      families[key].students.push({ id: s.id, fullName: s.fullName, rollNumber: s.rollNumber, className: s.className });
    }
    res.json(Object.values(families));
  } catch (err) {
    res.status(500).json({ message: "Could not build family list", error: err.message });
  }
}

// Withdraw a student - sets status to withdrawn and records reason/date
async function withdrawStudent(req, res) {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    await student.update({
      status: "withdrawn",
      withdrawalDate: req.body.withdrawalDate || new Date().toISOString().slice(0, 10),
      withdrawalReason: req.body.withdrawalReason || null,
    });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Could not withdraw student", error: err.message });
  }
}

async function withdrawalReport(req, res) {
  try {
    const students = await Student.findAll({ where: { status: "withdrawn" }, order: [["withdrawalDate", "DESC"]] });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Could not build withdrawal report", error: err.message });
  }
}

// PTM Sheet - class-wise list of students with parent contact, for meeting sign-off
async function ptmSheet(req, res) {
  try {
    const { className, section } = req.query;
    if (!className) return res.status(400).json({ message: "className is required" });
    const where = { className, status: "active" };
    if (section) where.section = section;
    const students = await Student.findAll({ where, order: [["rollNumber", "ASC"]] });
    res.json(students.map((s) => ({
      id: s.id,
      rollNumber: s.rollNumber,
      fullName: s.fullName,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
    })));
  } catch (err) {
    res.status(500).json({ message: "Could not build PTM sheet", error: err.message });
  }
}

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  importFromExcel,
  familyList,
  withdrawStudent,
  withdrawalReport,
  ptmSheet,
};
