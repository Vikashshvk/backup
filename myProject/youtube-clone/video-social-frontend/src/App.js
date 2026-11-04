import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Feed from "./components/Feedt";
import Upload from "./components/Upload";
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("sh_theme") || "cyber-dark",
  );

  const toggleTheme = () => {
    const next = themeMode === "light" ? "cyber-dark" : "light";
    setThemeMode(next);
    localStorage.setItem("sh_theme", next);
  };

  useEffect(() => {
    document.body.style.backgroundColor =
      themeMode === "light" ? "#f4f6f8" : "#07080c";
    document.body.style.color = themeMode === "light" ? "#0f172a" : "#e2e8f0";
    document.body.style.margin = "0";
    document.body.style.fontFamily = "'Segoe UI', sans-serif";
  }, [themeMode]);

  return (
    <AuthProvider>
      <Router>
        <Navbar themeMode={themeMode} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Feed themeMode={themeMode} />} />
          <Route path="/upload" element={<Upload themeMode={themeMode} />} />
          <Route path="/login" element={<Login themeMode={themeMode} />} />
          <Route
            path="/register"
            element={<Register themeMode={themeMode} />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
