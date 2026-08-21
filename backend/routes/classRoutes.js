const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/classController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin", "staff"), ctrl.getClasses);
router.get("/report", verifyToken, allowRoles("admin"), ctrl.classReport);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createClass);
router.put("/:id", verifyToken, allowRoles("admin"), ctrl.updateClass);
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deleteClass);
router.post("/:classId/sections", verifyToken, allowRoles("admin"), (req, res, next) => {
  req.body.classId = req.params.classId;
  next();
}, ctrl.createSection);
router.delete("/sections/:id", verifyToken, allowRoles("admin"), ctrl.deleteSection);

module.exports = router;
