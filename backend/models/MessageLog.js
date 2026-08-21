const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MessageLog = sequelize.define("MessageLog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  recipientNumber: { type: DataTypes.STRING, allowNull: false },
  recipientLabel: { type: DataTypes.STRING }, // e.g. student name
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM("sent", "failed", "queued"), defaultValue: "queued" },
  errorMessage: { type: DataTypes.STRING },
  sentAt: { type: DataTypes.DATE },
});

module.exports = MessageLog;
