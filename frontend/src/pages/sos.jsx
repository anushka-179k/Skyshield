import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  const [landmark, setLandmark] = useState('');
  const [status, setStatus] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [liveIncidents, setLiveIncidents] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'sos'), where('status', 'in', ['open', 'assigned']));
    const unsub = onSnapshot(q, (snap) => {
      setLiveIncidents(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.priority || 0) - (a.priority || 0))
          .slice(0, 5)
      );
    });
    return () => unsub();
  }, []);

  function detectMyGPS() {
    if (!navigator.geolocation) {
      setStatus('GPS not supported on this browser. Tap the map to drop your pin.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setStatus('Could not access GPS automatically. Please tap your location on the map.');
      }
    );
  }

  function applyPreset(presetType, presetNeed, presetSev) {
    setType(presetType);
    setNeed(presetNeed);
    setSeverity(presetSev);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Transmitting encrypted SOS packet to nearest Edge Fog Node...');
    const res = await sendSOS({
      lat: pos[0],
      lng: pos[1],
      type,
      need,
      severity: Number(severity),
      people: Number(people),
      vulnerable,
      landmark,
    });
    setStatus(
      res === 'sent-to-fog'
        ? 'CONFIRMED: SOS Received by Local Edge Fog Gateway & Queued for Priority Dispatch!'
        : 'OFFLINE SAVED: No network detected — SOS stored safely in Device IndexedDB and will auto-sync!'
    );
  }

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>

        {/* LEFT: CITIZEN SOS REPORTING FORM */}
        <div className="sky-card" style={{ padding: 28, border: '2px solid #FFB74D' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <h1 style={{ fontSize: 25, fontWeight: 800, color: '#1C1917' }}>Report Emergency SOS</h1>
            <span
              className="animate-alert-jump font-mono-tech"
              style={{ background: '#DC2626', color: '#FFFFFF', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}
            >
              ● OFFLINE-CAPABLE BEACON
            </span>
          </div>

          <p style={{ fontSize: 13.5, color: '#44403C', marginBottom: 16 }}>
            Select an emergency preset below, verify your GPS pin on the map, and broadcast immediately.
          </p>

          {/* Quick One-Tap Emergency Presets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => applyPreset('flood', 'boat', 4)}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                border: type === 'flood' ? '2px solid #E65100' : '1.5px solid #FFB74D',
                background: type === 'flood' ? '#FFE0B2' : '#FFF3E0',
                fontWeight: 800,
                fontSize: 12,
                color: '#1C1917',
                cursor: 'pointer',
              }}
            >
              🌊 Flash Flood
            </button>
            <button
              type="button"
              onClick={() => applyPreset('medical', 'medical', 5)}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                border: type === 'medical' ? '2px solid #DC2626' : '1.5px solid #FFB74D',
                background: type === 'medical' ? '#FEE2E2' : '#FFF3E0',
                fontWeight: 800,
                fontSize: 12,
                color: '#1C1917',
                cursor: 'pointer',
              }}
            >
              🚑 Medical SOS
            </button>
            <button
              type="button"
              onClick={() => applyPreset('trapped', 'general', 5)}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                border: type === 'trapped' ? '2px solid #E65100' : '1.5px solid #FFB74D',
                background: type === 'trapped' ? '#FFE0B2' : '#FFF3E0',
                fontWeight: 800,
                fontSize: 12,
                color: '#1C1917',
                cursor: 'pointer',
              }}
            >
              🏚️ Trapped / Collapse
            </button>
          </div>

          {/* GPS Bar + Map */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="font-mono-tech" style={{ fontSize: 12, fontWeight: 700, color: '#44403C' }}>
              PIN: {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
            </span>
            <button
              type="button"
              onClick={detectMyGPS}
              className="font-mono-tech"
              style={{
                background: '#1C1917',
                color: '#FFB74D',
                border: 'none',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {gpsLoading ? 'Locating...' : '📍 Use My Live GPS'}
            </button>
          </div>

          <div style={{ height: 210, marginBottom: 18, border: '2px solid #FFB74D', borderRadius: 12, overflow: 'hidden' }}>
            <MapContainer center={pos} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker pos={pos} setPos={setPos} />
            </MapContainer>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="font-mono-tech" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#44403C', marginBottom: 5 }}>
                  INCIDENT CATEGORY
                </label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
                  <option value="flood">Flash Flood / Waterlogged</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="trapped">Building Collapse / Trapped</option>
                </select>
              </div>

              <div>
                <label className="font-mono-tech" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#44403C', marginBottom: 5 }}>
                  RESCUE UNIT NEEDED
                </label>
                <select value={need} onChange={(e) => setNeed(e.target.value)} style={{ width: '100%' }}>
                  <option value="boat">Rescue Boat</option>
                  <option value="medical">Ambulance / Paramedics</option>
                  <option value="general">General Rescue Squad</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="font-mono-tech" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#44403C', marginBottom: 5 }}>
                  URGENCY LEVEL (1–5)
                </label>
                <input type="number" min="1" max="5" value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label className="font-mono-tech" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#44403C', marginBottom: 5 }}>
                  PEOPLE AT LOCATION
                </label>
                <input type="number" min="1" max="100" value={people} onChange={(e) => setPeople(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <label className="font-mono-tech" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#44403C', marginBottom: 5 }}>
                NEAREST LANDMARK / FLOOR (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g., 2nd Floor, Near Metro Pillar 42"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 700, color: '#1C1917', cursor: 'pointer', background: '#FFF3E0', padding: '10px 14px', borderRadius: 10, border: '1px solid #FFB74D' }}>
              <input type="checkbox" checked={vulnerable} onChange={(e) => setVulnerable(e.target.checked)} />
              Children, elderly, or injured individuals present (+15 Priority)
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
                marginTop: 16,
                padding: '14px 16px',
                borderRadius: 12,
                background: status.includes('CONFIRMED') ? '#DCFCE7' : '#FEF3C7',
                border: `2px solid ${status.includes('CONFIRMED') ? '#16A34A' : '#E65100'}`,
                color: status.includes('CONFIRMED') ? '#14532D' : '#9A3412',
                fontWeight: 800,
                fontSize: 13.5,
              }}
            >
              {status}
            </div>
          )}

          <button
            type="button"
            onClick={flushQueue}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '10px',
              background: '#FFE0B2',
              color: '#1C1917',
              border: '1.5px solid #FFB74D',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Sync Offline IndexedDB Queue Now
          </button>
        </div>

        {/* RIGHT: LIVE PUBLIC DISPATCH FEED & SAFETY STATUS */}
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="sky-card" style={{ padding: 24, background: '#FFE0B2', border: '2px solid #FFB74D' }}>
            <span className="font-mono-tech" style={{ fontSize: 11, fontWeight: 800, color: '#E65100' }}>
              HOW YOUR SOS IS PROTECTED
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1C1917', marginTop: 4, marginBottom: 10 }}>
              Zero-Packet-Loss Edge Routing
            </h3>
            <ul style={{ display: 'grid', gap: 10, fontSize: 13.5, color: '#44403C', paddingLeft: 18, lineHeight: 1.5 }}>
              <li><b>If internet drops:</b> Your SOS is saved locally in IndexedDB and uploaded automatically once signal returns.</li>
              <li><b>Neighbor clustering:</b> Multiple alerts within 110m merge automatically at the Fog Node to boost rescue priority.</li>
              <li><b>Instant triage:</b> Medical &amp; vulnerable citizen alerts are pushed to the top of Command Dispatch.</li>
            </ul>
          </div>

          <div className="sky-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>Live Dispatch Status Board</h3>
              <span className="font-mono-tech" style={{ fontSize: 11, fontWeight: 800, color: '#16A34A' }}>● REAL-TIME SYNC</span>
            </div>

            {liveIncidents.length === 0 ? (
              <p style={{ fontSize: 13.5, color: '#44403C' }}>
                All reported incidents in your sector are currently resolved. Submit an SOS on the left to test live dispatch.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {liveIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: inc.status === 'assigned' ? '#DCFCE7' : '#FEE2E2',
                      borderLeft: `4px solid ${inc.status === 'assigned' ? '#16A34A' : '#DC2626'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1C1917', textTransform: 'uppercase' }}>
                        {inc.type} • {inc.people} People
                      </div>
                      <div style={{ fontSize: 12, color: '#44403C', marginTop: 2 }}>
                        {inc.status === 'assigned'
                          ? `Rescue Team Dispatched • ETA ${inc.etaMin || 6} mins`
                          : 'Awaiting Rescue Unit Assignment'}
                      </div>
                    </div>
                    <span
                      className="font-mono-tech"
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: inc.status === 'assigned' ? '#16A34A' : '#DC2626',
                        color: '#FFFFFF',
                      }}
                    >
                      {inc.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}