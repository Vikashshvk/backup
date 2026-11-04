import React, { useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = ({ themeMode, toggleTheme }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") || "";

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isLight = themeMode === "light";

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchParams({});
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search does not support on your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onresult = (evt) => {
      const transcript = evt.results[0][0].transcript;
      setSearchParams({ q: transcript });
    };
    recognition.start();
  };

  const handleToggle = () => {
    const nextTheme = isLight ? "cyber-dark" : "light";
    localStorage.setItem("appTheme", nextTheme);
    window.dispatchEvent(new Event("themeChange"));
    if (toggleTheme) {
      toggleTheme();
    }
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        background: isLight
          ? "rgba(255, 255, 255, 0.85)"
          : "rgba(10, 14, 23, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${isLight ? "rgba(226, 232, 240, 0.8)" : "rgba(255, 255, 255, 0.08)"}`,
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: isLight
          ? "0 4px 20px -2px rgba(0, 0, 0, 0.05)"
          : "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Brand Logo */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #00f3ff 0%, #0077ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(0, 243, 255, 0.4)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#000">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "19px",
            fontWeight: "900",
            letterSpacing: "1px",
            color: isLight ? "#0f172a" : "#ffffff",
          }}
        >
          STREAM
          <span
            style={{
              color: "#00f3ff",
              textShadow: "0 0 12px rgba(0, 243, 255, 0.4)",
            }}
          >
            HUB
          </span>
        </span>
      </Link>

      {/* Refined Search with Mic & Clear */}
      <div
        style={{
          position: "relative",
          width: "45%",
          maxWidth: "480px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isLight ? "#94a3b8" : "#64748b"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: "14px",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          placeholder="Search videos, tags, creators..."
          value={currentQuery}
          onChange={handleSearchChange}
          style={{
            width: "100%",
            padding: "9px 70px 9px 40px",
            borderRadius: "50px",
            border: `1px solid ${
              isLight ? "#cbd5e1" : "rgba(0, 243, 255, 0.25)"
            }`,
            background: isLight ? "#f8fafc" : "#121724",
            color: isLight ? "#0f172a" : "#ffffff",
            fontSize: "13px",
            outline: "none",
            boxShadow: isLight
              ? "inset 0 1px 2px rgba(0,0,0,0.03)"
              : "inset 0 1px 4px rgba(0,0,0,0.4)",
            transition: "all 0.25s ease",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "10px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {currentQuery && (
            <button
              onClick={clearSearch}
              style={{
                background: "rgba(255, 42, 109, 0.1)",
                border: "none",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                color: "#ff2a6d",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              title="Clear Search"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          <button
            onClick={handleVoiceSearch}
            style={{
              background: isLight ? "#e2e8f0" : "rgba(0, 243, 255, 0.12)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              color: "#00f3ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "transform 0.15s ease",
            }}
            title="Voice Search"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isLight ? "#0f172a" : "#00f3ff"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Actions: Theme Toggle & Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={handleToggle}
          style={{
            background: isLight ? "#f1f5f9" : "#141926",
            border: `1px solid ${isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.1)"}`,
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? "🌙" : "☀️"}
        </button>

        {user ? (
          <div
            onClick={() => navigate("/?settings=1")}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00f3ff 0%, #0099ff 100%)",
              color: "#050811",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 0 12px rgba(0, 243, 255, 0.35)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              transition: "transform 0.2s ease",
            }}
            title={user.name}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              background: "linear-gradient(135deg, #00f3ff 0%, #00bbff 100%)",
              color: "#050811",
              padding: "8px 18px",
              borderRadius: "50px",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              boxShadow: "0 0 15px rgba(0, 243, 255, 0.3)",
              transition: "opacity 0.2s ease",
            }}
          >
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
