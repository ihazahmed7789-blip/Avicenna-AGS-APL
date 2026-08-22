const { DateSheetEntry } = require("../models");

async function createEntry(req, res) {
  try {
    const entry = await DateSheetEntry.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: "Could not create date sheet entry", error: err.message });
  }
}

async function getDateSheet(req, res) {
  try {
    const { className, section, examName } = req.query;
    const where = {};
    if (className) where.className = className;
    if (section) where.section = section;
    if (examName) where.examName = examName;

    const entries = await DateSheetEntry.findAll({ where, order: [["examDate", "ASC"]] });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch date sheet", error: err.message });
  }
}

async function deleteEntry(req, res) {
  try {
    const entry = await DateSheetEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    await entry.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete entry", error: err.message });
  }
}

module.exports = { createEntry, getDateSheet, deleteEntry };
