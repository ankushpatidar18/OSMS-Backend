const express = require('express');
const { loginUser, logoutUser } = require('../controllers/userController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/logout', logoutUser);

// for regularly checking
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user }); 
});

module.exports = router;
