const { Student, Employee, FeeRecord, SalaryPayment, Admission, Attendance, Result, Visitor, Complaint, AdmissionInquiry, Timetable, DateSheet, PTMSheet } = require("../models");

// One combined snapshot for the admin dashboard landing page
async function dashboardSummary(req, res) {
  try {
    const totalStudents = await Student.count({ where: { status: "active" } });
    const totalEmployees = await Employee.count({ where: { status: "active" } });
    const pendingAdmissions = await Admission.count({ where: { status: "pending" } });

    const unpaidFees = await FeeRecord.count({ where: { status: "unpaid" } });
    const overdueFees = await FeeRecord.count({ where: { status: "overdue" } });

    const withdrawnStudents=await Student.count({where:{status:"withdrawn"}});
    const admissions=await Admission.count();
    const totalFees=await FeeRecord.sum("amountDue")||0, collectedFees=await FeeRecord.sum("amountPaid")||0;
    const today=new Date().toISOString().slice(0,10);
    const attendanceToday=await Attendance.findAll({where:{date:today}});
    const presentToday=attendanceToday.filter(x=>x.status==="present").length;
    const { Op } = require("sequelize");
    const [visitorsToday, openComplaints, newInquiries, timetableCount, dateSheetUpcoming, ptmUpcoming] = await Promise.all([
      Visitor.count({ where: { checkInTime: { [Op.gte]: new Date(`${today}T00:00:00`) } } }),
      Complaint.count({ where: { status: { [Op.in]: ["open", "in_progress"] } } }),
      AdmissionInquiry.count({ where: { status: "new" } }),
      Timetable.count(),
      DateSheet.count({ where: { examDate: { [Op.gte]: today } } }),
      PTMSheet.count({ where: { meetingDate: { [Op.gte]: today } } }),
    ]);
    res.json({ totalStudents,totalEmployees,pendingAdmissions,unpaidFees,overdueFees,withdrawnStudents,admissions,totalFees,collectedFees,attendanceToday:attendanceToday.length,presentToday,visitorsToday,openComplaints,newInquiries,timetableCount,dateSheetUpcoming,ptmUpcoming });
  } catch (err) {
    res.status(500).json({ message: "Could not build dashboard summary", error: err.message });
  }
}

async function salaryReport(req, res) {
  try {
    const { month } = req.query;
    const where = {};
    if (month) where.month = month;
    const payments = await SalaryPayment.findAll({
      where,
      include: [{ model: Employee, attributes: ["fullName", "designation", "department"] }],
    });
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);
    res.json({ totalPaid, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: "Could not build salary report", error: err.message });
  }
}

async function overview(req,res){try{
 const active=await Student.count({where:{status:"active"}}), withdrawn=await Student.count({where:{status:"withdrawn"}});
 const admissions=await Admission.findAll({order:[["createdAt","DESC"]],limit:10});
 const fees=await FeeRecord.findAll(); const results=await Result.count();
 res.json({active,withdrawn,admissions,results,feeDue:fees.reduce((a,x)=>a+Number(x.amountDue),0),feePaid:fees.reduce((a,x)=>a+Number(x.amountPaid),0)});
}catch(e){res.status(500).json({message:e.message})}}
async function comprehensive(req,res){try{
 const students=await Student.count(),activeStudents=await Student.count({where:{status:"active"}}),staff=await Employee.count();
 const withdrawn=await Student.count({where:{status:"withdrawn"}}), admissions=await Admission.count();
 const fees=await FeeRecord.findAll(), attendance=await Attendance.findAll(), salary=await SalaryPayment.findAll();
 res.json({students,activeStudents,staff,withdrawn,admissions,feeDue:fees.reduce((a,x)=>a+Number(x.amountDue),0),feePaid:fees.reduce((a,x)=>a+Number(x.amountPaid),0),
 attendance:{present:attendance.filter(x=>x.status==="present").length,absent:attendance.filter(x=>x.status==="absent").length,leave:attendance.filter(x=>x.status==="leave").length},
 salaryPaid:salary.reduce((a,x)=>a+Number(x.amountPaid),0)});
}catch(e){res.status(500).json({message:"Could not build report",error:e.message})}}
async function dataset(req, res) {
  try {
    const { type } = req.params;
    const { Student, Employee, Admission, Attendance, Result, PTMSheet, Timetable, DateSheet, Certificate, SalaryPayment } = require("../models");
    let rows = [];
    switch (type) {
      case "student-strength":
        rows = await Student.findAll({ where: { status: "active" }, order: [["className","ASC"],["section","ASC"],["fullName","ASC"]] }); break;
      case "admissions":
        rows = await Admission.findAll({ order: [["createdAt","DESC"]] }); break;
      case "withdrawals":
        rows = await Student.findAll({ where: { status: "withdrawn" }, order: [["withdrawalDate","DESC"]] }); break;
      case "attendance":
        rows = await Attendance.findAll({ order: [["date","DESC"]] }); break;
      case "salary":
        rows = await SalaryPayment.findAll({ include: [{ model: Employee, attributes: ["fullName","designation","department"] }], order: [["createdAt","DESC"]] }); break;
      case "results":
        rows = await Result.findAll({ order: [["createdAt","DESC"]] }); break;
      case "ptm":
        rows = await PTMSheet.findAll({ include: [{ model: Student, attributes: ["fullName","rollNumber","className","section"] }], order: [["meetingDate","DESC"]] }); break;
      case "student-cards":
        rows = await Student.findAll({ where: { status: "active" }, order: [["className","ASC"],["fullName","ASC"]] }); break;
      case "staff-cards":
        rows = await Employee.findAll({ where: { status: "active" }, order: [["fullName","ASC"]] }); break;
      case "timetable":
        rows = await Timetable.findAll({ order: [["className","ASC"],["section","ASC"],["day","ASC"],["period","ASC"]] }); break;
      case "datesheet":
        rows = await DateSheet.findAll({ order: [["examDate","ASC"],["startTime","ASC"]] }); break;
      case "certificates":
        rows = await Certificate.findAll({ order: [["issueDate","DESC"]] }); break;
      case "family": {
        const students = await Student.findAll({ where: { status: "active" }, order: [["familyNumber","ASC"],["fullName","ASC"]] });
        const families = {};
        for (const st of students) {
          const key = st.familyNumber || `no-family-${st.id}`;
          if (!families[key]) families[key] = { familyNumber: st.familyNumber || "", guardianName: st.guardianName || "", guardianPhone: st.guardianPhone || "", students: [] };
          families[key].students.push(st.fullName);
        }
        rows = Object.values(families).map(f => ({ ...f, students: f.students.join(", ") }));
        break;
      }
      default: return res.status(404).json({ message: "Unknown report type." });
    }
    res.json({ type, count: rows.length, rows });
  } catch (e) { res.status(500).json({ message: "Could not build report", error: e.message }); }
}

module.exports = { dashboardSummary, salaryReport, overview, comprehensive, dataset };
