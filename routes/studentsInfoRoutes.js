const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const studentsInfoController = require('../controllers/studentsInfoController');

router.use(authMiddleware);

router.get("/", studentsInfoController.getStudents);
router.put("/:id", studentsInfoController.updateStudent);
router.post("/promote", studentsInfoController.promoteStudents);

module.exports = router;
