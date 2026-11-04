import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function Layout({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div>
      {/* Desktop YouTube-like Sidebar */}
      <aside className="desktop-sidebar">
        <h4 className="brand-text mb-4 ps-2">❤️ HeartSync</h4>
        <nav className="flex-grow-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-item-link ${isActive ? "active" : ""}`
            }
          >
            <span>🏠</span> Home
          </NavLink>
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `nav-item-link ${isActive ? "active" : ""}`
            }
          >
            <span>💬</span> Chats
          </NavLink>
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `nav-item-link ${isActive ? "active" : ""}`
            }
          >
            <span>👤</span> Account
          </NavLink>
        </nav>
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm w-100"
        >
          Logout
        </button>
      </aside>

      {/* Mobile Bottom Navbar (3 Links: Home, Chats, Account) */}
      <nav className="mobile-nav-bar">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="fs-5">🏠</span>
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/chats"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="fs-5">💬</span>
          <span>Chats</span>
        </NavLink>
        <NavLink
          to="/account"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="fs-5">👤</span>
          <span>Account</span>
        </NavLink>
      </nav>

      {/* Main Page Render */}
      <main className="content-container">
        <Outlet />
      </main>
    </div>
  );
}
