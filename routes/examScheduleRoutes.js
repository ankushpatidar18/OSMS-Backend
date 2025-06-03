const express = require('express');
const router = express.Router();
const controller = require('../controllers/examScheduleController');

router.get('/', controller.getSchedules);
router.post('/', controller.addSchedule);
router.put('/', controller.editSchedule);
router.delete('/:schedule_id', controller.deleteSchedule);

module.exports = router;
