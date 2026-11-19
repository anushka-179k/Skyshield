import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { sendSOS, flushQueue } from '../lib/queue';

function LocationPicker({ pos, setPos }) {
  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return pos ? <Marker position={pos} /> : null;
}

export default function Sos() {
  const [pos, setPos] = useState([28.6139, 77.209]);
  const [type, setType] = useState('flood');
  const [need, setNeed] = useState('boat');
  const [severity, setSeverity] = useState(4);
  const [people, setPeople] = useState(3);
  const [vulnerable, setVulnerable] = useState(false);
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Transmitting to nearest Edge Fog Node...');
    const res = await sendSOS({
      lat: pos[0],
      lng: pos[1],
      type,
      need,
      severity: Number(severity),
      people: Number(people),
      vulnerable,
    });
    setStatus(
      res === 'sent-to-fog'
        ? 'CONFIRMED: Received by Local Fog Node (Edge)'
        : 'OFFLINE MODE: Saved safely in Device IndexedDB Queue'
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '24px auto', padding: '0 20px' }}>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Citizen Emergency SOS Beacon</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
          Tap the map to drop your GPS pin ({pos[0].toFixed(4)}, {pos[1].toFixed(4)})
        </p>

        <div style={{ height: 240, marginBottom: 18, border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
          <MapContainer center={pos} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationPicker pos={pos} setPos={setPos} />
          </MapContainer>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>EMERGENCY TYPE</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
                <option value="flood">Flash Flood / Waterlogged</option>
                <option value="medical">Medical Emergency</option>
                <option value="trapped">Building Collapse / Trapped</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>RESOURCE NEEDED</label>
              <select value={need} onChange={(e) => setNeed(e.target.value)} style={{ width: '100%' }}>
                <option value="boat">Rescue Boat</option>
                <option value="medical">Ambulance / Paramedics</option>
                <option value="general">General Rescue Team</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>SEVERITY (1–5)</label>
              <input type="number" min="1" max="5" value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>PEOPLE STRANDED</label>
              <input type="number" min="1" max="100" value={people} onChange={(e) => setPeople(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={vulnerable} onChange={(e) => setVulnerable(e.target.checked)} />
            Elderly, infants, or differently-abled individuals present (+15 Priority Boost)
          </label>

          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              padding: '14px',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.5px',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              marginTop: 4,
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
            }}
          >
            BROADCAST EMERGENCY SOS
          </button>
        </form>

        {status && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 14px',
              borderRadius: 8,
              background: status.includes('CONFIRMED') ? 'rgba(22, 163, 74, 0.18)' : 'rgba(217, 119, 6, 0.2)',
              border: `1px solid ${status.includes('CONFIRMED') ? '#22c55e' : '#f59e0b'}`,
              color: status.includes('CONFIRMED') ? '#4ade80' : '#fbbf24',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {status}
          </div>
        )}

        <button
          onClick={flushQueue}
          style={{
            marginTop: 12,
            width: '100%',
            padding: '10px',
            background: '#1e293b',
            color: '#cbd5e1',
            border: '1px solid #334155',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Force Sync Offline Device Queue
        </button>
      </div>
    </div>
  );
}