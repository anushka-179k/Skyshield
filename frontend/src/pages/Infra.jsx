import { useEffect, useState } from 'react';

const LB = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const FOG = import.meta.env.VITE_FOG_URL || 'http://localhost:5000';

export default function Infra() {
  const [lbStats, setLbStats] = useState({ mode: 'leastconn', rps: 0, nodes: [] });
  const [fogStats, setFogStats] = useState({ stats: { received: 0, forwarded: 0, batches: 0, cloudUp: true }, pending: 0, offline: false });
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r1 = await fetch(LB + '/lb/stats');
        if (r1.ok) setLbStats(await r1.json());
      } catch {}
      try {
        const r2 = await fetch(FOG + '/fog/stats');
        if (r2.ok) setFogStats(await r2.json());
      } catch {}
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const switchMode = (m) => fetch(`${LB}/lb/mode/${m}`);
  const killNode = () => fetch(`${LB}/lb/kill`);
  const toggleFogLink = () =>
    fetch(`${FOG}/fog/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offline: !fogStats.offline }),
    });

  async function simulateSurge() {
    setSimulating(true);
    const hotspots = [[28.65, 77.29], [28.58, 77.22], [28.62, 77.19]];
    const promises = Array.from({ length: 60 }, (_, i) => {
      const [la, ln] = hotspots[i % 3];
      return fetch(`${FOG}/fog/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: la + (Math.random() - 0.5) * 0.003,
          lng: ln + (Math.random() - 0.5) * 0.003,
          type: ['flood', 'medical', 'trapped'][i % 3],
          need: ['boat', 'medical', 'general'][i % 3],
          severity: 3 + (i % 3),
          people: 2 + (i % 5),
          vulnerable: i % 4 === 0,
        }),
      });
    });
    await Promise.all(promises);
    setSimulating(false);
  }

  return (
    <div style={{ maxWidth: 1050, margin: '24px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Cloud & Fog Infrastructure Telemetry</h1>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Live edge deduplication, dynamic load balancing, and fault-tolerance control plane</p>

      {/* LOAD BALANCER & AUTO-SCALER */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Load Balancer & Auto-Scaler (Port 4000)</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Routing Policy: <b style={{ color: '#38bdf8' }}>{lbStats.mode.toUpperCase()}</b> &nbsp;|&nbsp;
              Live Throughput: <b style={{ color: '#4ade80' }}>{lbStats.rps.toFixed(1)} req/sec</b> &nbsp;|&nbsp;
              Active Worker Nodes: <b style={{ color: '#f8fafc' }}>{lbStats.nodes.length}</b>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => switchMode('roundrobin')} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: lbStats.mode === 'roundrobin' ? '#0284c7' : '#1e293b', color: 'white', cursor: 'pointer', fontSize: 13 }}>
              Static: Round Robin
            </button>
            <button onClick={() => switchMode('leastconn')} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: lbStats.mode === 'leastconn' ? '#0284c7' : '#1e293b', color: 'white', cursor: 'pointer', fontSize: 13 }}>
              Dynamic: Least Connections
            </button>
            <button onClick={killNode} style={{ padding: '8px 14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              Kill Random Instance
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {lbStats.nodes.map((n) => (
            <div
              key={n.port}
              style={{
                padding: 14,
                borderRadius: 10,
                background: n.healthy ? 'rgba(22, 163, 74, 0.14)' : 'rgba(220, 38, 38, 0.16)',
                border: `1px solid ${n.healthy ? '#22c55e' : '#ef4444'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>api-{n.port}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: n.healthy ? '#16a34a' : '#dc2626', color: 'white' }}>
                  {n.healthy ? 'HEALTHY' : 'DOWN'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>Active Connections: <b>{n.active}</b></div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>Requests Served: <b>{n.served}</b></div>
            </div>
          ))}
        </div>
      </div>

      {/* EDGE FOG NODE */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Edge Fog Gateway (Port 5000)</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Cloud Uplink Status:{' '}
              <b style={{ color: fogStats.offline ? '#f87171' : '#4ade80' }}>
                {fogStats.offline ? 'DISCONNECTED (BUFFERING LOCALLY AT EDGE)' : 'CONNECTED & SYNCING'}
              </b>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={simulateSurge} disabled={simulating} style={{ padding: '9px 14px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {simulating ? 'Flooding 60 Pings...' : 'Simulate 60-Ping Disaster Surge'}
            </button>
            <button onClick={toggleFogLink} style={{ padding: '9px 14px', background: fogStats.offline ? '#16a34a' : '#d97706', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {fogStats.offline ? 'Restore Cloud Uplink' : 'Cut Cloud Link (Offline Mode)'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <FogMetric label="RAW PINGS RECEIVED" value={fogStats.stats.received} color="#f8fafc" />
          <FogMetric label="DEDUPLICATED FORWARDED" value={fogStats.stats.forwarded} color="#38bdf8" />
          <FogMetric label="BUFFERED IN FOG RAM" value={fogStats.pending} color="#fbbf24" />
          <FogMetric label="CLOUD BATCHES SENT" value={fogStats.stats.batches} color="#4ade80" />
        </div>
      </div>
    </div>
  );
}

function FogMetric({ label, value, color }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: '12px 16px' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}