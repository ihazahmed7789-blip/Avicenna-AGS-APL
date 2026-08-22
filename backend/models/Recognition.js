const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Recognition = sequelize.define("Recognition", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM("week", "month"), allowNull: false },
  periodLabel: { type: DataTypes.STRING, allowNull: false }, // e.g. "2026-W32" or "2026-08"
  reason: { type: DataTypes.STRING },
});

module.exports = Recognition;
