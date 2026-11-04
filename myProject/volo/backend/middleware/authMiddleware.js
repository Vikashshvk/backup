import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "volo_secret_chidori_key_9999_production";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!token || token === "undefined") {
        return res
          .status(401)
          .json({ message: "Authorization token required" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User record not found" });
      }

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Invalid or expired session token" });
    }
  }

  return res.status(401).json({ message: "No authorization header provided" });
};
