const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload; // { uid, email, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
