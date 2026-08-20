const { getStatus, sendMessage, sendBulk } = require("../whatsapp/whatsappService");
const { Student, MessageLog } = require("../models");

async function status(req, res) {
  res.json(getStatus());
}

// Send to one number directly
async function sendSingle(req, res) {
  try {
    const { number, message } = req.body;
    const outcome = await sendMessage(number, message);
    await MessageLog.create({
      recipientNumber: number,
      message,
      status: outcome.success ? "sent" : "failed",
      errorMessage: outcome.error || null,
      sentAt: new Date(),
    });
    res.json(outcome);
  } catch (err) {
    res.status(500).json({ message: "Send failed", error: err.message });
  }
}

// Send to all students, or filtered by className/section
async function sendToStudents(req, res) {
  try {
    const { message, className, section } = req.body;
    const where = { status: "active" };
    if (className) where.className = className;
    if (section) where.section = section;

    const students = await Student.findAll({ where });
    const recipients = students
      .filter((s) => s.whatsappNumber)
      .map((s) => ({ number: s.whatsappNumber, label: s.fullName }));

    if (!recipients.length) {
      return res.status(400).json({ message: "No students with a WhatsApp number matched this filter" });
    }

    const results = await sendBulk(recipients, message);

    // Log each outcome
    await MessageLog.bulkCreate(
      results.map((r) => ({
        recipientNumber: r.number,
        recipientLabel: r.label,
        message,
        status: r.success ? "sent" : "failed",
        errorMessage: r.error || null,
        sentAt: new Date(),
      }))
    );

    const sentCount = results.filter((r) => r.success).length;
    res.json({ totalRecipients: recipients.length, sentCount, failedCount: recipients.length - sentCount, results });
  } catch (err) {
    res.status(500).json({ message: "Bulk send failed", error: err.message });
  }
}

async function getLogs(req, res) {
  try {
    const logs = await MessageLog.findAll({ order: [["createdAt", "DESC"]], limit: 200 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch logs", error: err.message });
  }
}

module.exports = { status, sendSingle, sendToStudents, getLogs };
