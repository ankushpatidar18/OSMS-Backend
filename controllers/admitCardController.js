
const pool = require('../db');

// Get all classes
exports.getClasses = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT class FROM students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all exams
exports.getExams = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exams');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get admit card data for a class and exam
exports.getAdmitCardData = async (req, res) => {
  const { className, examId } = req.query;
  try {
     // 1. Get students of the class WITH parent names
    const [students] = await pool.query(
      `SELECT s.*, p.father_name, p.mother_name
       FROM students s
       LEFT JOIN parents p ON s.student_id = p.student_id
       WHERE s.class = ?`,
      [className]
    );

    // 2. Get exam info
    const [exams] = await pool.query(
      'SELECT * FROM exams WHERE exam_id = ?',
      [examId]
    );
    const exam = exams[0];

    // 3. Get exam schedule for class & exam
    const [schedule] = await pool.query(
      `SELECT es.*, s.subject_name
       FROM exam_schedules es
       JOIN subjects s ON es.subject_id = s.subject_id
       WHERE es.class_name = ? AND es.exam_id = ?
       ORDER BY es.exam_date`,
      [className, examId]
    );

    res.json({
      students,
      exam,
      schedule
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
