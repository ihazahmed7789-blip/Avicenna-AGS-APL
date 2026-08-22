const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/exportController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/fee-report", verifyToken, allowRoles("admin"), ctrl.exportFeeReport);
router.get("/results-report", verifyToken, allowRoles("admin"), ctrl.exportResultReport);
router.get("/salary-report", verifyToken, allowRoles("admin"), ctrl.exportSalaryReport);

module.exports = router;
