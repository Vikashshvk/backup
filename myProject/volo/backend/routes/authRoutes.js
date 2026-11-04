import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "volo_secret_chidori_key_9999_production";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// Standard Registration (Name, Username, Email, Password)
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ message: "All registration fields are required" });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const uniqueId = `VOLO-${Math.floor(100000 + Math.random() * 900000)}`;

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      uniqueId,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      uniqueId: user.uniqueId,
      avatar: user.avatar,
      about: user.about,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mobile Registration
router.post("/register-mobile", async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, phone number, and password are required" });
    }

    const cleanPhone = phone.trim();
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const autoUsername = `user_${cleanPhone.slice(-4)}_${randomNum.toString().slice(-3)}`;
    const autoEmail = `${cleanPhone}@volo.internal`;
    const uniqueId = `VOLO-${randomNum}`;

    const user = await User.create({
      name: name.trim(),
      username: autoUsername,
      email: autoEmail,
      phone: cleanPhone,
      uniqueId,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      uniqueId: user.uniqueId,
      avatar: user.avatar,
      about: user.about,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Universal Login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Enter your credentials and password" });
    }

    const cleanIdent = identifier.trim().toLowerCase();
    const rawIdent = identifier.trim();

    const user = await User.findOne({
      $or: [
        { email: cleanIdent },
        { username: cleanIdent },
        { phone: rawIdent },
      ],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        uniqueId: user.uniqueId,
        avatar: user.avatar,
        about: user.about,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid username, phone, or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
