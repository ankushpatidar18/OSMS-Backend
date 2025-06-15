
const pool = require('../../db'); 

exports.getMarksByStudentId = async (req, res) => {
  const { student_id } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT sm.exam_id, sm.class_subject_id, sm.marks_obtained
      FROM student_marks sm
      WHERE sm.student_id = ?
    `, [student_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch marks', details: err });
  }
};


exports.saveStudentMarks = async (req, res) => {
  const { marks, student_id, recorded_by } = req.body;

  if (!Array.isArray(marks) || !student_id) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const mark of marks) {
      const { class_subject_id, exam_id, marks_obtained } = mark;

      await connection.query(`
        INSERT INTO student_marks (student_id, class_subject_id, exam_id, marks_obtained, recorded_by)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), recorded_by = VALUES(recorded_by)
      `, [student_id, class_subject_id, exam_id, marks_obtained, recorded_by || null]);
    }

    await connection.commit();
    res.json({ message: 'Marks saved successfully' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to save marks', details: err });
  } finally {
    connection.release();
  }
};
