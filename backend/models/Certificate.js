const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Certificate = sequelize.define("Certificate", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM("service", "experience", "relieving", "other"), allowNull: false },
  issueDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  content: { type: DataTypes.TEXT }, // free-text body, printable
});

module.exports = Certificate;
