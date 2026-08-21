const { Admission, Student } = require("../models");

async function createAdmission(req, res) {
  try {
    const admission = await Admission.create(req.body);
    res.status(201).json(admission);
  } catch (err) {
    res.status(500).json({ message: "Could not create admission record", error: err.message });
  }
}

// Public online admission application. Creates a pending application without requiring login.
async function createPublicAdmission(req, res) {
  try {
    const { applicantName, appliedForClass, guardianName, guardianPhone, notes } = req.body || {};
    if (!applicantName || !appliedForClass) {
      return res.status(400).json({ message: "Applicant name and applied-for class are required" });
    }
    const admission = await Admission.create({
      applicantName: String(applicantName).trim(),
      appliedForClass: String(appliedForClass).trim(),
      guardianName: guardianName ? String(guardianName).trim() : null,
      guardianPhone: guardianPhone ? String(guardianPhone).trim() : null,
      notes: notes ? String(notes).trim() : null,
      status: "pending",
      applicationDate: new Date(),
    });
    res.status(201).json({ message: "Application submitted successfully", id: admission.id });
  } catch (err) {
    res.status(500).json({ message: "Could not submit online application", error: err.message });
  }
}

async function getAdmissions(req, res) {
  try {
    const { status, appliedForClass } = req.query;
    const where = {};
    if (status) where.status = status;
    if (appliedForClass) where.appliedForClass = appliedForClass;
    const admissions = await Admission.findAll({ where, order: [["applicationDate", "DESC"]] });
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch admissions", error: err.message });
  }
}

async function updateAdmissionStatus(req, res) {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) return res.status(404).json({ message: "Admission not found" });
    await admission.update({ status: req.body.status, notes: req.body.notes });
    res.json(admission);
  } catch (err) {
    res.status(500).json({ message: "Could not update admission", error: err.message });
  }
}

// Approve an admission and enroll them as an actual Student record in one step
async function enrollAdmission(req, res) {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) return res.status(404).json({ message: "Admission not found" });

    const student = await Student.create({
      rollNumber: req.body.rollNumber,
      fullName: admission.applicantName,
      className: admission.appliedForClass,
      section: req.body.section,
      guardianName: admission.guardianName,
      guardianPhone: admission.guardianPhone,
      whatsappNumber: admission.guardianPhone,
      admissionDate: new Date(),
      status: "active",
    });

    await admission.update({ status: "enrolled", linkedStudentId: student.id });
    res.json({ admission, student });
  } catch (err) {
    res.status(500).json({ message: "Could not enroll student", error: err.message });
  }
}

// Strength report: student counts grouped by class & section
async function strengthReport(req, res) {
  try {
    const { Student } = require("../models");
    const students = await Student.findAll({ where: { status: "active" } });
    const byClass = {};
    for (const s of students) {
      const key = s.className;
      byClass[key] = byClass[key] || { total: 0, sections: {} };
      byClass[key].total += 1;
      const sec = s.section || "Unassigned";
      byClass[key].sections[sec] = (byClass[key].sections[sec] || 0) + 1;
    }
    res.json({ totalStrength: students.length, byClass });
  } catch (err) {
    res.status(500).json({ message: "Could not build strength report", error: err.message });
  }
}

module.exports = {
  createAdmission,
  createPublicAdmission,
  getAdmissions,
  updateAdmissionStatus,
  enrollAdmission,
  strengthReport,
};
