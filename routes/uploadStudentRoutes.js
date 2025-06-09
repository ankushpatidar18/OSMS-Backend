const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.js");
const uploadStudentController = require("../controllers/uploadStudentController.js");


router.post("/upload-students", upload.single("file"), uploadStudentController.uploadStudentExcel);


module.exports = router;
