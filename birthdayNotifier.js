const { Op } = require("sequelize");
const { Student, Employee, MessageLog } = require("./models");
const { sendMessage } = require("./whatsapp/whatsappService");

async function sendBirthdayMessages() {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const year = today.getFullYear();
  const students = await Student.findAll({ where: { status: "active", dateOfBirth: { [Op.ne]: null } } });
  const staff = await Employee.findAll({ where: { status: "active", dateOfBirth: { [Op.ne]: null } } });
  const recipients = [];
  for (const s of students) {
    if (String(s.dateOfBirth).slice(5, 10) === `${mm}-${dd}` && (s.whatsappNumber || s.guardianPhone)) {
      recipients.push({ number: s.whatsappNumber || s.guardianPhone, label: `Birthday - ${s.fullName}`, message: `Happy Birthday to ${s.fullName}! Wishing you a wonderful birthday from Avicenna Grammar School. May your year be filled with happiness, health and success.` });
    }
  }
  for (const e of staff) {
    if (String(e.dateOfBirth).slice(5, 10) === `${mm}-${dd}` && e.phone) {
      recipients.push({ number: e.phone, label: `Birthday - ${e.fullName}`, message: `Happy Birthday ${e.fullName}! Best wishes from Avicenna Grammar School. Wishing you happiness, health and continued success.` });
    }
  }
  if (!recipients.length) return { sent: 0 };
  const unique = [];
  for (const r of recipients) {
    const already = await MessageLog.findOne({ where: { recipientLabel: r.label, message: r.message, createdAt: { [Op.gte]: new Date(`${year}-${mm}-${dd}T00:00:00`) } } });
    if (!already) unique.push(r);
  }
  if (!unique.length) return { sent: 0, skipped: recipients.length };
  const result = [];
  for (const src of unique) {
    const r = await sendMessage(src.number, src.message);
    result.push(r);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  for (let i=0;i<result.length;i++) {
    const r=result[i], src=unique[i];
    await MessageLog.create({ recipientNumber: src.number, recipientLabel: src.label, message: src.message, status: r.success ? "sent" : "failed", errorMessage: r.error || null, sentAt: r.success ? new Date() : null });
  }
  return { sent: result.filter(x=>x.success).length, failed: result.filter(x=>!x.success).length };
}

function startBirthdayNotifier() {
  // Check at startup and then every hour; only the date/month/day match causes a send.
  sendBirthdayMessages().catch(err => console.error("Birthday notifier:", err.message));
  setInterval(() => sendBirthdayMessages().catch(err => console.error("Birthday notifier:", err.message)), 60 * 60 * 1000);
}
module.exports = { startBirthdayNotifier, sendBirthdayMessages };
