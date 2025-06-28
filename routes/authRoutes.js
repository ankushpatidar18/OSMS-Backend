const express = require('express');
const { loginAdmin, logoutAdmin } = require('../controllers/adminController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);

router.post('/logout', logoutAdmin);

// for regularly checking
router.get('/me', authMiddleware, (req, res) => {
  res.json({ admin: req.user });
});



module.exports = router;
