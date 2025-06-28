const db = require('../db');

exports.fullRegister = async (data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const {
      name, gender, dob, aadhaar_number, mobile_number, address, pincode, sssmid,
      class: className, medium, session, roll_number,
      father_name, mother_name,
      admission_no, admission_date,
      height_cm, weight_kg,
      category, APAAR_Number, PEN_Number
    } = data;

    const [studentResult] = await connection.query(
      `INSERT INTO students (name, gender, dob, aadhaar_number, mobile_number, address, pincode, sssmid, class, medium, session, roll_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name || null, gender || null, dob || null, aadhaar_number || null, mobile_number || null,
       address || null, pincode || null, sssmid || null, className || null,
       medium || null, session || null, roll_number || null]
    );
    const student_id = studentResult.insertId;

    await connection.query(
      `INSERT INTO parents (student_id, father_name, mother_name) VALUES (?, ?, ?)`,
      [student_id, father_name || null, mother_name || null]
    );
    await connection.query(
      `INSERT INTO admissions (student_id, admission_no, admission_date) VALUES (?, ?, ?)`,
      [student_id, admission_no || null, admission_date || null]
    );
    await connection.query(
      `INSERT INTO physical_info (student_id, height_cm, weight_kg) VALUES (?, ?, ?)`,
      [student_id, height_cm || null, weight_kg || null]
    );
    await connection.query(
      `INSERT INTO social_info (student_id, category, APAAR_Number, PEN_Number) VALUES (?, ?, ?, ?)`,
      [student_id, category, APAAR_Number, PEN_Number || null]
    );

    await connection.commit();
    return student_id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};