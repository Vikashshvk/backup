const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const StoredFile = require("../models/StoredFile");
const auth = require("../middleware/auth");

const router = express.Router();

const VAULT_ROOT = path.join(__dirname, "../uploads/vault");
if (!fs.existsSync(VAULT_ROOT)) {
  fs.mkdirSync(VAULT_ROOT, { recursive: true });
}

// Multer Storage: Har extension allow karta hai aur folder structure banata hai
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawRel = req.body.paths;
    let subDir = "";
    if (rawRel) {
      const relArr = Array.isArray(rawRel) ? rawRel : [rawRel];
      const match = relArr.find((p) => p && p.endsWith(file.originalname));
      if (match) {
        subDir = path.dirname(match);
      }
    }
    const finalDir = path.join(VAULT_ROOT, req.user.id, subDir);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    cb(null, finalDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// No filter: .py, .js, .git, .mp4, db, .zip, .exe sab allow hai
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 * 5 }, // 5GB per file
});

// 1. Get Logged-in User's Vault Files
router.get("/files", auth, async (req, res) => {
  try {
    const files = await StoredFile.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Upload Any File / Entire Folder
router.post("/upload", auth, upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Koi file select nahi ki gayi!" });
    }

    const rawPaths = req.body.paths || [];
    const pathList = Array.isArray(rawPaths) ? rawPaths : [rawPaths];

    const savedRecords = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const matchingRel =
        pathList.find((p) => p && p.endsWith(file.originalname)) ||
        file.originalname;

      const record = new StoredFile({
        originalName: file.originalname,
        storedPath: file.path.replace(/\\/g, "/"),
        relativePath: matchingRel.replace(/\\/g, "/"),
        size: file.size,
        extension: path.extname(file.originalname).toLowerCase() || "file",
        mimeType: file.mimetype || "application/octet-stream",
        userId: req.user.id,
      });

      const saved = await record.save();
      savedRecords.push(saved);
    }

    res
      .status(201)
      .json({ message: "Files successfully vaulted", files: savedRecords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Single Direct Download
router.get("/download/single/:id", auth, async (req, res) => {
  try {
    const fileDoc = await StoredFile.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!fileDoc || !fs.existsSync(fileDoc.storedPath)) {
      return res.status(404).json({ message: "File nahi mili!" });
    }
    res.download(fileDoc.storedPath, fileDoc.originalName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Bulk Download Selected Files as MyFiles.zip
router.post("/download/bulk", auth, async (req, res) => {
  try {
    const { fileIds } = req.body;
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Download ke liye files select karein!" });
    }

    const files = await StoredFile.find({
      _id: { $in: fileIds },
      userId: req.user.id,
    });
    if (files.length === 0) {
      return res.status(404).json({ message: "Files nahi mili!" });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="MyFiles.zip"');

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("error", (err) => res.status(500).send({ error: err.message }));
    archive.pipe(res);

    files.forEach((f) => {
      if (fs.existsSync(f.storedPath)) {
        archive.file(f.storedPath, { name: f.relativePath || f.originalName });
      }
    });

    archive.finalize();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Delete File
router.delete("/:id", auth, async (req, res) => {
  try {
    const fileDoc = await StoredFile.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!fileDoc) return res.status(404).json({ message: "File nahi mili!" });

    if (fs.existsSync(fileDoc.storedPath)) {
      try {
        fs.unlinkSync(fileDoc.storedPath);
      } catch (e) {}
    }

    await StoredFile.findByIdAndDelete(req.params.id);
    res.json({ message: "File successfully removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
