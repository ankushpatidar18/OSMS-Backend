const express = require("express");
const router = express.Router();
const db = require("../db"); 

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Route to get all students with optional filters
router.get("/", async (req, res) => {
  const { session, name, class: className, admission_no } = req.query; // changed

  if (!session) {
    return res.status(400).json({ error: "Session is required." });
  }

  try {
    let query = `
      SELECT 
        s.*,
        DATE_FORMAT(s.dob, '%Y-%m-%d') AS dob,   -- Add this line
        p.father_name, p.mother_name,
        a.admission_no, DATE_FORMAT(a.admission_date, '%Y-%m-%d') AS admission_date,
        pi.height_cm, pi.weight_kg,
        si.category,
        si.PEN_Number,
        si.APAAR_Number
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
    if (admission_no) { // changed
      query += " AND a.admission_no = ?";
      values.push(admission_no);
    }

    const [results] = await db.execute(query, values);
    res.json(results);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to build dynamic update SQL
function buildUpdateQuery(table, idField, data, allowedFields) {
  const fields = [];
  const values = [];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      // Convert empty strings to null for number fields
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


// Route to update student information
router.put("/:id", async (req, res) => {
  const student_id = req.params.id;
  const {
    name,
    gender,
    dob,
    aadhaar_number,
    address,
    pincode,
    sssmid,
    class: studentClass,
    medium,
    session,
    mobile_number,
    roll_number,
    father_name,
    mother_name,
    admission_no,
    admission_date,
    height_cm,
    weight_kg,
    category,
    PEN_Number,      // Added
    APAAR_Number     // Added
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // STUDENTS
    const studentUpdate = buildUpdateQuery(
      "students",
      "student_id",
      {
        name,
        gender,
        dob,
        aadhaar_number,
        address,
        pincode,
        sssmid,
        class: studentClass,
        medium,
        session,
        mobile_number,
        roll_number,
      },
      [
        "name",
        "gender",
        "dob",
        "aadhaar_number",
        "address",
        "pincode",
        "sssmid",
        "class",
        "medium",
        "session",
        "mobile_number",
        "roll_number",
      ]
    );
    if (studentUpdate) {
      await conn.execute(studentUpdate.sql, [...studentUpdate.values, student_id]);
    }

    // PARENTS
    const parentUpdate = buildUpdateQuery(
      "parents",
      "student_id",
      { father_name, mother_name },
      ["father_name", "mother_name"]
    );
    if (parentUpdate) {
      await conn.execute(parentUpdate.sql, [...parentUpdate.values, student_id]);
    }

    // ADMISSIONS
    const admissionUpdate = buildUpdateQuery(
      "admissions",
      "student_id",
      { admission_no, admission_date },
      ["admission_no", "admission_date"]
    );
    if (admissionUpdate) {
      await conn.execute(admissionUpdate.sql, [...admissionUpdate.values, student_id]);
    }

    // PHYSICAL INFO
    const physicalUpdate = buildUpdateQuery(
      "physical_info",
      "student_id",
      { height_cm, weight_kg },
      ["height_cm", "weight_kg"]
    );
    if (physicalUpdate) {
      await conn.execute(physicalUpdate.sql, [...physicalUpdate.values, student_id]);
    }

    // SOCIAL INFO
    const socialUpdate = buildUpdateQuery(
      "social_info",
      "student_id",
      { category, PEN_Number, APAAR_Number }, // Added
      ["category", "PEN_Number", "APAAR_Number"] // Added
    );
    if (socialUpdate) {
      await conn.execute(socialUpdate.sql, [...socialUpdate.values, student_id]);
    }

    await conn.commit();
    res.json({ message: "Student updated successfully." });
  } catch (error) {
    await conn.rollback();
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update student." });
  } finally {
    conn.release();
  }
});

// Promote students to next class/session (copy info, new student_id)
router.post('/promote', async (req, res) => {
  const { fromSession, fromClass, toSession, toClass, studentIds } = req.body;

  if (!fromSession || !fromClass || !toSession || !toClass) {
    return res.status(400).json({ error: "All session/class fields are required." });
  }

  try {
    // Get students to promote (by filter or by IDs)
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

    if (!students.length) {
      return res.status(404).json({ error: "No students found to promote." });
    }

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
            student.name,
            student.gender,
            student.dob,
            student.aadhaar_number,
            student.address,
            student.pincode,
            student.sssmid,
            toClass,      // new class
            student.medium,
            toSession,    // new session
            student.mobile_number,
            student.roll_number
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
      res.json({ message: `${promotedCount} students promoted successfully.` });
    } catch (err) {
      await conn.rollback();
      console.error("Promotion error:", err);
      res.status(500).json({ error: "Failed to promote students." });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("Error in promotion:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
