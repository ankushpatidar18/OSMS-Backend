const express = require('express');
const router = express.Router();
const marksheetController = require('../controllers/marksheetController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/student/:studentId', marksheetController.generateMarksheet);

module.exports = router;