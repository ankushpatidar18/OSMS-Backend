const db = require('../db');

exports.getStudentsForClass = async (className, session) => {
  const [rows] = await db.query(
    `SELECT student_id, name, dob
     FROM students
     WHERE class = ? AND session = ?
     ORDER BY name`,
    [className, session]
  );
  return rows;
};
