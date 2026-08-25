const { JobApplicant } = require("../models");

async function createApplicant(req, res) {
  try {
    const applicant = await JobApplicant.create(req.body);
    res.status(201).json(applicant);
  } catch (err) {
    res.status(500).json({ message: "Could not add applicant", error: err.message });
  }
}

async function getApplicants(req, res) {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const applicants = await JobApplicant.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch applicants", error: err.message });
  }
}

async function updateApplicant(req, res) {
  try {
    const applicant = await JobApplicant.findByPk(req.params.id);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });
    await applicant.update(req.body);
    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: "Could not update applicant", error: err.message });
  }
}

module.exports = { createApplicant, getApplicants, updateApplicant };
