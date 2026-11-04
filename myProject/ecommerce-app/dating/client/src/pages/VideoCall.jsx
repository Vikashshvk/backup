import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../api";

export default function VideoCall({ currentUser }) {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      })
      .catch((err) => console.log("Media error:", err));

    socket.on("incoming-call", async ({ signal, fromUser }) => {
      initPeer();
      localStreamRef.current
        ?.getTracks()
        .forEach((track) =>
          pcRef.current.addTrack(track, localStreamRef.current),
        );

      if (signal.sdp) {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.sdp),
        );
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("answer-call", {
          toUser: fromUser,
          signal: { sdp: answer },
        });
      } else if (signal.candidate) {
        await pcRef.current.addIceCandidate(
          new RTCIceCandidate(signal.candidate),
        );
      }
    });

    socket.on("call-accepted", async (signal) => {
      if (signal.sdp) {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.sdp),
        );
      } else if (signal.candidate) {
        await pcRef.current.addIceCandidate(
          new RTCIceCandidate(signal.candidate),
        );
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    };
  }, []);

  const initPeer = () => {
    pcRef.current = new RTCPeerConnection(config);
    pcRef.current.ontrack = (e) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = e.streams[0];
    };
    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("call-user", {
          targetUserId,
          signalData: { candidate: e.candidate },
          fromUser: currentUser._id,
        });
      }
    };
  };

  const startCall = async () => {
    initPeer();
    localStreamRef.current
      ?.getTracks()
      .forEach((track) =>
        pcRef.current.addTrack(track, localStreamRef.current),
      );
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socket.emit("call-user", {
      targetUserId,
      signalData: { sdp: offer },
      fromUser: currentUser._id,
    });
  };

  return (
    <div className="glass-card p-4 text-center">
      <h4 className="fw-bold mb-3">Live Video Call</h4>
      <div className="row g-3 justify-content-center mb-3">
        <div className="col-md-5">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-100 rounded-3 bg-dark"
            style={{ height: "260px", objectFit: "cover" }}
          />
          <small className="text-secondary d-block mt-1">You</small>
        </div>
        <div className="col-md-5">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-100 rounded-3 bg-dark"
            style={{ height: "260px", objectFit: "cover" }}
          />
          <small className="text-secondary d-block mt-1">Partner</small>
        </div>
      </div>
      <div className="d-flex justify-content-center gap-3">
        <button
          onClick={startCall}
          className="btn btn-success rounded-pill px-4"
        >
          Start Call
        </button>
        <button
          onClick={() => navigate("/chats")}
          className="btn btn-danger rounded-pill px-4"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
