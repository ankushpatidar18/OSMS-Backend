const db = require('../db');

exports.getAllClasses = async () => {
  const [rows] = await db.query('SELECT DISTINCT class FROM class_subjects ORDER BY class');
  return rows;
};

exports.getClassesForSession = async (session) => {
  const [rows] = await db.query(
    `SELECT DISTINCT class FROM students WHERE session = ? ORDER BY class`,
    [session]
  );
  return rows;
};

