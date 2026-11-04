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
      alert("Voice search aapke browser mein supported nahi hai.");
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

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: isLight ? "#ffffff" : "#0d111a",
        borderBottom: `1px solid ${isLight ? "#e2e8f0" : "#1a2235"}`,
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "background 0.3s ease",
      }}
    >
      {/* Brand Logo */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: "900",
            letterSpacing: "1px",
            color: isLight ? "#0f172a" : "#ffffff",
          }}
        >
          STREAM<span style={{ color: "#00f3ff" }}>HUB</span>
        </span>
      </Link>

      {/* Refined Search with Mic & Clear */}
      <div
        style={{
          position: "relative",
          width: "50%",
          maxWidth: "460px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search videos, tags, creators..."
          value={currentQuery}
          onChange={handleSearchChange}
          style={{
            width: "100%",
            padding: "8px 65px 8px 14px",
            borderRadius: "20px",
            border: `1px solid ${isLight ? "#cbd5e1" : "rgba(0, 243, 255, 0.35)"}`,
            background: isLight ? "#f1f5f9" : "#121724",
            color: isLight ? "#0f172a" : "#ffffff",
            fontSize: "12px",
            outline: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {currentQuery && (
            <button
              onClick={clearSearch}
              style={{
                background: "none",
                border: "none",
                color: "#ff2a6d",
                cursor: "pointer",
                fontSize: "12px",
              }}
              title="Clear Search"
            >
              ✕
            </button>
          )}
          <button
            onClick={handleVoiceSearch}
            style={{
              background: "none",
              border: "none",
              color: "#00f3ff",
              cursor: "pointer",
              fontSize: "13px",
            }}
            title="Voice Search"
          >
            🎙
          </button>
        </div>
      </div>

      {/* Right Actions: Theme Toggle & Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={toggleTheme}
          style={{
            background: isLight ? "#e2e8f0" : "#141926",
            border: `1px solid ${isLight ? "#cbd5e1" : "#243048"}`,
            borderRadius: "50%",
            width: "34px",
            height: "34px",
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? "🌙" : "☀️"}
        </button>

        {user ? (
          <div
            onClick={() => navigate("/?settings=1")}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#00f3ff",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
            }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              background: "#00f3ff",
              color: "#000",
              padding: "6px 12px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
