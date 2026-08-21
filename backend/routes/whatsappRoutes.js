const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/whatsappController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/status", verifyToken, allowRoles("admin"), ctrl.status);
router.post("/send", verifyToken, allowRoles("admin"), ctrl.sendSingle);
router.post("/send-to-students", verifyToken, allowRoles("admin"), ctrl.sendToStudents);
router.get("/logs", verifyToken, allowRoles("admin"), ctrl.getLogs);

module.exports = router;
