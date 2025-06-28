const db = require('../db');

exports.getStudents = async (filters) => {
  const { session, name, className, admission_no } = filters;
  let query = `
    SELECT 
      s.*,
      DATE_FORMAT(s.dob, '%Y-%m-%d') AS dob,
      p.father_name, p.mother_name,
      a.admission_no, DATE_FORMAT(a.admission_date, '%Y-%m-%d') AS admission_date,
      pi.height_cm, pi.weight_kg,
      si.category, si.PEN_Number, si.APAAR_Number
    FROM students s
    LEFT JOIN parents p ON s.student_id = p.student_id
    LEFT JOIN admissions a ON s.student_id = a.student_id
    LEFT JOIN physical_info pi ON s.student_id = pi.student_id
    LEFT JOIN social_info si ON s.student_id = si.student_id
    WHERE s.session = ?
  `;
  const values = [session];

  if (name) {
    query += " AND s.name LIKE ?";
    values.push(`%${name}%`);
  }
  if (className) {
    query += " AND s.class = ?";
    values.push(className);
  }
  if (admission_no) {
    query += " AND a.admission_no = ?";
    values.push(admission_no);
  }

  const [results] = await db.execute(query, values);
  return results;
};

exports.updateStudent = async (student_id, data) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Helper for dynamic update
    function buildUpdateQuery(table, idField, data, allowedFields) {
      const fields = [];
      const values = [];
      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          const value = data[field] === '' ? null : data[field];
          fields.push(`${field} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) return null;
      return {
        sql: `UPDATE ${table} SET ${fields.join(", ")} WHERE ${idField} = ?`,
        values,
      };
    }

    // STUDENTS
    const studentUpdate = buildUpdateQuery(
      "students",
      "student_id",
      data,
      [
        "name", "gender", "dob", "aadhaar_number", "address", "pincode", "sssmid",
        "class", "medium", "session", "mobile_number", "roll_number"
      ]
    );
    if (studentUpdate) {
      await conn.execute(studentUpdate.sql, [...studentUpdate.values, student_id]);
    }

    // PARENTS
    const parentUpdate = buildUpdateQuery(
      "parents",
      "student_id",
      data,
      ["father_name", "mother_name"]
    );
    if (parentUpdate) {
      await conn.execute(parentUpdate.sql, [...parentUpdate.values, student_id]);
    }

    // ADMISSIONS
    const admissionUpdate = buildUpdateQuery(
      "admissions",
      "student_id",
      data,
      ["admission_no", "admission_date"]
    );
    if (admissionUpdate) {
      await conn.execute(admissionUpdate.sql, [...admissionUpdate.values, student_id]);
    }

    // PHYSICAL INFO
    const physicalUpdate = buildUpdateQuery(
      "physical_info",
      "student_id",
      data,
      ["height_cm", "weight_kg"]
    );
    if (physicalUpdate) {
      await conn.execute(physicalUpdate.sql, [...physicalUpdate.values, student_id]);
    }

    // SOCIAL INFO
    const socialUpdate = buildUpdateQuery(
      "social_info",
      "student_id",
      data,
      ["category", "PEN_Number", "APAAR_Number"]
    );
    if (socialUpdate) {
      await conn.execute(socialUpdate.sql, [...socialUpdate.values, student_id]);
    }

    await conn.commit();
    return { message: "Student updated successfully." };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

exports.promoteStudents = async (fromSession, fromClass, toSession, toClass, studentIds) => {
  // Get students to promote
  let query = `
    SELECT s.*, p.*, a.*, pi.*, si.*
    FROM students s
    LEFT JOIN parents p ON s.student_id = p.student_id
    LEFT JOIN admissions a ON s.student_id = a.student_id
    LEFT JOIN physical_info pi ON s.student_id = pi.student_id
    LEFT JOIN social_info si ON s.student_id = si.student_id
    WHERE s.session = ? AND s.class = ?
  `;
  const values = [fromSession, fromClass];
  if (Array.isArray(studentIds) && studentIds.length > 0) {
    query += ` AND s.student_id IN (${studentIds.map(() => '?').join(',')})`;
    values.push(...studentIds);
  }
  const [students] = await db.execute(query, values);
  if (!students.length) return { promotedCount: 0 };

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let promotedCount = 0;
    for (const student of students) {
      // Check if already promoted
      const [existing] = await conn.execute(
        `SELECT s.student_id
         FROM students s
         LEFT JOIN parents p ON s.student_id = p.student_id
         WHERE s.name = ? AND s.dob = ? AND COALESCE(p.father_name, '') = COALESCE(?, '') AND s.session = ? AND s.class = ?`,
        [student.name, student.dob, student.father_name, toSession, toClass]
      );
      if (existing.length > 0) continue;

      // Insert into students (new student_id, new class/session)
      const [studentResult] = await conn.execute(
        `INSERT INTO students 
          (name, gender, dob, aadhaar_number, address, pincode, sssmid, class, medium, session, mobile_number, roll_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student.name, student.gender, student.dob, student.aadhaar_number, student.address,
          student.pincode, student.sssmid, toClass, student.medium, toSession,
          student.mobile_number, student.roll_number
        ]
      );
      const newStudentId = studentResult.insertId;

      // Copy parents
      await conn.execute(
        `INSERT INTO parents (student_id, father_name, mother_name)
         VALUES (?, ?, ?)`,
        [newStudentId, student.father_name, student.mother_name]
      );

      // Copy admissions
      await conn.execute(
        `INSERT INTO admissions (student_id, admission_no, admission_date)
         VALUES (?, ?, ?)`,
        [newStudentId, student.admission_no, student.admission_date]
      );

      // Copy physical_info
      await conn.execute(
        `INSERT INTO physical_info (student_id, height_cm, weight_kg)
         VALUES (?, ?, ?)`,
        [newStudentId, student.height_cm, student.weight_kg]
      );

      // Copy social_info
      await conn.execute(
        `INSERT INTO social_info (student_id, category, PEN_Number, APAAR_Number)
         VALUES (?, ?, ?, ?)`,
        [newStudentId, student.category, student.PEN_Number, student.APAAR_Number]
      );
      promotedCount++;
    }
    await conn.commit();
    return { promotedCount };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};