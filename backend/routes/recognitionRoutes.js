const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/recognitionController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, ctrl.getRecognitions);
router.post("/", verifyToken, allowRoles("admin", "staff"), ctrl.createRecognition);
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deleteRecognition);

module.exports = router;
