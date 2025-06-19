const subjectsService = require('../services/subjectsService');

exports.getSubjectsForClass = async (req, res) => {
  try {
    const className = req.params.class;
    const subjects = await subjectsService.getSubjectsForClass(className);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
