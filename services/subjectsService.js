const db = require('../db');

exports.getSubjectsForClass = async (className) => {
  const [rows] = await db.query(`
    SELECT cs.id AS class_subject_id, s.subject_id, s.subject_name, cs.max_marks
    FROM class_subjects cs
    JOIN subjects s ON cs.subject_id = s.subject_id
    WHERE cs.class = ?
    ORDER BY s.subject_name
  `, [className]);
  return rows;
};
