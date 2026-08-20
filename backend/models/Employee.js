const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Employee = sequelize.define("Employee", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employeeCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  designation: { type: DataTypes.STRING }, // e.g. "Teacher", "Accountant"
  department: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  joiningDate: { type: DataTypes.DATEONLY },
  monthlySalary: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  basicPay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  allowances: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  standardDeductions: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
});

module.exports = Employee;
