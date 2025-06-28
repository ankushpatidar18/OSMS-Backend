const studentsInfoService = require('../services/studentsInfoService');

exports.getStudents = async (req, res) => {
  const { session, name, class: className, admission_no } = req.query;
  if (!session) {
    return res.status(400).json({ error: "Session is required." });
  }
  try {
    const results = await studentsInfoService.getStudents({ session, name, className, admission_no });
    res.json(results);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateStudent = async (req, res) => {
  const student_id = req.params.id;
  try {
    const result = await studentsInfoService.updateStudent(student_id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update student." });
  }
};

exports.promoteStudents = async (req, res) => {
  const { fromSession, fromClass, toSession, toClass, studentIds } = req.body;
  if (!fromSession || !fromClass || !toSession || !toClass) {
    return res.status(400).json({ error: "All session/class fields are required." });
  }
  try {
    const { promotedCount } = await studentsInfoService.promoteStudents(fromSession, fromClass, toSession, toClass, studentIds);
    res.json({ message: `${promotedCount} students promoted successfully.` });
  } catch (err) {
    console.error("Promotion error:", err);
    res.status(500).json({ error: "Failed to promote students." });
  }
};