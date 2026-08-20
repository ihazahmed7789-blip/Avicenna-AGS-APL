const { Sequelize } = require("sequelize");
require("dotenv").config();

// Cloud MySQL providers (Aiven, PlanetScale, etc.) require SSL.
// Set DB_SSL=true in .env when connecting to one of those.
const useSSL = process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    dialectOptions: useSSL
      ? { ssl: { rejectUnauthorized: false } }
      : {},
  }
);

module.exports = sequelize;
