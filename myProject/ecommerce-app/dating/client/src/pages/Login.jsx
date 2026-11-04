import React, { useState } from "react";
import { API, socket } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      socket.connect();
      socket.emit("join-room", res.data.user._id);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="row justify-content-center align-items-center vh-100 m-0">
      <div className="col-11 col-sm-8 col-md-5 col-lg-4">
        <div className="glass-card p-4 shadow-lg">
          <div className="text-center mb-4">
            <h3 className="brand-text fw-bold mb-1">❤️ HeartSync</h3>
            <p className="text-secondary small">
              Welcome back! Sign in to find your match.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Username
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="e.g. rahul_sharma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Password
              </label>
              <input
                type="password"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 fw-bold py-2 mb-3 shadow-sm"
            >
              Login to HeartSync
            </button>

            <div className="text-center small text-secondary">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-warning fw-semibold text-decoration-none"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
