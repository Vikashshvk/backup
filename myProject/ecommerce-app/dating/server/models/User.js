const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "User" },
  bio: { type: String, default: "Looking for meaningful connections ✨" },
  age: { type: Number, default: 21 },
  gender: { type: String, default: "Not specified" },
  avatar: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("User", userSchema);
