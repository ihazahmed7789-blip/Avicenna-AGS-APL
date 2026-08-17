const { Attendance, Student, Employee } = require("../models");
const { Op } = require("sequelize");

// Mark attendance for many people at once for one date
// body: { personType, date, records: [{ personId, status, remarks }] }
async function markBulkAttendance(req, res) {
  try {
    const { personType, date, records } = req.body;
    if (!personType || !date || !Array.isArray(records)) {
      return res.status(400).json({ message: "personType, date and records[] are required" });
    }

    const results = [];
    for (const r of records) {
      const [row] = await Attendance.upsert({
        personType,
        personId: r.personId,
        date,
        status: r.status,
        remarks: r.remarks || null,
        markedByUserId: req.user.id,
      }, { returning: true });
      results.push(row);
    }
    res.json({ marked: results.length });
  } catch (err) {
    res.status(500).json({ message: "Could not mark attendance", error: err.message });
  }
}

async function getAttendance(req, res) {
  try {
    const { personType, date, personId, from, to } = req.query;
    const where = {};
    if (personType) where.personType = personType;
    if (personId) where.personId = personId;
    if (date) where.date = date;
    if (from && to) where.date = { [Op.between]: [from, to] };

    const records = await Attendance.findAll({ where, order: [["date", "DESC"]] });

    // Attach names for display
    const studentIds = records.filter((r) => r.personType === "student").map((r) => r.personId);
    const staffIds = records.filter((r) => r.personType === "staff").map((r) => r.personId);
    const students = studentIds.length ? await Student.findAll({ where: { id: studentIds } }) : [];
    const staff = staffIds.length ? await Employee.findAll({ where: { id: staffIds } }) : [];

    const withNames = records.map((r) => {
      const person = r.personType === "student"
        ? students.find((s) => s.id === r.personId)
        : staff.find((e) => e.id === r.personId);
      return { ...r.toJSON(), personName: person?.fullName || `#${r.personId}` };
    });

    res.json(withNames);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch attendance", error: err.message });
  }
}

// Summary counts for a date range - used for the attendance report
async function attendanceReport(req, res) {
  try {
    const { personType, from, to } = req.query;
    const where = {};
    if (personType) where.personType = personType;
    if (from && to) where.date = { [Op.between]: [from, to] };

    const records = await Attendance.findAll({ where });
    const summary = { present: 0, absent: 0, late: 0, leave: 0, short_leave: 0 };
    for (const r of records) summary[r.status] = (summary[r.status] || 0) + 1;
    res.json({ total: records.length, ...summary });
  } catch (err) {
    res.status(500).json({ message: "Could not build attendance report", error: err.message });
  }
}

module.exports = { markBulkAttendance, getAttendance, attendanceReport };
