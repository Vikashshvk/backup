import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = `http://${window.location.hostname}:5000`;

const getSafeThumbnailUrl = (video) => {
  if (!video) return "";
  const raw = video.thumbnailPath || video.videoPath || "";
  if (raw.startsWith("http")) return raw;
  const clean = raw.replace(/\\/g, "/").replace(/^\/?uploads\/?/, "");
  return `${API_BASE}/uploads/${clean}`;
};

const parseSubtitles = (raw) => {
  if (!raw) return [];
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const cues = [];
  let i = 0;

  const toSec = (tStr) => {
    if (!tStr) return 0;
    const parts = tStr.trim().replace(",", ".").split(":");
    if (parts.length === 3) {
      return (
        parseFloat(parts[0]) * 3600 +
        parseFloat(parts[1]) * 60 +
        parseFloat(parts[2])
      );
    }
    if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return 0;
  };

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes("-->")) {
      const [startRaw, endRaw] = line.split("-->");
      const start = toSec(startRaw);
      const end = toSec(endRaw.split(" ")[0]);
      let text = "";
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        text += (text ? " " : "") + lines[i].trim();
        i++;
      }
      if (text && !isNaN(start) && !isNaN(end)) {
        cues.push({ start, end, text });
      }
    }
    i++;
  }
  return cues;
};

