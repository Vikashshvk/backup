const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Video = require("../models/video");
const auth = require("../middleware/auth");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const { generateSubtitleWithPython } = require("../utils/subtitleGenerator");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`,
    );
  },
});
const upload = multer({ storage });

// Helper 1: Embedded Text Subtitle Extraction
const extractEmbeddedSubtitles = (videoFilePath) => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoFilePath, (err, metadata) => {
      if (err || !metadata.streams) return resolve(null);
      const subStreams = metadata.streams.filter(
        (s) => s.codec_type === "subtitle",
      );
      const textStream = subStreams.find(
        (s) =>
          s.codec_name === "subrip" ||
          s.codec_name === "ass" ||
          s.codec_name === "ssa" ||
          s.codec_name === "webvtt" ||
          s.codec_name === "mov_text",
      );
      if (!textStream) return resolve(null);

      const vttFileName = `${Date.now()}-extracted.vtt`;
      const outputPath = path.join(__dirname, "../uploads", vttFileName);

      ffmpeg(videoFilePath)
        .outputOptions([`-map 0:${textStream.index}`])
        .output(outputPath)
        .on("end", () => resolve(`uploads/${vttFileName}`))
        .on("error", () => resolve(null))
        .run();
    });
  });
};

// Helper 2: Audio Tracks Extraction
const extractAudioTracks = (videoFilePath) => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoFilePath, async (err, metadata) => {
      if (err || !metadata.streams) return resolve([]);
      const audioStreams = metadata.streams.filter(
        (s) => s.codec_type === "audio",
      );
      if (audioStreams.length <= 1) return resolve([]);

      const extractedTracks = [];
      for (let i = 0; i < audioStreams.length; i++) {
        const stream = audioStreams[i];
        const langCode = (stream.tags?.language || "").toLowerCase();

        let langName = `Audio Track ${i + 1}`;
        if (langCode === "hin" || langCode === "hindi")
          langName = "Hindi Dubbed";
        else if (langCode === "eng" || langCode === "english")
          langName = "English [Original]";
        else if (langCode === "jpn" || langCode === "japanese")
          langName = "Japanese";
        else if (stream.tags?.title) langName = stream.tags.title;

        const audioFileName = `${Date.now()}-dub-${i}.mp3`;
        const audioOutputPath = path.join(
          __dirname,
          "../uploads",
          audioFileName,
        );

        await new Promise((res) => {
          ffmpeg(videoFilePath)
            .outputOptions([`-map 0:${stream.index}`, "-q:a 2"])
            .output(audioOutputPath)
            .on("end", () => {
              extractedTracks.push({
                language: langCode || "und",
                title: langName,
                path: `uploads/${audioFileName}`,
                index: stream.index,
              });
              res();
            })
            .on("error", () => res())
            .run();
        });
      }
      resolve(extractedTracks);
    });
  });
};

// 1. Public Videos Feed
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

// 2. User's Own Uploads
router.get("/my-uploads", auth, async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Increment Views
router.put("/:id/view", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!video) return res.status(404).json({ message: "Video nahi mili" });
    res.json({ views: video.views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Video Upload Handler (async function ke andar await valid hai)
router.post("/upload-multiple", auth, upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Kam se kam ek video file select karein!" });
    }

    const { isPublic, description, tags } = req.body;
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
    const subtitleFiles = req.files.filter(
      (f) =>
        f.originalname.endsWith(".srt") ||
        f.originalname.endsWith(".vtt") ||
        f.fieldname === "subtitles",
    );

    if (videoFiles.length === 0) {
      return res.status(400).json({ message: "Valid video file nahi mili!" });
    }

    const parsedTags = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const savedVideos = [];

    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      const videoDuration = Number(durations[i]) || 0;
      const videoTitle =
        titles[i] || file.originalname.replace(/\.[^/.]+$/, "");
      const fullVideoPath = path.join(
        __dirname,
        "..",
        "uploads",
        file.filename,
      );

      const matchingThumb = imageFiles[i] || imageFiles[0];
      const thumbPath = matchingThumb
        ? `uploads/${matchingThumb.filename}`
        : `uploads/${file.filename}`;

      // Subtitle Extraction Logic
      let subPath = null;
      if (subtitleFiles[i]) {
        subPath = `uploads/${subtitleFiles[i].filename}`;
      } else {
        subPath = await extractEmbeddedSubtitles(fullVideoPath);
        if (!subPath) {
          console.log(
            "Embedded subtitle nahi mila, Python se generate kar rahe hain...",
          );
          subPath = await generateSubtitleWithPython(fullVideoPath);
        }
      }

      // Audio Tracks Extraction Logic
      const audioTracks = await extractAudioTracks(fullVideoPath);

      const newVideo = new Video({
        title: videoTitle,
        description: description || "",
        tags: parsedTags,
        videoPath: `uploads/${file.filename}`,
        thumbnailPath: thumbPath,
        subtitlePath: subPath,
        audioTracks: audioTracks,
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

// 5. Like
router.put("/:id/like", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const uId = req.user.id;
    video.dislikes = video.dislikes.filter((id) => id.toString() !== uId);

    if (video.likes.some((id) => id.toString() === uId)) {
      video.likes = video.likes.filter((id) => id.toString() !== uId);
    } else {
      video.likes.push(uId);
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
    if (!video) return res.status(404).json({ message: "Video not found" });

    const uId = req.user.id;
    video.likes = video.likes.filter((id) => id.toString() !== uId);

    if (video.dislikes.some((id) => id.toString() === uId)) {
      video.dislikes = video.dislikes.filter((id) => id.toString() !== uId);
    } else {
      video.dislikes.push(uId);
    }

    await video.save();
    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text, userName } = req.body;
    if (!text)
      return res.status(400).json({ message: "Comment cannot be empty" });

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.comments.unshift({
      userId: req.user.id,
      userName: userName || "Anonymous",
      text,
    });

    await video.save();
    res.json(video.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video nahi mili" });
    if (video.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Sirf apni video delete kar sakte hain!" });
    }

    const removeFile = (relPath) => {
      if (relPath && relPath.startsWith("uploads/")) {
        const full = path.join(__dirname, "..", relPath);
        if (fs.existsSync(full)) {
          try {
            fs.unlinkSync(full);
          } catch (e) {}
        }
      }
    };

    removeFile(video.videoPath);
    removeFile(video.thumbnailPath);
    removeFile(video.subtitlePath);
    if (video.audioTracks && video.audioTracks.length > 0) {
      video.audioTracks.forEach((t) => removeFile(t.path));
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video and associated media deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
