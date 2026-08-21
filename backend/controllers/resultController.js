const { Result, Student } = require("../models");

function computeGrade(obtained, total) {
  const pct = (parseFloat(obtained) / parseFloat(total)) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

async function createResult(req, res) {
  try {
    const body = req.body;
    body.grade = body.grade || computeGrade(body.marksObtained, body.totalMarks);
    if (req.user?.role === "staff") body.enteredByEmployeeId = req.user.linkedEmployeeId;
    const result = await Result.create(body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Could not save result", error: err.message });
  }
}

async function getResults(req, res) {
  try {
    const { studentId, examName, className } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (examName) where.examName = examName;

    const include = [{ model: Student, attributes: ["fullName", "rollNumber", "className", "section"] }];
    if (className) include[0].where = { className };

    const results = await Result.findAll({ where, include, order: [["examDate", "DESC"]] });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch results", error: err.message });
  }
}

// Report card for one student: all subjects for a given exam
async function reportCard(req, res) {
  try {
    const { studentId, examName } = req.query;
    if (!studentId || !examName) {
      return res.status(400).json({ message: "studentId and examName are required" });
    }
    const results = await Result.findAll({ where: { studentId, examName } });
    const totalObtained = results.reduce((sum, r) => sum + parseFloat(r.marksObtained), 0);
    const totalMax = results.reduce((sum, r) => sum + parseFloat(r.totalMarks), 0);
    const percentage = totalMax ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

    res.json({ subjects: results, totalObtained, totalMax, percentage });
  } catch (err) {
    res.status(500).json({ message: "Could not build report card", error: err.message });
  }
}

module.exports = { createResult, getResults, reportCard };
