import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { BACKEND_URL } from "../config";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Paperclip,
  PhoneOff,
  Mic,
  MicOff,
  PhoneIncoming,
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export default function ChatWindow({ activeChat, onBack }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Call States
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState("voice");
  const [isMuted, setIsMuted] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const candidateQueue = useRef([]);

  const partner =
    activeChat?.participants?.find((p) => (p._id || p) !== user?._id) ||
    activeChat?.participants?.[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Safe Load Messages
  useEffect(() => {
    if (!activeChat?._id || !user?.token) return;

    axios
      .get(`${BACKEND_URL}/api/chats/${activeChat._id}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        // Ensure array only
        if (Array.isArray(res.data)) {
          setMessages(res.data);
        } else {
          setMessages([]);
        }
        scrollToBottom();
      })
      .catch((err) => {
        console.error("Fetch messages error:", err);
        setMessages([]);
      });

    if (socket) {
      socket.emit("join-chat", activeChat._id);
    }
  }, [activeChat, socket, user]);

  const cleanupCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    candidateQueue.current = [];
    setCallState("idle");
    setIncomingCallData(null);
    setIsMuted(false);
  };

  // 2. Real-time Listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (msg) => {
      if (msg && msg.chat === activeChat?._id) {
        setMessages((prev) => {
          if (!Array.isArray(prev)) return [msg];
          if (prev.some((m) => m?._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    const handleIncomingCall = (data) => {
      setIncomingCallData(data);
      setCallType(data.callType);
      setCallState("incoming");
    };

    const handleCallAccepted = async (signal) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(signal),
          );
          setCallState("connected");

          while (candidateQueue.current.length > 0) {
            const cand = candidateQueue.current.shift();
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(cand),
            );
          }
        }
      } catch (err) {
        console.error("Call accept signaling error:", err);
      }
    };

    const handleReceiveCandidate = async (candidate) => {
      try {
        if (
          peerConnectionRef.current &&
          peerConnectionRef.current.remoteDescription
        ) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        } else {
          candidateQueue.current.push(candidate);
        }
      } catch (err) {
        console.error("Candidate queue error:", err);
      }
    };

    const handleCallEnded = () => cleanupCall();

    socket.on("message-received", handleMessageReceived);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("receive-candidate", handleReceiveCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("message-received", handleMessageReceived);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("receive-candidate", handleReceiveCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket, activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Peer Connection Setup
  const setupPeerConnection = (stream, targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(() => {});
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          to: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  };

  // 3. Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat?._id) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      text: msgText,
      sender: { _id: user?._id, name: user?.name, avatar: user?.avatar },
      chat: activeChat._id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) =>
      Array.isArray(prev) ? [...prev, tempMsg] : [tempMsg],
    );
    scrollToBottom();

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/chats/${activeChat._id}/messages`,
        { text: msgText },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      setMessages((prev) =>
        Array.isArray(prev)
          ? prev.map((m) => (m._id === tempId ? res.data : m))
          : [res.data],
      );
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) =>
        Array.isArray(prev) ? prev.filter((m) => m._id !== tempId) : [],
      );
    }
  };

  // 4. File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat?._id) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/chats/${activeChat._id}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setMessages((prev) =>
        Array.isArray(prev) ? [...prev, res.data] : [res.data],
      );
      scrollToBottom();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  // Calling
  const initiateCall = async (type) => {
    const targetId = partner?._id || partner;
    if (!targetId) return;
    setCallType(type);
    setCallState("calling");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      localStreamRef.current = stream;

      if (localVideoRef.current && type === "video") {
        localVideoRef.current.srcObject = stream;
      }

      const pc = setupPeerConnection(stream, targetId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call-user", {
        userToCall: targetId,
        signalData: offer,
        from: user._id,
        fromName: user.name,
        callType: type,
      });
    } catch (err) {
      console.error("Permission error:", err);
      alert("Camera/Mic permission required");
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!incomingCallData) return;
    setCallState("connected");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCallData.callType === "video",
      });
      localStreamRef.current = stream;

      if (localVideoRef.current && incomingCallData.callType === "video") {
        localVideoRef.current.srcObject = stream;
      }

      const pc = setupPeerConnection(stream, incomingCallData.from);
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCallData.signal),
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      while (candidateQueue.current.length > 0) {
        const cand = candidateQueue.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      }

      socket.emit("answer-call", {
        to: incomingCallData.from,
        signal: answer,
      });
    } catch (err) {
      console.error("Call accept error:", err);
      cleanupCall();
    }
  };

  const endCall = () => {
    const targetId = partner?._id || partner || incomingCallData?.from;
    if (socket && targetId) {
      socket.emit("end-call", { to: targetId });
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  if (!activeChat) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#090611",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#0a0712",
        position: "relative",
      }}
    >
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Calling Screen Overlay */}
      {callState !== "idle" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#090514",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "40px 20px",
          }}
        >
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <img
              src={
                partner?.avatar ||
                "https://api.dicebear.com/7.x/identicon/svg?seed=volo"
              }
              alt=""
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "50%",
                border: "3px solid #9333ea",
                marginBottom: "12px",
              }}
            />
            <h2 style={{ color: "#fff", fontSize: "20px" }}>
              {partner?.name || partner?.username || "User"}
            </h2>
            <p style={{ color: "#a855f7", fontSize: "13px", marginTop: "6px" }}>
              {callState === "calling" &&
                `Ringing (${callType.toUpperCase()})...`}
              {callState === "incoming" &&
                `Incoming ${callType.toUpperCase()} Call...`}
              {callState === "connected" &&
                `Connected (${callType.toUpperCase()})`}
            </p>
          </div>

          {callType === "video" && (
            <div
              style={{
                width: "92%",
                height: "260px",
                background: "#171026",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #3b285f",
                position: "relative",
              }}
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  width: "80px",
                  height: "110px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "2px solid #9333ea",
                }}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            {callState === "incoming" ? (
              <>
                <button
                  onClick={acceptCall}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <PhoneIncoming size={26} />
                </button>
                <button
                  onClick={endCall}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#dc2626",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <PhoneOff size={26} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: isMuted ? "#ef4444" : "#221838",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={endCall}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#dc2626",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <PhoneOff size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #1c142d",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0d0917",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={onBack}
            className="mobile-back-btn"
            style={{
              background: "transparent",
              border: "none",
              color: "#f3f4f6",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <img
            src={
              partner?.avatar ||
              "https://api.dicebear.com/7.x/identicon/svg?seed=volo"
            }
            alt=""
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "1.5px solid #7e22ce",
            }}
          />
          <div>
            <div
              style={{ fontSize: "14px", fontWeight: "700", color: "#f3f4f6" }}
            >
              {partner?.name || partner?.username || "Chat"}
            </div>
            <div style={{ fontSize: "11px", color: "#22c55e" }}>Active</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            color: "#c084fc",
            alignItems: "center",
          }}
        >
          <button onClick={() => initiateCall("voice")} style={iconBtnStyle}>
            <Phone size={19} />
          </button>
          <button onClick={() => initiateCall("video")} style={iconBtnStyle}>
            <Video size={20} />
          </button>
          <MoreVertical
            size={18}
            color="#9ca3af"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Messages Feed */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {Array.isArray(messages) &&
          messages.map((m) => {
            if (!m) return null;
            const senderId = m.sender?._id || m.sender;
            const isMe = senderId === user?._id;

            return (
              <div
                key={m._id || Math.random()}
                style={{
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    padding: m.mediaUrl ? "6px" : "9px 13px",
                    borderRadius: isMe
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    background: isMe
                      ? "linear-gradient(135deg, #9333ea, #6b21a8)"
                      : "#181226",
                    color: "#f3f4f6",
                    fontSize: "13px",
                    wordBreak: "break-word",
                  }}
                >
                  {m.mediaType === "image" && m.mediaUrl && (
                    <img
                      src={`${BACKEND_URL}${m.mediaUrl}`}
                      alt="pic"
                      style={{
                        maxWidth: "100%",
                        borderRadius: "10px",
                        display: "block",
                        marginBottom: m.text ? "6px" : "0",
                      }}
                    />
                  )}
                  {m.mediaType === "video" && m.mediaUrl && (
                    <video
                      src={`${BACKEND_URL}${m.mediaUrl}`}
                      controls
                      style={{
                        maxWidth: "100%",
                        borderRadius: "10px",
                        display: "block",
                        marginBottom: m.text ? "6px" : "0",
                      }}
                    />
                  )}
                  {m.text && <div>{m.text}</div>}
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  {m.createdAt
                    ? new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "now"}
                </span>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "10px 12px",
          background: "#0d0917",
          borderTop: "1px solid #1c142d",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "transparent",
            border: "none",
            color: "#a855f7",
            cursor: "pointer",
            padding: "6px",
          }}
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          placeholder="Message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            flex: 1,
            background: "#151022",
            border: "1px solid #2e1d4b",
            borderRadius: "20px",
            padding: "10px 14px",
            color: "#f3f4f6",
            fontSize: "14px",
            outline: "none",
          }}
        />

        <button
          type="submit"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#9333ea",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

const iconBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#c084fc",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: "6px",
};
