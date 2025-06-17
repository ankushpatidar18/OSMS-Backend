const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classesController');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', classesController.getAllClasses);

module.exports = router;
