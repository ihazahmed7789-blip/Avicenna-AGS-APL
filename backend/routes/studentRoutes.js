const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentController");
const { verifyToken, allowRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", verifyToken, allowRoles("admin", "staff"), ctrl.getStudents);
router.get("/family-list", verifyToken, allowRoles("admin"), ctrl.familyList);
router.get("/:id", verifyToken, ctrl.getStudentById);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createStudent);
router.put("/:id", verifyToken, allowRoles("admin"), ctrl.updateStudent);
router.put("/:id/withdraw", verifyToken, allowRoles("admin"), ctrl.withdrawStudent);
router.get("/reports/withdrawals", verifyToken, allowRoles("admin"), ctrl.withdrawalReport);
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deleteStudent);
router.post("/import", verifyToken, allowRoles("admin"), upload.single("file"), ctrl.importFromExcel);

module.exports = router;
