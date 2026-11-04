const mongoose = require("mongoose");

const storedFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storedPath: { type: String, required: true },
    relativePath: { type: String, default: "" }, // Folder structure ke liye
    size: { type: Number, default: 0 },
    extension: { type: String, default: "file" },
    mimeType: { type: String, default: "application/octet-stream" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StoredFile", storedFileSchema);
