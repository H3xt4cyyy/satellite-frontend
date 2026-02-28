import React, { useState, useEffect } from 'react';

const API_BASE = "https://satellite-backend-fnev.onrender.com"; // I-paste dito ang Render URL mo

function App() {
  const [view, setView] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Auto-detect screen size para sa responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.layout(isMobile)}>
      {/* SIDEBAR / HEADER */}
      <div style={styles.sidebar(isMobile)}>
        <h2 style={{ fontSize: '1.2rem', color: '#FFD700', marginBottom: isMobile ? 0 : '20px' }}>
          SATELLITE MASTER
        </h2>
        <div style={styles.navGroup(isMobile)}>
          <button onClick={() => setView('dashboard')} style={styles.navBtn(view === 'dashboard')}>Dashboard</button>
          <button onClick={() => setView('directory')} style={styles.navBtn(view === 'directory')}>Directory</button>
          <button onClick={() => setView('tracker')} style={styles.navBtn(view === 'tracker')}>Tracker</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main(isMobile)}>
        {view === 'dashboard' && <Dashboard />}
        {view === 'directory' && <Directory />}
        {view === 'tracker' && <Tracker />}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (DUMMY EXAMPLES) ---
const Dashboard = () => <div><h3>Dashboard</h3><p>Welcome, Ryan! Check your sales today.</p></div>;
const Directory = () => <div><h3>Customer Directory</h3><p>Manage your suki list here.</p></div>;
const Tracker = () => <div><h3>Load Tracker</h3><p>Record new transactions for Solsona customers.</p></div>;

// --- RESPONSIVE STYLES ---
const styles = {
  layout: (isMobile) => ({
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    minHeight: '100vh',
    backgroundColor: '#0A0F1E',
    color: 'white',
    fontFamily: 'sans-serif'
  }),
  sidebar: (isMobile) => ({
    width: isMobile ? '100%' : '200px',
    backgroundColor: '#161B2D',
    padding: '20px 15px',
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: isMobile ? 'space-between' : 'flex-start',
    borderRight: isMobile ? 'none' : '1px solid #23293F',
    borderBottom: isMobile ? '1px solid #23293F' : 'none',
    position: 'sticky',
    top: 0,
    zIndex: 100
  }),
  navGroup: (isMobile) => ({
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    gap: '10px'
  }),
  navBtn: (active) => ({
    padding: '10px 15px',
    backgroundColor: active ? '#FFD700' : 'transparent',
    color: active ? '#0A0F1E' : 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  }),
  main: (isMobile) => ({
    flex: 1,
    padding: isMobile ? '20px' : '40px',
    overflowX: 'hidden'
  })
};

export default App;