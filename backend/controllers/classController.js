const { SchoolClass, Section, Student } = require("../models");

async function createClass(req, res) {
  try {
    const cls = await SchoolClass.create(req.body);
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ message: "Could not create class", error: err.message });
  }
}

async function getClasses(req, res) {
  try {
    const classes = await SchoolClass.findAll({ include: [Section], order: [["order", "ASC"], ["name", "ASC"]] });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch classes", error: err.message });
  }
}

async function updateClass(req, res) {
  try {
    const cls = await SchoolClass.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    await cls.update(req.body);
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: "Could not update class", error: err.message });
  }
}

async function deleteClass(req, res) {
  try {
    const cls = await SchoolClass.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    await cls.destroy();
    res.json({ message: "Class deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete class", error: err.message });
  }
}

async function createSection(req, res) {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: "Could not create section", error: err.message });
  }
}

async function deleteSection(req, res) {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) return res.status(404).json({ message: "Section not found" });
    await section.destroy();
    res.json({ message: "Section deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete section", error: err.message });
  }
}

// Report: how many active students are in each class/section
async function classReport(req, res) {
  try {
    const students = await Student.findAll({ where: { status: "active" } });
    const byClass = {};
    for (const s of students) {
      byClass[s.className] = byClass[s.className] || { total: 0, sections: {} };
      byClass[s.className].total += 1;
      const sec = s.section || "Unassigned";
      byClass[s.className].sections[sec] = (byClass[s.className].sections[sec] || 0) + 1;
    }
    res.json(byClass);
  } catch (err) {
    res.status(500).json({ message: "Could not build class report", error: err.message });
  }
}

module.exports = { createClass, getClasses, updateClass, deleteClass, createSection, deleteSection, classReport };
