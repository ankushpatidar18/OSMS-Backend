const db = require('../db');

exports.getMarksEntryStatus = async (class_subject_id, exam_id) => {
  const [rows] = await db.query(
    `SELECT student_id, marks_obtained
     FROM student_marks
     WHERE class_subject_id = ? AND exam_id = ?`,
    [class_subject_id, exam_id]
  );
  return rows;
};

exports.upsertMarks = async (class_subject_id, exam_id, marks, userId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const mark of marks) {
      await conn.query(
        `INSERT INTO student_marks 
          (student_id, class_subject_id, exam_id, marks_obtained, recorded_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           marks_obtained = VALUES(marks_obtained),
           recorded_by = VALUES(recorded_by),
           recorded_at = CURRENT_TIMESTAMP
        `,
        [mark.student_id, class_subject_id, exam_id, mark.marks_obtained, userId]
      );
    }
    await conn.commit();
    return { message: 'Marks entered/updated successfully' };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
