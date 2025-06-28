const examService = require('../../services/entrymarksMatrix/examService');

exports.getExamsForClass = async (req, res) => {
  const { class: className, session } = req.params;
  if (!className || !session) {
    return res.status(400).json({ error: 'class and session are required' });
  }
  const classGroup = ["KG1", "KG2", "1", "2", "3", "4", "5"].includes(className) ? "primary" : "middle";
  try {
    const rows = await examService.getExamsForClass(className, session, classGroup);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};
