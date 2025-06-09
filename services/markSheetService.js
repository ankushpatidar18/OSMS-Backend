const pool = require('../db');

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
};

const generateStudentMarksheet = async (studentId, session) => {
  // Get student info
  const [[student]] = await pool.query(
    `SELECT s.*, 
    (SELECT COUNT(*) FROM student_marks WHERE student_id = s.student_id) as marks_count
    FROM students s 
    WHERE student_id = ?`, 
    [studentId]
  );

  if (!student) throw new Error('Student not found');
  if (student.marks_count === 0) throw new Error('No marks entered for this student');

  // Get all marks for the student
  const [marks] = await pool.query(`
    SELECT 
      s.subject_name,
      cs.max_marks,
      e.name as exam_name,
      e.weightage,
      sm.marks_obtained
    FROM student_marks sm
    JOIN exams e ON sm.exam_id = e.exam_id
    JOIN class_subjects cs ON sm.class_subject_id = cs.id
    JOIN subjects s ON cs.subject_id = s.subject_id
    WHERE sm.student_id = ?
    AND e.session = ?
    ORDER BY s.subject_name, e.weightage DESC
  `, [studentId, session]);

  // Organize by subject
  const subjects = {};
  marks.forEach(mark => {
    if (!subjects[mark.subject_name]) {
      subjects[mark.subject_name] = {
        max_marks: mark.max_marks,
        exams: [],
        total: 0,
        weighted_total: 0
      };
    }
    subjects[mark.subject_name].exams.push({
      name: `${mark.exam_name} (${mark.weightage})`,
      marks: mark.marks_obtained
    });
    subjects[mark.subject_name].total += mark.marks_obtained;
    subjects[mark.subject_name].weighted_total += 
      (mark.marks_obtained * mark.weightage / 100);
  });

  // Calculate subject grades and overall
  let totalMax = 0;
  let totalObtained = 0;
  const subjectResults = Object.entries(subjects).map(([name, data]) => {
    totalMax += data.max_marks;
    totalObtained += data.total;
    
    const percentage = (data.weighted_total / data.max_marks) * 100;
    const grade = calculateGrade(percentage);
    
    return {
      subject_name: name,
      max_marks: data.max_marks,
      exams: data.exams,
      total: data.total,
      weighted_total: data.weighted_total,
      percentage: percentage.toFixed(2),
      grade: grade
    };
  });

  // Get attendance
  const [[attendance]] = await pool.query(`
    SELECT total_working_days, days_present 
    FROM student_results 
    WHERE student_id = ? AND session = ?
  `, [studentId, session]);

  // Calculate overall result
  const overallPercentage = (totalObtained / totalMax * 100).toFixed(2);
  const overallGrade = calculateGrade(overallPercentage);
  const examResult = overallPercentage >= 33 ? 'PASS' : 'FAIL';

  return {
    student_info: {
      name: student.name,
      class: student.class,
      roll_number: student.sssmid,
      session: session
    },
    subjects: subjectResults,
    overall: {
      total_marks: totalMax,
      obtained_marks: totalObtained,
      percentage: overallPercentage,
      grade: overallGrade,
      result: examResult,
      attendance: attendance 
        ? `${attendance.days_present}/${attendance.total_working_days}`
        : 'Not available'
    }
  };
};

module.exports = { generateStudentMarksheet };