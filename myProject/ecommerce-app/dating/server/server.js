const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const User = require("./models/User");
const Post = require("./models/Post");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
// Serve uploaded images statically
app.use("/uploads", express.static(uploadDir));

const JWT_SECRET = "superdatingsecretkey123";

// MongoDB Connect
mongoose
  .connect("mongodb://127.0.0.1:27017/dating_react_db")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// --- AUTH ROUTES ---
app.post(
  "/api/auth/register",
  upload.single("avatarFile"),
  async (req, res) => {
    try {
      const { username, email, password, name } = req.body;
      const avatar = req.file
        ? `http://localhost:5001/uploads/${req.file.filename}`
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400";

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        name,
        avatar,
      });
      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      res.json({ token, user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  const user = await User.findById(req.userId).populate("followers following");
  res.json(user);
});

// --- POSTS ROUTES ---
app.get("/api/posts", auth, async (req, res) => {
  const posts = await Post.find()
    .populate("author", "name username avatar")
    .populate("comments.user", "name username avatar")
    .sort({ createdAt: -1 });
  res.json(posts);
});

// Photo upload required for post
app.post("/api/posts", auth, upload.single("postImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ msg: "Photo is required to create a post!" });
    }
    const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    const post = await Post.create({
      author: req.userId,
      image: imageUrl,
      caption: req.body.caption || "",
    });
    const fullPost = await Post.findById(post._id).populate(
      "author",
      "name username avatar",
    );
    res.json(fullPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/posts/:id/comment", auth, async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { user: req.userId, text: req.body.text } } },
    { new: true },
  ).populate("comments.user", "name username avatar");
  res.json(post);
});

app.post("/api/posts/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const index = post.likes.indexOf(req.userId);
  if (index === -1) {
    post.likes.push(req.userId);
  } else {
    post.likes.splice(index, 1);
  }
  await post.save();
  res.json(post);
});

// --- USER & SOCIAL ROUTES ---
app.get("/api/users/discover", auth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.userId } }).select(
    "-password",
  );
  res.json(users);
});

app.post("/api/users/:id/follow", auth, async (req, res) => {
  const targetId = req.params.id;
  const currentId = req.userId;
  const currentUser = await User.findById(currentId);

  if (currentUser.following.includes(targetId)) {
    await User.findByIdAndUpdate(currentId, { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: currentId } });
  } else {
    await User.findByIdAndUpdate(currentId, { $push: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $push: { followers: currentId } });
  }
  const updatedUser = await User.findById(currentId).populate(
    "following followers",
  );
  res.json(updatedUser);
});

app.put(
  "/api/users/profile",
  auth,
  upload.single("avatarFile"),
  async (req, res) => {
    const updateData = {
      name: req.body.name,
      bio: req.body.bio,
      age: req.body.age,
      gender: req.body.gender,
    };
    if (req.file) {
      updateData.avatar = `http://localhost:5001/uploads/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    });
    res.json(user);
  },
);

// --- CHAT ROUTES ---
app.get("/api/messages/:targetId", auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.userId, receiver: req.params.targetId },
      { sender: req.params.targetId, receiver: req.userId },
    ],
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// --- SOCKET.IO CHAT & WEBRTC ---
const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", (userId) => {
    onlineUsers.set(String(userId), socket.id);
  });

  socket.on("send-message", async ({ senderId, receiverId, message }) => {
    try {
      const msg = await Message.create({
        sender: senderId,
        receiver: receiverId,
        message,
      });
      const targetSocketId = onlineUsers.get(String(receiverId));
      if (targetSocketId) {
        io.to(targetSocketId).emit("receive-message", msg);
      }
      socket.emit("message-sent", msg);
    } catch (e) {
      console.log("Socket message error:", e);
    }
  });

  socket.on("call-user", ({ targetUserId, signalData, fromUser }) => {
    const targetSocket = onlineUsers.get(String(targetUserId));
    if (targetSocket) {
      io.to(targetSocket).emit("incoming-call", {
        signal: signalData,
        fromUser,
      });
    }
  });

  socket.on("answer-call", ({ toUser, signal }) => {
    const callerSocket = onlineUsers.get(String(toUser));
    if (callerSocket) {
      io.to(callerSocket).emit("call-accepted", signal);
    }
  });

  socket.on("disconnect", () => {
    for (let [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
  });
});

server.listen(5001, () => console.log("Server active on port 5001"));
