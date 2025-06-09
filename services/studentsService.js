const db = require('../db');

exports.getStudentsForClass = async (className) => {
  const [rows] = await db.query(
    `SELECT student_id, name FROM students WHERE class = ? ORDER BY name`,
    [className]
  );
  return rows;
};
