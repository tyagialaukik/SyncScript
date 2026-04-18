import React, { useState } from 'react';

const PresenceBar = ({ users, docId, language, onLanguageChange, onRun, isRunning }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", maxWidth: "100%", height: "48px", background: "#0d1117",
      borderBottom: "1px solid #30363d", padding: "0 16px",
      boxSizing: "border-box", overflow: "hidden"
    }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#60A5FA", fontWeight: 700, fontSize: "16px" }}>
          SyncScript
        </span>
        <span style={{ color: "#30363d" }}>|</span>
        <span style={{ color: "#888", fontSize: "12px" }}>
          Room: {docId}
        </span>
      </div>

      <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        {users.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#34D399',
              boxShadow: '0 0 8px #34D399'
            }} />
            <span style={{ color: '#34D399', fontSize: '13px', fontWeight: 600 }}>Live</span>
          </div>
        )}
        <span style={{ color: '#888', fontSize: '13px' }}>
          {users.length} {users.length === 1 ? 'user' : 'users'} online
        </span>
      </div>

      <div style={{ flexShrink: 0, display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={onRun}
          disabled={isRunning}
          style={{
            background: isRunning ? "#1a472a" : "#166534",
            border: "1px solid #16a34a",
            color: "#34D399",
            padding: "4px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: isRunning ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            fontWeight: 600
          }}
        >
          {isRunning ? "Running..." : "▶ Run"}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {users.map((user) => (
            <div
              key={user.userId}
              title={user.userId}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: user.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #2d2d2d',
                cursor: 'help'
              }}
            >
              <span style={{ fontSize: '10px', color: 'rgba(0,0,0,0.5)', fontWeight: 'bold' }}>
                {user.userId.slice(0, 2).toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopy}
          style={{
            background: "transparent", border: "1px solid #30363d",
            color: "#888", padding: "4px 12px", borderRadius: "6px",
            fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap"
          }}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>

        <select
          value={language}
          onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
          style={{
            background: "#161b22", color: "#ccc",
            border: "1px solid #30363d", padding: "4px 8px",
            borderRadius: "6px", fontSize: "12px", flexShrink: 0,
            outline: "none", cursor: "pointer"
          }}
        >
          <option value="javascript">javascript</option>
          <option value="typescript">typescript</option>
          <option value="python">python</option>
          <option value="java">java</option>
          <option value="cpp">cpp</option>
        </select>
      </div>
    </div>
  );
};

export default PresenceBar;
