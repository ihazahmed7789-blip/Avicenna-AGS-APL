const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admissionController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin"), ctrl.getAdmissions);
router.get("/strength-report", verifyToken, allowRoles("admin"), ctrl.strengthReport);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createAdmission);
router.put("/:id/status", verifyToken, allowRoles("admin"), ctrl.updateAdmissionStatus);
router.post("/:id/enroll", verifyToken, allowRoles("admin"), ctrl.enrollAdmission);

module.exports = router;
