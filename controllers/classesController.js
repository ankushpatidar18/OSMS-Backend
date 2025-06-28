const classesService = require('../services/classesService');

exports.getAllClasses = async (req, res) => {
  try {
    const session = req.query.session;
    if (session && typeof session !== 'string') {
      return res.status(400).json({ error: 'Invalid session parameter' });
    }
    let classes;
    if (session) {
      classes = await classesService.getClassesForSession(session);
    } else {
      classes = await classesService.getAllClasses();
    }
    res.json(classes);
  } catch (error) {
    console.error('Error in getAllClasses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

