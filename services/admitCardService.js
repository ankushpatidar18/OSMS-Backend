const db = require('../db');

// Use class_subjects for fetching classes
exports.getClasses = async () => {
  const [rows] = await db.query('SELECT DISTINCT class FROM class_subjects ORDER BY class');
  return rows;
};

exports.getExams = async () => {
  const [rows] = await db.query('SELECT * FROM exams');
  return rows;
};

exports.getAdmitCardData = async (className, examId, session) => {
  const [students] = await db.query(
    `SELECT s.*, p.father_name, p.mother_name
     FROM students s
     LEFT JOIN parents p ON s.student_id = p.student_id
     WHERE s.class = ? AND s.session = ?`,
    [className, session]
  );

  const [exams] = await db.query(
    'SELECT * FROM exams WHERE exam_id = ?',
    [examId]
  );
  const exam = exams[0];

  const [schedule] = await db.query(
    `SELECT es.*, s.subject_name
     FROM exam_schedules es
     JOIN subjects s ON es.subject_id = s.subject_id
     WHERE es.class_name = ? AND es.exam_id = ?
     ORDER BY es.exam_date`,
    [className, examId]
  );

  return { students, exam, schedule };
};