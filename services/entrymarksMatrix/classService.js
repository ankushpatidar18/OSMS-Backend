const db = require('../../db');

exports.getUniqueClasses = async () => {
  const [rows] = await db.query(
    `SELECT DISTINCT class FROM class_subjects ORDER BY class`
  );
  return rows.map(row => row.class);
};