const multer = require("multer");

// Keeps the uploaded Excel file in memory only (not saved to disk)
const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;
