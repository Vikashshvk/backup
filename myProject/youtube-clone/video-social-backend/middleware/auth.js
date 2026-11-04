const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    // "Bearer <token>" format se actual token nikalna
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET,
    );
    req.user = decoded; // Token se user info request me save ho gayi
    next();
  } catch (err) {
    res.status(401).json({ message: "Token valid nahi hai" });
  }
};

module.exports = auth;
