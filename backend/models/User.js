const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// One User row per login account. role decides admin/staff/student.
// For staff/student, studentId or employeeId links to their profile record.
const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }, // bcrypt hash
  role: { type: DataTypes.ENUM("admin", "staff", "student"), allowNull: false },
  linkedStudentId: { type: DataTypes.INTEGER, allowNull: true },
  linkedEmployeeId: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = User;
