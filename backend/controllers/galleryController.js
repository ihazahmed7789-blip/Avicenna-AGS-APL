const fs = require("fs");
const path = require("path");
const { Gallery } = require("../models");

// Admin: full list, newest management view first
async function listGallery(req, res) {
  try {
    const photos = await Gallery.findAll({ order: [["sortOrder", "ASC"], ["createdAt", "DESC"]] });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch gallery", error: err.message });
  }
}

// Public: only published photos, for the main website
async function publicGallery(req, res) {
  try {
    const photos = await Gallery.findAll({
      where: { isPublished: true },
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch gallery", error: err.message });
  }
}

// Admin: upload a new photo (multipart/form-data, field name "photo")
async function uploadPhoto(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No photo file was uploaded" });
    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    const photo = await Gallery.create({
      imageUrl,
      caption: req.body.caption || "",
      isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
      sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder, 10) : 0,
    });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ message: "Could not upload photo", error: err.message });
  }
}

// Admin: update caption / featured flag / order / published state
async function updatePhoto(req, res) {
  try {
    const photo = await Gallery.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    // Featured (homepage slideshow) is capped to 5 photos
    if (req.body.isFeatured === true || req.body.isFeatured === "true") {
      const featuredCount = await Gallery.count({ where: { isFeatured: true } });
      if (featuredCount >= 5 && !photo.isFeatured) {
        return res.status(400).json({ message: "Only 5 photos can be featured in the slideshow at a time. Unfeature one first." });
      }
    }

    const updates = {};
    if (req.body.caption !== undefined) updates.caption = req.body.caption;
    if (req.body.isFeatured !== undefined) updates.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
    if (req.body.sortOrder !== undefined) updates.sortOrder = parseInt(req.body.sortOrder, 10);
    if (req.body.isPublished !== undefined) updates.isPublished = req.body.isPublished === "true" || req.body.isPublished === true;

    await photo.update(updates);
    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: "Could not update photo", error: err.message });
  }
}

// Admin: delete a photo (removes the file from disk too)
async function deletePhoto(req, res) {
  try {
    const photo = await Gallery.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const filePath = path.join(__dirname, "..", photo.imageUrl.replace(/^\//, ""));
    fs.unlink(filePath, () => {}); // best-effort; ignore if already missing

    await photo.destroy();
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete photo", error: err.message });
  }
}

module.exports = { listGallery, publicGallery, uploadPhoto, updatePhoto, deletePhoto };
