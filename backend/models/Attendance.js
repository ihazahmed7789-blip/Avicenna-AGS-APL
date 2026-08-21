const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// One row per person per day. personType tells you whether personId
// points to a Student or an Employee.
const Attendance = sequelize.define("Attendance", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  personType: { type: DataTypes.ENUM("student", "staff"), allowNull: false },
  personId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM("present", "absent", "late", "leave", "short_leave"), allowNull: false },
  remarks: { type: DataTypes.STRING },
  markedByUserId: { type: DataTypes.INTEGER },
}, {
  indexes: [{ unique: true, fields: ["personType", "personId", "date"] }], // one record per person per day
});

module.exports = Attendance;
