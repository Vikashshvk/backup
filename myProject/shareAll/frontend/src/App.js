import React, { useEffect, useState, useRef } from "react";

const API_BASE = `http://${window.location.hostname}:5000`;

function App() {
  const [files, setFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDetails, setUploadDetails] = useState("");
  const [activeMedia, setActiveMedia] = useState(null);
  const [search, setSearch] = useState("");

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/feed`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error("Feed fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 4000);
    return () => clearInterval(interval);
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
  };

  // Uploader with Live Progress
  const handleUpload = (e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadDetails("Uploading shuru ho raha hai...");

    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]);
      const relPath = fileList[i].webkitRelativePath || fileList[i].name;
      formData.append("paths", relPath);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
        setUploadDetails(
          `${formatSize(event.loaded)} / ${formatSize(event.total)} (${percent}%)`,
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadProgress(100);
        setUploadDetails("Upload Complete!");
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          setUploadDetails("");
        }, 1200);
        fetchFiles();
      } else {
        alert("Upload fail ho gaya: " + xhr.statusText);
        setUploading(false);
      }
      e.target.value = null;
    };

    xhr.onerror = () => {
      alert("Network disconnection / Wi-Fi drop error");
      setUploading(false);
      e.target.value = null;
    };

    xhr.send(formData);
  };

  // Bulk ZIP Download
  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch(`${API_BASE}/api/download/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: selectedIds }),
      });

      if (!response.ok) throw new Error("Bulk download failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "MyFiles.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert("Bulk download error: " + err.message);
    }
  };

  // Single File Download
  const handleSingleDownload = (id, fileName) => {
    const url = `${API_BASE}/api/download/single/${id}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Single File Delete
  const handleSingleDelete = async (id, fileName) => {
    if (!window.confirm(`Delete karna chahte hain: "${fileName}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/files/single/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setSelectedIds((prev) => prev.filter((x) => x !== id));
      if (activeMedia && activeMedia.id === id) setActiveMedia(null);
      fetchFiles();
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(`Selected ${selectedIds.length} files ko delete karein?`)
    )
      return;

    try {
      const res = await fetch(`${API_BASE}/api/files/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: selectedIds }),
      });

      if (!res.ok) throw new Error("Bulk delete failed");

      setSelectedIds([]);
      fetchFiles();
    } catch (err) {
      alert("Bulk delete error: " + err.message);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map((f) => f.id));
    }
  };

  const getFileBadge = (f) => {
    if (f.isVideo) return { icon: "🎬", color: "#00f3ff", tag: "VIDEO" };
    if (f.isAudio) return { icon: "🎵", color: "#05ffa1", tag: "AUDIO" };
    if (f.isCode) return { icon: "💻", color: "#ffd166", tag: "CODE" };
    if (f.extension.includes("pdf"))
      return { icon: "📕", color: "#ef476f", tag: "PDF" };
    if (f.extension.includes("zip") || f.extension.includes("rar"))
      return { icon: "📦", color: "#a06cd5", tag: "ARCHIVE" };
    return { icon: "📄", color: "#94a3b8", tag: "FILE" };
  };

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.relativePath.toLowerCase().includes(search.toLowerCase()) ||
      f.extension.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={styles.appContainer}>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleUpload}
      />
      <input
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        ref={folderInputRef}
        style={{ display: "none" }}
        onChange={handleUpload}
      />

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>LAN SHARE // VAULT</h1>
          <p style={styles.subText}>
            Local Host:{" "}
            <span style={{ color: "#00f3ff" }}>{window.location.hostname}</span>{" "}
            • Direct LAN Access
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            style={styles.primaryBtn}
          >
            {uploading ? "⏳ Uploading..." : "📄 + Upload Files"}
          </button>
          <button
            onClick={() => folderInputRef.current.click()}
            disabled={uploading}
            style={styles.secondaryBtn}
          >
            📂 + Upload Folder
          </button>

          {selectedIds.length > 0 && (
            <>
              <button onClick={handleBulkDownload} style={styles.bulkBtn}>
                ⬇ Download ({selectedIds.length})
              </button>
              <button onClick={handleBulkDelete} style={styles.bulkDeleteBtn}>
                🗑 Delete ({selectedIds.length})
              </button>
            </>
          )}
        </div>
      </header>

      {/* Upload Progress Bar */}
      {uploading && (
        <div style={styles.progressContainer}>
          <div style={styles.progressTopRow}>
            <span
              style={{ fontSize: "12px", color: "#00f3ff", fontWeight: "bold" }}
            >
              Uploading to Storage...
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#cbd5e1",
                fontFamily: "monospace",
              }}
            >
              {uploadDetails}
            </span>
          </div>
          <div style={styles.progressBarTrack}>
            <div
              style={{ ...styles.progressBarFill, width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Media Player */}
      {activeMedia && (
        <div style={styles.playerWrapper}>
          <div style={styles.playerCard}>
            <div style={styles.playerHeader}>
              <span
                style={{
                  color: "#00f3ff",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {activeMedia.name}
              </span>
              <button
                onClick={() => setActiveMedia(null)}
                style={styles.closeBtn}
              >
                ✕ Close
              </button>
            </div>
            <video
              controls
              autoPlay
              style={styles.videoPlayer}
              src={`${API_BASE}/api/stream/${activeMedia.id}`}
            />
          </div>
        </div>
      )}

      {/* Filter and Select Bar */}
      <div style={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={
              filteredFiles.length > 0 &&
              selectedIds.length === filteredFiles.length
            }
            onChange={toggleSelectAll}
            style={{
              cursor: "pointer",
              width: "16px",
              height: "16px",
              accentColor: "#00f3ff",
            }}
          />
          <span style={{ fontSize: "13px", fontWeight: "600" }}>
            Select All
          </span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            ({selectedIds.length} of {filteredFiles.length} selected)
          </span>
        </div>

        <input
          type="text"
          placeholder="Search file name, folder, extension..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Grid View */}
      {filteredFiles.length === 0 ? (
        <div style={styles.emptyContainer}>
          <p style={{ fontSize: "16px", margin: "0 0 6px" }}>
            LAN Storage Empty
          </p>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Files ya folders upload karein, yahan live show honge.
          </span>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredFiles.map((file) => {
            const badge = getFileBadge(file);
            const isSelected = selectedIds.includes(file.id);

            return (
              <div
                key={file.id}
                style={{
                  ...styles.card,
                  borderColor: isSelected ? "#00f3ff" : "#1e293b",
                  background: isSelected ? "#0f172a" : "#0b0f17",
                }}
              >
                <div style={styles.cardTop}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(file.id)}
                      style={{
                        cursor: "pointer",
                        width: "15px",
                        height: "15px",
                        accentColor: "#00f3ff",
                      }}
                    />
                    <span
                      style={{
                        ...styles.badge,
                        color: badge.color,
                        borderColor: badge.color,
                      }}
                    >
                      {badge.tag}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: "12px 0",
                  }}
                >
                  <span style={{ fontSize: "30px" }}>{badge.icon}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={styles.fileName} title={file.name}>
                      {file.name}
                    </div>
                    <div style={styles.relPath} title={file.relativePath}>
                      📁 {file.relativePath}
                    </div>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {formatSize(file.size)}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {file.isVideo && (
                      <button
                        onClick={() => setActiveMedia(file)}
                        style={styles.streamBtn}
                      >
                        ▶ Play
                      </button>
                    )}
                    <button
                      onClick={() => handleSingleDownload(file.id, file.name)}
                      style={styles.downloadBtn}
                    >
                      ⬇ Save
                    </button>
                    <button
                      onClick={() => handleSingleDelete(file.id, file.name)}
                      style={styles.cardDeleteBtn}
                      title="Delete permanently"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: "100vh",
    backgroundColor: "#05070d",
    color: "#f1f5f9",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
    maxWidth: "1280px",
    margin: "0 auto 16px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "16px",
  },
  logo: {
    margin: 0,
    fontSize: "22px",
    letterSpacing: "1px",
    color: "#00f3ff",
  },
  subText: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#64748b",
  },
  primaryBtn: {
    backgroundColor: "#00f3ff",
    color: "#000",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "12px",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    color: "#05ffa1",
    fontWeight: "bold",
    border: "1px solid #05ffa1",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "12px",
  },
  bulkBtn: {
    backgroundColor: "#0077b6",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "12px",
  },
  bulkDeleteBtn: {
    backgroundColor: "#ff2a6d",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "12px",
    boxShadow: "0 0 10px rgba(255, 42, 109, 0.4)",
  },
  progressContainer: {
    maxWidth: "1280px",
    margin: "0 auto 16px",
    background: "#0c1017",
    border: "1px solid #00f3ff",
    padding: "12px 16px",
    borderRadius: "8px",
    boxShadow: "0 0 15px rgba(0, 243, 255, 0.15)",
  },
  progressTopRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  progressBarTrack: {
    width: "100%",
    height: "10px",
    background: "#161f30",
    borderRadius: "5px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #00f3ff 0%, #05ffa1 100%)",
    borderRadius: "5px",
    transition: "width 0.15s ease-out",
  },
  playerWrapper: {
    maxWidth: "1280px",
    margin: "0 auto 20px",
  },
  playerCard: {
    background: "#0d111a",
    border: "1px solid #00f3ff",
    borderRadius: "8px",
    overflow: "hidden",
  },
  playerHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 14px",
    background: "#111625",
  },
  closeBtn: {
    background: "none",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    borderRadius: "4px",
    padding: "2px 8px",
    cursor: "pointer",
    fontSize: "11px",
  },
  videoPlayer: {
    width: "100%",
    maxHeight: "520px",
    backgroundColor: "#000",
  },
  filterBar: {
    maxWidth: "1280px",
    margin: "0 auto 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    background: "#0c1017",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #1a2333",
  },
  searchInput: {
    background: "#141b26",
    border: "1px solid #243044",
    borderRadius: "6px",
    padding: "6px 12px",
    color: "#fff",
    fontSize: "12px",
    minWidth: "260px",
    outline: "none",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
    border: "1px dashed #1e293b",
    borderRadius: "10px",
    maxWidth: "1280px",
    margin: "0 auto",
  },
  grid: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "14px",
  },
  card: {
    border: "1px solid",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    fontSize: "9px",
    fontWeight: "bold",
    border: "1px solid",
    borderRadius: "4px",
    padding: "1px 5px",
    letterSpacing: "0.5px",
  },
  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  relPath: {
    fontSize: "10px",
    color: "#64748b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: "2px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid #151d2a",
  },
  streamBtn: {
    background: "rgba(0, 243, 255, 0.15)",
    border: "1px solid #00f3ff",
    color: "#00f3ff",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  downloadBtn: {
    background: "rgba(5, 255, 161, 0.15)",
    border: "1px solid #05ffa1",
    color: "#05ffa1",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cardDeleteBtn: {
    background: "rgba(255, 42, 109, 0.15)",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default App;
