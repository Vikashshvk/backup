import React, { useState } from "react";
import { API, socket } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup({ setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    avatar: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      socket.connect();
      socket.emit("join-room", res.data.user._id);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="row justify-content-center align-items-center vh-100 m-0 py-4">
      <div className="col-11 col-sm-8 col-md-6 col-lg-4">
        <div className="glass-card p-4 shadow-lg">
          <div className="text-center mb-3">
            <h3 className="brand-text fw-bold mb-1">❤️ Create Account</h3>
            <p className="text-secondary small">
              Join and connect with people near you.
            </p>
          </div>

          <form onSubmit={handleSignup}>
            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="form-control bg-dark text-white border-secondary"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">
                Username
              </label>
              <input
                type="text"
                name="username"
                className="form-control bg-dark text-white border-secondary"
                placeholder="e.g. rahul99"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-control bg-dark text-white border-secondary"
                placeholder="e.g. rahul@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Create strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Profile Photo URL <span className="text-muted">(Optional)</span>
              </label>
              <input
                type="text"
                name="avatar"
                className="form-control bg-dark text-white border-secondary"
                placeholder="https://images.unsplash.com/..."
                value={formData.avatar}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 fw-bold py-2 mb-3 shadow-sm"
            >
              Sign Up
            </button>

            <div className="text-center small text-secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-warning fw-semibold text-decoration-none"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
