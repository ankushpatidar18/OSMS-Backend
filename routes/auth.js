const express = require('express');
const { loginAdmin, logoutAdmin } = require('../controllers/adminController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/admin/login', loginAdmin);

router.post('/admin/logout', logoutAdmin);

// GET /api/admin/me
router.get('/admin/me', authMiddleware, (req, res) => {
  res.json({ admin: req.user });
});



module.exports = router;
