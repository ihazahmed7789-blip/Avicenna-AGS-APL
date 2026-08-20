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
const { Visitor, Complaint, AdmissionInquiry } = require("./Frontdesk");
const JobApplicant = require("./JobApplicant");
const Recognition = require("./Recognition");
const { TimetableEntry, DateSheetEntry } = require("./Timetable");
const Certificate = require("./Certificate");
const DirectoryContact = require("./DirectoryContact");

// Associations
Student.hasMany(FeeRecord, { foreignKey: "studentId", onDelete: "CASCADE" });
FeeRecord.belongsTo(Student, { foreignKey: "studentId" });

Student.hasMany(Result, { foreignKey: "studentId", onDelete: "CASCADE" });
Result.belongsTo(Student, { foreignKey: "studentId" });

Employee.hasMany(SalaryPayment, { foreignKey: "employeeId", onDelete: "CASCADE" });
SalaryPayment.belongsTo(Employee, { foreignKey: "employeeId" });

SchoolClass.hasMany(Section, { foreignKey: "classId", onDelete: "CASCADE" });
Section.belongsTo(SchoolClass, { foreignKey: "classId" });

Student.hasMany(Recognition, { foreignKey: "studentId", onDelete: "CASCADE" });
Recognition.belongsTo(Student, { foreignKey: "studentId" });

Employee.hasMany(Certificate, { foreignKey: "employeeId", onDelete: "CASCADE" });
Certificate.belongsTo(Employee, { foreignKey: "employeeId" });

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
  JobApplicant,
  Recognition,
  TimetableEntry,
  DateSheetEntry,
  Certificate,
  DirectoryContact,
};
