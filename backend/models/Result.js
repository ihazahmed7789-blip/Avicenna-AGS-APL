const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Result = sequelize.define("Result", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  examName: { type: DataTypes.STRING, allowNull: false }, // "Mid Term", "Final"
  subject: { type: DataTypes.STRING, allowNull: false },
  marksObtained: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  totalMarks: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  grade: { type: DataTypes.STRING },
  examDate: { type: DataTypes.DATEONLY },
  enteredByEmployeeId: { type: DataTypes.INTEGER }, // which staff entered it
});

module.exports = Result;
