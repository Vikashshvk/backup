import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Uploads directory ensure karna
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
// Static uploads folder serve karna taaki image/video direct access ho sakein
app.use("/uploads", express.static(uploadDir));

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

let onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("setup", (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
  });

  socket.on("send-message", (data) => {
    socket.to(data.chatId).emit("message-received", data);
  });

  // Calling Signaling: Offer
  socket.on("call-user", (data) => {
    socket.to(data.userToCall).emit("incoming-call", {
      signal: data.signalData,
      from: data.from,
      fromName: data.fromName,
      callType: data.callType,
    });
  });

  // Calling Signaling: Answer
  socket.on("answer-call", (data) => {
    socket.to(data.to).emit("call-accepted", data.signal);
  });

  // Calling Signaling: ICE Candidate Exchange (Fixes call drop / disconnect)
  socket.on("ice-candidate", (data) => {
    socket.to(data.to).emit("receive-candidate", data.candidate);
  });

  // Calling Signaling: End Call
  socket.on("end-call", (data) => {
    socket.to(data.to).emit("call-ended");
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});

// App Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
  res.send("Volo Backend is running smoothly.");
});

// Listen on 0.0.0.0 for LAN & Mobile accessibility
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/volo_chat";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on all network interfaces at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });
