const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Routes import
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// PC ke 'uploads' folder ko browser me access dene ke liye
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// backend/server.js me jahan express.static hai:
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  },
  express.static(path.join(__dirname, "uploads")),
);

// Routes connection
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
