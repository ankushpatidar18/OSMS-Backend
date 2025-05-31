const express = require('express');
const { loginAdmin, logoutAdmin } = require('../controllers/adminController');
const router = express.Router();

router.post('/admin/login', loginAdmin);

router.post('/admin/logout', logoutAdmin);

module.exports = router;
