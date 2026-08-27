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

    // Sunday is a school holiday - block attendance marking for it automatically
    const dayOfWeek = new Date(date + "T00:00:00").getDay(); // 0 = Sunday
    if (dayOfWeek === 0) {
      return res.status(400).json({ message: "Sunday is a holiday - attendance cannot be marked for this date." });
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

// Tells the frontend whether a given date is a holiday (currently: Sundays)
async function checkHoliday(req, res) {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "date is required" });
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  res.json({ isHoliday: dayOfWeek === 0, reason: dayOfWeek === 0 ? "Sunday" : null });
}

// Monthly attendance register - one row per student, one column per day,
// classic printable school register format
async function attendanceRegister(req, res) {
  try {
    const { className, section, month } = req.query; // month = "2026-08"
    if (!className || !month) return res.status(400).json({ message: "className and month are required" });

    const where = { className, status: "active" };
    if (section) where.section = section;
    const students = await Student.findAll({ where, order: [["rollNumber", "ASC"]] });
    const studentIds = students.map((s) => s.id);

    const [year, mon] = month.split("-");
    const daysInMonth = new Date(parseInt(year), parseInt(mon), 0).getDate();

    const records = studentIds.length
      ? await Attendance.findAll({
          where: {
            personType: "student",
            personId: { [Op.in]: studentIds },
            date: { [Op.between]: [`${month}-01`, `${month}-${String(daysInMonth).padStart(2, "0")}`] },
          },
        })
      : [];

    const register = students.map((s) => {
      const days = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${month}-${String(d).padStart(2, "0")}`;
        const dow = new Date(dateStr + "T00:00:00").getDay();
        if (dow === 0) { days[d] = "H"; continue; } // Sunday holiday
        const rec = records.find((r) => r.personId === s.id && r.date === dateStr);
        days[d] = rec ? rec.status[0].toUpperCase() : "-";
      }
      return { studentId: s.id, rollNumber: s.rollNumber, fullName: s.fullName, days };
    });

    res.json({ daysInMonth, register });
  } catch (err) {
    res.status(500).json({ message: "Could not build attendance register", error: err.message });
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

module.exports = { markBulkAttendance, getAttendance, attendanceReport, checkHoliday, attendanceRegister };
