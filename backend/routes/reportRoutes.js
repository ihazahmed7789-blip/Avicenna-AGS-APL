const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reportController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/dashboard-summary", verifyToken, allowRoles("admin"), ctrl.dashboardSummary);
router.get("/overview", verifyToken, allowRoles("admin"), ctrl.overview);
router.get("/comprehensive", verifyToken, allowRoles("admin"), ctrl.comprehensive);
router.get("/dataset/:type", verifyToken, allowRoles("admin"), ctrl.dataset);
router.get("/salary", verifyToken, allowRoles("admin"), ctrl.salaryReport);

module.exports = router;
