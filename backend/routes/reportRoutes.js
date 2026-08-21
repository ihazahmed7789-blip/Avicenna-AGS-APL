const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reportController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/dashboard-summary", verifyToken, allowRoles("admin"), ctrl.dashboardSummary);
router.get("/salary", verifyToken, allowRoles("admin"), ctrl.salaryReport);

module.exports = router;
