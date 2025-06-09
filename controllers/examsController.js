const examsService = require('../services/examsService');

exports.getExamsForClassSubject = async (req, res) => {
  try {
    const exams = await examsService.getExamsForClassSubject(req.params.classSubjectId);
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
