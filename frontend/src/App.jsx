import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import About from './pages/About';
import Sos from './pages/sos';
import MapPage from './pages/map';
import Infra from './pages/Infra';
import Shelters from './pages/Shelters';

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? '#38bdf8' : '#cbd5e1',
  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
  textDecoration: 'none',
  padding: '8px 13px',
  borderRadius: '8px',
  fontWeight: isActive ? '600' : '500',
  fontSize: '13px',
});

export default function App() {
  return (
    <BrowserRouter>
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.5px', color: '#f8fafc' }}>
            SKY<span style={{ color: '#38bdf8' }}>SHIELD</span>
          </span>
          <span style={{ fontSize: 11, background: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: 99 }}>
            FOG + CLOUD DISASTER GRID
          </span>
        </NavLink>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <NavLink to="/" end style={navLinkStyle}>Overview & About</NavLink>
          <NavLink to="/map" style={navLinkStyle}>Command Map</NavLink>
          <NavLink to="/sos" style={navLinkStyle}>Citizen SOS</NavLink>
          <NavLink to="/shelters" style={navLinkStyle}>Shelters & Cache</NavLink>
          <NavLink to="/infra" style={navLinkStyle}>Cloud & Fog Infra</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/sos" element={<Sos />} />
        <Route path="/shelters" element={<Shelters />} />
        <Route path="/infra" element={<Infra />} />
      </Routes>
    </BrowserRouter>
  );
}