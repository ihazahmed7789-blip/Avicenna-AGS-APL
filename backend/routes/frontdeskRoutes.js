const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/frontdeskController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/directory", verifyToken, allowRoles("admin", "staff"), ctrl.getDirectory);
router.post("/directory", verifyToken, allowRoles("admin", "staff"), ctrl.addDirectoryContact);
router.delete("/directory/:id", verifyToken, allowRoles("admin"), ctrl.deleteDirectoryContact);

router.get("/visitors", verifyToken, allowRoles("admin", "staff"), ctrl.getVisitors);
router.post("/visitors", verifyToken, allowRoles("admin", "staff"), ctrl.checkInVisitor);
router.put("/visitors/:id/checkout", verifyToken, allowRoles("admin", "staff"), ctrl.checkOutVisitor);

router.get("/complaints", verifyToken, allowRoles("admin", "staff"), ctrl.getComplaints);
router.post("/complaints", verifyToken, allowRoles("admin", "staff"), ctrl.createComplaint);
router.put("/complaints/:id", verifyToken, allowRoles("admin", "staff"), ctrl.updateComplaint);

router.get("/inquiries", verifyToken, allowRoles("admin", "staff"), ctrl.getInquiries);
router.post("/inquiries", verifyToken, allowRoles("admin", "staff"), ctrl.createInquiry);
router.put("/inquiries/:id", verifyToken, allowRoles("admin", "staff"), ctrl.updateInquiry);

module.exports = router;
