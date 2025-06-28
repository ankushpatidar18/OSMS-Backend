const pool = require('../../db');

exports.getUniqueClasses = async () => {
  const [rows] = await pool.query(
    `SELECT DISTINCT class FROM class_subjects ORDER BY class`
  );
  return rows.map(row => row.class);
};