const marksService = require('../../services/entrymarksMatrix/marksService');

exports.getMarksByStudentId = async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) {
    return res.status(400).json({ error: 'student_id is required' });
  }
  try {
    const rows = await marksService.getMarksByStudentId(student_id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
};

exports.saveStudentMarks = async (req, res) => {
  const { marks, student_id, recorded_by } = req.body;
  if (!Array.isArray(marks) || !student_id) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  try {
    const result = await marksService.saveStudentMarks(student_id, marks, recorded_by);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save marks' });
  }
};
