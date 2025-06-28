const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:class', studentsController.getStudentsForClass);

module.exports = router;
