import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <BrowserRouter>
      {/* 1. TOP JUMPING RED ALERT UTILITY BAR */}
      <div
        style={{
          background: '#DC2626',
          color: '#FFFFFF',
          padding: '9px 24px',
          borderBottom: '2px solid #991B1B',
          fontSize: 13,
          position: 'relative',
          zIndex: 1100,
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
                background: '#FFFFFF',
                color: '#DC2626',
                fontWeight: 800,
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 6,
                letterSpacing: '0.5px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <span className="live-dot-wrapper" style={{ width: 8, height: 8 }}>
                <span className="live-dot-ping" style={{ background: '#DC2626' }} />
                <span className="live-dot-core" style={{ width: 8, height: 8, background: '#DC2626' }} />
              </span>
              LIVE ALERT GRID
            </span>
            <span style={{ fontWeight: 600 }}>
              NEW DELHI NCR COMMAND ACTIVE — <strong>6 Relief Shelters</strong> &amp; <strong>Fog-Cloud Sync Online</strong>
            </span>
          </div>

          <Link
            to="/sos"
            className="font-mono-tech"
            style={{
              background: '#1C1917',
              color: '#FFB74D',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 11.5,
              padding: '4px 12px',
              borderRadius: 6,
            }}
          >
            EMERGENCY SOS BEACON →
          </Link>
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
                fontWeight: 700,
                background: '#FFE0B2',
                color: '#E65100',
                border: '1px solid #FFB74D',
                padding: '3px 9px',
                borderRadius: 99,
              }}
            >
              FOG + CLOUD GRID
            </span>
          </NavLink>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <NavLink to="/" end style={navLinkStyle}>Overview</NavLink>
            <NavLink to="/map" style={navLinkStyle}>Command Map</NavLink>
            <NavLink to="/shelters" style={navLinkStyle}>Shelters &amp; Cache</NavLink>
            <NavLink to="/infra" style={navLinkStyle}>Cloud &amp; Fog Infra</NavLink>
            <NavLink to="/team" style={navLinkStyle}>Our Team</NavLink>
            <NavLink
              to="/sos"
              className="animate-alert-jump"
              style={{
                background: '#DC2626',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '9px 15px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                marginLeft: 4,
                boxShadow: '0 6px 16px rgba(220, 38, 38, 0.32)',
              }}
            >
              ● CITIZEN SOS
            </NavLink>
          </div>
        </div>
      </nav>

      {/* ROUTES */}
      <main style={{ minHeight: '75vh' }}>
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/sos" element={<Sos />} />
          <Route path="/shelters" element={<Shelters />} />
          <Route path="/infra" element={<Infra />} />
          <Route path="/team" element={<Team />} />
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
              COMMAND MODULES
            </h4>
            <div style={{ display: 'grid', gap: 8, fontSize: 13.5 }}>
              <Link to="/map" style={{ color: '#E7E5E4', textDecoration: 'none' }}>Live Disaster Command Map</Link>
              <Link to="/sos" style={{ color: '#E7E5E4', textDecoration: 'none' }}>Citizen Emergency SOS Beacon</Link>
              <Link to="/shelters" style={{ color: '#E7E5E4', textDecoration: 'none' }}>Relief Shelter &amp; Redis Cache</Link>
              <Link to="/infra" style={{ color: '#E7E5E4', textDecoration: 'none' }}>L7 Auto-Scaler &amp; Edge Fog</Link>
              <Link to="/team" style={{ color: '#FFB74D', textDecoration: 'none', fontWeight: 700 }}>Meet the Response Team</Link>
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