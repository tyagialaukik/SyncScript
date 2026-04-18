import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState(location.state?.roomId || '');
  const navigate = useNavigate();

  // CSS for animated gradient
  useEffect(() => {
    if (!document.getElementById('home-styles')) {
      const style = document.createElement('style');
      style.id = 'home-styles';
      style.innerHTML = `
        @keyframes gradientBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .home-bg {
          background: linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #0d0d0d);
          background-size: 400% 400%;
          animation: gradientBg 15s ease infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleStart = () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    const finalRoomCode = roomCode.trim() || Math.random().toString(36).slice(2, 8);
    navigate(`/doc/${finalRoomCode}`, { state: { userName } });
  };

  return (
    <div className="home-bg" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', color: '#fff'
    }}>
      <h1 style={{ color: '#60A5FA', fontSize: '48px', fontWeight: 700, margin: '0 0 16px 0' }}>SyncScript</h1>
      <p style={{ color: '#888', fontSize: '18px', marginBottom: '24px', marginTop: 0 }}>Real-time collaborative code editor</p>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '48px' }}>
        <span style={{ background: '#1e1e2e', color: '#888', padding: '6px 14px', borderRadius: '20px', fontSize: '13px' }}>⚡ Real-time sync</span>
        <span style={{ background: '#1e1e2e', color: '#888', padding: '6px 14px', borderRadius: '20px', fontSize: '13px' }}>👥 Live cursors</span>
        <span style={{ background: '#1e1e2e', color: '#888', padding: '6px 14px', borderRadius: '20px', fontSize: '13px' }}>💾 Auto-saved</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Enter your name" 
          value={userName} 
          onChange={(e) => setUserName(e.target.value)} 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#1e1e1e', color: 'white', fontSize: '16px' }}
        />
        <input 
          type="text" 
          placeholder="Enter room code or leave blank to create new" 
          value={roomCode} 
          onChange={(e) => setRoomCode(e.target.value)} 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#1e1e1e', color: 'white', fontSize: '16px' }}
        />
      </div>

      <button 
        onClick={handleStart}
        style={{
          background: '#60A5FA', color: 'white', padding: '12px 32px',
          borderRadius: '8px', fontSize: '16px', border: 'none', cursor: 'pointer'
        }}
      >
        Start Coding →
      </button>
      
      <p style={{ color: '#888', fontSize: '14px', marginTop: '16px' }}>
        Share the URL with others to collaborate instantly
      </p>
    </div>
  );
};

export default Home;
