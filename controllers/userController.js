const userService = require('../services/userService'); 

exports.loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const { token, user } = await userService.loginUser(email, password, role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.status(200).json({
      message: 'Login successful',
      user 
    });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Invalid email or password' });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: "Logged out successfully" });
};


