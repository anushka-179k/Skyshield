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

  async function triggerCloudAutoScale() {
    setStressTesting(true);
    const endTime = Date.now() + 12000;
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
    <div style={{ maxWidth: 1200, margin: '28px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C1917', marginBottom: 4 }}>Cloud &amp; Fog Infrastructure Telemetry</h1>
      <p style={{ fontSize: 14, color: '#44403C', marginBottom: 22 }}>
        Live edge deduplication, horizontal auto-scaling, dynamic load balancing, and self-healing control plane
      </p>

      {/* TIER 1: LOAD BALANCER & AUTO-SCALER */}
      <div className="sky-card" style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>Layer-7 Load Balancer &amp; Elastic Auto-Scaler (Port 4000)</h3>
            <p className="font-mono-tech" style={{ fontSize: 12.5, color: '#44403C', marginTop: 4 }}>
              Policy: <b style={{ color: '#E65100' }}>{lbStats.mode.toUpperCase()}</b> &nbsp;|&nbsp;
              Throughput: <b style={{ color: '#16A34A' }}>{lbStats.rps.toFixed(1)} req/sec</b> &nbsp;|&nbsp;
              Instances: <b style={{ color: '#1C1917' }}>{lbStats.nodes.length} / 5</b>
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              onClick={triggerCloudAutoScale}
              disabled={stressTesting}
              style={{ padding: '9px 15px', background: '#E65100', color: '#FFFFFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
            >
              {stressTesting ? 'Spiking Traffic...' : 'Trigger Auto-Scale Spike (12s)'}
            </button>
            <button onClick={() => switchMode('roundrobin')} style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #FFB74D', background: lbStats.mode === 'roundrobin' ? '#FFE0B2' : '#FFF3E0', color: '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              Round Robin
            </button>
            <button onClick={() => switchMode('leastconn')} style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #FFB74D', background: lbStats.mode === 'leastconn' ? '#FFE0B2' : '#FFF3E0', color: '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              Least Connections
            </button>
            <button onClick={killNode} className="animate-alert-jump" style={{ padding: '9px 15px', background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: 13 }}>
              Kill Node (Failover Test)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {lbStats.nodes.map((n) => (
            <div
              key={n.port}
              style={{
                padding: 16,
                borderRadius: 12,
                background: n.healthy ? '#DCFCE7' : '#FEE2E2',
                border: `2px solid ${n.healthy ? '#16A34A' : '#DC2626'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="font-mono-tech" style={{ fontWeight: 800, fontSize: 15, color: '#1C1917' }}>api-{n.port}</span>
                <span className="font-mono-tech" style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: n.healthy ? '#16A34A' : '#DC2626', color: '#FFFFFF' }}>
                  {n.healthy ? 'HEALTHY' : 'CRASHED'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#1C1917' }}>Active Connections: <b>{n.active}</b></div>
              <div style={{ fontSize: 13, color: '#1C1917' }}>Total Served: <b>{n.served}</b></div>
            </div>
          ))}
        </div>
      </div>

      {/* TIER 2: EDGE FOG NODE */}
      <div className="sky-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>Edge Fog Gateway &amp; Deduplicator (Port 5000)</h3>
            <p className="font-mono-tech" style={{ fontSize: 12.5, color: '#44403C', marginTop: 4 }}>
              Cloud Uplink:{' '}
              <b style={{ color: fogStats.offline ? '#DC2626' : '#16A34A' }}>
                {fogStats.offline ? 'SEVERED (BUFFERING IN EDGE RAM)' : 'CONNECTED & SYNCING'}
              </b>
              &nbsp;|&nbsp; Bandwidth Saved: <b style={{ color: '#E65100' }}>{savedPercent}%</b>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={simulateSurge} disabled={simulatingFog} style={{ padding: '10px 16px', background: '#E65100', color: '#FFFFFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              {simulatingFog ? 'Flooding 60 Pings...' : 'Simulate 60-Ping Disaster Surge'}
            </button>
            <button onClick={toggleFogLink} style={{ padding: '10px 16px', background: fogStats.offline ? '#16A34A' : '#1C1917', color: '#FFB74D', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              {fogStats.offline ? 'Restore Cloud Uplink' : 'Cut Cloud Link (Offline Mode)'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <FogMetric label="RAW CITIZEN PINGS" value={fogStats.stats.received} color="#1C1917" />
          <FogMetric label="DEDUPLICATED SENT" value={fogStats.stats.forwarded} color="#E65100" />
          <FogMetric label="QUEUED IN FOG RAM" value={fogStats.pending} color="#DC2626" />
          <FogMetric label="CLOUD BATCHES" value={fogStats.stats.batches} color="#16A34A" />
        </div>
      </div>
    </div>
  );
}

function FogMetric({ label, value, color }) {
  return (
    <div style={{ background: '#FFF3E0', border: '1.5px solid #FFB74D', borderRadius: 12, padding: '14px 18px' }}>
      <div className="font-mono-tech" style={{ fontSize: 11, color: '#44403C', fontWeight: 800 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}