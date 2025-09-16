const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.loginUser = async (email, password, role) => {
  // Find user with the given role
  const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
  if (rows.length === 0) {
    throw new Error('Invalid email or password');
  }
  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  // JWT payload includes user_id, email, role
  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  return {
    token,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    }
  };
};