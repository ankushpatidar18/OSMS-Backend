const classService = require('../../services/entrymarksMatrix/classService');

exports.getUniqueClasses = async (req, res) => {
  try {
    const classes = await classService.getUniqueClasses();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};
