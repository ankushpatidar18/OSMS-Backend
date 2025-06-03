const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.js");
const studentController = require("../controllers/studentController");


router.post("/upload-students", upload.single("file"), studentController.uploadStudentExcel);


module.exports = router;
