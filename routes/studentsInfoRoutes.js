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
        p.father_name, p.mother_name,
        a.admission_no, a.admission_date,
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
    is_repeater,
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
        is_repeater,
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
        "is_repeater",
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

module.exports = router;
