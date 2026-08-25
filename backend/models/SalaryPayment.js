const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SalaryPayment = sequelize.define("SalaryPayment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.INTEGER, allowNull: false },
  month: { type: DataTypes.STRING, allowNull: false }, // e.g. "2026-08"
  amountPaid: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  deductions: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paidDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM("paid", "pending"), defaultValue: "pending" },
});

module.exports = SalaryPayment;
