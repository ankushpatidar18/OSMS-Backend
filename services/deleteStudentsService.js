const pool = require('../db');

exports.deleteManyStudents = async (studentIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `DELETE FROM student_marks WHERE student_id IN (?)`,
      [studentIds]
    );
    await connection.query(
      `DELETE FROM student_results WHERE student_id IN (?)`,
      [studentIds]
    );
    await connection.query(
      `DELETE FROM students WHERE student_id IN (?)`,
      [studentIds]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.filterStudents = async (session, className) => {
  const [rows] = await pool.query(
    `SELECT s.student_id, s.name, p.father_name, p.mother_name, a.admission_no
     FROM students s
     LEFT JOIN parents p ON s.student_id = p.student_id
     LEFT JOIN admissions a ON s.student_id = a.student_id
     WHERE s.session = ? AND s.class = ?
     ORDER BY s.name`,
    [session, className]
  );
  return rows;
};