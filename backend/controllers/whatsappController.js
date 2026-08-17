const { getStatus, reconnect, logout, sendMessage, sendBulk, normalizePakistanWhatsAppNumber } = require("../whatsapp/whatsappService");
const { Student, MessageLog } = require("../models");

async function status(req, res) {
  res.json(getStatus());
}

async function connect(req, res) {
  try {
    res.json(await reconnect());
  } catch (err) {
    res.status(500).json({ message: "Could not initialize WhatsApp", error: err.message });
  }
}

async function disconnect(req, res) {
  try {
    res.json(await logout());
  } catch (err) {
    res.status(500).json({ message: "Could not disconnect WhatsApp", error: err.message });
  }
}

async function sendSingle(req, res) {
  try {
    const { number, message } = req.body;
    if (!number || !message) return res.status(400).json({ message: "Number and message are required." });
    const normalizedNumber = normalizePakistanWhatsAppNumber(number);
    if (!normalizedNumber) return res.status(400).json({ message: "Invalid Pakistan WhatsApp number. Use 03xx-xxxxxxx or 923xxxxxxxxx." });
    const outcome = await sendMessage(normalizedNumber, message);
    await MessageLog.create({ recipientNumber: normalizedNumber, message, status: outcome.success ? "sent" : "failed", errorMessage: outcome.error || null, sentAt: new Date() });
    res.json(outcome);
  } catch (err) {
    res.status(500).json({ message: "Send failed", error: err.message });
  }
}

async function sendToStudents(req, res) {
  try {
    const { message, className, section } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required." });
    const where = { status: "active" };
    if (className) where.className = className;
    if (section) where.section = section;
    const students = await Student.findAll({ where });
    const recipients = students.filter((s) => s.whatsappNumber).map((s) => ({ number: s.whatsappNumber, label: s.fullName }));
    if (!recipients.length) return res.status(400).json({ message: "No active students with a WhatsApp number matched this filter." });
    const results = await sendBulk(recipients, message);
    await MessageLog.bulkCreate(results.map((r) => ({ recipientNumber: r.number, recipientLabel: r.label, message, status: r.success ? "sent" : "failed", errorMessage: r.error || null, sentAt: new Date() })));
    const sentCount = results.filter((r) => r.success).length;
    res.json({ totalRecipients: recipients.length, sentCount, failedCount: recipients.length - sentCount, results });
  } catch (err) {
    res.status(500).json({ message: "Bulk send failed", error: err.message });
  }
}


async function sendToFamily(req, res) {
  try {
    const { familyNumber, message } = req.body;
    if (!familyNumber || !message) return res.status(400).json({ message: "Family number and message are required." });
    const students = await Student.findAll({ where: { status: "active", familyNumber } });
    if (!students.length) return res.status(404).json({ message: "No active students found for this family." });
    const recipients = [];
    const seen = new Set();
    for (const student of students) {
      const number = normalizePakistanWhatsAppNumber(student.whatsappNumber || student.guardianPhone);
      if (number && !seen.has(number)) {
        seen.add(number);
        recipients.push({ number, label: student.guardianName || `${student.fullName}'s guardian` });
      }
    }
    if (!recipients.length) return res.status(400).json({ message: "No valid WhatsApp number found for this family." });
    const results = await sendBulk(recipients, message);
    await MessageLog.bulkCreate(results.map((r) => ({
      recipientNumber: r.number, recipientLabel: r.label, message,
      status: r.success ? "sent" : "failed", errorMessage: r.error || null, sentAt: new Date()
    })));
    const sentCount = results.filter((r) => r.success).length;
    res.json({ totalRecipients: results.length, sentCount, failedCount: results.length - sentCount, results });
  } catch (err) { res.status(500).json({ message: "Family message failed", error: err.message }); }
}

async function getLogs(req, res) {
  try {
    const logs = await MessageLog.findAll({ order: [["createdAt", "DESC"]], limit: 200 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch logs", error: err.message });
  }
}

module.exports = { status, connect, disconnect, sendSingle, sendToStudents, sendToFamily, getLogs };
