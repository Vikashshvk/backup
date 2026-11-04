  const mongoose = require("mongoose");

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      allies: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Followers
      alliedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Following
    },
    { timestamps: true },
  );

  module.exports = mongoose.model("User", userSchema);
