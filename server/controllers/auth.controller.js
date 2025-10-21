const { loginWithGoogle } = require("../services/auth.service");

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
