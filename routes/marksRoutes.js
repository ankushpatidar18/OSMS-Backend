const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Route to get marks for a specific class_subject_id and exam_id
router.get('/entry-status', authMiddleware,async (req, res) => {
  const { class_subject_id, exam_id } = req.query;
  if (!class_subject_id || !exam_id) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }
  try {
    const [rows] = await db.query(`
      SELECT student_id, marks_obtained
      FROM student_marks
      WHERE class_subject_id = ? AND exam_id = ?
    `, [class_subject_id, exam_id]);
    if (!rows.length) return res.status(404).json([]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to enter or update marks for students
router.post('/',authMiddleware, async (req, res) => {
  const { class_subject_id, exam_id, marks } = req.body;
  const userId = req.user?.id || null; 

  if (!class_subject_id || !exam_id || !marks?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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
    res.json({ message: 'Marks entered/updated successfully' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});


module.exports = router;