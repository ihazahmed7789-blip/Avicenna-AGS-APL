const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employeeController");
const { verifyToken, allowRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", verifyToken, allowRoles("admin"), ctrl.getEmployees);
router.get("/:id", verifyToken, allowRoles("admin"), ctrl.getEmployeeById);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createEmployee);
router.put("/:id", verifyToken, allowRoles("admin"), ctrl.updateEmployee);
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deleteEmployee);
router.post("/import", verifyToken, allowRoles("admin"), upload.single("file"), ctrl.importFromExcel);

module.exports = router;
