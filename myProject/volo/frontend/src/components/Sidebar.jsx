import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { BACKEND_URL } from "../config";
import {
  Search,
  MessageSquare,
  Flame,
  Settings,
  LogOut,
  MessageCircle,
} from "lucide-react";

export default function Sidebar({ activeChat, setActiveChat, onOpenAuth }) {
  const { user, logoutUser } = useAuth();
  const { onlineUsers } = useSocket();
  const [activeTab, setActiveTab] = useState("discover");
  const [chats, setChats] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const fetchChats = async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChats(res.data);
    } catch (err) {
      if (err.response?.status === 401) logoutUser();
    }
  };

  const fetchDiscoverUsers = async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDiscoverUsers(res.data);
    } catch (err) {
      if (err.response?.status === 401) logoutUser();
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchChats();
      fetchDiscoverUsers();
    }
  }, [user]);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/users/search?query=${val}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = async (targetUserId) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/chats`,
        { receiverId: targetUserId },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setActiveChat(res.data);
      setSearchQuery("");
      setSearchResults([]);
      setActiveTab("chats");
      fetchChats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0917" }}>
      <div
        style={{
          width: "60px",
          background: "#090610",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 0",
          borderRight: "1px solid #1c142d",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            onClick={!user ? onOpenAuth : undefined}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid #9333ea",
              cursor: "pointer",
              overflow: "hidden",
            }}
          >
            <img
              src={
                user?.avatar ||
                "https://api.dicebear.com/7.x/identicon/svg?seed=guest"
              }
              alt="avatar"
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          <button
            onClick={() => setActiveTab("discover")}
            style={activeTab === "discover" ? navBtnActive : navBtn}
          >
            <Flame
              size={20}
              color={activeTab === "discover" ? "#ec4899" : "#9ca3af"}
            />
          </button>

          <button
            onClick={() => setActiveTab("chats")}
            style={activeTab === "chats" ? navBtnActive : navBtn}
          >
            <MessageSquare size={20} />
          </button>

          <button style={navBtn}>
            <Settings size={20} />
          </button>
        </div>

        {user && (
          <button onClick={logoutUser} style={{ ...navBtn, color: "#ef4444" }}>
            <LogOut size={20} />
          </button>
        )}
      </div>

      <div
        style={{
          width: "300px",
          borderRight: "1px solid #1c142d",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{ fontSize: "15px", fontWeight: "700", color: "#f3f4f6" }}
            >
              {activeTab === "discover" ? "Explore Matches" : "Conversations"}
            </h2>
            <p style={{ fontSize: "11px", color: "#a855f7" }}>
              {user ? `@${user.username}` : "Guest"}
            </p>
          </div>
          {!user && (
            <button
              onClick={onOpenAuth}
              style={{
                padding: "6px 12px",
                background: "#9333ea",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          )}
        </div>

        <div style={{ padding: "0 16px 12px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#151022",
              border: "1px solid #2e1d4b",
              borderRadius: "8px",
              padding: "6px 10px",
            }}
          >
            <Search size={15} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f3f4f6",
                fontSize: "12px",
                marginLeft: "6px",
                width: "100%",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", padding: "0 16px 10px", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("discover")}
            style={{
              ...pillBtn,
              background: activeTab === "discover" ? "#7e22ce" : "#171026",
              color: activeTab === "discover" ? "#fff" : "#9ca3af",
            }}
          >
            Discover ({discoverUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            style={{
              ...pillBtn,
              background: activeTab === "chats" ? "#7e22ce" : "#171026",
              color: activeTab === "chats" ? "#fff" : "#9ca3af",
            }}
          >
            Chats ({chats.length})
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {searchQuery && searchResults.length > 0 ? (
            searchResults.map((u) => (
              <div
                key={u._id}
                onClick={() => startChat(u._id)}
                style={chatItemStyle}
              >
                <img
                  src={u.avatar}
                  alt=""
                  style={{ width: "36px", height: "36px", borderRadius: "50%" }}
                />
                <div style={{ marginLeft: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#a855f7" }}>
                    {u.uniqueId}
                  </div>
                </div>
              </div>
            ))
          ) : activeTab === "discover" ? (
            discoverUsers.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                No active profiles found.
              </div>
            ) : (
              discoverUsers.map((u) => {
                const isOnline = onlineUsers.includes(u._id);
                return (
                  <div
                    key={u._id}
                    style={{
                      ...chatItemStyle,
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ position: "relative" }}>
                        <img
                          src={u.avatar}
                          alt=""
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            border: "1.5px solid #581c87",
                          }}
                        />
                        {isOnline && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: "8px",
                              height: "8px",
                              background: "#22c55e",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ marginLeft: "10px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600" }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "#a855f7" }}>
                          {u.uniqueId}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => startChat(u._id)}
                      style={{
                        padding: "6px 8px",
                        background: "#9333ea",
                        border: "none",
                        borderRadius: "6px",
                        color: "#fff",
                        fontSize: "11px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <MessageCircle size={13} /> Chat
                    </button>
                  </div>
                );
              })
            )
          ) : chats.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              No conversations yet.
            </div>
          ) : (
            chats.map((c) => {
              const partner =
                c.participants?.find((p) => p._id !== user?._id) ||
                c.participants?.[0];
              const isSelected = activeChat?._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => setActiveChat(c)}
                  style={{
                    ...chatItemStyle,
                    background: isSelected ? "#1b122c" : "transparent",
                    borderLeft: isSelected
                      ? "3px solid #9333ea"
                      : "3px solid transparent",
                  }}
                >
                  <img
                    src={partner?.avatar}
                    alt=""
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{ marginLeft: "10px", flex: 1, overflow: "hidden" }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {partner?.name || partner?.username}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.lastMessage?.text || "Direct conversation"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const navBtn = {
  background: "transparent",
  border: "none",
  color: "#6b7280",
  cursor: "pointer",
  padding: "6px",
};

const navBtnActive = {
  ...navBtn,
  color: "#c084fc",
};

const pillBtn = {
  flex: 1,
  padding: "6px",
  fontSize: "11px",
  border: "1px solid #2e1d4b",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};

const chatItemStyle = {
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  cursor: "pointer",
  borderBottom: "1px solid #140d24",
};
