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

// Class-wise (and section-wise) result report: all students with each
// subject's marks laid out for comparison/printing
async function classResultReport(req, res) {
  try {
    const { className, section, examName } = req.query;
    if (!className || !examName) return res.status(400).json({ message: "className and examName are required" });

    const studentWhere = { className, status: "active" };
    if (section) studentWhere.section = section;
    const students = await Student.findAll({ where: studentWhere, order: [["rollNumber", "ASC"]] });
    const studentIds = students.map((s) => s.id);

    const { Op } = require("sequelize");
    const results = studentIds.length
      ? await Result.findAll({ where: { studentId: { [Op.in]: studentIds }, examName } })
      : [];

    const subjects = [...new Set(results.map((r) => r.subject))];

    const report = students.map((s) => {
      const subjectMarks = {};
      let totalObtained = 0, totalMax = 0;
      for (const subj of subjects) {
        const r = results.find((res) => res.studentId === s.id && res.subject === subj);
        subjectMarks[subj] = r ? { obtained: r.marksObtained, total: r.totalMarks, grade: r.grade } : null;
        if (r) { totalObtained += parseFloat(r.marksObtained); totalMax += parseFloat(r.totalMarks); }
      }
      return {
        studentId: s.id, rollNumber: s.rollNumber, fullName: s.fullName, section: s.section,
        subjects: subjectMarks, totalObtained, totalMax,
        percentage: totalMax ? ((totalObtained / totalMax) * 100).toFixed(2) : null,
      };
    });

    res.json({ subjects, report });
  } catch (err) {
    res.status(500).json({ message: "Could not build class result report", error: err.message });
  }
}

module.exports = { createResult, getResults, reportCard, classResultReport };
