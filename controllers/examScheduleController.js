const pool = require('../db');

// Get all schedules for a class and exam
exports.getSchedules = async (req, res) => {
  const { className, examId } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT es.*, s.subject_name
       FROM exam_schedules es
       JOIN subjects s ON es.subject_id = s.subject_id
       WHERE es.class_name = ? AND es.exam_id = ?
       ORDER BY es.exam_date`,
      [className, examId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new schedule
exports.addSchedule = async (req, res) => {
  const { exam_id, class_name, subject_id, exam_date, exam_day, exam_time } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO exam_schedules (exam_id, class_name, subject_id, exam_date, exam_day, exam_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [exam_id, class_name, subject_id, exam_date, exam_day, exam_time]
    );
    res.json({ schedule_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit a schedule
exports.editSchedule = async (req, res) => {
  const { schedule_id, exam_date, exam_day, exam_time, subject_id } = req.body;
  try {
    await pool.query(
      `UPDATE exam_schedules SET exam_date=?, exam_day=?, exam_time=?, subject_id=?
       WHERE schedule_id=?`,
      [exam_date, exam_day, exam_time, subject_id, schedule_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
  const { schedule_id } = req.params;
  try {
    await pool.query(`DELETE FROM exam_schedules WHERE schedule_id=?`, [schedule_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
