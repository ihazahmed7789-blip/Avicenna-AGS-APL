const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// One row per period slot for a class/section
const TimetableEntry = sequelize.define("TimetableEntry", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  className: { type: DataTypes.STRING, allowNull: false },
  section: { type: DataTypes.STRING },
  day: { type: DataTypes.ENUM("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), allowNull: false },
  period: { type: DataTypes.INTEGER, allowNull: false }, // 1, 2, 3...
  startTime: { type: DataTypes.STRING }, // "08:00"
  endTime: { type: DataTypes.STRING },
  subject: { type: DataTypes.STRING, allowNull: false },
  teacherId: { type: DataTypes.INTEGER, allowNull: true }, // Employee id
});

// Exam schedule entry
const DateSheetEntry = sequelize.define("DateSheetEntry", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  className: { type: DataTypes.STRING, allowNull: false },
  section: { type: DataTypes.STRING },
  examName: { type: DataTypes.STRING, allowNull: false }, // "Mid Term 2026"
  subject: { type: DataTypes.STRING, allowNull: false },
  examDate: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.STRING },
  endTime: { type: DataTypes.STRING },
  room: { type: DataTypes.STRING },
});

module.exports = { TimetableEntry, DateSheetEntry };
