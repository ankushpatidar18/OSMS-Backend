
const express = require('express');
const router = express.Router();
const admitCardController = require('../controllers/admitCardController');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/classes', admitCardController.getClasses);
router.get('/exams', admitCardController.getExams);
router.get('/admit-card-data', admitCardController.getAdmitCardData);


//have to put in admitCardController.js
router.get('/subjects', async (req, res) => {
  try {
    const [rows] = await require('../db').query('SELECT * FROM subjects');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
