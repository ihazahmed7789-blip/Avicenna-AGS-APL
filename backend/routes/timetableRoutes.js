const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/timetableController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin", "staff", "student"), ctrl.getTimetable);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createEntry);
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deleteEntry);

module.exports = router;
