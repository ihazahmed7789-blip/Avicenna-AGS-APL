const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/whatsappController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/status", verifyToken, allowRoles("admin"), ctrl.status);
router.post("/connect", verifyToken, allowRoles("admin"), ctrl.connect);
router.post("/disconnect", verifyToken, allowRoles("admin"), ctrl.disconnect);
router.post("/send", verifyToken, allowRoles("admin"), ctrl.sendSingle);
router.post("/send-to-family", verifyToken, allowRoles("admin"), ctrl.sendToFamily);
router.post("/send-to-students", verifyToken, allowRoles("admin"), ctrl.sendToStudents);
router.get("/logs", verifyToken, allowRoles("admin"), ctrl.getLogs);

module.exports = router;
