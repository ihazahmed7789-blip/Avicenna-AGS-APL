const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const JobApplicant = sequelize.define("JobApplicant", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  appliedFor: { type: DataTypes.STRING }, // designation applied for
  interviewDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM("applied", "shortlisted", "interviewed", "hired", "rejected"), defaultValue: "applied" },
  notes: { type: DataTypes.TEXT },
});

module.exports = JobApplicant;
