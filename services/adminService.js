const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.loginAdmin = async (email, password) => {
  const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
  if (rows.length === 0) {
    throw new Error('Invalid email or password');
  }
  const admin = rows[0];
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  const token = jwt.sign(
    { id: admin.admin_id, email: admin.email, roll_number: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  return {
    token,
    admin: {
      name: admin.full_name,
      email: admin.email
    }
  };
};