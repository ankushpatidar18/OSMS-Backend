// backend/routes/students.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); 

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// DELETE selected students safely with transaction
router.delete('/delete-many', async (req, res) => {
  const { studentIds } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ error: 'No student IDs provided' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Step 1: Delete from student_marks
    await connection.query(
      `DELETE FROM student_marks WHERE student_id IN (?)`,
      [studentIds]
    );

    // Step 2: Delete from student_results
    await connection.query(
      `DELETE FROM student_results WHERE student_id IN (?)`,
      [studentIds]
    );

    // Step 3: Delete from students (cascades to parents, admissions, physical_info, social_info)
    await connection.query(
      `DELETE FROM students WHERE student_id IN (?)`,
      [studentIds]
    );

    await connection.commit();
    res.status(200).json({ message: 'Selected students deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete students' });
  } finally {
    connection.release();
  }
});

// GET students by session and class
router.get('/filter', async (req, res) => {
  const { session, class: className } = req.query;

  if (!session || !className) {
    return res.status(400).json({ error: 'Session and class are required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT s.student_id, s.name, p.father_name, p.mother_name, a.admission_no
       FROM students s
       LEFT JOIN parents p ON s.student_id = p.student_id
       LEFT JOIN admissions a ON s.student_id = a.student_id
       WHERE s.session = ? AND s.class = ?
       ORDER BY s.name`,
      [session, className]
    );

    res.json(rows);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

module.exports = router;
