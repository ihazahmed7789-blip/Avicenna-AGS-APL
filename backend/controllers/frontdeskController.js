const { Visitor, Complaint, AdmissionInquiry, Student, Employee, DirectoryContact } = require("../models");

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

// --- Directory (combined read-only view of student guardians + staff phones + manual contacts) ---
async function getDirectory(req, res) {
  try {
    const students = await Student.findAll({ where: { status: "active" }, attributes: ["id", "fullName", "className", "guardianName", "guardianPhone"] });
    const staff = await Employee.findAll({ where: { status: "active" }, attributes: ["id", "fullName", "designation", "phone"] });
    const manual = await DirectoryContact.findAll({ order: [["name", "ASC"]] });

    const directory = [
      ...students.map((s) => ({ type: "Guardian", name: s.guardianName || `${s.fullName}'s guardian`, phone: s.guardianPhone, note: `${s.fullName} (${s.className})` })),
      ...staff.map((e) => ({ type: "Staff", name: e.fullName, phone: e.phone, note: e.designation })),
      ...manual.map((c) => ({ type: "Other", name: c.name, phone: c.phone, note: c.note, id: c.id, manual: true })),
    ].filter((d) => d.phone);

    res.json(directory);
  } catch (err) {
    res.status(500).json({ message: "Could not build directory", error: err.message });
  }
}

async function addDirectoryContact(req, res) {
  try {
    const contact = await DirectoryContact.create(req.body);
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: "Could not add contact", error: err.message });
  }
}

async function deleteDirectoryContact(req, res) {
  try {
    const contact = await DirectoryContact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    await contact.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete contact", error: err.message });
  }
}

module.exports = {
  checkInVisitor, checkOutVisitor, getVisitors,
  createComplaint, getComplaints, updateComplaint,
  createInquiry, getInquiries, updateInquiry,
  getDirectory, addDirectoryContact, deleteDirectoryContact,
};
