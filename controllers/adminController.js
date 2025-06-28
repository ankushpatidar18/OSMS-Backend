const adminService = require('../services/adminService');

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, admin } = await adminService.loginAdmin(email, password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: 'Login successful',
      admin
    });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Invalid email or password' });
  }
};

exports.logoutAdmin = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: "Logged out successfully" });
};


