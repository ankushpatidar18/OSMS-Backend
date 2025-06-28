const admitCardService = require('../services/admitCardService');

exports.getClasses = async (req, res) => {
  try {
    const rows = await admitCardService.getClasses();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const rows = await admitCardService.getExams();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdmitCardData = async (req, res) => {
  const { className, examId, session } = req.query;
  try {
    const data = await admitCardService.getAdmitCardData(className, examId, session);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
