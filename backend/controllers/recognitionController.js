const { Recognition, Student } = require("../models");

async function createRecognition(req, res) {
  try {
    const record = await Recognition.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: "Could not save recognition", error: err.message });
  }
}

async function getRecognitions(req, res) {
  try {
    const { type } = req.query;
    const where = type ? { type } : {};
    const records = await Recognition.findAll({
      where,
      include: [{ model: Student, attributes: ["fullName", "rollNumber", "className"] }],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch recognitions", error: err.message });
  }
}

async function deleteRecognition(req, res) {
  try {
    const record = await Recognition.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });
    await record.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete", error: err.message });
  }
}

module.exports = { createRecognition, getRecognitions, deleteRecognition };
