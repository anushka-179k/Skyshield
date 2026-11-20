import { useEffect, useState } from 'react';

const LB = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Shelters() {
  const [shelters, setShelters] = useState([]);
  const [cacheStatus, setCacheStatus] = useState('—');
  const [latencyMs, setLatencyMs] = useState(0);
  const [servedBy, setServedBy] = useState('—');
  const [loading, setLoading] = useState(false);

  async function fetchShelters() {
    setLoading(true);
    const t0 = performance.now();
    try {
      const res = await fetch(`${LB}/api/shelters`);
      const data = await res.json();
      const t1 = performance.now();
      setShelters(data);
      setCacheStatus(res.headers.get('X-Cache') || 'MISS');
      setServedBy(res.headers.get('X-Instance') || 'api-4001');
      setLatencyMs(Math.round(t1 - t0));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShelters();
  }, []);

  async function admitVictims(sh) {
    const nextBeds = Math.max(0, sh.bedsFree - 5);
    const nextFood = Math.max(0, sh.foodPacks - 10);
    await fetch(`${LB}/api/shelters/${sh.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bedsFree: nextBeds, foodPacks: nextFood }),
    });
    fetchShelters(); // Next fetch will show CACHE MISS because PATCH invalidated Redis!
  }

  async function restockShelter(sh) {
    await fetch(`${LB}/api/shelters/${sh.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bedsFree: sh.bedsTotal, foodPacks: sh.foodPacks + 100 }),
    });
    fetchShelters();
  }

  return (
    <div style={{ maxWidth: 1120, margin: '24px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Relief Shelter Inventory & Redis Cache Layer</h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            Cache-Aside pattern with 15s TTL & automatic cache invalidation on writes
          </p>
        </div>

        <button
          onClick={fetchShelters}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: 'white', padding: '10px 18px', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          {loading ? 'Querying...' : 'Refresh Shelters (Test Redis Cache)'}
        </button>
      </div>

      {/* LIVE REDIS TELEMETRY BANNER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        <div style={{ background: '#0f172a', border: `1px solid ${cacheStatus === 'HIT' ? '#22c55e' : '#f59e0b'}`, borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>UPSTASH REDIS CACHE STATUS</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: cacheStatus === 'HIT' ? '#4ade80' : '#fbbf24', marginTop: 4 }}>
            {cacheStatus === 'HIT' ? 'CACHE HIT (IN-MEMORY)' : 'CACHE MISS (FIRESTORE DB)'}
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>ROUND-TRIP API LATENCY</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>{latencyMs} ms</div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>SERVED BY CLOUD WORKER</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#c084fc', marginTop: 4 }}>{servedBy}</div>
        </div>
      </div>

      {/* SHELTER CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {shelters.map((sh) => {
          const pct = Math.round((sh.bedsFree / (sh.bedsTotal || 1)) * 100);
          return (
            <div key={sh.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{sh.name}</h3>
                <span style={{ fontSize: 11, background: '#1e293b', color: '#38bdf8', padding: '3px 8px', borderRadius: 99, fontWeight: 600 }}>
                  {pct}% Free
                </span>
              </div>

              <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 6 }}>
                Available Beds: <b>{sh.bedsFree} / {sh.bedsTotal}</b>
              </div>
              <div style={{ height: 8, background: '#1e293b', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct > 30 ? '#22c55e' : '#ef4444' }} />
              </div>

              <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 14 }}>
                Emergency Food Rations: <b>{sh.foodPacks} packs</b>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => admitVictims(sh)}
                  style={{ flex: 1, padding: '8px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Admit 5 Evacuees
                </button>
                <button
                  onClick={() => restockShelter(sh)}
                  style={{ flex: 1, padding: '8px', background: 'rgba(22, 163, 74, 0.18)', color: '#4ade80', border: '1px solid #22c55e', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Restock Supplies
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}