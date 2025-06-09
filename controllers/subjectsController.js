const subjectsService = require('../services/subjectsService');

exports.getSubjectsForClass = async (req, res) => {
  try {
    const subjects = await subjectsService.getSubjectsForClass(req.params.class);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
