const express = require('express');
const router = express.Router();

const studentCtrl = require('../controllers/entrymarksMatrix/studentController');
const subjectCtrl = require('../controllers/entrymarksMatrix/subjectController');
const examCtrl = require('../controllers/entrymarksMatrix/examController');
const marksCtrl = require('../controllers/entrymarksMatrix/marksController');
const classCtrl = require('../controllers/entrymarksMatrix/classController');

router.get('/students', studentCtrl.getStudentsByClassAndSession);
router.get('/subjects/:class', subjectCtrl.getSubjectsByClass);
router.get('/exams/:class/:session', examCtrl.getExamsForClass);
router.get('/marks', marksCtrl.getMarksByStudentId);
router.post('/marks', marksCtrl.saveStudentMarks);
router.get('/classes', classCtrl.getUniqueClasses);

module.exports = router;