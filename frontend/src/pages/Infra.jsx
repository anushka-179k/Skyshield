import { useEffect, useState } from 'react';

const LB = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const FOG = import.meta.env.VITE_FOG_URL || 'http://localhost:5000';

export default function Infra() {
  const [lbStats, setLbStats] = useState({ mode: 'leastconn', rps: 0, nodes: [] });
  const [fogStats, setFogStats] = useState({ stats: { received: 0, forwarded: 0, batches: 0, cloudUp: true }, pending: 0, offline: false });
  const [simulatingFog, setSimulatingFog] = useState(false);
  const [stressTesting, setStressTesting] = useState(false);

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
    }, 800);
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

  // Trigger Cloud Auto-Scaler (Fires continuous concurrent requests to push RPS > threshold)
  async function triggerCloudAutoScale() {
    setStressTesting(true);
    const endTime = Date.now() + 12000; // 12-second burst
    const workers = Array.from({ length: 15 }, async () => {
      while (Date.now() < endTime) {
        try {
          await fetch(`${LB}/api/ping`);
        } catch {}
      }
    });
    await Promise.all(workers);
    setStressTesting(false);
  }

  // Trigger Fog Edge Deduplication Surge
  async function simulateSurge() {
    setSimulatingFog(true);
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
    setSimulatingFog(false);
  }

  const savedPercent =
    fogStats.stats.received > 0
      ? Math.max(0, Math.round(((fogStats.stats.received - fogStats.stats.forwarded) / fogStats.stats.received) * 100))
      : 0;

  return (
    <div style={{ maxWidth: 1120, margin: '24px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Cloud & Fog Infrastructure Telemetry</h1>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
        Live edge deduplication, horizontal auto-scaling, dynamic load balancing, and self-healing control plane
      </p>

      {/* TIER 1: LOAD BALANCER & AUTO-SCALER */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Layer-7 Load Balancer & Elastic Auto-Scaler (Port 4000)</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Policy: <b style={{ color: '#38bdf8' }}>{lbStats.mode.toUpperCase()}</b> &nbsp;|&nbsp;
              Live Throughput: <b style={{ color: '#4ade80' }}>{lbStats.rps.toFixed(1)} req/sec</b> &nbsp;|&nbsp;
              Active Cloud Instances: <b style={{ color: '#f8fafc' }}>{lbStats.nodes.length} / 5</b>
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              onClick={triggerCloudAutoScale}
              disabled={stressTesting}
              style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #2563eb, #0284c7)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              {stressTesting ? 'Spiking Traffic (Watch Nodes Scale)...' : 'Trigger Auto-Scale Spike (12s)'}
            </button>
            <button onClick={() => switchMode('roundrobin')} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: lbStats.mode === 'roundrobin' ? '#0284c7' : '#1e293b', color: 'white', cursor: 'pointer', fontSize: 13 }}>
              Round Robin
            </button>
            <button onClick={() => switchMode('leastconn')} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: lbStats.mode === 'leastconn' ? '#0284c7' : '#1e293b', color: 'white', cursor: 'pointer', fontSize: 13 }}>
              Least Connections
            </button>
            <button onClick={killNode} style={{ padding: '8px 14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              Kill Node (Failover Test)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 12 }}>
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
                  {n.healthy ? 'HEALTHY' : 'CRASHED'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>Active Connections: <b>{n.active}</b></div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>Total Served: <b>{n.served}</b></div>
            </div>
          ))}
        </div>
      </div>

      {/* TIER 2: EDGE FOG NODE */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Edge Fog Gateway & Deduplicator (Port 5000)</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Cloud Uplink:{' '}
              <b style={{ color: fogStats.offline ? '#f87171' : '#4ade80' }}>
                {fogStats.offline ? 'SEVERED (BUFFERING IN EDGE RAM)' : 'CONNECTED & SYNCING'}
              </b>
              &nbsp;|&nbsp; Bandwidth Saved: <b style={{ color: '#c084fc' }}>{savedPercent}%</b>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={simulateSurge} disabled={simulatingFog} style={{ padding: '9px 14px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {simulatingFog ? 'Flooding 60 Pings...' : 'Simulate 60-Ping Disaster Surge'}
            </button>
            <button onClick={toggleFogLink} style={{ padding: '9px 14px', background: fogStats.offline ? '#16a34a' : '#d97706', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {fogStats.offline ? 'Restore Cloud Uplink' : 'Cut Cloud Link (Offline Mode)'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <FogMetric label="RAW CITIZEN PINGS" value={fogStats.stats.received} color="#f8fafc" />
          <FogMetric label="DEDUPLICATED SENT" value={fogStats.stats.forwarded} color="#38bdf8" />
          <FogMetric label="QUEUED IN FOG RAM" value={fogStats.pending} color="#fbbf24" />
          <FogMetric label="CLOUD BATCHES" value={fogStats.stats.batches} color="#4ade80" />
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