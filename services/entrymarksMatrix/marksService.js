const db = require('../../db');

exports.getMarksByStudentId = async (student_id) => {
  const [rows] = await db.query(
    `SELECT sm.exam_id, sm.class_subject_id, sm.marks_obtained
     FROM student_marks sm
     WHERE sm.student_id = ?`,
    [student_id]
  );
  return rows;
};

exports.saveStudentMarks = async (student_id, marks, recorded_by) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const mark of marks) {
      const { class_subject_id, exam_id, marks_obtained } = mark;
      await connection.query(
        `INSERT INTO student_marks (student_id, class_subject_id, exam_id, marks_obtained, recorded_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), recorded_by = VALUES(recorded_by)`,
        [student_id, class_subject_id, exam_id, marks_obtained, recorded_by || null]
      );
    }
    await connection.commit();
    return { message: 'Marks saved successfully' };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};