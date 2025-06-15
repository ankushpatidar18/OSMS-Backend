
const pool = require('../../db');

exports.getExamsForClass = async (req, res) => {
  const { class: className, session } = req.params;

  const classGroup = ["KG1", "KG2", "1", "2", "3", "4", "5"].includes(className) ? "primary" : "middle";

  try {
    const [rows] = await pool.query(`
      SELECT e.exam_id, e.name, e.total_marks
      FROM exams e
      JOIN exam_schedules es ON e.exam_id = es.exam_id
      WHERE es.class_name = ? AND e.session = ? AND e.class_group = ?
      GROUP BY e.exam_id
    `, [className, session, classGroup]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams', details: err });
  }
};
