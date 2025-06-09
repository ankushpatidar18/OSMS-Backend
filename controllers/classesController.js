const classesService = require('../services/classesService');

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await classesService.getAllClasses();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
