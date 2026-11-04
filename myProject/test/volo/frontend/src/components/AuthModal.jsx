import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config";
import { Sparkles, X, Smartphone, Mail } from "lucide-react";

const API_BASE = `${BACKEND_URL}/api/auth`;

export default function AuthModal({ onClose }) {
  const { loginUser } = useAuth();
  const [authMode, setAuthMode] = useState("register");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let res;
      if (authMode === "register") {
        res = await axios.post(`${API_BASE}/register`, {
          name: formData.name || formData.username,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      } else if (authMode === "register_mobile") {
        res = await axios.post(`${API_BASE}/register-mobile`, {
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
        });
      } else {
        res = await axios.post(`${API_BASE}/login`, {
          identifier: formData.identifier,
          password: formData.password,
        });
      }

      loginUser(res.data);
      if (onClose) onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Verify network and input.",
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 3, 10, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#151022",
          border: "1px solid #3b285f",
          borderRadius: "16px",
          width: "340px",
          padding: "24px",
          position: "relative",
        }}
      >
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #dc2626 50%, #ffffff 50%)",
              border: "2px solid #581c87",
              marginBottom: "10px",
            }}
          />
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f3f4f6" }}>
            {authMode === "login" && "Login to Volo"}
            {authMode === "register" && "Register on Volo"}
            {authMode === "register_mobile" && "Register with Mobile"}
          </h2>
        </div>

        {error && (
          <div
            style={{
              background: "#450a0a",
              color: "#f87171",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              marginBottom: "12px",
              border: "1px solid #7f1d1d",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          {authMode === "register" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Username"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Email address"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                style={inputStyle}
              />
            </>
          )}

          {authMode === "register_mobile" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={inputStyle}
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                style={inputStyle}
              />
            </>
          )}

          {authMode === "login" && (
            <input
              type="text"
              placeholder="Username, Email, or Phone"
              required
              value={formData.identifier}
              onChange={(e) =>
                setFormData({ ...formData, identifier: e.target.value })
              }
              style={inputStyle}
            />
          )}

          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#9333ea",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={16} />
            {authMode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "12px",
          }}
        >
          {authMode === "login" ? (
            <div style={{ color: "#9ca3af" }}>
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setAuthMode("register");
                  setError("");
                }}
                style={{
                  color: "#c084fc",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Sign Up
              </span>
            </div>
          ) : (
            <div style={{ color: "#9ca3af" }}>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
                style={{
                  color: "#c084fc",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Log In
              </span>
            </div>
          )}

          {authMode !== "register_mobile" && (
            <div>
              <span
                onClick={() => {
                  setAuthMode("register_mobile");
                  setError("");
                }}
                style={{
                  color: "#a855f7",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  textDecoration: "underline",
                }}
              >
                <Smartphone size={13} /> Register via Mobile Number
              </span>
            </div>
          )}

          {authMode === "register_mobile" && (
            <div>
              <span
                onClick={() => {
                  setAuthMode("register");
                  setError("");
                }}
                style={{
                  color: "#a855f7",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  textDecoration: "underline",
                }}
              >
                <Mail size={13} /> Register via Email & Username
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#0f0a1c",
  border: "1px solid #2e1d4b",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "#f3f4f6",
  fontSize: "13px",
  outline: "none",
};
