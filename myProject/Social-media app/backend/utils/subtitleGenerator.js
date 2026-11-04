const { spawn } = require("child_process");
const path = require("path");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

const generateSubtitleWithPython = (videoFilePath) => {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, "auto_sub.py");
    const ffmpegPath = ffmpegInstaller.path;

    // Args: [script_path, video_path, ffmpeg_path]
    const pyProcess = spawn("python", [pythonScript, videoFilePath, ffmpegPath]);

    let outputVttPath = "";
    let errorDetails = "";

    pyProcess.stdout.on("data", (data) => {
      outputVttPath += data.toString().trim();
    });

    pyProcess.stderr.on("data", (data) => {
      errorDetails += data.toString();
    });

    pyProcess.on("close", (code) => {
      if (code === 0 && outputVttPath) {
        const relativePath = path
          .relative(path.join(__dirname, ".."), outputVttPath)
          .replace(/\\/g, "/");
        console.log("Subtitle successfully generated:", relativePath);
        resolve(relativePath);
      } else {
        console.error("=== Python Subtitle Generation Error ===");
        console.error(`Exit Code: ${code}`);
        console.error(`Details: ${errorDetails || "No stderr output"}`);
        console.error("=========================================");
        resolve(null);
      }
    });

    pyProcess.on("error", (err) => {
      console.error("Python command execute nahi ho saki:", err.message);
      resolve(null);
    });
  });
};

module.exports = { generateSubtitleWithPython };