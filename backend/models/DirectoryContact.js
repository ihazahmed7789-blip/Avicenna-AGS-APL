const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Extra directory entries the admin adds manually — vendors, board members,
// or anyone not already captured as a Student guardian or Employee.
const DirectoryContact = sequelize.define("DirectoryContact", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  note: { type: DataTypes.STRING },
});

module.exports = DirectoryContact;
