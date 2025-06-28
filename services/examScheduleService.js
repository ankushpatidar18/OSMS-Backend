const pool = require('../db');

exports.getSchedules = async (className, examId) => {
  const [rows] = await pool.query(
    `SELECT 
       es.schedule_id,
       es.subject_id,
       DATE_FORMAT(es.exam_date, '%Y-%m-%d') AS exam_date,
       es.exam_day,
       es.exam_time,
       es.class_name,
       es.exam_id,
       s.subject_name
     FROM exam_schedules es
     JOIN subjects s ON es.subject_id = s.subject_id
     WHERE es.class_name = ? AND es.exam_id = ?
     ORDER BY es.exam_date`,
    [className, examId]
  );
  return rows;
};

exports.addSchedule = async ({ exam_id, class_name, subject_id, exam_date, exam_day, exam_time }) => {
  const [result] = await pool.query(
    `INSERT INTO exam_schedules (exam_id, class_name, subject_id, exam_date, exam_day, exam_time)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [exam_id, class_name, subject_id, exam_date, exam_day, exam_time]
  );
  return result.insertId;
};

exports.editSchedule = async ({ schedule_id, exam_date, exam_day, exam_time, subject_id }) => {
  await pool.query(
    `UPDATE exam_schedules SET exam_date=?, exam_day=?, exam_time=?, subject_id=?
     WHERE schedule_id=?`,
    [exam_date, exam_day, exam_time, subject_id, schedule_id]
  );
};

exports.deleteSchedule = async (schedule_id) => {
  await pool.query(`DELETE FROM exam_schedules WHERE schedule_id=?`, [schedule_id]);
};