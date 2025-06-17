const express = require('express');
const router = express.Router();
const subjectsController = require('../controllers/subjectsController');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/for-class/:class', subjectsController.getSubjectsForClass);

module.exports = router;
