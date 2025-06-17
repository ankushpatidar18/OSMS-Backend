const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.loginAdmin = async (req, res) => {
 const { email, password } = req.body;
 

  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Create token
    const token = jwt.sign(
      { id: admin.admin_id, email: admin.email, roll_number: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // Set cookie
   res.cookie('token', token, {
  httpOnly: true,
  secure: false,          // ✅ false for localhost (no https)
  sameSite: 'lax',        // ✅ 'lax' works better on localhost
  maxAge: 24 * 60 * 60 * 1000
});

    res.status(200).json({
      message: 'Login successful',
      admin: {
        name: admin.full_name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logoutAdmin = (req, res) => {
 res.clearCookie("token", {
  httpOnly: true,
  sameSite: "lax",         // ✅
  secure: false,           // ✅
});

  res.status(200).json({ message: "Logged out successfully" });
};


