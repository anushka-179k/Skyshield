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
      setSos(s.docs.map((d) => ({ id: d.id, ...d.data() })))
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
      <div style={{ position: 'relative', height: '68vh', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <MapContainer center={[28.62, 77.21]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

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

        {/* Floating Map Legend */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 999, background: 'rgba(15, 23, 42, 0.92)', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', fontSize: 12, display: 'flex', gap: 16 }}>
          <span><b style={{ color: '#ef4444' }}>●</b> High Priority SOS</span>
          <span><b style={{ color: '#38bdf8' }}>●</b> Relief Shelter</span>
          <span><b style={{ color: '#4ade80' }}>●</b> Free Rescue Unit</span>
          <span><b style={{ color: '#22c55e' }}>---</b> Active Dispatch Route</span>
        </div>
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