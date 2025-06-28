const marksheetService = require('../services/marksheetService');

exports.getMarksheet = async (req, res) => {
  const { class: className, session } = req.params;
  if (!className || !session) {
    return res.status(400).json({ error: 'class and session are required' });
  }
  try {
    const result = await marksheetService.generateMarksheet(className, session);
    res.json(result);
  } catch (error) {
    console.error('Error generating marksheet:', error);
    res.status(500).json({ error: 'Failed to generate marksheet data' });
  }
};