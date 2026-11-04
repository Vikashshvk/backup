const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Video = require("../models/video");
const auth = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({ storage });

// 1. Public Feed
router.get("/public", async (req, res) => {
  try {
    const videos = await Video.find({ isPublic: true })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Logged-in User ke uploaded videos (Settings / Account ke liye)
router.get("/my-uploads", auth, async (req, res) => {
  try {
    const userVideos = await Video.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(userVideos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Multi-Video Upload with Auto / Custom Thumbnail
router.post("/upload-multiple", auth, upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Kam se kam ek video file select karein!" });
    }

    const { isPublic } = req.body;
    const rawTitles = req.body.titles || req.body.title || [];
    const rawDurations = req.body.durations || req.body.duration || [];

    const titles = Array.isArray(rawTitles) ? rawTitles : [rawTitles];
    const durations = Array.isArray(rawDurations)
      ? rawDurations
      : [rawDurations];

    const videoFiles = req.files.filter(
      (f) => f.mimetype.startsWith("video/") || f.fieldname === "videos",
    );
    const imageFiles = req.files.filter(
      (f) => f.mimetype.startsWith("image/") || f.fieldname === "thumbnails",
    );

    if (videoFiles.length === 0) {
      return res.status(400).json({ message: "Valid video file nahi mili!" });
    }

    const savedVideos = [];

    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      const videoDuration = Number(durations[i]) || 0;
      const videoTitle =
        titles[i] || file.originalname.replace(/\.[^/.]+$/, "");

      const matchingThumb = imageFiles[i] || imageFiles[0];
      const thumbPath = matchingThumb
        ? `uploads/${matchingThumb.filename}`
        : `uploads/${file.filename}`;

      const newVideo = new Video({
        title: videoTitle,
        videoPath: `uploads/${file.filename}`,
        thumbnailPath: thumbPath,
        isPublic:
          isPublic !== undefined
            ? isPublic === "true" || isPublic === true
            : true,
        isShort: videoDuration > 0 && videoDuration <= 120,
        duration: videoDuration,
        userId: req.user.id,
      });

      const saved = await newVideo.save();
      savedVideos.push(saved);
    }

    res
      .status(201)
      .json({ message: "Videos uploaded successfully", videos: savedVideos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Secure Delete Video: Sirf creator hi delete kar sakega
router.delete("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video nahi mili" });

    if (video.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Aap sirf apni video hi delete kar sakte hain!" });
    }

    const fullPath = path.join(__dirname, "..", video.videoPath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {}
    }

    if (video.thumbnailPath && video.thumbnailPath.startsWith("uploads/")) {
      const thumbFullPath = path.join(__dirname, "..", video.thumbnailPath);
      if (fs.existsSync(thumbFullPath)) {
        try {
          fs.unlinkSync(thumbFullPath);
        } catch (e) {}
      }
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video successfully delete ho gayi!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Like
router.put("/:id/like", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video nahi mili" });

    const userId = req.user.id;
    if (video.likes.includes(userId)) {
      video.likes = video.likes.filter((id) => id.toString() !== userId);
    } else {
      video.likes.push(userId);
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId);
    }

    await video.save();
    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Dislike
router.put("/:id/dislike", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video nahi mili" });

    const userId = req.user.id;
    if (video.dislikes.includes(userId)) {
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId);
    } else {
      video.dislikes.push(userId);
      video.likes = video.likes.filter((id) => id.toString() !== userId);
    }

    await video.save();
    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Comments
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text, userName } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ message: "Comment blank nahi ho sakta" });

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video nahi mili" });

    video.comments.push({
      userId: req.user.id,
      userName: userName || "Anonymous",
      text: text.trim(),
    });
    await video.save();

    res.status(201).json(video.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
