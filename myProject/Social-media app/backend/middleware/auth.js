const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Header se token nikaalo
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // "Bearer <token>" format handle karo
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({ message: "Token missing after Bearer" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret",
    );

    // req.user set karo (check karo login/register token sign karte waqt payload me kya daala tha)
    req.user = decoded.user || decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token valid nahi hai ya expire ho chuka hai" });
  }
};
