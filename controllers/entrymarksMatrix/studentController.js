
const pool = require('../../db');

exports.getStudentsByClassAndSession = async (req, res) => {
  const { class: className, session } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT s.student_id, s.name, s.roll_number, p.father_name
      FROM students s
      JOIN parents p ON s.student_id = p.student_id
      WHERE s.class = ? AND s.session = ?
      ORDER BY s.roll_number ASC
    `, [className, session]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students', details: err });
  }
};
