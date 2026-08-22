const { Certificate, Employee } = require("../models");

const TEMPLATES = {
  service: (emp) => `This is to certify that ${emp.fullName} has served this institution as ${emp.designation || "a staff member"} in the ${emp.department || "school"} department since ${emp.joiningDate || "their joining date"}. During this period, their conduct and performance have been satisfactory.`,
  experience: (emp) => `This is to certify that ${emp.fullName} worked with this institution as ${emp.designation || "a staff member"} and gained valuable professional experience during their tenure.`,
  relieving: (emp) => `This is to certify that ${emp.fullName}, who served as ${emp.designation || "a staff member"}, has been relieved of their duties. We wish them well in their future endeavors.`,
  other: () => "",
};

async function createCertificate(req, res) {
  try {
    const employee = await Employee.findByPk(req.body.employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const content = req.body.content || TEMPLATES[req.body.type]?.(employee) || "";
    const cert = await Certificate.create({ ...req.body, content });
    res.status(201).json(cert);
  } catch (err) {
    res.status(500).json({ message: "Could not create certificate", error: err.message });
  }
}

async function getCertificates(req, res) {
  try {
    const { employeeId } = req.query;
    const where = employeeId ? { employeeId } : {};
    const certs = await Certificate.findAll({
      where,
      include: [{ model: Employee, attributes: ["fullName", "designation", "department"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch certificates", error: err.message });
  }
}

module.exports = { createCertificate, getCertificates };
