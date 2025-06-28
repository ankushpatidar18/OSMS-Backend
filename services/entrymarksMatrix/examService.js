const db = require('../../db');

exports.getExamsForClass = async (className, session, classGroup) => {
  const [rows] = await db.query(
    `SELECT e.exam_id, e.name, e.total_marks
     FROM exams e
     JOIN exam_schedules es ON e.exam_id = es.exam_id
     WHERE es.class_name = ? AND e.session = ? AND e.class_group = ?
     GROUP BY e.exam_id`,
    [className, session, classGroup]
  );
  return rows;
};