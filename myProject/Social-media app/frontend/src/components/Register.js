import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = `http://${window.location.hostname}:5000`;

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, formData);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Registration failed or node conflict",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authWrapper}>
      {/* Inline Keyframe Animations */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(0, 243, 255, 0.2), 0 10px 40px rgba(0,0,0,0.8); }
          50% { box-shadow: 0 0 30px rgba(0, 243, 255, 0.4), 0 10px 40px rgba(0,0,0,0.8); }
        }
        @keyframes cyberPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .cyber-input:focus {
          border-color: #00f3ff !important;
          box-shadow: 0 0 10px rgba(0, 243, 255, 0.35) !important;
        }
        .cyber-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(0, 243, 255, 0.6) !important;
          filter: brightness(1.1);
        }
      `}</style>

      <div
        style={{
          ...styles.authCard,
          animation:
            "floatCard 6s ease-in-out infinite, pulseGlow 4s ease-in-out infinite",
        }}
      >
        <div style={styles.badgePulse}>
          <span style={styles.dot}></span> REGISTRATION PROTOCOL // NEW NODE
        </div>

        <h2 style={styles.cardTitle}>CREATE IDENTITY</h2>
        <p style={styles.cardSubtitle}>
          Register identity parameters to join the grid
        </p>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>OPERATOR NAME</label>
            <input
              type="text"
              name="name"
              required
              className="cyber-input"
              placeholder="e.g. CyberViper"
              value={formData.name}
              onChange={handleChange}
              style={styles.inputField}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>TRANSMISSION EMAIL</label>
            <input
              type="email"
              name="email"
              required
              className="cyber-input"
              placeholder="node@quantum.local"
              value={formData.email}
              onChange={handleChange}
              style={styles.inputField}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>SECURITY CIPHER (PASSWORD)</label>
            <input
              type="password"
              name="password"
              required
              className="cyber-input"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              style={styles.inputField}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "INITIALIZING NODE..." : "ACTIVATE NODE ➔"}
          </button>
        </form>

        <div style={styles.footerRow}>
          <span style={{ color: "#748ba7", fontSize: "13px" }}>
            Already registered?
          </span>{" "}
          <Link to="/login" style={styles.redirectLink}>
            Authenticate Here
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  authWrapper: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07080c",
    backgroundImage:
      "radial-gradient(circle at 50% 20%, #111726 0%, #07080c 60%)",
    padding: "20px 16px",
    fontFamily:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
  },
  authCard: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "rgba(14, 18, 28, 0.85)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(0, 243, 255, 0.35)",
    borderRadius: "16px",
    padding: "36px 30px",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  badgePulse: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    color: "#00f3ff",
    background: "rgba(0, 243, 255, 0.08)",
    border: "1px solid rgba(0, 243, 255, 0.25)",
    padding: "3px 10px",
    borderRadius: "20px",
    marginBottom: "14px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#00f3ff",
    boxShadow: "0 0 6px #00f3ff",
    animation: "cyberPulse 1.5s infinite",
  },
  cardTitle: {
    margin: "0 0 6px 0",
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "1px",
    color: "#ffffff",
    textShadow: "0 0 20px rgba(0, 243, 255, 0.25)",
  },
  cardSubtitle: {
    margin: "0 0 24px 0",
    fontSize: "12px",
    color: "#748ba7",
    letterSpacing: "0.5px",
  },
  errorAlert: {
    background: "rgba(255, 42, 109, 0.1)",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "18px",
    textAlign: "left",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    textAlign: "left",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    color: "#00f3ff",
  },
  inputField: {
    background: "#121724",
    border: "1px solid #243048",
    color: "#ffffff",
    padding: "12px 14px",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    transition: "border-color 0.25s ease, box-shadow 0.25s ease",
  },
  submitBtn: {
    marginTop: "10px",
    background: "linear-gradient(135deg, #00f3ff 0%, #00b4d8 100%)",
    border: "none",
    color: "#000",
    padding: "13px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "1px",
    boxShadow: "0 0 16px rgba(0, 243, 255, 0.35)",
    transition: "all 0.25s ease",
  },
  footerRow: {
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(26, 34, 53, 0.7)",
  },
  redirectLink: {
    color: "#00f3ff",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    marginLeft: "4px",
  },
};

export default Register;
