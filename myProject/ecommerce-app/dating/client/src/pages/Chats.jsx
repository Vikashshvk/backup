import React, { useState, useEffect, useRef } from "react";
import { API, socket } from "../api";
import { Link } from "react-router-dom";

export default function Chats({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    API.get("/users/discover").then((res) => setUsers(res.data));

    // Connect socket if not connected
    if (!socket.connected) socket.connect();
    socket.emit("join-room", currentUser._id);

    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", handleReceive);

    return () => {
      socket.off("receive-message", handleReceive);
    };
  }, [currentUser._id]);

  const openChat = async (user) => {
    setActiveUser(user);
    const res = await API.get(`/messages/${user._id}`);
    setMessages(res.data);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeUser) return;

    const payload = {
      senderId: currentUser._id,
      receiverId: activeUser._id,
      message: msgInput.trim(),
    };

    socket.emit("send-message", payload);
    setMessages((prev) => [
      ...prev,
      {
        sender: currentUser._id,
        receiver: activeUser._id,
        message: msgInput.trim(),
      },
    ]);
    setMsgInput("");
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="glass-card row g-0"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Connections List */}
      <div className="col-4 border-end border-secondary border-opacity-25 p-3 overflow-y-auto">
        <h6 className="fw-bold mb-3">Chats</h6>
        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => openChat(u)}
            className={`d-flex align-items-center gap-2 p-2 rounded mb-2 ${
              activeUser?._id === u._id ? "bg-warning text-dark" : "text-white"
            }`}
            style={{ cursor: "pointer" }}
          >
            <img
              src={u.avatar}
              width="38"
              height="38"
              className="rounded-circle object-fit-cover"
              alt=""
            />
            <div className="small fw-semibold text-truncate">{u.name}</div>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="col-8 d-flex flex-column h-100">
        {activeUser ? (
          <>
            <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <img
                  src={activeUser.avatar}
                  width="36"
                  height="36"
                  className="rounded-circle object-fit-cover"
                  alt=""
                />
                <h6 className="mb-0 fw-bold">{activeUser.name}</h6>
              </div>
              <Link
                to={`/call/${activeUser._id}`}
                className="btn btn-sm btn-danger rounded-pill px-3"
              >
                📹 Call
              </Link>
            </div>

            <div className="flex-grow-1 p-3 overflow-y-auto d-flex flex-column gap-2">
              {messages.map((m, idx) => {
                const isMe =
                  m.sender === currentUser._id ||
                  m.senderId === currentUser._id;
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-3 text-break ${
                      isMe
                        ? "bg-warning text-dark align-self-end"
                        : "bg-secondary bg-opacity-50 text-white align-self-start"
                    }`}
                    style={{ maxWidth: "70%" }}
                  >
                    {m.message}
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <form
              onSubmit={sendMessage}
              className="p-2 border-top border-secondary border-opacity-25 d-flex gap-2"
            >
              <input
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
              />
              <button className="btn btn-warning px-4 fw-bold">Send</button>
            </form>
          </>
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 text-secondary">
            Select a connection to start talking
          </div>
        )}
      </div>
    </div>
  );
}
