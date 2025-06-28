
const express = require('express');
const router = express.Router();
const admitCardController = require('../controllers/admitCardController');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/classes', admitCardController.getClasses);
router.get('/exams', admitCardController.getExams);
router.get('/data', admitCardController.getAdmitCardData);



module.exports = router;
