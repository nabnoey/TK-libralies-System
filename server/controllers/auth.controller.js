const { loginWithGoogle, registerAdmin, loginAdmin } = require("../services/auth.service");

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const result = await loginWithGoogle(idToken);
    res.json(result); // { token, user }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Google login failed" });
  }
};

exports.adminRegister = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerAdmin(email, password, name);
    res.status(201).json(result); // { message, user } - ไม่มี token
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Admin registration failed" });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginAdmin(email, password);
    res.json(result); // { token, user }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Admin login failed" });
  }
};
