const deleteStudentsService = require('../services/deleteStudentsService');

exports.deleteManyStudents = async (req, res) => {
  const { studentIds } = req.body;
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ error: 'No student IDs provided' });
  }
  try {
    await deleteStudentsService.deleteManyStudents(studentIds);
    res.status(200).json({ message: 'Selected students deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete students' });
  }
};

exports.filterStudents = async (req, res) => {
  const { session, class: className } = req.query;
  if (!session || !className) {
    return res.status(400).json({ error: 'Session and class are required' });
  }
  try {
    const students = await deleteStudentsService.filterStudents(session, className);
    res.json(students);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};