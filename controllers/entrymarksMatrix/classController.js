
const pool = require('../../db'); 

exports.getUniqueClasses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT class FROM class_subjects ORDER BY class
    `);
    res.json(rows.map(row => row.class));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes', details: err });
  }
};
