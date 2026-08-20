const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/attendanceController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin", "staff"), ctrl.getAttendance);
router.get("/report", verifyToken, allowRoles("admin"), ctrl.attendanceReport);
router.get("/check-holiday", verifyToken, allowRoles("admin", "staff"), ctrl.checkHoliday);
router.get("/register", verifyToken, allowRoles("admin", "staff"), ctrl.attendanceRegister);
router.post("/mark", verifyToken, allowRoles("admin", "staff"), ctrl.markBulkAttendance);

module.exports = router;
