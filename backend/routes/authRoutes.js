const express = require("express");
const router = express.Router();
const { login, createUser } = require("../controllers/authController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.post("/login", login);
router.post("/users", verifyToken, allowRoles("admin"), createUser);

module.exports = router;
