// backend/routes/students.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); 

router.post('/full-register', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name, gender, dob, aadhaar_number, mobile_number, address, pincode, sssmid,
      class: className, medium, session, is_repeater, roll_number,
      father_name, mother_name,
      admission_no, admission_date,
      height_cm, weight_kg,
      category
    } = req.body;

    // Insert into students
    const [studentResult] = await connection.query(
      `INSERT INTO students (name, gender, dob, aadhaar_number, mobile_number, address, pincode, sssmid, class, medium, session, is_repeater, roll_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name || null, gender || null, dob || null, aadhaar_number || null, mobile_number || null,
       address || null, pincode || null, sssmid || null, className || null,
       medium || null, session || null, is_repeater != null ? is_repeater : null, roll_number || null]
    );

    const student_id = studentResult.insertId;

    // Insert into parents
    await connection.query(
      `INSERT INTO parents (student_id, father_name, mother_name) VALUES (?, ?, ?)`,
      [student_id, father_name || null, mother_name || null]
    );

    // Insert into admissions
    await connection.query(
      `INSERT INTO admissions (student_id, admission_no, admission_date) VALUES (?, ?, ?)`,
      [student_id, admission_no || null, admission_date || null]
    );

    // Insert into physical_info
    await connection.query(
      `INSERT INTO physical_info (student_id, height_cm, weight_kg) VALUES (?, ?, ?)`,
      [student_id, height_cm || null, weight_kg || null]
    );

    // Insert into social_info
    await connection.query(
      `INSERT INTO social_info (student_id, category) VALUES (?, ?)`,
      [student_id, category || null]
    );

    await connection.commit();
    res.status(201).json({ message: 'Student registered successfully', student_id });

  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    connection.release();
  }
});

module.exports = router;
