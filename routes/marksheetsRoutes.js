const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const marksheetController = require('../controllers/marksheetController');

router.use(authMiddleware);

router.get('/marksheet/:class/:session', marksheetController.getMarksheet);

module.exports = router;
