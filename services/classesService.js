const db = require('../db');

exports.getAllClasses = async () => {
  const [rows] = await db.query(`SELECT DISTINCT class FROM class_subjects ORDER BY class`);
  return rows.map(r => r.class);
};

exports.getClassesForSession = async (session) => {
  const [rows] = await db.query(
    `SELECT DISTINCT class FROM students WHERE session = ? ORDER BY class`,
    [session]
  );
  return rows.map(r => r.class);
};

