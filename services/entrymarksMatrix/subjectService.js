const db = require('../../db');

exports.getSubjectsByClass = async (className) => {
  const [rows] = await db.query(
    `SELECT cs.id AS class_subject_id, s.subject_name
     FROM class_subjects cs
     JOIN subjects s ON cs.subject_id = s.subject_id
     WHERE cs.class = ?`,
    [className]
  );
  return rows;
};