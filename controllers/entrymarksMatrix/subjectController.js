
const pool = require('../../db');

exports.getSubjectsByClass = async (req, res) => {
  const { class: className } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT cs.id AS class_subject_id, s.subject_name
      FROM class_subjects cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE cs.class = ?
    `, [className]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects', details: err });
  }
};
