const marksService = require('../services/marksService');

exports.getMarksEntryStatus = async (req, res) => {
  const { class_subject_id, exam_id } = req.query;
  if (!class_subject_id || !exam_id) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }
  try {
    const marks = await marksService.getMarksEntryStatus(class_subject_id, exam_id);
    res.json(marks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.upsertMarks = async (req, res) => {
  const { class_subject_id, exam_id, marks } = req.body;
  const userId = null;
  if (!class_subject_id || !exam_id || !marks?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await marksService.upsertMarks(class_subject_id, exam_id, marks, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
