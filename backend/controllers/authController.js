const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ where: { username } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const payload = {
      id: user.id,
      name: user.name,
      role: user.role,
      linkedStudentId: user.linkedStudentId,
      linkedEmployeeId: user.linkedEmployeeId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// Admin-only: create a login account for a staff member or student
async function createUser(req, res) {
  try {
    const { name, username, password, role, linkedStudentId, linkedEmployeeId } = req.body;
    if (!name || !username || !password || !role) {
      return res.status(400).json({ message: "name, username, password and role are required" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      password: hashed,
      role,
      linkedStudentId: linkedStudentId || null,
      linkedEmployeeId: linkedEmployeeId || null,
    });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Could not create user", error: err.message });
  }
}

module.exports = { login, createUser };
