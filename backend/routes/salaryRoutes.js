const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/salaryController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin"), ctrl.getPayments);
router.post("/", verifyToken, allowRoles("admin"), ctrl.recordPayment);

module.exports = router;
