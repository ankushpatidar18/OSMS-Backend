const uploadStudentService = require('../services/uploadStudentsService');

exports.uploadStudentExcel = async (req, res) => {
  try {
    const result = await uploadStudentService.processStudentExcel(req.file);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error uploading student Excel:", error);
    res.status(500).json({ message: error.message || "Server error during upload." });
  }
};
