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
    <div style={{ padding: '20px 28px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header + Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Live Disaster Command Center</h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Real-time Firestore telemetry & priority heuristic resource dispatch</p>
        </div>
        <button
          onClick={runAllocation}
          disabled={allocating || openCount === 0 || freeTeams === 0}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #0284c7)',
            color: 'white',
            padding: '12px 22px',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
          }}
        >
          {allocating ? 'Running Dispatch Algorithm...' : 'Run Priority Auto-Allocation'}
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard label="CRITICAL OPEN SOS" value={openCount} color="#f87171" />
        <StatCard label="ACTIVE RESCUE MISSIONS" value={assignedCount} color="#38bdf8" />
        <StatCard label="AVAILABLE RESCUE UNITS" value={`${freeTeams} / ${teams.length}`} color="#4ade80" />
        <StatCard label="SHELTER BEDS AVAILABLE" value={totalFreeBeds} color="#c084fc" />
      </div>

      {/* Tactical Map + Legend */}
      <div style={{ position: 'relative', height: '56vh', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', marginBottom: 22 }}>
        <MapContainer center={[28.62, 77.21]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

          {sos.map((s) => {
            const color = s.priority > 60 ? '#ef4444' : s.priority > 40 ? '#f97316' : '#eab308';
            const assignedTeam = teams.find((t) => t.id === s.teamId);
            return (
              <div key={s.id}>
                <CircleMarker center={[s.lat, s.lng]} radius={Math.min(18, 7 + (s.people || 1))} pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}>
                  <Popup>
                    <div style={{ lineHeight: 1.5 }}>
                      <strong style={{ color: '#f87171' }}>SOS: {s.type?.toUpperCase()}</strong><br />
                      Priority Score: <b>{s.priority}</b><br />
                      Stranded: <b>{s.people} people</b> (Merged: {s.reportCount})<br />
                      Status: <b>{s.status.toUpperCase()}</b> {s.etaMin ? `• ETA ${s.etaMin}m` : ''}
                    </div>
                  </Popup>
                </CircleMarker>
                {assignedTeam && (
                  <Polyline positions={[[assignedTeam.lat, assignedTeam.lng], [s.lat, s.lng]]} pathOptions={{ color: '#22c55e', weight: 3, dashArray: '8, 6' }} />
                )}
              </div>
            );
          })}

          {shelters.map((sh) => (
            <CircleMarker key={sh.id} center={[sh.lat, sh.lng]} radius={9} pathOptions={{ color: '#38bdf8', fillColor: '#0284c7', fillOpacity: 0.9, weight: 2 }}>
              <Popup>
                <div style={{ lineHeight: 1.5 }}>
                  <strong style={{ color: '#38bdf8' }}>{sh.name}</strong><br />
                  Beds Free: <b>{sh.bedsFree} / {sh.bedsTotal}</b><br />
                  Food Packs: <b>{sh.foodPacks}</b>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {teams.map((t) => (
            <CircleMarker key={t.id} center={[t.lat, t.lng]} radius={8} pathOptions={{ color: t.status === 'free' ? '#4ade80' : '#94a3b8', fillColor: t.status === 'free' ? '#16a34a' : '#475569', fillOpacity: 0.95, weight: 2 }}>
              <Popup>
                <div style={{ lineHeight: 1.5 }}>
                  <strong style={{ color: '#4ade80' }}>{t.name}</strong><br />
                  Skills: {t.skills?.join(', ')}<br />
                  Status: <b>{t.status.toUpperCase()}</b>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 999, background: 'rgba(15, 23, 42, 0.92)', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', fontSize: 12, display: 'flex', gap: 16 }}>
          <span><b style={{ color: '#ef4444' }}>●</b> High Priority SOS</span>
          <span><b style={{ color: '#38bdf8' }}>●</b> Relief Shelter</span>
          <span><b style={{ color: '#4ade80' }}>●</b> Free Rescue Unit</span>
          <span><b style={{ color: '#22c55e' }}>---</b> Active Dispatch Route</span>
        </div>
      </div>

      {/* LIVE PRIORITY TRIAGE & MISSION CONTROL TABLE */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Live Priority Triage & Active Rescue Missions</h3>
        {sos.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94a3b8' }}>No active SOS alerts. Broadcast one from Citizen SOS or run a Disaster Surge in Cloud & Fog Infra.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
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
                    <tr key={s.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: s.priority > 60 ? '#f87171' : '#fbbf24' }}>
                        {s.priority} pts
                      </td>
                      <td style={{ padding: '10px 8px', textTransform: 'uppercase', fontWeight: 600 }}>{s.type}</td>
                      <td style={{ padding: '10px 8px' }}>{s.people} people</td>
                      <td style={{ padding: '10px 8px', color: '#38bdf8' }}>{s.reportCount || 1}x pings</td>
                      <td style={{ padding: '10px 8px' }}>{team ? `${team.name} (ETA ${s.etaMin}m)` : 'Awaiting Dispatch'}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: s.status === 'assigned' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: s.status === 'assigned' ? '#38bdf8' : '#f87171' }}>
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <button
                          onClick={() => resolveSOS(s.id)}
                          style={{ padding: '6px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
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

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}