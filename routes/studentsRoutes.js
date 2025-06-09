const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');

router.get('/for-class/:class', studentsController.getStudentsForClass);

module.exports = router;
