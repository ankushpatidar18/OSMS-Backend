const classesService = require('../services/classesService');
const db = require('../db'); 

exports.getAllClasses = async (req, res) => {
  try {
    const session = req.query.session;
    let classes;
    if (session) {
      // Only classes with students in this session
      classes = await classesService.getClassesForSession(session);
    } else {
      classes = await classesService.getAllClasses();
    }
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