const Feed = () => {
  const [videos, setVideos] = useState([]);
  const [myUploadedVideos, setMyUploadedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "videos" | "shorts" | "myfiles"
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeShortIndex, setActiveShortIndex] = useState(null);
  const [animatingLikeId, setAnimatingLikeId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Player controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Subtitles
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState("");
  const [parsedCues, setParsedCues] = useState([]);
  const [seekFeedback, setSeekFeedback] = useState(null);

  // Audio Track State
  const [selectedAudioTrack, setSelectedAudioTrack] = useState("default");
  const [audioSyncStatus, setAudioSyncStatus] = useState("locked");

  // =================== MYFILES VAULT STATE ===================
  const [vaultFiles, setVaultFiles] = useState([]);
  const [selectedVaultIds, setSelectedVaultIds] = useState([]);
  const [vaultUploading, setVaultUploading] = useState(false);
  const [vaultFilter, setVaultFilter] = useState("");
  const vaultFileInputRef = useRef(null);
  const vaultFolderInputRef = useRef(null);

  const videoPlayerRef = useRef(null);
  const secondaryAudioRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastTapRef = useRef({ time: 0, side: null });
  const controlsTimeoutRef = useRef(null);

  const [themeMode, setThemeMode] = useState("cyber-dark");
  const [autoPlayVideos] = useState(true);
  const [streamQuality] = useState("1080p");

  const { user, token, logout } = useContext(AuthContext);
  const currentUserId = user?._id || user?.id;
  const navigate = useNavigate();
  const location = useLocation();

  const shortsContainerRef = useRef(null);
  const shortsVideoRefs = useRef([]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/videos/public`);
      setVideos(res.data);
    } catch (err) {
      console.error("Videos load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaultFiles = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/vault/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVaultFiles(res.data);
    } catch (err) {
      console.error("Vault files load error:", err);
    }
  };

  const fetchMyUploads = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/videos/my-uploads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyUploadedVideos(res.data);
    } catch (err) {
      console.error("My uploads error:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (activeTab === "myfiles" && token) {
      fetchVaultFiles();
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (settingsOpen && token) {
      fetchMyUploads();
    }
  }, [settingsOpen, token]);

  // Video Selection
  const handleSelectVideo = async (video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    setPlaybackSpeed(1);
    setSelectedAudioTrack("default");
    setAudioSyncStatus("locked");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (secondaryAudioRef.current) {
      secondaryAudioRef.current.pause();
      secondaryAudioRef.current.src = "";
    }

    setParsedCues([]);
    setActiveSubtitle("");

    if (video.subtitlePath) {
      try {
        const cleanSub = video.subtitlePath
          .replace(/\\/g, "/")
          .replace(/^\/?uploads\/?/, "");
        const res = await axios.get(`${API_BASE}/uploads/${cleanSub}`, {
          responseType: "text",
        });
        const cues = parseSubtitles(res.data);
        if (cues && cues.length > 0) {
          setParsedCues(cues);
          setSubtitlesEnabled(true);
        } else {
          setSubtitlesEnabled(false);
        }
      } catch (err) {
        setSubtitlesEnabled(false);
      }
    } else {
      setSubtitlesEnabled(false);
    }

    try {
      const res = await axios.put(`${API_BASE}/api/videos/${video._id}/view`);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === video._id ? { ...v, views: res.data.views } : v,
        ),
      );
    } catch {}
  };

  const closePlayer = () => {
    if (videoPlayerRef.current) videoPlayerRef.current.pause();
    if (secondaryAudioRef.current) {
      secondaryAudioRef.current.pause();
      secondaryAudioRef.current.src = "";
    }
    setSelectedVideo(null);
    setSelectedAudioTrack("default");
    setParsedCues([]);
    setActiveSubtitle("");
    setSubtitlesEnabled(false);
  };

  const handleAudioTrackChange = (trackPath) => {
    setSelectedAudioTrack(trackPath);
    if (!videoPlayerRef.current) return;

    const currTime = videoPlayerRef.current.currentTime;
    const isVidPlaying = !videoPlayerRef.current.paused;

    if (trackPath === "default") {
      videoPlayerRef.current.muted = false;
      if (secondaryAudioRef.current) {
        secondaryAudioRef.current.pause();
        secondaryAudioRef.current.src = "";
      }
      setAudioSyncStatus("locked");
    } else {
      videoPlayerRef.current.muted = true;
      if (secondaryAudioRef.current) {
        const cleanPath = trackPath
          .replace(/\\/g, "/")
          .replace(/^\/?uploads\/?/, "");
        secondaryAudioRef.current.src = `${API_BASE}/uploads/${cleanPath}`;
        secondaryAudioRef.current.currentTime = currTime;
        secondaryAudioRef.current.playbackRate = playbackSpeed;
        if (isVidPlaying) {
          secondaryAudioRef.current.play().catch(() => {});
        }
      }
    }
  };

  useEffect(() => {
    if (selectedAudioTrack === "default") return;

    const vEl = videoPlayerRef.current;
    const aEl = secondaryAudioRef.current;
    if (!vEl || !aEl) return;

    const handleWaiting = () => {
      if (!aEl.paused) aEl.pause();
      setAudioSyncStatus("syncing");
    };

    const handlePlaying = () => {
      if (vEl.paused) return;
      aEl.currentTime = vEl.currentTime;
      aEl.play().catch(() => {});
      setAudioSyncStatus("locked");
    };

    const handleRateChange = () => {
      aEl.playbackRate = vEl.playbackRate;
    };

    const handleSeeked = () => {
      aEl.currentTime = vEl.currentTime;
      setAudioSyncStatus("locked");
    };

    const driftInterval = setInterval(() => {
      if (!vEl.paused && !aEl.paused) {
        const diff = vEl.currentTime - aEl.currentTime;
        if (Math.abs(diff) > 0.15) {
          aEl.currentTime = vEl.currentTime;
          setAudioSyncStatus("drift");
          setTimeout(() => setAudioSyncStatus("locked"), 400);
        }
      }
    }, 200);

    vEl.addEventListener("waiting", handleWaiting);
    vEl.addEventListener("playing", handlePlaying);
    vEl.addEventListener("ratechange", handleRateChange);
    vEl.addEventListener("seeked", handleSeeked);

    return () => {
      clearInterval(driftInterval);
      vEl.removeEventListener("waiting", handleWaiting);
      vEl.removeEventListener("playing", handlePlaying);
      vEl.removeEventListener("ratechange", handleRateChange);
      vEl.removeEventListener("seeked", handleSeeked);
    };
  }, [selectedAudioTrack]);

  const changeSpeed = (speed) => {
    const num = parseFloat(speed);
    setPlaybackSpeed(num);
    if (videoPlayerRef.current) videoPlayerRef.current.playbackRate = num;
    if (secondaryAudioRef.current) secondaryAudioRef.current.playbackRate = num;
  };

  const triggerControlsVisibility = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoPlayerRef.current && !videoPlayerRef.current.paused) {
        setShowControls(false);
      }
    }, 3200);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!videoPlayerRef.current) return;
    if (videoPlayerRef.current.paused) {
      videoPlayerRef.current.play();
      setIsPlaying(true);
      if (selectedAudioTrack !== "default" && secondaryAudioRef.current) {
        secondaryAudioRef.current.play().catch(() => {});
      }
    } else {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
      if (secondaryAudioRef.current) {
        secondaryAudioRef.current.pause();
      }
    }
    triggerControlsVisibility();
  }, [triggerControlsVisibility, selectedAudioTrack]);

  const seekRelative = useCallback(
    (seconds) => {
      if (!videoPlayerRef.current) return;
      const target = Math.max(
        0,
        Math.min(
          videoPlayerRef.current.duration || 0,
          videoPlayerRef.current.currentTime + seconds,
        ),
      );
      videoPlayerRef.current.currentTime = target;
      setCurrentTime(target);
      if (selectedAudioTrack !== "default" && secondaryAudioRef.current) {
        secondaryAudioRef.current.currentTime = target;
      }
      triggerControlsVisibility();
    },
    [triggerControlsVisibility, selectedAudioTrack],
  );

  const toggleSubtitles = useCallback(() => {
    setSubtitlesEnabled((prev) => {
      const next = !prev;
      if (!next) setActiveSubtitle("");
      return next;
    });
  }, []);

  const showFeedback = useCallback((side) => {
    setSeekFeedback(side);
    setTimeout(() => setSeekFeedback(null), 650);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const elem = document.getElementById("youtube-video-box");
    if (!elem) return;

    if (!document.fullscreenElement) {
      try {
        await elem.requestFullscreen();
        if (videoPlayerRef.current) {
          const aspect =
            videoPlayerRef.current.videoWidth /
            videoPlayerRef.current.videoHeight;
          if (
            aspect >= 1.6 &&
            window.screen.orientation &&
            window.screen.orientation.lock
          ) {
            window.screen.orientation.lock("landscape").catch(() => {});
          }
        }
      } catch {}
    } else {
      document.exitFullscreen().catch(() => {});
      if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
        return;
      if (!selectedVideo) return;

      const key = e.key.toLowerCase();
      if (key === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === "c") {
        e.preventDefault();
        toggleSubtitles();
      } else if (e.key === "ArrowRight" || key === "l") {
        e.preventDefault();
        seekRelative(10);
        showFeedback("right");
      } else if (e.key === "ArrowLeft" || key === "j") {
        e.preventDefault();
        seekRelative(-10);
        showFeedback("left");
      } else if (e.key === " " || key === "k") {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedVideo,
    toggleFullscreen,
    toggleSubtitles,
    seekRelative,
    showFeedback,
    togglePlayPause,
  ]);

  const handleTimeUpdate = () => {
    if (videoPlayerRef.current) {
      const curr = videoPlayerRef.current.currentTime;
      setCurrentTime(curr);
      setDuration(videoPlayerRef.current.duration || 0);
    }
  };

  const handleSeekChange = (e) => {
    const newTime = Number(e.target.value);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
    if (selectedAudioTrack !== "default" && secondaryAudioRef.current) {
      secondaryAudioRef.current.currentTime = newTime;
    }
    triggerControlsVisibility();
  };

  const handleTouchZone = (e, side) => {
    e.stopPropagation();
    const now = Date.now();
    if (
      lastTapRef.current.side === side &&
      now - lastTapRef.current.time < 300
    ) {
      if (side === "left") {
        seekRelative(-10);
        showFeedback("left");
      } else {
        seekRelative(10);
        showFeedback("right");
      }
      lastTapRef.current = { time: 0, side: null };
    } else {
      lastTapRef.current = { time: now, side };
      togglePlayPause();
    }
  };

  const handleManualSubtitleSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const cues = parseSubtitles(event.target.result);
      if (cues.length > 0) {
        setParsedCues(cues);
        setSubtitlesEnabled(true);
      } else {
        alert(
          "Subtitle file parse nahi ho saki. Valid .srt ya .vtt choose karein.",
        );
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (!subtitlesEnabled) {
      setActiveSubtitle("");
      return;
    }
    if (parsedCues.length > 0) {
      const found = parsedCues.find(
        (c) => currentTime >= c.start && currentTime <= c.end,
      );
      setActiveSubtitle(found ? found.text : "");
    }
  }, [currentTime, parsedCues, subtitlesEnabled]);

  const confirmAndDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await axios.delete(`${API_BASE}/api/videos/${deleteConfirmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyUploadedVideos((prev) =>
        prev.filter((v) => v._id !== deleteConfirmId),
      );
      setVideos((prev) => prev.filter((v) => v._id !== deleteConfirmId));
      if (selectedVideo?._id === deleteConfirmId) {
        closePlayer();
      }
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Delete fail ho gaya");
      setDeleteConfirmId(null);
    }
  };

  const requireAuth = () => {
    if (!token || !user) {
      alert("Pehle account me Login karein!");
      setSettingsOpen(true);
      return false;
    }
    return true;
  };

  const handleLike = async (videoId) => {
    if (!requireAuth()) return;
    setAnimatingLikeId(videoId);
    setTimeout(() => setAnimatingLikeId(null), 600);

    try {
      const res = await axios.put(
        `${API_BASE}/api/videos/${videoId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId
            ? { ...v, likes: res.data.likes, dislikes: res.data.dislikes }
            : v,
        ),
      );
      if (selectedVideo?._id === videoId) {
        setSelectedVideo((prev) => ({
          ...prev,
          likes: res.data.likes,
          dislikes: res.data.dislikes,
        }));
      }
    } catch (err) {
      alert("Like failed");
    }
  };

  const handleDislike = async (videoId) => {
    if (!requireAuth()) return;
    try {
      const res = await axios.put(
        `${API_BASE}/api/videos/${videoId}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId
            ? { ...v, likes: res.data.likes, dislikes: res.data.dislikes }
            : v,
        ),
      );
      if (selectedVideo?._id === videoId) {
        setSelectedVideo((prev) => ({
          ...prev,
          likes: res.data.likes,
          dislikes: res.data.dislikes,
        }));
      }
    } catch (err) {
      alert("Dislike failed");
    }
  };

  const handleShare = async (video) => {
    const videoUrl = `${window.location.origin}/?v=${video._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Watch on StreamHub: ${video.title}`,
          url: videoUrl,
        });
      } catch (err) {}
    } else {
      navigator.clipboard?.writeText(videoUrl);
      alert("Direct Link Copied!");
    }
  };

  const handleAddComment = async (videoId) => {
    if (!requireAuth()) return;
    const text = commentInputs[videoId];
    if (!text || !text.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/videos/${videoId}/comment`,
        { text: text.trim(), userName: user.name },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, comments: res.data } : v)),
      );
      if (selectedVideo?._id === videoId) {
        setSelectedVideo((prev) => ({ ...prev, comments: res.data }));
      }
      setCommentInputs((prev) => ({ ...prev, [videoId]: "" }));
    } catch (err) {
      alert("Comment failed");
    }
  };

  const isVideoShort = (v) => {
    return (
      v.isShort === true ||
      v.isShort === "true" ||
      (Number(v.duration) > 0 && Number(v.duration) <= 120)
    );
  };

  const searchParams = new URLSearchParams(location.search);
  const searchParam = (searchParams.get("q") || "").toLowerCase().trim();

  const filteredVideos = videos.filter((v) => {
    if (!searchParam) return true;
    return (
      v.title?.toLowerCase().includes(searchParam) ||
      v.userId?.name?.toLowerCase().includes(searchParam)
    );
  });

  const shortsList = filteredVideos.filter((v) => isVideoShort(v));
  const regularVideos = filteredVideos.filter((v) => !isVideoShort(v));

  const openShortModal = (index) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
    }
    if (secondaryAudioRef.current) {
      secondaryAudioRef.current.pause();
    }
    setActiveShortIndex(index);
    setTimeout(() => {
      if (shortsContainerRef.current) {
        const height = shortsContainerRef.current.clientHeight;
        shortsContainerRef.current.scrollTo({
          top: index * height,
          behavior: "instant",
        });
        shortsVideoRefs.current.forEach((vid, idx) => {
          if (vid) {
            if (idx === index) {
              vid.currentTime = 0;
              vid.play().catch(() => {});
            } else {
              vid.pause();
            }
          }
        });
      }
    }, 50);
  };

  const handleShortsScroll = () => {
    if (!shortsContainerRef.current) return;
    const scrollTop = shortsContainerRef.current.scrollTop;
    const height = shortsContainerRef.current.clientHeight;
    const currentIndex = Math.round(scrollTop / height);

    if (currentIndex !== activeShortIndex) {
      setActiveShortIndex(currentIndex);
      shortsVideoRefs.current.forEach((vid, idx) => {
        if (vid) {
          if (idx === currentIndex) {
            vid.currentTime = 0;
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        }
      });
    }
  };

  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec)) return "00:00";
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // =================== VAULT ACTIONS ===================
  const handleVaultUpload = async (e) => {
    if (!requireAuth()) return;
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setVaultUploading(true);
    const formData = new FormData();

    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]);
      const rel = fileList[i].webkitRelativePath || fileList[i].name;
      formData.append("paths", rel);
    }

    try {
      await axios.post(`${API_BASE}/api/vault/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Files successfully saved to MyFiles Vault!");
      fetchVaultFiles();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setVaultUploading(false);
      e.target.value = null;
    }
  };

  const handleDownloadSingleVaultFile = (fileId) => {
    if (!requireAuth()) return;
    const downloadUrl = `${API_BASE}/api/vault/download/single/${fileId}`;
    window.open(downloadUrl, "_blank");
  };

  const handleBulkDownloadVault = async () => {
    if (!requireAuth()) return;
    if (selectedVaultIds.length === 0) {
      alert("Pehle download karne ke liye files select karein!");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/vault/download/bulk`,
        { fileIds: selectedVaultIds },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "MyFiles.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert("Bulk download failed: " + err.message);
    }
  };

  const handleDeleteVaultFile = async (fileId) => {
    if (!requireAuth()) return;
    if (
      !window.confirm(
        "Kya aap sach me is file ko vault se delete karna chahte hain?",
      )
    )
      return;

    try {
      await axios.delete(`${API_BASE}/api/vault/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVaultFiles((prev) => prev.filter((f) => f._id !== fileId));
      setSelectedVaultIds((prev) => prev.filter((id) => id !== fileId));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const toggleSelectVaultFile = (id) => {
    setSelectedVaultIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAllVaultFiles = () => {
    if (selectedVaultIds.length === filteredVaultFiles.length) {
      setSelectedVaultIds([]);
    } else {
      setSelectedVaultIds(filteredVaultFiles.map((f) => f._id));
    }
  };

  const filteredVaultFiles = vaultFiles.filter((f) => {
    if (!vaultFilter) return true;
    return (
      f.originalName?.toLowerCase().includes(vaultFilter.toLowerCase()) ||
      f.relativePath?.toLowerCase().includes(vaultFilter.toLowerCase()) ||
      f.extension?.toLowerCase().includes(vaultFilter.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div style={styles.centerBox}>
        <div style={styles.cyberLoader}></div>
        <p
          style={{
            color: "#00f3ff",
            marginTop: "14px",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          STREAM FEED SYNCING...
        </p>
      </div>
    );
  }

  const isLight = themeMode === "light";
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        ...styles.pageWrapper,
        backgroundColor: isLight ? "#f4f6f8" : "#07080c",
        color: isLight ? "#0f172a" : "#e2e8f0",
      }}
    >
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); color: #ff2a6d; filter: drop-shadow(0 0 12px #ff2a6d); }
          100% { transform: scale(1); }
        }
        .like-burst { animation: heartPop 0.5s ease-in-out !important; }

        @keyframes rippleFeedback {
          0% { opacity: 0.9; transform: scale(0.85); }
          100% { opacity: 0; transform: scale(1.4); }
        }
        .ripple-anim { animation: rippleFeedback 0.65s ease-out forwards; }

        @media (min-width: 769px) {
          .youtube-player-frame {
            aspect-ratio: 16 / 9 !important;
            max-height: 580px !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
          }
          .cyber-card { transition: all 0.25s ease; }
          .cyber-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0, 243, 255, 0.25) !important;
          }
        }
        @media (max-width: 768px) {
          .youtube-player-frame {
            width: 100vw !important;
            margin-left: -14px !important;
            margin-right: -14px !important;
            height: 40vh !important;
            border-radius: 0 !important;
          }
        }

        input[type="range"].mx-thick-seekbar {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
        }
        input[type="range"].mx-thick-seekbar::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 12px #00f3ff, 0 0 4px #ffffff;
          cursor: pointer;
        }

        .reels-scroll-container {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .reels-scroll-container::-webkit-scrollbar { display: none; }
        .reel-snap-item {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justifyContent: center;
          background: #000;
        }
      `}</style>

      <audio ref={secondaryAudioRef} />

      {/* Hidden File/Folder Inputs for Universal Upload */}
      <input
        type="file"
        multiple
        ref={vaultFileInputRef}
        style={{ display: "none" }}
        onChange={handleVaultUpload}
      />
      <input
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        ref={vaultFolderInputRef}
        style={{ display: "none" }}
        onChange={handleVaultUpload}
      />

      {searchParam && (
        <div
          style={{
            ...styles.searchBanner,
            background: isLight
              ? "rgba(0, 243, 255, 0.15)"
              : "rgba(0, 243, 255, 0.08)",
          }}
        >
          <span>
            Filtering: <b style={{ color: "#00f3ff" }}>"{searchParam}"</b>
          </span>
          <button onClick={() => navigate("/")} style={styles.clearSearchBtn}>
            ✕ Clear
          </button>
        </div>
      )}

      <div style={styles.container}>
        {/* ================= VIDEO PLAYER ================= */}
        {selectedVideo && (
          <div
            style={{
              ...styles.expandedSection,
              background: isLight ? "#ffffff" : "#0d111a",
              borderColor: isLight ? "#e2e8f0" : "#00f3ff",
            }}
          >
            <div
              style={{
                ...styles.expandedHeader,
                background: isLight ? "#e2e8f0" : "#111624",
              }}
            >
              <span
                style={{
                  color: isLight ? "#0284c7" : "#00f3ff",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              >
                MX MEDIA ENGINE // ACTIVE
              </span>
              <button onClick={closePlayer} style={styles.closeBtn}>
                ✕ Close
              </button>
            </div>

            <div
              id="youtube-video-box"
              className="youtube-player-frame"
              style={styles.youtubePlayerBox}
              onMouseMove={triggerControlsVisibility}
            >
              <video
                ref={videoPlayerRef}
                autoPlay={autoPlayVideos}
                onTimeUpdate={handleTimeUpdate}
                crossOrigin="anonymous"
                style={styles.youtubeFullVideo}
                src={`${API_BASE}/uploads/${selectedVideo.videoPath.replace(/\\/g, "/").replace(/^\/?uploads\/?/, "")}`}
              />

              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  zIndex: 25,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(10, 14, 22, 0.75)",
                  backdropFilter: "blur(6px)",
                  border: `1px solid ${audioSyncStatus === "locked" ? "rgba(5, 255, 161, 0.4)" : "#ff2a6d"}`,
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "10px",
                  fontFamily: "monospace",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor:
                      audioSyncStatus === "locked" ? "#05ffa1" : "#ff2a6d",
                    boxShadow: `0 0 8px ${audioSyncStatus === "locked" ? "#05ffa1" : "#ff2a6d"}`,
                  }}
                />
                <span style={{ color: "#cbd5e1" }}>
                  AUDIO:{" "}
                  <b style={{ color: "#00f3ff" }}>
                    {selectedAudioTrack === "default" ? "ORIGINAL" : "DUB"}
                  </b>
                </span>
                <span
                  style={{
                    color: audioSyncStatus === "locked" ? "#05ffa1" : "#ff2a6d",
                    fontWeight: "bold",
                  }}
                >
                  [{audioSyncStatus.toUpperCase()}]
                </span>
              </div>

              {subtitlesEnabled && activeSubtitle && (
                <div style={styles.subtitlesBox}>
                  <span style={styles.subtitleText}>{activeSubtitle}</span>
                </div>
              )}

              <div style={styles.touchZonesContainer}>
                <div
                  onClick={(e) => handleTouchZone(e, "left")}
                  style={styles.touchHalfZone}
                >
                  {seekFeedback === "left" && (
                    <div
                      className="ripple-anim"
                      style={styles.doubleTapIndicator}
                    >
                      <span style={{ fontSize: "22px" }}>⏪</span>
                      <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                        -10s
                      </span>
                    </div>
                  )}
                </div>
                <div
                  onClick={(e) => handleTouchZone(e, "right")}
                  style={styles.touchHalfZone}
                >
                  {seekFeedback === "right" && (
                    <div
                      className="ripple-anim"
                      style={styles.doubleTapIndicator}
                    >
                      <span style={{ fontSize: "22px" }}>⏩</span>
                      <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                        +10s
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!isPlaying && (
                <div
                  onClick={togglePlayPause}
                  style={styles.centerPausedOverlay}
                >
                  <div style={styles.largePlayPulse}>▶</div>
                </div>
              )}

              <div
                style={{
                  ...styles.customControlsBar,
                  opacity: showControls || !isPlaying ? 1 : 0,
                  pointerEvents: showControls || !isPlaying ? "auto" : "none",
                }}
              >
                <div style={styles.seekbarContainer}>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="mx-thick-seekbar"
                    style={{
                      background: `linear-gradient(to right, #00f3ff 0%, #00f3ff ${progressPercent}%, rgba(255, 255, 255, 0.25) ${progressPercent}%, rgba(255, 255, 255, 0.25) 100%)`,
                    }}
                  />
                </div>

                <div style={styles.controlButtonsRow}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={togglePlayPause}
                      style={styles.playBtn}
                      title="Play/Pause"
                    >
                      {isPlaying ? "❚❚" : "▶"}
                    </button>
                    <button
                      onClick={() => seekRelative(-10)}
                      style={styles.seekStepBtn}
                    >
                      -10s
                    </button>
                    <button
                      onClick={() => seekRelative(10)}
                      style={styles.seekStepBtn}
                    >
                      +10s
                    </button>
                    <span style={styles.timeCounter}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {selectedVideo.audioTracks &&
                      selectedVideo.audioTracks.length > 0 && (
                        <select
                          value={selectedAudioTrack}
                          onChange={(e) =>
                            handleAudioTrackChange(e.target.value)
                          }
                          style={{
                            background: "#0d111a",
                            color: "#05ffa1",
                            border: "1px solid #05ffa1",
                            borderRadius: "4px",
                            fontSize: "11px",
                            padding: "2px 6px",
                            outline: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          title="Dubbed Audio Track"
                        >
                          <option value="default">🌐 Original Audio</option>
                          {selectedVideo.audioTracks.map((t, idx) => (
                            <option key={idx} value={t.path}>
                              🗣 {t.title || `Track ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                      )}

                    <select
                      value={playbackSpeed}
                      onChange={(e) => changeSpeed(e.target.value)}
                      style={{
                        background: "#111624",
                        color: "#00f3ff",
                        border: "1px solid rgba(0, 243, 255, 0.4)",
                        borderRadius: "4px",
                        fontSize: "10px",
                        padding: "2px 4px",
                        outline: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      <option value="0.25">0.25x</option>
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1">1.0x (Normal)</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2.0x</option>
                      <option value="2.5">2.5x</option>
                      <option value="3">3.0x</option>
                    </select>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".srt,.vtt"
                      style={{ display: "none" }}
                      onChange={handleManualSubtitleSelect}
                    />

                    <button
                      onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                      }
                      style={{
                        ...styles.loadSubBtn,
                        borderColor:
                          parsedCues.length > 0 ? "#05ffa1" : "#00f3ff",
                        color: parsedCues.length > 0 ? "#05ffa1" : "#00f3ff",
                      }}
                      title="Attach subtitle file manually"
                    >
                      {parsedCues.length > 0 ? "✓ Sub Active" : "+ Add Sub"}
                    </button>

                    <button
                      onClick={toggleSubtitles}
                      style={{
                        ...styles.ccBtn,
                        background: subtitlesEnabled
                          ? "rgba(0, 243, 255, 0.25)"
                          : "transparent",
                        borderColor: subtitlesEnabled
                          ? "#00f3ff"
                          : "rgba(255,255,255,0.4)",
                        color: subtitlesEnabled ? "#00f3ff" : "#cbd5e1",
                      }}
                      title="Toggle Captions"
                    >
                      CC
                    </button>
                    <span style={styles.resolutionBadge}>{streamQuality}</span>
                    <button
                      onClick={toggleFullscreen}
                      style={styles.fullscreenBtn}
                      title="Fullscreen (F)"
                    >
                      ⛶
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "12px 14px" }}>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "18px",
                  color: isLight ? "#0f172a" : "#fff",
                }}
              >
                {selectedVideo.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: isLight ? "#64748b" : "#748ba7",
                }}
              >
                Creator:{" "}
                <span style={{ color: "#00f3ff" }}>
                  {selectedVideo.userId?.name || "Node"}
                </span>
                {parsedCues.length > 0 && (
                  <span style={styles.hasSubBadge}>
                    ✓ Subtitle Active ({parsedCues.length} lines)
                  </span>
                )}
                {selectedVideo.audioTracks &&
                  selectedVideo.audioTracks.length > 0 && (
                    <span
                      style={{
                        ...styles.hasSubBadge,
                        color: "#05ffa1",
                        background: "rgba(5, 255, 161, 0.12)",
                        marginLeft: "8px",
                      }}
                    >
                      🗣 {selectedVideo.audioTracks.length} Dubbing Tracks
                    </span>
                  )}
              </p>

              <div style={styles.actionToolbar}>
                <button
                  onClick={() => handleLike(selectedVideo._id)}
                  className={
                    animatingLikeId === selectedVideo._id ? "like-burst" : ""
                  }
                  style={{
                    ...styles.actionBtn,
                    background: isLight ? "#e2e8f0" : "#141926",
                    color: selectedVideo.likes?.includes(currentUserId)
                      ? "#ff2a6d"
                      : isLight
                        ? "#334155"
                        : "#cbd5e1",
                  }}
                >
                  ❤ {selectedVideo.likes?.length || 0}
                </button>
                <button
                  onClick={() => handleDislike(selectedVideo._id)}
                  style={{
                    ...styles.actionBtn,
                    background: isLight ? "#e2e8f0" : "#141926",
                    color: selectedVideo.dislikes?.includes(currentUserId)
                      ? "#00f3ff"
                      : isLight
                        ? "#334155"
                        : "#cbd5e1",
                  }}
                >
                  👎 {selectedVideo.dislikes?.length || 0}
                </button>
                <button
                  onClick={() => handleShare(selectedVideo)}
                  style={{
                    ...styles.actionBtn,
                    background: isLight ? "#e2e8f0" : "#141926",
                    color: isLight ? "#334155" : "#cbd5e1",
                  }}
                >
                  ➦ Share
                </button>
              </div>

              <div
                style={{
                  ...styles.commentBox,
                  background: isLight ? "#f8fafc" : "#080a10",
                  borderColor: isLight ? "#cbd5e1" : "#161c2a",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <input
                    type="text"
                    placeholder="Add comment..."
                    value={commentInputs[selectedVideo._id] || ""}
                    onChange={(e) =>
                      setCommentInputs({
                        ...commentInputs,
                        [selectedVideo._id]: e.target.value,
                      })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddComment(selectedVideo._id)
                    }
                    style={{
                      ...styles.commentInput,
                      background: isLight ? "#ffffff" : "#121724",
                      color: isLight ? "#000" : "#fff",
                      borderColor: isLight ? "#cbd5e1" : "#222c40",
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(selectedVideo._id)}
                    style={styles.sendCommentBtn}
                  >
                    Send
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    maxHeight: "120px",
                    overflowY: "auto",
                  }}
                >
                  {selectedVideo.comments?.map((c) => (
                    <div
                      key={c._id}
                      style={{
                        fontSize: "12px",
                        padding: "4px 0",
                        borderBottom: `1px solid ${isLight ? "#e2e8f0" : "#141926"}`,
                      }}
                    >
                      <b style={{ color: "#00f3ff" }}>[{c.userName}]: </b>
                      <span style={{ color: isLight ? "#334155" : "#cbd5e1" }}>
                        {c.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MYFILES STORAGE VAULT TAB ================= */}
        {activeTab === "myfiles" && (
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    color: "#00f3ff",
                    letterSpacing: "1px",
                  }}
                >
                  📁 MYFILES CLOUD VAULT
                </h2>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "11px",
                    color: isLight ? "#64748b" : "#748ba7",
                  }}
                >
                  Upload code (.py, .js, .git), videos, movies, datasets, PPT,
                  PDF, or complete project folders.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => vaultFileInputRef.current?.click()}
                  disabled={vaultUploading}
                  style={{
                    background: "#00f3ff",
                    color: "#000",
                    border: "none",
                    padding: "7px 12px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {vaultUploading ? "⏳ Uploading..." : "📄 + Upload Files"}
                </button>
                <button
                  onClick={() => vaultFolderInputRef.current?.click()}
                  disabled={vaultUploading}
                  style={{
                    background: "rgba(5, 255, 161, 0.2)",
                    border: "1px solid #05ffa1",
                    color: "#05ffa1",
                    padding: "7px 12px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  📂 + Upload Folder
                </button>
                {selectedVaultIds.length > 0 && (
                  <button
                    onClick={handleBulkDownloadVault}
                    style={{
                      background: "#ff2a6d",
                      color: "#fff",
                      border: "none",
                      padding: "7px 14px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "12px",
                      boxShadow: "0 0 10px rgba(255,42,109,0.5)",
                    }}
                  >
                    ⬇ Download Selected ({selectedVaultIds.length})
                    [MyFiles.zip]
                  </button>
                )}
              </div>
            </div>

            {/* Filter and Select Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: isLight ? "#ffffff" : "#0e121c",
                padding: "10px 14px",
                borderRadius: "8px",
                border: `1px solid ${isLight ? "#cbd5e1" : "#1a2235"}`,
                marginBottom: "14px",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="checkbox"
                  checked={
                    filteredVaultFiles.length > 0 &&
                    selectedVaultIds.length === filteredVaultFiles.length
                  }
                  onChange={toggleSelectAllVaultFiles}
                  style={{
                    cursor: "pointer",
                    width: "16px",
                    height: "16px",
                    accentColor: "#00f3ff",
                  }}
                />
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                  Select All
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: isLight ? "#64748b" : "#748ba7",
                  }}
                >
                  ({selectedVaultIds.length} of {filteredVaultFiles.length}{" "}
                  selected)
                </span>
              </div>
              <input
                type="text"
                placeholder="Search by file name or extension (.py, .js, .pdf)..."
                value={vaultFilter}
                onChange={(e) => setVaultFilter(e.target.value)}
                style={{
                  background: isLight ? "#f1f5f9" : "#141926",
                  border: `1px solid ${isLight ? "#cbd5e1" : "#222c3f"}`,
                  borderRadius: "6px",
                  padding: "6px 12px",
                  color: isLight ? "#000" : "#fff",
                  fontSize: "12px",
                  outline: "none",
                  minWidth: "220px",
                }}
              />
            </div>

            {/* Files List Table */}
            {filteredVaultFiles.length === 0 ? (
              <div style={styles.emptyNote}>
                Vault me abhi koi file nahi hai. Upar diye gaye buttons se koi
                bhi file ya folder upload karein!
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {filteredVaultFiles.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: isLight ? "#ffffff" : "#0d111a",
                      border: `1px solid ${selectedVaultIds.includes(item._id) ? "#00f3ff" : isLight ? "#cbd5e1" : "#161d2d"}`,
                      borderRadius: "6px",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedVaultIds.includes(item._id)}
                        onChange={() => toggleSelectVaultFile(item._id)}
                        style={{
                          cursor: "pointer",
                          width: "15px",
                          height: "15px",
                          accentColor: "#00f3ff",
                        }}
                      />
                      <span style={{ fontSize: "16px" }}>
                        {item.extension.includes("py")
                          ? "🐍"
                          : item.extension.includes("js")
                            ? "🟨"
                            : item.extension.includes("git")
                              ? "🐙"
                              : item.extension.includes("mp4")
                                ? "🎬"
                                : item.extension.includes("mp3")
                                  ? "🎵"
                                  : item.extension.includes("pdf")
                                    ? "📕"
                                    : item.extension.includes("zip")
                                      ? "📦"
                                      : "📄"}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: isLight ? "#0f172a" : "#fff",
                          }}
                        >
                          {item.originalName}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: isLight ? "#64748b" : "#748ba7",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Path: {item.relativePath} • Size:{" "}
                          {formatFileSize(item.size)} • Ext: {item.extension}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleDownloadSingleVaultFile(item._id)}
                        style={{
                          background: "rgba(0, 243, 255, 0.15)",
                          border: "1px solid #00f3ff",
                          color: "#00f3ff",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                        title="Download directly"
                      >
                        ⬇ Download
                      </button>
                      <button
                        onClick={() => handleDeleteVaultFile(item._id)}
                        style={{
                          background: "rgba(255, 42, 109, 0.15)",
                          border: "1px solid #ff2a6d",
                          color: "#ff2a6d",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                        title="Delete file"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SHORTS SHELF ================= */}
        {(activeTab === "all" || activeTab === "shorts") && (
          <div style={{ marginBottom: "26px" }}>
            <h3
              style={{
                ...styles.sectionHeader,
                color: isLight ? "#475569" : "#748ba7",
              }}
            >
              ⚡ SHORTS SHELF
            </h3>
            {shortsList.length === 0 ? (
              <div style={styles.emptyNote}>No Shorts available.</div>
            ) : (
              <div style={styles.shortsGrid}>
                {shortsList.map((short, index) => {
                  const thumb = getSafeThumbnailUrl(short);

                  return (
                    <div
                      key={short._id}
                      onClick={() => openShortModal(index)}
                      className="short-card"
                      style={styles.shortCard}
                    >
                      <img
                        src={thumb}
                        alt="short-thumb"
                        style={styles.shortThumbnail}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${API_BASE}/uploads/${short.videoPath.replace(/\\/g, "/").replace(/^\/?uploads\/?/, "")}#t=0.5`;
                        }}
                      />
                      <div style={styles.shortOverlay}>
                        <span style={styles.shortBadge}>⚡ Short</span>
                        <h4 style={styles.shortTitle}>{short.title}</h4>
                        <span style={{ fontSize: "11px", color: "#e2e8f0" }}>
                          ❤ {short.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= REGULAR VIDEOS ================= */}
        {(activeTab === "all" || activeTab === "videos") && (
          <div>
            {activeTab === "all" && (
              <h3
                style={{
                  ...styles.sectionHeader,
                  color: isLight ? "#475569" : "#748ba7",
                }}
              >
                🎬 VIDEOS
              </h3>
            )}
            {regularVideos.length === 0 ? (
              <div style={styles.emptyNote}>No videos available.</div>
            ) : (
              <div style={styles.videosGrid}>
                {regularVideos.map((vid) => {
                  const thumb = getSafeThumbnailUrl(vid);

                  return (
                    <div
                      key={vid._id}
                      onClick={() => handleSelectVideo(vid)}
                      className="cyber-card"
                      style={{
                        ...styles.videoCard,
                        background: isLight ? "#ffffff" : "#0d111a",
                        borderColor: isLight ? "#cbd5e1" : "#1a2235",
                      }}
                    >
                      <div style={styles.videoThumbWrapper}>
                        <img
                          src={thumb}
                          alt="thumb"
                          style={styles.videoThumb}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${API_BASE}/uploads/${vid.videoPath.replace(/\\/g, "/").replace(/^\/?uploads\/?/, "")}#t=0.5`;
                          }}
                        />
                        <div
                          className="play-icon-box"
                          style={styles.playIconOverlay}
                        >
                          ▶
                        </div>
                      </div>
                      <div style={{ padding: "10px" }}>
                        <h4
                          style={{
                            ...styles.videoCardTitle,
                            color: isLight ? "#0f172a" : "#fff",
                          }}
                        >
                          {vid.title}
                        </h4>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "11px",
                            color: isLight ? "#64748b" : "#64748b",
                          }}
                        >
                          {vid.userId?.name || "Node"} • {vid.views || 0} views
                          • {vid.likes?.length || 0} likes
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= FULLSCREEN SHORTS MODAL ================= */}
        {activeShortIndex !== null && shortsList.length > 0 && (
          <div style={styles.fullscreenModal}>
            <button
              onClick={() => {
                setActiveShortIndex(null);
                shortsVideoRefs.current.forEach((v) => v?.pause());
              }}
              style={styles.shortCloseBtn}
            >
              ✕
            </button>
            <div
              ref={shortsContainerRef}
              onScroll={handleShortsScroll}
              className="reels-scroll-container"
              style={styles.shortScrollContainer}
            >
              {shortsList.map((short, index) => {
                const cleanPath = short.videoPath
                  .replace(/\\/g, "/")
                  .replace(/^\/?uploads\/?/, "");
                return (
                  <div key={short._id} className="reel-snap-item">
                    <video
                      ref={(el) => (shortsVideoRefs.current[index] = el)}
                      loop
                      playsInline
                      style={styles.zoomlessVideo}
                      src={`${API_BASE}/uploads/${cleanPath}`}
                      onClick={(e) => {
                        e.target.paused ? e.target.play() : e.target.pause();
                      }}
                    />
                    <div style={styles.shortsFloatingActions}>
                      <div style={styles.floatingActionItem}>
                        <button
                          onClick={() => handleLike(short._id)}
                          className={
                            animatingLikeId === short._id ? "like-burst" : ""
                          }
                          style={{
                            ...styles.floatingBtn,
                            color: short.likes?.includes(currentUserId)
                              ? "#ff2a6d"
                              : "#fff",
                          }}
                        >
                          ❤
                        </button>
                        <span style={styles.actionCount}>
                          {short.likes?.length || 0}
                        </span>
                      </div>
                      <div style={styles.floatingActionItem}>
                        <button
                          onClick={() => handleShare(short)}
                          style={styles.floatingBtn}
                        >
                          ➦
                        </button>
                        <span style={styles.actionCount}>Share</span>
                      </div>
                    </div>
                    <div style={styles.shortBottomMeta}>
                      <h3
                        style={{
                          margin: "0 0 4px",
                          fontSize: "14px",
                          color: "#fff",
                        }}
                      >
                        {short.title}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#00f3ff",
                        }}
                      >
                        @{short.userId?.name || "User"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= ACCOUNT & SETTINGS ================= */}
      {settingsOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: isLight ? "#f8fafc" : "#07080c",
            color: isLight ? "#0f172a" : "#fff",
            zIndex: 999999,
            overflowY: "auto",
            padding: "24px 18px 80px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${isLight ? "#e2e8f0" : "#1a2235"}`,
              paddingBottom: "14px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>⚙</span>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>
                ACCOUNT & SETTINGS
              </h2>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              style={{
                background: "none",
                border: "1px solid #ff2a6d",
                color: "#ff2a6d",
                padding: "6px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✕ Back to Feed
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              background: isLight ? "#ffffff" : "#0e121c",
              padding: "14px",
              borderRadius: "10px",
              border: `1px solid ${isLight ? "#cbd5e1" : "#1a2235"}`,
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={styles.avatarLarge}>
                {(user?.name || "G").charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "15px" }}>
                  {user ? user.name : "Guest User"}
                </h4>
                <p
                  style={{
                    margin: "2px 0 0",
                    color: isLight ? "#64748b" : "#748ba7",
                    fontSize: "12px",
                  }}
                >
                  {user ? user.email : "Not Authenticated"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => setThemeMode(isLight ? "cyber-dark" : "light")}
                style={{
                  background: isLight ? "#0f172a" : "#00f3ff",
                  color: isLight ? "#fff" : "#000",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {isLight ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>

              {user ? (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Warning: Kya aap sach me Logout karna chahte hain?",
                      )
                    ) {
                      logout();
                      setSettingsOpen(false);
                      navigate("/login");
                    }
                  }}
                  style={{
                    background: "rgba(255, 42, 109, 0.15)",
                    border: "1px solid #ff2a6d",
                    color: "#ff2a6d",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  🚪 Logout
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link
                    to="/login"
                    onClick={() => setSettingsOpen(false)}
                    style={styles.loginLinkBtn}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setSettingsOpen(false)}
                    style={styles.registerLinkBtn}
                  >
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </div>

          {user && (
            <div style={{ marginTop: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", color: "#00f3ff" }}>
                  MY UPLOADS ({myUploadedVideos.length})
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    color: isLight ? "#64748b" : "#748ba7",
                  }}
                >
                  Admin Rights: Only you can delete your content
                </span>
              </div>

              {myUploadedVideos.length === 0 ? (
                <div style={styles.emptyNote}>
                  Aapne abhi tak koi video ya short broadcast nahi kiya hai.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {myUploadedVideos.map((item) => {
                    const thumb = getSafeThumbnailUrl(item);

                    return (
                      <div
                        key={item._id}
                        style={{
                          border: `1px solid ${isLight ? "#cbd5e1" : "#1e2638"}`,
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: isLight ? "#fff" : "#0f131f",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            aspectRatio: "16 / 9",
                            backgroundColor: "#000",
                          }}
                        >
                          <img
                            src={thumb}
                            alt="thumb"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${API_BASE}/uploads/${item.videoPath.replace(/\\/g, "/").replace(/^\/?uploads\/?/, "")}#t=0.5`;
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              top: "8px",
                              left: "8px",
                              background: item.isShort ? "#ff2a6d" : "#00f3ff",
                              color: "#000",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: "bold",
                            }}
                          >
                            {item.isShort ? "⚡ Short" : "🎬 Video"}
                          </span>
                        </div>
                        <div style={{ padding: "12px" }}>
                          <h4
                            style={{
                              margin: "0 0 6px",
                              fontSize: "14px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.title}
                          </h4>
                          <p
                            style={{
                              margin: "0 0 12px",
                              fontSize: "11px",
                              color: isLight ? "#64748b" : "#748ba7",
                            }}
                          >
                            Duration: {item.duration}s • Views:{" "}
                            {item.views || 0} • Likes: {item.likes?.length || 0}
                          </p>
                          <button
                            onClick={() => setDeleteConfirmId(item._id)}
                            style={{
                              width: "100%",
                              background: "rgba(255, 42, 109, 0.15)",
                              border: "1px solid #ff2a6d",
                              color: "#ff2a6d",
                              padding: "7px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "12px",
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {deleteConfirmId && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000000,
              }}
            >
              <div
                style={{
                  background: "#111624",
                  border: "1px solid #ff2a6d",
                  padding: "22px",
                  borderRadius: "12px",
                  textAlign: "center",
                  maxWidth: "340px",
                  boxShadow: "0 0 25px rgba(255,42,109,0.3)",
                }}
              >
                <h3 style={{ color: "#ff2a6d", margin: "0 0 8px" }}>
                  Warning!
                </h3>
                <p
                  style={{
                    color: "#cbd5e1",
                    fontSize: "13px",
                    margin: "0 0 20px",
                  }}
                >
                  Are you sure you want to permanently delete this broadcast?
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #475569",
                      background: "none",
                      color: "#fff",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAndDelete}
                    style={{
                      padding: "8px 16px",
                      background: "#ff2a6d",
                      border: "none",
                      color: "#fff",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= BOTTOM NAVBAR WITH 📁 MYFILES ================= */}
      <div style={styles.bottomNavWrapper}>
        <div style={styles.bottomNavContainer}>
          <button
            onClick={() => {
              setActiveTab("all");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              ...styles.bottomNavItem,
              color: activeTab === "all" ? "#00f3ff" : "#64748b",
            }}
          >
            <span style={{ fontSize: "15px" }}>🌐</span>
            <span style={{ fontSize: "10px" }}>All</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("videos");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              ...styles.bottomNavItem,
              color: activeTab === "videos" ? "#00f3ff" : "#64748b",
            }}
          >
            <span style={{ fontSize: "15px" }}>🎬</span>
            <span style={{ fontSize: "10px" }}>Videos</span>
          </button>
          <button
            onClick={() => navigate("/upload")}
            style={styles.uploadCenterBtn}
            title="Upload Video"
          >
            +
          </button>
          <button
            onClick={() => {
              setActiveTab("shorts");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              ...styles.bottomNavItem,
              color: activeTab === "shorts" ? "#ff2a6d" : "#64748b",
            }}
          >
            <span style={{ fontSize: "15px" }}>⚡</span>
            <span style={{ fontSize: "10px" }}>Shorts</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("myfiles");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              ...styles.bottomNavItem,
              color: activeTab === "myfiles" ? "#05ffa1" : "#64748b",
            }}
          >
            <span style={{ fontSize: "15px" }}>📁</span>
            <span style={{ fontSize: "10px" }}>MyFiles</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              ...styles.bottomNavItem,
              color: settingsOpen ? "#00f3ff" : "#64748b",
            }}
          >
            <span style={{ fontSize: "15px" }}>⚙</span>
            <span style={{ fontSize: "10px" }}>Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    padding: "12px 14px 85px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
  },
  searchBanner: {
    maxWidth: "1280px",
    margin: "0 auto 12px",
    padding: "8px 12px",
    border: "1px solid rgba(0, 243, 255, 0.25)",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
  },
  clearSearchBtn: {
    background: "transparent",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "10px",
    cursor: "pointer",
  },
  sectionHeader: {
    fontSize: "13px",
    letterSpacing: "1px",
    margin: "0 0 10px",
    textTransform: "uppercase",
  },
  emptyNote: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px dashed #1e2638",
    color: "#5f718a",
    fontSize: "12px",
    textAlign: "center",
  },
  shortsGrid: {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    paddingBottom: "10px",
  },
  shortCard: {
    minWidth: "140px",
    maxWidth: "150px",
    height: "235px",
    backgroundColor: "#0e121c",
    borderRadius: "10px",
    border: "1px solid #1a2235",
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    flexShrink: 0,
  },
  shortThumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  shortOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
    padding: "8px",
    boxSizing: "border-box",
  },
  shortBadge: {
    fontSize: "9px",
    background: "#ff2a6d",
    color: "#fff",
    padding: "2px 5px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  shortTitle: {
    margin: "3px 0 1px",
    fontSize: "11px",
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  videosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "14px",
  },
  videoCard: {
    borderRadius: "10px",
    border: "1px solid",
    overflow: "hidden",
    cursor: "pointer",
  },
  videoThumbWrapper: {
    position: "relative",
    aspectRatio: "16 / 9",
    backgroundColor: "#000",
  },
  videoThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  playIconOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "36px",
    height: "36px",
    background: "rgba(0, 243, 255, 0.85)",
    color: "#00f3ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },
  videoCardTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  expandedSection: {
    width: "100%",
    border: "1px solid",
    borderRadius: "0",
    marginBottom: "24px",
    overflow: "hidden",
    boxShadow: "0 0 20px rgba(0, 243, 255, 0.25)",
  },
  expandedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
  },
  closeBtn: {
    background: "none",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    padding: "3px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "bold",
  },
  youtubePlayerBox: {
    position: "relative",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  youtubeFullVideo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  subtitlesBox: {
    position: "absolute",
    bottom: "60px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 25,
    pointerEvents: "none",
    maxWidth: "88%",
    textAlign: "center",
  },
  subtitleText: {
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    color: "#00f3ff",
    padding: "5px 14px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    border: "1px solid rgba(0, 243, 255, 0.5)",
    boxShadow: "0 0 14px rgba(0, 0, 0, 0.95)",
    display: "inline-block",
    textShadow: "0 0 4px #000",
  },
  hasSubBadge: {
    marginLeft: "8px",
    fontSize: "10px",
    color: "#05ffa1",
    background: "rgba(5, 255, 161, 0.12)",
    padding: "1px 6px",
    borderRadius: "4px",
  },
  touchZonesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    zIndex: 10,
  },
  touchHalfZone: {
    flex: 1,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  doubleTapIndicator: {
    backgroundColor: "rgba(0, 243, 255, 0.25)",
    border: "2px solid #00f3ff",
    borderRadius: "50%",
    width: "74px",
    height: "74px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 0 20px #00f3ff",
    pointerEvents: "none",
  },
  centerPausedOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 12,
    pointerEvents: "none",
  },
  largePlayPulse: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(0, 243, 255, 0.9)",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    paddingLeft: "4px",
    boxShadow: "0 0 18px #00f3ff",
  },
  customControlsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
    padding: "6px 14px 10px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    transition: "opacity 0.25s ease",
    zIndex: 20,
  },
  seekbarContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  controlButtonsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playBtn: {
    background: "#00f3ff",
    border: "none",
    color: "#000",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  seekStepBtn: {
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  timeCounter: {
    fontSize: "11px",
    color: "#cbd5e1",
    fontFamily: "monospace",
    marginLeft: "4px",
  },
  loadSubBtn: {
    background: "rgba(0, 243, 255, 0.1)",
    border: "1px dashed",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  ccBtn: {
    border: "1px solid",
    padding: "2px 7px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  resolutionBadge: {
    fontSize: "9px",
    border: "1px solid #00f3ff",
    color: "#00f3ff",
    padding: "2px 5px",
    borderRadius: "4px",
  },
  fullscreenBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  actionToolbar: {
    display: "flex",
    gap: "8px",
    margin: "10px 0",
  },
  actionBtn: {
    border: "1px solid #222c3f",
    padding: "5px 12px",
    borderRadius: "16px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  commentBox: {
    border: "1px solid",
    borderRadius: "8px",
    padding: "10px",
  },
  commentInput: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "6px",
    outline: "none",
    fontSize: "12px",
    border: "1px solid",
  },
  sendCommentBtn: {
    background: "#00f3ff",
    border: "none",
    color: "#000",
    fontWeight: "bold",
    padding: "0 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
  },
  fullscreenModal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  shortScrollContainer: {
    width: "100%",
    maxWidth: "420px",
    height: "100vh",
    position: "relative",
  },
  zoomlessVideo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  shortCloseBtn: {
    position: "fixed",
    top: "14px",
    left: "14px",
    background: "rgba(0,0,0,0.6)",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 100000,
  },
  shortsFloatingActions: {
    position: "absolute",
    right: "12px",
    bottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    alignItems: "center",
    zIndex: 10,
  },
  floatingActionItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  floatingBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(20, 25, 38, 0.75)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  actionCount: {
    fontSize: "10px",
    fontWeight: "bold",
    color: "#fff",
    marginTop: "3px",
  },
  shortBottomMeta: {
    position: "absolute",
    bottom: "20px",
    left: "14px",
    right: "65px",
    zIndex: 10,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "6px",
    borderRadius: "6px",
  },
  avatarLarge: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#00f3ff",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
  },
  loginLinkBtn: {
    padding: "6px 12px",
    border: "1px solid #222c3f",
    color: "#00f3ff",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "12px",
    background: "#141926",
    fontWeight: "bold",
  },
  registerLinkBtn: {
    padding: "6px 12px",
    background: "#00f3ff",
    color: "#000",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "800",
  },
  bottomNavWrapper: {
    position: "fixed",
    bottom: "12px",
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    pointerEvents: "none",
  },
  bottomNavContainer: {
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(10, 14, 22, 0.94)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(0, 243, 255, 0.25)",
    boxShadow:
      "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 243, 255, 0.15)",
    borderRadius: "30px",
    padding: "4px 8px",
    width: "calc(100% - 24px)",
    maxWidth: "460px",
  },
  bottomNavItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px",
    flex: 1,
  },
  uploadCenterBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #00f3ff 0%, #0077b6 100%)",
    border: "none",
    color: "#000",
    fontSize: "22px",
    fontWeight: "900",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 0 16px rgba(0, 243, 255, 0.5)",
    margin: "0 4px",
    transform: "translateY(-4px)",
  },
  centerBox: {
    minHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cyberLoader: {
    width: "38px",
    height: "38px",
    border: "3px solid #1a2233",
    borderTop: "3px solid #00f3ff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

export default Feed;
