import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import About from './pages/About';
import Sos from './pages/sos';
import MapPage from './pages/map';
import Infra from './pages/Infra';
import Shelters from './pages/Shelters';
import Team from './pages/Team';

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? '#FFFFFF' : '#1C1917',
  backgroundColor: isActive ? '#E65100' : 'transparent',
  textDecoration: 'none',
  padding: '8px 14px',
  borderRadius: '10px',
  fontWeight: isActive ? '700' : '600',
  fontSize: '13.5px',
  transition: 'all 0.2s ease',
});

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('skyshield_admin') === 'true');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function enableAdmin() {
    setIsAdmin(true);
    localStorage.setItem('skyshield_admin', 'true');
    setShowAdminModal(false);
    setPinInput('');
    setPinError('');
  }

  function handleAdminLogin(e) {
    e.preventDefault();
    if (pinInput.trim() === '1234') {
      enableAdmin();
    } else {
      setPinError('Invalid Command PIN. Use 1234 or click Instant Demo Access.');
    }
  }

  function logoutAdmin() {
    setIsAdmin(false);
    localStorage.removeItem('skyshield_admin');
  }

  return (
    <BrowserRouter>
      {/* 1. TOP EMERGENCY & ROLE SWITCH UTILITY BAR */}
      <div
        style={{
          background: isAdmin ? '#1C1917' : '#DC2626',
          color: '#FFFFFF',
          padding: '9px 24px',
          borderBottom: isAdmin ? '2px solid #E65100' : '2px solid #991B1B',
          fontSize: 13,
          position: 'relative',
          zIndex: 1100,
          transition: 'background 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span
              className="animate-alert-jump font-mono-tech"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: isAdmin ? '#E65100' : '#FFFFFF',
                color: isAdmin ? '#FFFFFF' : '#DC2626',
                fontWeight: 800,
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 6,
                letterSpacing: '0.5px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <span className="live-dot-wrapper" style={{ width: 8, height: 8 }}>
                <span className="live-dot-ping" style={{ background: isAdmin ? '#FFFFFF' : '#DC2626' }} />
                <span className="live-dot-core" style={{ width: 8, height: 8, background: isAdmin ? '#FFFFFF' : '#DC2626' }} />
              </span>
              {isAdmin ? 'COMMAND ADMIN SESSION ACTIVE' : 'LIVE CITIZEN ALERT GRID'}
            </span>
            <span style={{ fontWeight: 600 }}>
              {isAdmin
                ? 'Authorized Access: Live Dispatch, Shelter Inventory & L7 Auto-Scaler Unlocked'
                : 'NEW DELHI NCR ACTIVE — 6 Relief Shelters Open • Report Emergencies Instantly'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin ? (
              <button
                onClick={logoutAdmin}
                className="font-mono-tech"
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 11.5,
                  padding: '5px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                EXIT ADMIN (CITIZEN VIEW) ✕
              </button>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="font-mono-tech"
                style={{
                  background: '#1C1917',
                  color: '#FFB74D',
                  border: '1px solid #FFB74D',
                  fontWeight: 800,
                  fontSize: 11.5,
                  padding: '5px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                🔒 COMMAND ADMIN LOGIN
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. STICKY GLASSMORPHIC CANDLELIGHT NAVBAR */}
      <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span className="live-dot-wrapper">
              <span className="live-dot-ping" style={{ background: '#E65100' }} />
              <span className="live-dot-core" style={{ background: '#E65100' }} />
            </span>
            <span className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px', color: '#1C1917' }}>
              SKY<span style={{ color: '#E65100' }}>SHIELD</span>
            </span>
            <span
              className="font-mono-tech"
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                background: isAdmin ? '#1C1917' : '#FFE0B2',
                color: isAdmin ? '#FFB74D' : '#E65100',
                border: '1px solid #FFB74D',
                padding: '3px 9px',
                borderRadius: 99,
              }}
            >
              {isAdmin ? 'ADMIN COMMAND' : 'CITIZEN PORTAL'}
            </span>
          </NavLink>

          {/* Role-Based Navigation Links */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <NavLink to="/" end style={navLinkStyle}>Overview</NavLink>

            {isAdmin ? (
              <>
                <NavLink to="/map" style={navLinkStyle}>Command Map</NavLink>
                <NavLink to="/shelters" style={navLinkStyle}>Shelter &amp; Cache Ops</NavLink>
                <NavLink to="/infra" style={navLinkStyle}>Cloud &amp; Fog Infra</NavLink>
                <NavLink to="/sos" style={navLinkStyle}>Test SOS</NavLink>
                <NavLink to="/team" style={navLinkStyle}>Our Team</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/shelters" style={navLinkStyle}>Public Shelters</NavLink>
                <NavLink to="/team" style={navLinkStyle}>Our Team</NavLink>
                <NavLink
                  to="/sos"
                  className="animate-alert-jump"
                  style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '13px',
                    marginLeft: 4,
                    boxShadow: '0 6px 16px rgba(220, 38, 38, 0.32)',
                  }}
                >
                  ● REPORT EMERGENCY SOS
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ADMIN AUTH MODAL */}
      {showAdminModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28, 25, 23, 0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            className="animate-alert-pop"
            style={{
              background: '#FFF3E0',
              border: '2px solid #E65100',
              borderRadius: 20,
              padding: 28,
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="font-mono-tech" style={{ fontSize: 11, fontWeight: 800, background: '#FFE0B2', color: '#E65100', padding: '4px 10px', borderRadius: 6 }}>
                RESTRICTED DISPATCH ACCESS
              </span>
              <button
                onClick={() => setShowAdminModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: 18, fontWeight: 800, cursor: 'pointer', color: '#1C1917' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1C1917', marginBottom: 6 }}>
              Command Center Login
            </h3>
            <p style={{ fontSize: 13.5, color: '#44403C', marginBottom: 18, lineHeight: 1.5 }}>
              Enter the Disaster Response Officer PIN (<b>1234</b>) to unlock live rescue dispatch, shelter inventory controls, and L7 auto-scaler telemetry.
            </p>

            <form onSubmit={handleAdminLogin} style={{ display: 'grid', gap: 12 }}>
              <input
                type="password"
                placeholder="Enter Command PIN (1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                style={{ width: '100%', background: '#FFFFFF' }}
              />
              {pinError && (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#DC2626' }}>{pinError}</div>
              )}
              <button
                type="submit"
                style={{
                  background: '#E65100',
                  color: '#FFFFFF',
                  padding: '12px',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Unlock Command Center →
              </button>
            </form>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #FFB74D', textAlign: 'center' }}>
              <button
                type="button"
                onClick={enableAdmin}
                className="font-mono-tech"
                style={{
                  width: '100%',
                  background: '#1C1917',
                  color: '#FFB74D',
                  padding: '10px',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚡ 1-Click Demo Admin Access (For Presentation)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROUTES */}
      <main style={{ minHeight: '75vh' }}>
        <Routes>
          <Route path="/" element={<About isAdmin={isAdmin} onOpenAdmin={() => setShowAdminModal(true)} />} />
          <Route path="/sos" element={<Sos />} />
          <Route path="/shelters" element={<Shelters isAdmin={isAdmin} />} />
          <Route path="/team" element={<Team />} />
          <Route path="/map" element={isAdmin ? <MapPage /> : <Navigate to="/" replace />} />
          <Route path="/infra" element={isAdmin ? <Infra /> : <Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. DETAILED FOOTER */}
      <footer
        style={{
          background: '#1C1917',
          color: '#FFF3E0',
          marginTop: 56,
          padding: '44px 24px 28px',
          borderTop: '4px solid #E65100',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32,
            paddingBottom: 28,
            borderBottom: '1px solid rgba(255, 224, 178, 0.15)',
          }}
        >
          <div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              SKY<span style={{ color: '#FFB74D' }}>SHIELD</span>
            </div>
            <p style={{ fontSize: 13.5, color: '#D6D3D1', lineHeight: 1.6 }}>
              Hybrid Edge-Fog &amp; Auto-Scaling Cloud Disaster Response Grid engineered for zero packet loss and sub-second rescue dispatch.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#FFB74D', letterSpacing: '0.6px', marginBottom: 12 }}>
              QUICK ACCESS
            </h4>
            <div style={{ display: 'grid', gap: 8, fontSize: 13.5 }}>
              <Link to="/sos" style={{ color: '#F87171', textDecoration: 'none', fontWeight: 700 }}>● Citizen Emergency SOS Beacon</Link>
              <Link to="/shelters" style={{ color: '#E7E5E4', textDecoration: 'none' }}>Public Relief Shelter Finder</Link>
              <Link to="/team" style={{ color: '#E7E5E4', textDecoration: 'none' }}>Meet the Response Team</Link>
              {isAdmin ? (
                <>
                  <Link to="/map" style={{ color: '#FFB74D', textDecoration: 'none' }}>Admin Command Map</Link>
                  <Link to="/infra" style={{ color: '#FFB74D', textDecoration: 'none' }}>L7 Auto-Scaler &amp; Edge Fog</Link>
                </>
              ) : (
                <button
                  onClick={() => setShowAdminModal(true)}
                  style={{ background: 'transparent', border: 'none', color: '#FFB74D', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: 13.5, fontWeight: 700 }}
                >
                  🔒 Command Officer Login
                </button>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#FFB74D', letterSpacing: '0.6px', marginBottom: 12 }}>
              SYSTEM TELEMETRY
            </h4>
            <div
              className="font-mono-tech"
              style={{
                background: 'rgba(255, 243, 224, 0.06)',
                border: '1px solid rgba(255, 183, 77, 0.25)',
                borderRadius: 12,
                padding: 14,
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: '#4ADE80' }}>● EDGE FOG GATEWAY: ONLINE</div>
              <div style={{ color: '#FFB74D' }}>● L7 LOAD BALANCER: ACTIVE</div>
              <div style={{ color: '#F87171' }}>● EMERGENCY SOS DISPATCH: ARMED</div>
            </div>
          </div>
        </div>

        <div
          className="font-mono-tech"
          style={{
            maxWidth: 1240,
            margin: '20px auto 0',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            fontSize: 11.5,
            color: '#A8A29E',
          }}
        >
          <span>© 2026 SKYSHIELD CCSA CAPSTONE PROJECT</span>
          <span>CANDLELIGHT + HIGH-VISIBILITY ALERT DESIGN SYSTEM</span>
        </div>
      </footer>
    </BrowserRouter>
  );
}