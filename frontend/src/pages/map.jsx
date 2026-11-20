import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const LB = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function MapPage() {
  const [sos, setSos] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'sos'), where('status', 'in', ['open', 'assigned'])), (s) =>
      setSos(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.priority || 0) - (a.priority || 0)))
    );
    const u2 = onSnapshot(collection(db, 'shelters'), (s) =>
      setShelters(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const u3 = onSnapshot(collection(db, 'teams'), (s) =>
      setTeams(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { u1(); u2(); u3(); };
  }, []);

  async function runAllocation() {
    setAllocating(true);
    try {
      await fetch(LB + '/api/allocate', { method: 'POST' });
    } finally {
      setAllocating(false);
    }
  }

  async function resolveSOS(id) {
    await fetch(`${LB}/api/sos/${id}/resolve`, { method: 'POST' });
  }

  const openCount = sos.filter((s) => s.status === 'open').length;
  const assignedCount = sos.filter((s) => s.status === 'assigned').length;
  const freeTeams = teams.filter((t) => t.status === 'free').length;
  const totalFreeBeds = shelters.reduce((sum, sh) => sum + (sh.bedsFree || 0), 0);

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1360, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C1917', marginBottom: 4 }}>Live Disaster Command Center</h1>
          <p style={{ fontSize: 14, color: '#44403C' }}>Real-time Firestore telemetry &amp; priority heuristic resource dispatch</p>
        </div>
        <button
          onClick={runAllocation}
          disabled={allocating || openCount === 0 || freeTeams === 0}
          style={{
            background: '#E65100',
            color: '#FFFFFF',
            padding: '13px 22px',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(230, 81, 0, 0.32)',
          }}
        >
          {allocating ? 'Running Dispatch Algorithm...' : 'Run Priority Auto-Allocation →'}
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label="CRITICAL OPEN SOS" value={openCount} color="#DC2626" highlight />
        <StatCard label="ACTIVE RESCUE MISSIONS" value={assignedCount} color="#E65100" />
        <StatCard label="AVAILABLE RESCUE UNITS" value={`${freeTeams} / ${teams.length}`} color="#16A34A" />
        <StatCard label="SHELTER BEDS AVAILABLE" value={totalFreeBeds} color="#1C1917" />
      </div>

      {/* Tactical Map */}
      <div style={{ position: 'relative', height: '54vh', borderRadius: 18, overflow: 'hidden', border: '2px solid #FFB74D', boxShadow: '0 14px 30px rgba(28, 25, 23, 0.12)', marginBottom: 24 }}>
        <MapContainer center={[28.62, 77.21]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

          {sos.map((s) => {
            const color = s.priority > 60 ? '#DC2626' : s.priority > 40 ? '#E65100' : '#D97706';
            const assignedTeam = teams.find((t) => t.id === s.teamId);
            return (
              <div key={s.id}>
                <CircleMarker center={[s.lat, s.lng]} radius={Math.min(18, 7 + (s.people || 1))} pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}>
                  <Popup>
                    <div style={{ lineHeight: 1.5, color: '#1C1917' }}>
                      <strong style={{ color: '#DC2626' }}>SOS: {s.type?.toUpperCase()}</strong><br />
                      Priority Score: <b>{s.priority}</b><br />
                      Stranded: <b>{s.people} people</b> (Merged: {s.reportCount})<br />
                      Status: <b>{s.status.toUpperCase()}</b> {s.etaMin ? `• ETA ${s.etaMin}m` : ''}
                    </div>
                  </Popup>
                </CircleMarker>
                {assignedTeam && (
                  <Polyline positions={[[assignedTeam.lat, assignedTeam.lng], [s.lat, s.lng]]} pathOptions={{ color: '#16A34A', weight: 3, dashArray: '8, 6' }} />
                )}
              </div>
            );
          })}

          {shelters.map((sh) => (
            <CircleMarker key={sh.id} center={[sh.lat, sh.lng]} radius={9} pathOptions={{ color: '#E65100', fillColor: '#FFB74D', fillOpacity: 0.95, weight: 2 }}>
              <Popup>
                <div style={{ lineHeight: 1.5, color: '#1C1917' }}>
                  <strong style={{ color: '#E65100' }}>{sh.name}</strong><br />
                  Beds Free: <b>{sh.bedsFree} / {sh.bedsTotal}</b><br />
                  Food Packs: <b>{sh.foodPacks}</b>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {teams.map((t) => (
            <CircleMarker key={t.id} center={[t.lat, t.lng]} radius={8} pathOptions={{ color: t.status === 'free' ? '#16A34A' : '#78716C', fillColor: t.status === 'free' ? '#22C55E' : '#A8A29E', fillOpacity: 0.95, weight: 2 }}>
              <Popup>
                <div style={{ lineHeight: 1.5, color: '#1C1917' }}>
                  <strong style={{ color: '#16A34A' }}>{t.name}</strong><br />
                  Skills: {t.skills?.join(', ')}<br />
                  Status: <b>{t.status.toUpperCase()}</b>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        <div className="font-mono-tech" style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 999, background: 'rgba(255, 243, 224, 0.95)', border: '1.5px solid #FFB74D', borderRadius: 10, padding: '8px 14px', fontSize: 11.5, fontWeight: 700, color: '#1C1917', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span><b style={{ color: '#DC2626' }}>●</b> High Priority SOS</span>
          <span><b style={{ color: '#E65100' }}>●</b> Relief Shelter</span>
          <span><b style={{ color: '#16A34A' }}>●</b> Free Rescue Unit</span>
          <span><b style={{ color: '#16A34A' }}>---</b> Dispatch Route</span>
        </div>
      </div>

      {/* Live Priority Triage Table */}
      <div className="sky-card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1917', marginBottom: 14 }}>Live Priority Triage &amp; Active Rescue Missions</h3>
        {sos.length === 0 ? (
          <p style={{ fontSize: 13.5, color: '#44403C' }}>No active SOS alerts. Broadcast one from Citizen SOS or run a Disaster Surge in Cloud &amp; Fog Infra.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, textAlign: 'left' }}>
              <thead>
                <tr className="font-mono-tech" style={{ borderBottom: '2px solid #FFE0B2', color: '#78716C', fontSize: 11.5 }}>
                  <th style={{ padding: '10px 8px' }}>PRIORITY</th>
                  <th style={{ padding: '10px 8px' }}>INCIDENT TYPE</th>
                  <th style={{ padding: '10px 8px' }}>STRANDED</th>
                  <th style={{ padding: '10px 8px' }}>FOG MERGED</th>
                  <th style={{ padding: '10px 8px' }}>DISPATCHED UNIT</th>
                  <th style={{ padding: '10px 8px' }}>STATUS</th>
                  <th style={{ padding: '10px 8px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {sos.map((s) => {
                  const team = teams.find((t) => t.id === s.teamId);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #FFF3E0' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 800, color: s.priority > 60 ? '#DC2626' : '#E65100' }}>
                        {s.priority} pts
                      </td>
                      <td style={{ padding: '12px 8px', textTransform: 'uppercase', fontWeight: 700 }}>{s.type}</td>
                      <td style={{ padding: '12px 8px' }}>{s.people} people</td>
                      <td className="font-mono-tech" style={{ padding: '12px 8px', color: '#E65100', fontWeight: 700 }}>{s.reportCount || 1}x pings</td>
                      <td style={{ padding: '12px 8px' }}>{team ? `${team.name} (ETA ${s.etaMin}m)` : 'Awaiting Dispatch'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          className={s.status === 'open' ? 'animate-alert-jump' : ''}
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 800,
                            background: s.status === 'assigned' ? '#FFE0B2' : '#FEE2E2',
                            color: s.status === 'assigned' ? '#E65100' : '#DC2626',
                          }}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          onClick={() => resolveSOS(s.id)}
                          style={{ padding: '7px 14px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                        >
                          Mark Rescued
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, highlight }) {
  return (
    <div
      className={`sky-card ${highlight ? 'animate-alert-pop' : ''}`}
      style={{
        padding: '16px 20px',
        background: highlight ? '#FEE2E2' : '#FFFFFF',
        borderColor: highlight ? '#DC2626' : 'rgba(230, 81, 0, 0.2)',
      }}
    >
      <div className="font-mono-tech" style={{ fontSize: 11, fontWeight: 800, color: '#44403C' }}>{label}</div>
      <div className="font-display" style={{ fontSize: 30, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}