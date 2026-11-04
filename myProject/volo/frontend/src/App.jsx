import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "#0a0712",
      }}
    >
      {/* Sidebar: Mobile me tabhi dikhega jab activeChat null ho */}
      <div
        style={{
          width: activeChat ? "0%" : "100%",
          display: activeChat ? "none" : "flex",
          flexDirection: "row",
          height: "100%",
          "@media (minWidth: 768px)": { display: "flex", width: "380px" },
        }}
        className="sidebar-container"
      >
        <Sidebar
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      </div>

      {/* Chat Window: Mobile me tabhi dikhega jab chat selected ho */}
      <div
        style={{
          flex: 1,
          display: !activeChat ? "none" : "flex",
          height: "100%",
        }}
        className="chat-container"
      >
        <ChatWindow
          activeChat={activeChat}
          onBack={() => setActiveChat(null)}
        />
      </div>

      {(!user || showAuthModal) && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
