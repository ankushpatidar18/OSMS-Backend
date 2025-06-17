const express = require('express');
const router = express.Router();
const examsController = require('../controllers/examsController');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/for-class-subject/:classSubjectId', examsController.getExamsForClassSubject);

module.exports = router;
