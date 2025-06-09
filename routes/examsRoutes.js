const express = require('express');
const router = express.Router();
const examsController = require('../controllers/examsController');

router.get('/for-class-subject/:classSubjectId', examsController.getExamsForClassSubject);

module.exports = router;
