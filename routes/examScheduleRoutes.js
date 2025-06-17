const express = require('express');
const router = express.Router();
const controller = require('../controllers/examScheduleController');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', controller.getSchedules);
router.post('/', controller.addSchedule);
router.put('/', controller.editSchedule);
router.delete('/:schedule_id', controller.deleteSchedule);

module.exports = router;
