const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/datesheetController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin", "staff", "student"), ctrl.getDateSheet);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createEntry);
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deleteEntry);

module.exports = router;
