// Run once after setup: node seed.js
// Creates the first admin account so you can log in and start adding
// staff/student users from within the app.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User } = require("./models");

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const existing = await User.findOne({ where: { username: "admin" } });
  if (existing) {
    console.log("Admin user already exists. Nothing to do.");
    process.exit(0);
  }

  const hashed = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "School Admin",
    username: "admin",
    password: hashed,
    role: "admin",
  });

  console.log("Admin user created:");
  console.log("  username: admin");
  console.log("  password: admin123");
  console.log("Change this password after your first login.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
