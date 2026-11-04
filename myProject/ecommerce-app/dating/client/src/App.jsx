import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { API, socket } from "./api";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Chats from "./pages/Chats";
import Account from "./pages/Account";
import CreatePost from "./pages/CreatePost";
import VideoCall from "./pages/VideoCall";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/auth/me")
        .then((res) => {
          setUser(res.data);
          socket.connect();
          socket.emit("join-room", res.data._id);
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup setUser={setUser} /> : <Navigate to="/" />}
        />

        {user ? (
          <Route element={<Layout user={user} setUser={setUser} />}>
            <Route path="/" element={<Home currentUser={user} />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/chats" element={<Chats currentUser={user} />} />
            <Route
              path="/account"
              element={<Account user={user} setUser={setUser} />}
            />
            <Route
              path="/call/:id"
              element={<VideoCall currentUser={user} />}
            />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
