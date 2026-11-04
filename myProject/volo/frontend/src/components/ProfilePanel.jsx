import React from "react";
import { X, Mail, Phone, Hash } from "lucide-react";

export default function ProfilePanel({ activeChat, onClose }) {
  const partner = activeChat?.participants?.[0];

  if (!partner) return null;

  return (
    <div
      style={{
        width: "300px",
        background: "#120d20",
        borderLeft: "1px solid #1c142d",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: "600" }}>Contact Info</h3>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <img
          src={partner.avatar}
          alt=""
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            border: "2px solid #9333ea",
            marginBottom: "10px",
          }}
        />
        <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
          {partner.name || partner.username}
        </h4>
        <span style={{ fontSize: "12px", color: "#a855f7" }}>
          @{partner.username}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          fontSize: "13px",
        }}
      >
        <div>
          <div style={labelStyle}>
            <Hash size={13} /> Unique ID
          </div>
          <div style={valueStyle}>{partner.uniqueId || "VOLO-UNKNOWN"}</div>
        </div>
        <div>
          <div style={labelStyle}>
            <Mail size={13} /> Email
          </div>
          <div style={valueStyle}>{partner.email || "N/A"}</div>
        </div>
        <div>
          <div style={labelStyle}>
            <Phone size={13} /> Phone
          </div>
          <div style={valueStyle}>{partner.phone || "N/A"}</div>
        </div>
        <div>
          <div style={labelStyle}>About</div>
          <div style={valueStyle}>
            {partner.about || "Hey there! I am using Volo."}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: "11px",
  color: "#9ca3af",
  marginBottom: "4px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const valueStyle = {
  color: "#e5e7eb",
  fontWeight: "500",
};
