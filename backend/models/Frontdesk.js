const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Front desk visitor sign-in/out log
const Visitor = sequelize.define("Visitor", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  visitorName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  purpose: { type: DataTypes.STRING },
  toMeet: { type: DataTypes.STRING }, // who they're visiting
  checkInTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  checkOutTime: { type: DataTypes.DATE, allowNull: true },
});

// Complaints register - from parents, staff, or general
const Complaint = sequelize.define("Complaint", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  complainantName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  subject: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM("open", "in_progress", "resolved"), defaultValue: "open" },
  resolutionNotes: { type: DataTypes.TEXT },
});

// Admission inquiries - informal leads, before someone submits a formal Admission application
const AdmissionInquiry = sequelize.define("AdmissionInquiry", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  inquirerName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  interestedClass: { type: DataTypes.STRING },
  source: { type: DataTypes.STRING }, // e.g. "Walk-in", "Referral", "Facebook"
  notes: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM("new", "contacted", "converted", "not_interested"), defaultValue: "new" },
});

// Manually maintained phone/people directory contacts.
const DirectoryContact = sequelize.define("DirectoryContact", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: "Other" },
  note: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = { Visitor, Complaint, AdmissionInquiry, DirectoryContact };
