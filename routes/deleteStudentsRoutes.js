const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const deleteStudentsController = require('../controllers/deleteStudentsController');

router.use(authMiddleware);

router.delete('/delete-many', deleteStudentsController.deleteManyStudents);
router.get('/filter', deleteStudentsController.filterStudents);

module.exports = router;
