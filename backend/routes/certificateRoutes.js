const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/certificateController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, allowRoles("admin"), ctrl.getCertificates);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createCertificate);

module.exports = router;
