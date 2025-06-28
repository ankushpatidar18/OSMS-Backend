const addStudentsService = require('../services/addStudentsService');

exports.fullRegister = async (req, res) => {
  try {
    const student_id = await addStudentsService.fullRegister(req.body);
    res.status(201).json({ message: 'Student registered successfully', student_id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};