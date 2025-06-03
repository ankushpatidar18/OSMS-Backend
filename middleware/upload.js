const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, "students_" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only Excel and CSV files
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedExt = [".xls", ".xlsx", ".csv"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel (.xls, .xlsx) or CSV (.csv) files are allowed!"));
  }
};

// Multer upload instance with file size limit (e.g., 5 MB)
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = upload;
