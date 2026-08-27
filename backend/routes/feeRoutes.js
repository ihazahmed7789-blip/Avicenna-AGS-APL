const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/feeController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin", "staff", "student"), ctrl.getFeeRecords);
router.get("/summary", verifyToken, allowRoles("admin"), ctrl.feeSummaryReport);
router.get("/unpaid", verifyToken, allowRoles("admin"), ctrl.unpaidByClass);
router.get("/student/:studentId/history", verifyToken, allowRoles("admin", "staff", "student"), ctrl.studentFeeHistory);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createFeeRecord);
router.post("/:id/pay", verifyToken, allowRoles("admin"), ctrl.payFee);
router.post("/mark-overdue", verifyToken, allowRoles("admin"), ctrl.markOverdue);

module.exports = router;
