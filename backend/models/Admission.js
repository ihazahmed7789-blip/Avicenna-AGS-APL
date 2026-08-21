const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Admission = sequelize.define("Admission", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicantName: { type: DataTypes.STRING, allowNull: false },
  appliedForClass: { type: DataTypes.STRING, allowNull: false },
  guardianName: { type: DataTypes.STRING },
  guardianPhone: { type: DataTypes.STRING },
  applicationDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM("pending", "approved", "rejected", "enrolled"), defaultValue: "pending" },
  linkedStudentId: { type: DataTypes.INTEGER, allowNull: true }, // set once enrolled
  notes: { type: DataTypes.STRING },
});

module.exports = Admission;
