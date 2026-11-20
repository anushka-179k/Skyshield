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
    <div style={{ maxWidth: 680, margin: '32px auto', padding: '0 20px' }}>
      <div className="sky-card" style={{ padding: 28, border: '2px solid #FFB74D' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1C1917' }}>Citizen Emergency SOS Beacon</h2>
          <span
            className="animate-alert-jump font-mono-tech"
            style={{ background: '#DC2626', color: '#FFFFFF', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}
          >
            ● LIVE DISPATCH
          </span>
        </div>
        <p className="font-mono-tech" style={{ fontSize: 12.5, color: '#44403C', marginBottom: 16 }}>
          Tap the map to drop your GPS pin ({pos[0].toFixed(4)}, {pos[1].toFixed(4)})
        </p>

        <div style={{ height: 240, marginBottom: 20, border: '2px solid #FFB74D', borderRadius: 12, overflow: 'hidden' }}>
          <MapContainer center={pos} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationPicker pos={pos} setPos={setPos} />
          </MapContainer>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="font-mono-tech" style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#44403C', marginBottom: 6 }}>
                EMERGENCY TYPE
              </label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
                <option value="flood">Flash Flood / Waterlogged</option>
                <option value="medical">Medical Emergency</option>
                <option value="trapped">Building Collapse / Trapped</option>
              </select>
            </div>

            <div>
              <label className="font-mono-tech" style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#44403C', marginBottom: 6 }}>
                RESOURCE NEEDED
              </label>
              <select value={need} onChange={(e) => setNeed(e.target.value)} style={{ width: '100%' }}>
                <option value="boat">Rescue Boat</option>
                <option value="medical">Ambulance / Paramedics</option>
                <option value="general">General Rescue Team</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="font-mono-tech" style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#44403C', marginBottom: 6 }}>
                SEVERITY (1–5)
              </label>
              <input type="number" min="1" max="5" value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label className="font-mono-tech" style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#44403C', marginBottom: 6 }}>
                PEOPLE STRANDED
              </label>
              <input type="number" min="1" max="100" value={people} onChange={(e) => setPeople(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1C1917', cursor: 'pointer', background: '#FFF3E0', padding: '10px 14px', borderRadius: 10, border: '1px solid #FFB74D' }}>
            <input type="checkbox" checked={vulnerable} onChange={(e) => setVulnerable(e.target.checked)} />
            Elderly, infants, or differently-abled individuals present (+15 Priority Boost)
          </label>

          <button
            type="submit"
            className="animate-alert-jump"
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              padding: '15px',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '0.5px',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              marginTop: 4,
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.35)',
            }}
          >
            BROADCAST EMERGENCY SOS
          </button>
        </form>

        {status && (
          <div
            className="animate-alert-pop"
            style={{
              marginTop: 18,
              padding: '14px 16px',
              borderRadius: 12,
              background: status.includes('CONFIRMED') ? '#DCFCE7' : '#FEF3C7',
              border: `2px solid ${status.includes('CONFIRMED') ? '#16A34A' : '#E65100'}`,
              color: status.includes('CONFIRMED') ? '#14532D' : '#9A3412',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {status}
          </div>
        )}

        <button
          onClick={flushQueue}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '11px',
            background: '#FFE0B2',
            color: '#1C1917',
            border: '1.5px solid #FFB74D',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          Force Sync Offline Device Queue
        </button>
      </div>
    </div>
  );
}