const { TimetableEntry, Employee } = require("../models");

async function createEntry(req, res) {
  try {
    const entry = await TimetableEntry.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: "Could not create timetable entry", error: err.message });
  }
}

async function getTimetable(req, res) {
  try {
    const { className, section, day } = req.query;
    const where = {};
    if (className) where.className = className;
    if (section) where.section = section;
    if (day) where.day = day;

    const entries = await TimetableEntry.findAll({ where, order: [["day", "ASC"], ["period", "ASC"]] });

    // Attach teacher names
    const teacherIds = [...new Set(entries.filter((e) => e.teacherId).map((e) => e.teacherId))];
    const teachers = teacherIds.length ? await Employee.findAll({ where: { id: teacherIds } }) : [];
    const withNames = entries.map((e) => ({
      ...e.toJSON(),
      teacherName: teachers.find((t) => t.id === e.teacherId)?.fullName || null,
    }));

    res.json(withNames);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch timetable", error: err.message });
  }
}

async function deleteEntry(req, res) {
  try {
    const entry = await TimetableEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    await entry.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete entry", error: err.message });
  }
}

module.exports = { createEntry, getTimetable, deleteEntry };
