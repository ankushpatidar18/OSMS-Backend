const studentsService = require('../services/studentsService');

exports.getStudentsForClass = async (req, res) => {
  try {
    const className = req.params.class;
    const session = req.query.session;
    if (!className || !session) {
      return res.status(400).json({ error: 'Missing class or session' });
    }
    const students = await studentsService.getStudentsForClass(className, session);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
