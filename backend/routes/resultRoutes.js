const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/resultController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin", "staff", "student"), ctrl.getResults);
router.get("/report-card", verifyToken, ctrl.reportCard);
router.post("/", verifyToken, allowRoles("admin", "staff"), ctrl.createResult);

module.exports = router;
