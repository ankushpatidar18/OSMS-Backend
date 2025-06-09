const marksheetService = require('../services/markSheetService');

exports.generateMarksheet = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { session } = req.query;
    
    if (!session) {
      return res.status(400).json({ error: 'Session parameter is required' });
    }

    const marksheet = await marksheetService.generateStudentMarksheet(studentId, session);
    res.json(marksheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};