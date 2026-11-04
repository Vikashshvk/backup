const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const User = require("./models/user");
const Post = require("./models/post");
const Message = require("./models/message");
const { isLoggedIn } = require("./middleware");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Database Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/datingapp")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Settings
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Session
const sessionMiddleware = session({
  secret: "datingsecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});
app.use(sessionMiddleware);

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

// --- ROUTES ---

// 1. Home Feed / Explore (Cards, Follow, Like, Comment)
app.get("/", (req, res) => res.redirect("/home"));

app.get("/home", isLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author")
      .populate("comments.user")
      .sort({ createdAt: -1 });

    const discoverUsers = await User.find({ _id: { $ne: req.user._id } }).limit(
      10,
    );
    res.render("home", { posts, discoverUsers });
  } catch (err) {
    next(err);
  }
});

// Post Create
app.post("/posts", isLoggedIn, async (req, res, next) => {
  try {
    const { caption, image } = req.body;
    await Post.create({
      author: req.user._id,
      images: [image],
      caption,
    });
    res.redirect("/home");
  } catch (err) {
    next(err);
  }
});

// Post Comment
app.post("/posts/:id/comment", isLoggedIn, async (req, res, next) => {
  try {
    const { comment } = req.body;
    await Post.findByIdAndUpdate(req.params.id, {
      $push: { comments: { user: req.user._id, text: comment } },
    });
    res.redirect("/home");
  } catch (err) {
    next(err);
  }
});

// Follow/Unfollow User
app.post("/users/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user._id;

    if (req.user.following.includes(targetId)) {
      await User.findByIdAndUpdate(currentId, {
        $pull: { following: targetId },
      });
      await User.findByIdAndUpdate(targetId, {
        $pull: { followers: currentId },
      });
    } else {
      await User.findByIdAndUpdate(currentId, {
        $push: { following: targetId },
      });
      await User.findByIdAndUpdate(targetId, {
        $push: { followers: currentId },
      });
    }
    res.redirect("back");
  } catch (err) {
    next(err);
  }
});

// 2. Chat Section
app.get("/chats", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("following");
    res.render("chats", {
      chatUsers: user.following,
      activeChat: null,
      messages: [],
    });
  } catch (err) {
    next(err);
  }
});

app.get("/chats/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("following");
    const activeChat = await User.findById(req.params.userId);

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: activeChat._id },
        { sender: activeChat._id, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.render("chats", { chatUsers: user.following, activeChat, messages });
  } catch (err) {
    next(err);
  }
});

// 3. Video Call Route
app.get("/call/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    res.render("videocall", { targetUser });
  } catch (err) {
    next(err);
  }
});

// 4. Account Settings / Profile Edit
app.get("/account", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("followers")
      .populate("following");
    res.render("account", { user });
  } catch (err) {
    next(err);
  }
});

app.put("/account", isLoggedIn, async (req, res, next) => {
  try {
    const { name, bio, avatar, age, gender } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      name,
      bio,
      avatar,
      age,
      gender,
    });
    res.redirect("/account");
  } catch (err) {
    next(err);
  }
});

// Auth Routes
app.get("/login", (req, res) => res.render("login", { errorMsg: null }));
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  }),
);

app.get("/signup", (req, res) => res.render("signup"));
app.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password, name, avatar } = req.body;
    const user = new User({ email, username, name, avatar });
    const regUser = await User.register(user, password);
    req.login(regUser, (err) => {
      if (err) return next(err);
      res.redirect("/home");
    });
  } catch (err) {
    next(err);
  }
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

// --- SOCKET.IO (Chat & WebRTC Video Call Signaling) ---
const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // Direct Message
  socket.on("send-message", async ({ senderId, receiverId, message }) => {
    const msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message,
    });
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-message", msg);
    }
  });

  // WebRTC Signals
  socket.on("call-user", ({ targetUserId, signalData, fromUser }) => {
    const targetSocket = onlineUsers.get(targetUserId);
    if (targetSocket) {
      io.to(targetSocket).emit("incoming-call", {
        signal: signalData,
        fromUser,
      });
    }
  });

  socket.on("answer-call", ({ toUser, signal }) => {
    const callerSocket = onlineUsers.get(toUser);
    if (callerSocket) {
      io.to(callerSocket).emit("call-accepted", signal);
    }
  });

  socket.on("end-call", ({ toUser }) => {
    const targetSocket = onlineUsers.get(toUser);
    if (targetSocket) {
      io.to(targetSocket).emit("call-ended");
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

server.listen(8080, () =>
  console.log("Dating App running on http://localhost:8080"),
);
