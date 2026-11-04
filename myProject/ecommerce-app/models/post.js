const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, default: "User" },
  bio: { type: String, default: "Looking for meaningful connections ✨" },
  age: { type: Number, default: 21 },
  gender: { type: String, default: "Not specified" },
  avatar: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
  },
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  theme: { type: String, default: "dark" },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
