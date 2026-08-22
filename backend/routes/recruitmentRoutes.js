const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/recruitmentController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin"), ctrl.getApplicants);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createApplicant);
router.put("/:id", verifyToken, allowRoles("admin"), ctrl.updateApplicant);

module.exports = router;
