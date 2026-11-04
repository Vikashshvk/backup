  const mongoose = require("mongoose");

  const videoSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, default: "" },
      tags: [{ type: String }],
      videoPath: { type: String, required: true },
      thumbnailPath: { type: String, default: "" },
      subtitlePath: { type: String, default: null },
      isPublic: { type: Boolean, default: true },
      isShort: { type: Boolean, default: false },
      duration: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      comments: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          userName: { type: String, default: "Anonymous" },
          text: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    { timestamps: true },
  );

  module.exports = mongoose.model("Video", videoSchema);
