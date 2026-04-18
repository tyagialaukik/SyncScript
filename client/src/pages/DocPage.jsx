import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Editor from '../components/Editor';

const COLORS = ["#F87171", "#34D399", "#60A5FA", "#FBBF24", "#A78BFA"];

const DocPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [userName, setUserName] = useState(location.state?.userName || '');
  const [modalName, setModalName] = useState('');
  
  if (!userName) {
    return (
      <div style={{ 
        width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', position: 'fixed', top: 0, left: 0, zIndex: 50 
      }}>
        <div style={{
          background: '#0d1117', padding: '32px', borderRadius: '12px', 
          border: '1px solid #30363d', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '16px', width: '360px', boxSizing: 'border-box'
        }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>Join Room</h2>
          <p style={{ color: '#60A5FA', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{roomId}</p>
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={modalName}
            onChange={(e) => setModalName(e.target.value)}
            style={{ 
              padding: '12px', borderRadius: '8px', border: '1px solid #333', 
              background: '#1e1e1e', color: 'white', fontSize: '16px', width: '100%', boxSizing: 'border-box'
            }}
          />
          <button 
            onClick={() => { if (modalName.trim()) setUserName(modalName.trim()) }}
            style={{
              background: '#60A5FA', color: 'white', padding: '12px 32px',
              borderRadius: '8px', fontSize: '16px', border: 'none', cursor: 'pointer', width: '100%'
            }}
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  const userColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Editor docId={roomId} userId={userName} userColor={userColor} language="javascript" />
    </div>
  );
};

export default DocPage;
