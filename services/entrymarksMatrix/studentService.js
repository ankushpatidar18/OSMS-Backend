const pool = require('../../db');

exports.getStudentsByClassAndSession = async (className, session) => {
  const [rows] = await pool.query(
    `SELECT s.student_id, s.name, s.roll_number, p.father_name
     FROM students s
     JOIN parents p ON s.student_id = p.student_id
     WHERE s.class = ? AND s.session = ?
     ORDER BY s.roll_number ASC`,
    [className, session]
  );
  return rows;
};