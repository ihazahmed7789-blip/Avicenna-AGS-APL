const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/galleryController");
const { verifyToken, allowRoles } = require("../middleware/auth");
const uploadImage = require("../middleware/uploadImage");

router.get("/public", ctrl.publicGallery);
router.get("/", verifyToken, allowRoles("admin"), ctrl.listGallery);
router.post("/", verifyToken, allowRoles("admin"), uploadImage.single("photo"), ctrl.uploadPhoto);
router.put("/:id", verifyToken, allowRoles("admin"), ctrl.updatePhoto);
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deletePhoto);

module.exports = router;
