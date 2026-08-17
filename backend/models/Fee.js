const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// A fee charge raised for a student for a given month/term
const FeeRecord = sequelize.define("FeeRecord", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  month: { type: DataTypes.STRING, allowNull: false }, // "2026-08"
  amountDue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  amountPaid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  dueDate: { type: DataTypes.DATEONLY },
  paidDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM("paid", "unpaid", "partial", "overdue"), defaultValue: "unpaid" },
});

module.exports = FeeRecord;
