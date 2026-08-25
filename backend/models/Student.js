const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Student = sequelize.define("Student", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rollNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  fatherName: { type: DataTypes.STRING },
  dateOfBirth: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.ENUM("male", "female", "other") },
  className: { type: DataTypes.STRING, allowNull: false }, // e.g. "9th"
  section: { type: DataTypes.STRING }, // e.g. "A"
  admissionDate: { type: DataTypes.DATEONLY },
  address: { type: DataTypes.STRING },
  guardianName: { type: DataTypes.STRING },
  guardianPhone: { type: DataTypes.STRING }, // used as WhatsApp number
  whatsappNumber: { type: DataTypes.STRING }, // international format e.g. 923001234567
  familyNumber: { type: DataTypes.STRING }, // groups siblings under one family for Family List / combined fee view
  guardianCnic: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM("active", "inactive", "graduated", "withdrawn"), defaultValue: "active" },
  withdrawalDate: { type: DataTypes.DATEONLY, allowNull: true },
  withdrawalReason: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Student;
