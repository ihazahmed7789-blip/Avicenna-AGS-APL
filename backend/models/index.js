const sequelize = require("../config/db");

const User = require("./User");
const Student = require("./Student");
const Employee = require("./Employee");
const SalaryPayment = require("./SalaryPayment");
const FeeRecord = require("./Fee");
const Result = require("./Result");
const Admission = require("./Admission");
const MessageLog = require("./MessageLog");
const { SchoolClass, Section } = require("./SchoolClass");
const Attendance = require("./Attendance");
const { Visitor, Complaint, AdmissionInquiry, DirectoryContact } = require("./Frontdesk");
const JobApplicant = require("./JobApplicant");
const { Timetable, DateSheet, Certificate, PTMSheet, Recognition, Leave, AppSetting } = require("./Academic");

// Associations
Student.hasMany(FeeRecord, { foreignKey: "studentId", onDelete: "CASCADE" });
FeeRecord.belongsTo(Student, { foreignKey: "studentId" });

Student.hasMany(Result, { foreignKey: "studentId", onDelete: "CASCADE" });
Result.belongsTo(Student, { foreignKey: "studentId" });

Employee.hasMany(SalaryPayment, { foreignKey: "employeeId", onDelete: "CASCADE" });
SalaryPayment.belongsTo(Employee, { foreignKey: "employeeId" });

SchoolClass.hasMany(Section, { foreignKey: "classId", onDelete: "CASCADE" });
Section.belongsTo(SchoolClass, { foreignKey: "classId" });

Student.hasMany(PTMSheet,{foreignKey:"studentId",onDelete:"CASCADE"}); PTMSheet.belongsTo(Student,{foreignKey:"studentId"});
Student.hasMany(Recognition,{foreignKey:"studentId",onDelete:"CASCADE"}); Recognition.belongsTo(Student,{foreignKey:"studentId"});
Student.hasMany(Leave,{foreignKey:"personId",constraints:false}); Employee.hasMany(Leave,{foreignKey:"personId",constraints:false});
module.exports = {
  sequelize,
  User,
  Student,
  Employee,
  SalaryPayment,
  FeeRecord,
  Result,
  Admission,
  MessageLog,
  SchoolClass,
  Section,
  Attendance,
  Visitor,
  Complaint,
  AdmissionInquiry,
  DirectoryContact,
  JobApplicant,
  Timetable, DateSheet, Certificate, PTMSheet, Recognition, Leave, AppSetting,
};
