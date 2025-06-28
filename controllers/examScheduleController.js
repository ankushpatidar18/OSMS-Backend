const examScheduleService = require('../services/examScheduleService');

exports.getSchedules = async (req, res) => {
  const { className, examId } = req.query;
  try {
    const rows = await examScheduleService.getSchedules(className, examId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addSchedule = async (req, res) => {
  try {
    const scheduleId = await examScheduleService.addSchedule(req.body);
    res.json({ schedule_id: scheduleId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editSchedule = async (req, res) => {
  try {
    await examScheduleService.editSchedule(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { schedule_id } = req.params;
  try {
    await examScheduleService.deleteSchedule(schedule_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
