const studentsService = require('../services/studentsService');

exports.getStudentsForClass = async (req, res) => {
  try {
    const students = await studentsService.getStudentsForClass(req.params.class);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
