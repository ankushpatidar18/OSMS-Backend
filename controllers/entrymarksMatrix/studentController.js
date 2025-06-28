const studentService = require('../../services/entrymarksMatrix/studentService');

exports.getStudentsByClassAndSession = async (req, res) => {
  const { class: className, session } = req.query;
  if (!className || !session) {
    return res.status(400).json({ error: 'class and session are required' });
  }
  try {
    const rows = await studentService.getStudentsByClassAndSession(className, session);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};
