const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.js");
const uploadStudentController = require("../controllers/uploadStudentController.js");

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post("/upload-students", upload.single("file"), uploadStudentController.uploadStudentExcel);


module.exports = router;
