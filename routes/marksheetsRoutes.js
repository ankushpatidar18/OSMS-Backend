const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper function to check if a class is in the middle group (6-8)
const isMiddleClass = (className) => {
  // Accepts both "6", "7", "8" and "6 TH", etc.
  const classNum = parseInt(String(className).replace(/\D/g, ''));
  return !isNaN(classNum) && classNum >= 6 && classNum <= 8;
};

router.get('/marksheet/:class/:session', async (req, res) => {
  const { class: className, session } = req.params;

  try {
    // Get all students in the class with their basic info
    const [students] = await db.query(`
      SELECT 
        s.student_id,
        s.name,
        s.sssmid,
        s.class,
        s.medium,
        s.roll_number,
        DATE_FORMAT(s.dob, '%d/%m/%Y') as dob,
        p.father_name,
        p.mother_name,
        a.admission_no
      FROM students s
      LEFT JOIN parents p ON s.student_id = p.student_id
      LEFT JOIN admissions a ON s.student_id = a.student_id
      WHERE s.class = ? AND s.session = ?
      ORDER BY s.name
    `, [className,session]);

    if (students.length === 0) {
      return res.json([]);
    }

    // Get subjects for this class
    const [subjects] = await db.query(`
      SELECT cs.id as class_subject_id, cs.subject_id, s.subject_name, cs.max_marks
      FROM class_subjects cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE cs.class = ?
    `, [className]);

    // Get all marks data for students in this class
    const [marksData] = await db.query(`
      SELECT 
        sm.student_id,
        sm.class_subject_id,
        sm.exam_id,
        sm.marks_obtained,
        e.name as exam_name,
        e.total_marks,
        e.contribution_ratio,
        cs.subject_id,
        s.subject_name
      FROM student_marks sm
      JOIN exams e ON sm.exam_id = e.exam_id
      JOIN class_subjects cs ON sm.class_subject_id = cs.id
      JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE cs.class = ? AND e.session = ?
    `, [className, session]);

    // Process data for each student
    const result = students.map((student, index) => {
      const studentSubjects = subjects.map(subject => {
        // Build subject data, conditionally including 'monthly'
        const subjectData = {
          name: subject.subject_name.toUpperCase(),
          maxMarks: subject.max_marks,
          annualExam: 0,
          halfYearly: 0,
          ...(isMiddleClass(className) ? {} : { monthly: 0 }),
          project: 0,
          total: 0,
          grade: null
        };

        // Get marks for this student and subject
        const studentMarks = marksData.filter(m => 
          m.student_id === student.student_id && 
          m.class_subject_id === subject.class_subject_id
        );

        let weightedTotal = 0;
        
        studentMarks.forEach(mark => {
          const examName = mark.exam_name.toLowerCase();
          const marksObtained = parseFloat(mark.marks_obtained) || 0;
          const contributionRatio = parseFloat(mark.contribution_ratio) || 1;
          const weightedMarks = marksObtained * contributionRatio;
          
          if (examName.includes('annual')) {
            subjectData.annualExam = marksObtained;
            weightedTotal += weightedMarks;
          } else if (examName.includes('half-yearly') || examName.includes('half yearly')) {
            const halfYearlyCeil = Math.ceil(marksObtained * contributionRatio);
            subjectData.halfYearly = halfYearlyCeil;
            weightedTotal += halfYearlyCeil;
          } else if (examName.includes('monthly')) {
            if (!isMiddleClass(className)) {
              subjectData.monthly = marksObtained;
              weightedTotal += weightedMarks;
            }
          } else if (examName.includes('project')) {
            subjectData.project = marksObtained;
            weightedTotal += weightedMarks;
          }
        });

        subjectData.total = Math.round(weightedTotal);
        
        // Calculate grade based on percentage for this subject
        const subjectPercentage = (weightedTotal / subject.max_marks) * 100;
        if (subjectPercentage >= 86) subjectData.grade = 'A+';
        else if (subjectPercentage >= 76) subjectData.grade = 'A';
        else if (subjectPercentage >= 66) subjectData.grade = 'B+';
        else if (subjectPercentage >= 56) subjectData.grade = 'B';
        else if (subjectPercentage >= 51) subjectData.grade = 'C+';
        else if (subjectPercentage >= 46) subjectData.grade = 'C';
        else if (subjectPercentage >= 33) subjectData.grade = 'D';
        else subjectData.grade = 'F';

        return subjectData;
      });

      // Calculate overall totals
      const totalMarks = subjects.reduce((sum, subject) => sum + subject.max_marks, 0);
      const obtainedMarks = studentSubjects.reduce((sum, subject) => sum + subject.total, 0);
      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

      // Calculate overall grade
      let totalGrade;
      if (percentage >= 86) totalGrade = 'A+';
      else if (percentage >= 76) totalGrade = 'A';
      else if (percentage >= 66) totalGrade = 'B+';
      else if (percentage >= 56) totalGrade = 'B';
      else if (percentage >= 51) totalGrade = 'C+';
      else if (percentage >= 46) totalGrade = 'C';
      else if (percentage >= 33) totalGrade = 'D';
      else totalGrade = 'F';

      return {
        id: student.student_id,
        sNo: index + 1,
        rollNo: student.roll_number || '',
        sssId: student.sssmid || '',
        scholarNo: student.admission_no || '',
        medium: (student.medium || '').toUpperCase(),
        studentName: (student.name || '').toUpperCase(),
        fatherName: (student.father_name || '').toUpperCase(),
        motherName: (student.mother_name || '').toUpperCase(),
        dateOfBirth: student.dob || '',
        class: student.class + ' TH',
        subjects: studentSubjects,
        totalMarks: totalMarks,
        obtainedMarks: obtainedMarks,
        totalGrade: totalGrade,
        examResult: totalGrade === 'F' ? 'FAIL' : 'PASS',
        percentage: Math.round(percentage * 100) / 100,
        totalAttendance: '',
        totalPresent: ''
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating marksheet:', error);
    res.status(500).json({ error: 'Failed to generate marksheet data' });
  }
});

module.exports = router;
