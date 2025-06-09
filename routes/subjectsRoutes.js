const express = require('express');
const router = express.Router();
const subjectsController = require('../controllers/subjectsController');

router.get('/for-class/:class', subjectsController.getSubjectsForClass);

module.exports = router;
