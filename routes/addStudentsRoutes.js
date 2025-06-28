const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const addStudentsController = require('../controllers/addStudentsController');

router.use(authMiddleware);
router.post('/', addStudentsController.fullRegister);

module.exports = router;
