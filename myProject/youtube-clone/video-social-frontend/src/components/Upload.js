import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = `http://${window.location.hostname}:5000`;

const captureFrameFromVideo = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    video.onloadedmetadata = () => {
      const targetTime = Math.min(
        2.0,
        video.duration > 2 ? 1.5 : video.duration / 2,
      );
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(videoUrl);
            if (blob) {
              const imageFile = new File([blob], `thumb_${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              resolve(imageFile);
            } else {
              resolve(null);
            }
          },
          "image/jpeg",
          0.9,
        );
      } catch {
        URL.revokeObjectURL(videoUrl);
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      resolve(null);
    };
  });
};

const Upload = () => {
  const [videoList, setVideoList] = useState([]);
  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMultipleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setErrorMsg("");

    for (const file of files) {
      const autoThumb = await captureFrameFromVideo(file);

      const tempVideo = document.createElement("video");
      const tempUrl = URL.createObjectURL(file);
      tempVideo.src = tempUrl;

      await new Promise((res) => {
        tempVideo.onloadedmetadata = () => {
          const sec = Math.round(tempVideo.duration) || 0;
          URL.revokeObjectURL(tempUrl);

          setVideoList((prev) => [
            ...prev,
            {
              file,
              title: file.name.replace(/\.[^/.]+$/, ""),
              duration: sec,
              isShort: sec <= 120,
              autoThumb,
              previewUrl: autoThumb ? URL.createObjectURL(autoThumb) : null,
            },
          ]);
          res();
        };
        tempVideo.onerror = () => {
          URL.revokeObjectURL(tempUrl);
          res();
        };
      });
    }
  };

  const handleTitleChange = (index, val) => {
    setVideoList((prev) => {
      const copy = [...prev];
      copy[index].title = val;
      return copy;
    });
  };

  const removeVideo = (index) => {
    setVideoList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !user) {
      setErrorMsg("Pehle account Login karein!");
      return;
    }

    if (!videoList.length) {
      setErrorMsg("Kam se kam 1 video select karo!");
      return;
    }

    const formData = new FormData();
    videoList.forEach((item) => {
      formData.append("videos", item.file);
      formData.append("titles", item.title);
      formData.append("durations", item.duration);

      const thumbToSend = customThumbnail || item.autoThumb;
      if (thumbToSend) {
        formData.append("thumbnails", thumbToSend);
      }
    });

    formData.append("isPublic", "true");

    setLoading(true);
    setProgress(0);

    try {
      await axios.post(`${API_BASE}/api/videos/upload-multiple`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percent);
        },
      });

      navigate("/");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Upload failed");
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>MULTI-VIDEO BROADCAST</h2>
        <p style={styles.subtitle}>
          Video frame is auto-captured as default thumbnail
        </p>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <label style={styles.dropZone}>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleMultipleFiles}
              style={{ display: "none" }}
            />
            <div style={styles.uploadIcon}>+</div>
            <p
              style={{
                margin: "4px 0 2px",
                color: "#00f3ff",
                fontWeight: "bold",
              }}
            >
              Select Video File(s)
            </p>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              MP4 / MKV (Thumbnail automatically extracted)
            </span>
          </label>

          <div style={styles.thumbBox}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#00f3ff",
                display: "block",
                marginBottom: "6px",
              }}
            >
              CUSTOM THUMBNAIL (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCustomThumbnail(e.target.files[0] || null)}
              style={{ color: "#cbd5e1", fontSize: "12px" }}
            />
            <span
              style={{
                fontSize: "10px",
                color: "#64748b",
                display: "block",
                marginTop: "4px",
              }}
            >
              {customThumbnail
                ? `✓ Custom image selected: ${customThumbnail.name}`
                : "Agar koi image nahi doge toh video ka automatic frame thumbnail banega"}
            </span>
          </div>

          {videoList.length > 0 && (
            <div style={styles.videoQueue}>
              {videoList.map((item, idx) => (
                <div key={idx} style={styles.queueItem}>
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt="auto-thumb"
                      style={styles.previewThumbImg}
                    />
                  ) : (
                    <div style={styles.previewThumbImg}>🎬</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleTitleChange(idx, e.target.value)}
                      placeholder="Title for this video"
                      style={styles.inputTitle}
                    />
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        marginTop: "4px",
                      }}
                    >
                      {item.duration}s •{" "}
                      <span
                        style={{
                          color: item.isShort ? "#ff2a6d" : "#00f3ff",
                          fontWeight: "bold",
                        }}
                      >
                        {item.isShort ? "⚡ Short" : "🎬 Video"}
                      </span>
                      {" • "}
                      <span style={{ color: "#05ffa1" }}>
                        ✓ Auto-Frame Ready
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(idx)}
                    style={styles.removeBtn}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "#00f3ff",
                  marginBottom: "4px",
                }}
              >
                <span>TRANSMITTING BATCH...</span>
                <span>{progress}%</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#161c2a",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "#00f3ff",
                    transition: "width 0.2s",
                  }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !videoList.length}
            style={{
              ...styles.submitBtn,
              opacity: loading || !videoList.length ? 0.6 : 1,
              cursor: loading || !videoList.length ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? `UPLOADING (${progress}%)`
              : `PUBLISH ${videoList.length} VIDEOS ➔`}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07080c",
    padding: "20px 16px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    backgroundColor: "#0e111a",
    border: "1px solid #1a2235",
    borderRadius: "14px",
    padding: "24px 20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
  },
  title: {
    margin: "0 0 4px",
    fontSize: "20px",
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 16px",
    fontSize: "12px",
    color: "#748ba7",
    textAlign: "center",
  },
  errorAlert: {
    background: "rgba(255, 42, 109, 0.1)",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    marginBottom: "12px",
  },
  dropZone: {
    border: "2px dashed #243048",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    background: "#121724",
  },
  uploadIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(0, 243, 255, 0.15)",
    border: "1px solid #00f3ff",
    color: "#00f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
  },
  thumbBox: {
    background: "#121724",
    padding: "12px",
    borderRadius: "8px",
    border: "1px dashed #243048",
  },
  videoQueue: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "240px",
    overflowY: "auto",
  },
  queueItem: {
    display: "flex",
    alignItems: "center",
    background: "#131826",
    border: "1px solid #1f283d",
    borderRadius: "8px",
    padding: "8px 10px",
    gap: "10px",
  },
  previewThumbImg: {
    width: "60px",
    height: "40px",
    borderRadius: "4px",
    objectFit: "cover",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
    border: "1px solid #00f3ff",
  },
  inputTitle: {
    width: "100%",
    background: "#0a0d16",
    border: "1px solid #222c40",
    color: "#fff",
    padding: "6px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },
  removeBtn: {
    background: "rgba(255, 42, 109, 0.1)",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    borderRadius: "6px",
    padding: "4px 8px",
    cursor: "pointer",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #00f3ff 0%, #00b4d8 100%)",
    border: "none",
    color: "#000",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "800",
    boxShadow: "0 0 14px rgba(0, 243, 255, 0.3)",
    cursor: "pointer",
  },
};

export default Upload;
