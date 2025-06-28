const subjectService = require('../../services/entrymarksMatrix/subjectService');

exports.getSubjectsByClass = async (req, res) => {
  const { class: className } = req.params;
  if (!className) {
    return res.status(400).json({ error: 'class is required' });
  }
  try {
    const rows = await subjectService.getSubjectsByClass(className);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};
