const db = require('../db');

exports.getExamsForClassSubject = async (classSubjectId) => {
  const [rows] = await db.query(`
    SELECT e.exam_id, e.name, e.total_marks,e.session
    FROM exam_schedules es
    JOIN exams e ON es.exam_id = e.exam_id
    WHERE es.class_name = (
      SELECT class FROM class_subjects WHERE id = ?
    ) AND es.subject_id = (
      SELECT subject_id FROM class_subjects WHERE id = ?
    )
    ORDER BY e.name
  `, [classSubjectId, classSubjectId]);
  return rows;
};
