const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");

const archiverModule = require("archiver");
const archiver =
  typeof archiverModule === "function"
    ? archiverModule
    : archiverModule.default || archiverModule;

const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Public shared uploads directory
const STORAGE_ROOT = path.join(__dirname, "shared_storage");
if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawPaths = req.body.paths;
    let targetDir = STORAGE_ROOT;

    if (rawPaths) {
      const pathList = Array.isArray(rawPaths) ? rawPaths : [rawPaths];
      const matchedRel = pathList.find(
        (p) => p && p.endsWith(file.originalname),
      );
      if (matchedRel) {
        const subFolder = path.dirname(matchedRel);
        targetDir = path.join(STORAGE_ROOT, subFolder);
      }
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[\/\\]/g, "_");
    cb(null, safeName);
  },
});

// Unlimited file size & files count
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 * 100 }, // 100GB limit
});

// Recursive file scanner
const scanDirectory = (dir, list = []) => {
  if (!fs.existsSync(dir)) return list;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      scanDirectory(fullPath, list);
    } else {
      const relPath = path.relative(STORAGE_ROOT, fullPath).replace(/\\/g, "/");
      const ext = path.extname(item).toLowerCase();

      const isVideo = [".mp4", ".mkv", ".webm", ".avi", ".mov"].includes(ext);
      const isAudio = [".mp3", ".wav", ".aac", ".flac", ".ogg"].includes(ext);
      const isCode = [
        ".js",
        ".py",
        ".html",
        ".css",
        ".json",
        ".c",
        ".cpp",
        ".java",
        ".env",
        ".gitignore",
        ".git",
      ].includes(ext);

      list.push({
        id: Buffer.from(relPath).toString("base64"),
        name: item,
        relativePath: relPath,
        size: stats.size,
        extension: ext || ".file",
        isVideo,
        isAudio,
        isCode,
        updatedAt: stats.mtime,
      });
    }
  }
  return list;
};

// 1. PUBLIC FEED
app.get("/api/feed", (req, res) => {
  try {
    const files = scanDirectory(STORAGE_ROOT);
    files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Storage scan failed: " + err.message });
  }
});

// 2. UNIVERSAL UPLOAD ROUTE (Safe against connection aborts)
app.post("/api/upload", (req, res) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err.code === "ECONNABORTED" || err.message === "Request aborted") {
        console.warn("Upload interrupted/aborted by client.");
        return res.status(400).json({ message: "Upload interrupted" });
      }
      return res.status(500).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Koi file receive nahi hui" });
    }

    res.status(200).json({
      message: "Uploaded successfully",
      count: req.files.length,
    });
  });
});

// 3. SINGLE FILE DOWNLOAD
app.get("/api/download/single/:id", (req, res) => {
  try {
    const relPath = Buffer.from(req.params.id, "base64").toString("utf-8");
    const fullPath = path.resolve(STORAGE_ROOT, relPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).send("File nahi mili");
    }

    res.download(fullPath, path.basename(fullPath));
  } catch (err) {
    res.status(500).send("Download error: " + err.message);
  }
});

// 4. STREAM / PREVIEW
app.get("/api/stream/:id", (req, res) => {
  try {
    const relPath = Buffer.from(req.params.id, "base64").toString("utf-8");
    const fullPath = path.resolve(STORAGE_ROOT, relPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).send("File nahi mili");
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(fullPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(fullPath).pipe(res);
    }
  } catch (err) {
    res.status(500).send("Stream error: " + err.message);
  }
});

// 5. BULK ZIP DOWNLOAD
app.post("/api/download/bulk", (req, res) => {
  const { fileIds } = req.body;
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).send("Files select karein");
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="MyFiles.zip"');
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

  const archive = (typeof archiver === "function" ? archiver : archiverModule)(
    "zip",
    {
      zlib: { level: 6 },
    },
  );

  archive.on("error", (err) => {
    console.error("Archive error:", err.message);
    if (!res.headersSent) res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  fileIds.forEach((id) => {
    try {
      const relPath = Buffer.from(id, "base64").toString("utf-8");
      const fullPath = path.resolve(STORAGE_ROOT, relPath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        archive.file(fullPath, { name: relPath.replace(/\\/g, "/") });
      }
    } catch {}
  });

  archive.finalize();
});

// 6. SINGLE FILE DELETE
app.delete("/api/files/single/:id", (req, res) => {
  try {
    const relPath = Buffer.from(req.params.id, "base64").toString("utf-8");
    const fullPath = path.resolve(STORAGE_ROOT, relPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "File nahi mili" });
    }

    fs.unlinkSync(fullPath);

    const parentDir = path.dirname(fullPath);
    if (parentDir !== STORAGE_ROOT && fs.existsSync(parentDir)) {
      if (fs.readdirSync(parentDir).length === 0) {
        fs.rmdirSync(parentDir);
      }
    }

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. BULK DELETE
app.post("/api/files/bulk-delete", (req, res) => {
  const { fileIds } = req.body;
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({ message: "Select files first" });
  }

  let deletedCount = 0;
  fileIds.forEach((id) => {
    try {
      const relPath = Buffer.from(id, "base64").toString("utf-8");
      const fullPath = path.resolve(STORAGE_ROOT, relPath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
        deletedCount++;
        const parentDir = path.dirname(fullPath);
        if (parentDir !== STORAGE_ROOT && fs.existsSync(parentDir)) {
          if (fs.readdirSync(parentDir).length === 0) fs.rmdirSync(parentDir);
        }
      }
    } catch {}
  });

  res.json({ message: `${deletedCount} files deleted` });
});

// IP helper
const getLocalIp = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
};

// Server listen & Timeout Unlock for 40GB+ Uploads
const server = app.listen(PORT, "0.0.0.0", () => {
  const localIp = getLocalIp();
  console.log(`\n======================================================`);
  console.log(` LAN SHARE SERVER RUNNING`);
  console.log(` PC Local:   http://localhost:${PORT}`);
  console.log(` Wi-Fi URL:  http://${localIp}:${PORT}`);
  console.log(` Storage:    ${STORAGE_ROOT}`);
  console.log(`======================================================\n`);
});

// Large file transfers ke timeouts unlock
server.timeout = 0;
server.keepAliveTimeout = 0;
server.headersTimeout = 0;
