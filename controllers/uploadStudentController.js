const ExcelJS = require('exceljs');
const pool = require('../db');
const path = require('path');
const fs = require('fs');
const FileType = require('file-type');
 

exports.uploadStudentExcel = async (req, res) => {
  let filePath;
  let connection;
  try {
    // 1. Check for file
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    // 2. Validate file type (only .xlsx, .xls, .csv)
    filePath = path.resolve(req.file.path);
    const fileType = await FileType.fromFile(filePath);
    const allowedTypes = ['xlsx', 'xls', 'csv'];
    if (!fileType || !allowedTypes.includes(fileType.ext)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Invalid file type. Only Excel or CSV files are allowed." });
    }

    // 3. Read Excel file
    const workbook = new ExcelJS.Workbook();
    if (fileType.ext === 'csv') {
      await workbook.csv.readFile(filePath);
    } else {
      await workbook.xlsx.readFile(filePath);
    }
    const worksheet = workbook.worksheets[0];

    // 4. Map header names to column indices
    const headerMap = {};
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      if (cell.value) headerMap[cell.value.toString().trim()] = colNumber;
    });

    // 5. Helper to get cell value by header
    const getCell = (row, header) => {
      if (!row) return null;
      const colNumber = headerMap[header];
      if (!colNumber) return null;
      const cell = row.getCell(colNumber);
      if (!cell) return null;
      const value = cell.value;
      return value ? (typeof value === 'object' && value.text ? value.text : value) : null;
    };

    // 6. Start DB transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 7. Loop through each student row
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (!row || !row.hasValues || row.actualCellCount === 0) continue;

      // === Data extraction and validation ===
      const studentData = {
        name: getCell(row, 'Name'),
        gender: getCell(row, 'Gender'),
        dob: getCell(row, 'DOB') ? new Date(getCell(row, 'DOB')) : null,
        aadhaar_number: getCell(row, 'AADHAAR No.'),
        address: getCell(row, 'Address'),
        pincode: getCell(row, 'Pincode'),
        sssmid: getCell(row, 'Student State Code'),
        class: getCell(row, 'Class'),
        medium: getCell(row, 'Medium Of Instruction'),
        session: getCell(row, 'Session'),
        is_repeater: getCell(row, 'Is Repeater') === 'YES',
        mobile_number: getCell(row, 'Mobile No.')
      };

      // === Basic validation ===
      if (!studentData.name) {
        throw new Error(`Row ${rowNumber}: Student name is required.`);
      }

      // === Insert into students table ===
      const [studentResult] = await connection.query(`
        INSERT INTO students 
        (name, gender, dob, aadhaar_number, address, pincode, sssmid, class, medium, session, is_repeater, mobile_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        Object.values(studentData)
      );
      const student_id = studentResult.insertId;

      // === Insert into parents table ===
      await connection.query(`
        INSERT INTO parents (student_id, father_name, mother_name)
        VALUES (?, ?, ?)`,
        [
          student_id,
          getCell(row, 'Father Name'),
          getCell(row, 'Mother Name')
        ]
      );

      // === Insert into admissions table ===
      await connection.query(`
        INSERT INTO admissions (student_id, admission_no, admission_date)
        VALUES (?, ?, ?)`,
        [
          student_id,
          getCell(row, 'Admission No.'),
          getCell(row, 'Admission Date') ? new Date(getCell(row, 'Admission Date')) : null
        ]
      );

      // === Insert into physical_info table ===
      await connection.query(`
        INSERT INTO physical_info (student_id, height_cm, weight_kg)
        VALUES (?, ?, ?)`,
        [
          student_id,
          parseFloat(getCell(row, 'Height in CMs')) || null,
          parseFloat(getCell(row, 'Weight in KGs')) || null
        ]
      );

      // === Insert into social_info table ===
      await connection.query(`
        INSERT INTO social_info (student_id, category)
        VALUES (?, ?)`,
        [
          student_id,
          getCell(row, 'Social Category')
        ]
      );
    }

    // 8. Commit transaction and cleanup
    await connection.commit();
    fs.unlinkSync(filePath);
    res.status(200).json({ message: "All students inserted successfully." });

  } catch (error) {
    // Rollback transaction if started
    if (connection) await connection.rollback();
    // Remove file if uploaded
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Error uploading student Excel:", error);
    res.status(500).json({ message: error.message || "Server error during upload." });
  } finally {
    if (connection) connection.release();
  }
};
