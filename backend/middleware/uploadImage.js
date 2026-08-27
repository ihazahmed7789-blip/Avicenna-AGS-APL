const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Gallery photos are saved to disk (not memory) since they need to be served
// back out over HTTP for the public website and the admin preview.
const galleryDir = path.join(__dirname, "..", "uploads", "gallery");
fs.mkdirSync(galleryDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
}

const uploadImage = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } }); // 8MB per photo

module.exports = uploadImage;
