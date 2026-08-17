const { Visitor, Complaint, AdmissionInquiry, DirectoryContact, Student, Employee } = require("../models");

// --- Visitors ---
async function checkInVisitor(req, res) {
  try {
    const visitor = await Visitor.create({ ...req.body, checkInTime: new Date() });
    res.status(201).json(visitor);
  } catch (err) {
    res.status(500).json({ message: "Could not check in visitor", error: err.message });
  }
}

async function checkOutVisitor(req, res) {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    await visitor.update({ checkOutTime: new Date() });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ message: "Could not check out visitor", error: err.message });
  }
}

async function getVisitors(req, res) {
  try {
    const visitors = await Visitor.findAll({ order: [["checkInTime", "DESC"]], limit: 200 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch visitors", error: err.message });
  }
}

// --- Complaints ---
async function createComplaint(req, res) {
  try {
    const complaint = await Complaint.create(req.body);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: "Could not log complaint", error: err.message });
  }
}

async function getComplaints(req, res) {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const complaints = await Complaint.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch complaints", error: err.message });
  }
}

async function updateComplaint(req, res) {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    await complaint.update(req.body);
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: "Could not update complaint", error: err.message });
  }
}

// --- Admission Inquiries ---
async function createInquiry(req, res) {
  try {
    const inquiry = await AdmissionInquiry.create(req.body);
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: "Could not log inquiry", error: err.message });
  }
}

async function getInquiries(req, res) {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const inquiries = await AdmissionInquiry.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch inquiries", error: err.message });
  }
}

async function updateInquiry(req, res) {
  try {
    const inquiry = await AdmissionInquiry.findByPk(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    await inquiry.update(req.body);
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: "Could not update inquiry", error: err.message });
  }
}

// --- Directory (manual contacts + staff + student guardians) ---
async function getDirectory(req, res) {
  try {
    const [contacts, students, staff] = await Promise.all([
      DirectoryContact.findAll({ where: { active: true }, order: [["name", "ASC"]] }),
      Student.findAll({ where: { status: "active" }, attributes: ["id", "fullName", "className", "guardianName", "guardianPhone"] }),
      Employee.findAll({ where: { status: "active" }, attributes: ["id", "fullName", "designation", "phone"] }),
    ]);
    const directory = [
      ...contacts.map((c) => ({ id: `contact-${c.id}`, source: "manual", sourceId: c.id, type: c.type || "Other", name: c.name, phone: c.phone, note: c.note || "" })),
      ...students.map((st) => ({ id: `guardian-${st.id}`, source: "guardian", sourceId: st.id, type: "Guardian", name: st.guardianName || `${st.fullName}'s guardian`, phone: st.guardianPhone, note: `${st.fullName} (${st.className})` })),
      ...staff.map((e) => ({ id: `staff-${e.id}`, source: "staff", sourceId: e.id, type: "Staff", name: e.fullName, phone: e.phone, note: e.designation || "" })),
    ].filter((d) => d.phone);
    res.json(directory);
  } catch (err) {
    res.status(500).json({ message: "Could not build directory", error: err.message });
  }
}

async function createDirectoryContact(req, res) {
  try {
    const { normalizePakistanWhatsAppNumber } = require("../utils/phone");
    const phone = normalizePakistanWhatsAppNumber(req.body.phone);
    if (!phone) return res.status(400).json({ message: "Invalid Pakistan phone number. Use 03xx-xxxxxxx or 923xxxxxxxxx." });
    if (!req.body.name?.trim()) return res.status(400).json({ message: "Name is required." });
    const row = await DirectoryContact.create({ name: req.body.name.trim(), phone, type: req.body.type || "Other", note: req.body.note || "" });
    res.status(201).json(row);
  } catch (err) { res.status(400).json({ message: "Could not save contact", error: err.message }); }
}

async function updateDirectoryContact(req, res) {
  try {
    const row = await DirectoryContact.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Contact not found." });
    const { normalizePakistanWhatsAppNumber } = require("../utils/phone");
    const data = { ...req.body };
    if (data.phone) {
      data.phone = normalizePakistanWhatsAppNumber(data.phone);
      if (!data.phone) return res.status(400).json({ message: "Invalid Pakistan phone number." });
    }
    await row.update(data);
    res.json(row);
  } catch (err) { res.status(400).json({ message: "Could not update contact", error: err.message }); }
}

async function deleteDirectoryContact(req, res) {
  try {
    const row = await DirectoryContact.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Contact not found." });
    await row.destroy();
    res.json({ message: "Contact deleted." });
  } catch (err) { res.status(500).json({ message: "Could not delete contact", error: err.message }); }
}

module.exports = {
  checkInVisitor, checkOutVisitor, getVisitors,
  createComplaint, getComplaints, updateComplaint,
  createInquiry, getInquiries, updateInquiry,
  getDirectory, createDirectoryContact, updateDirectoryContact, deleteDirectoryContact,
};
