const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Master list of classes/grades (e.g. "9th", "10th") so the whole app
// references the same consistent class names instead of free typing.
const SchoolClass = sequelize.define("SchoolClass", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }, // "9th"
  order: { type: DataTypes.INTEGER, defaultValue: 0 }, // for sorting classes in the right order
});

// Sections within a class (e.g. "A", "B") and optional groups (e.g. "Science", "Arts")
const Section = sequelize.define("Section", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  classId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false }, // "A"
  group: { type: DataTypes.STRING }, // "Science", "Arts" - optional
  capacity: { type: DataTypes.INTEGER },
});

module.exports = { SchoolClass, Section };
