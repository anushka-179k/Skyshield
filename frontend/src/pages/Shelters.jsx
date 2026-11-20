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
    fetchShelters();
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
    <div style={{ maxWidth: 1200, margin: '28px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C1917', marginBottom: 4 }}>Relief Shelter Inventory &amp; Redis Cache</h1>
          <p style={{ fontSize: 14, color: '#44403C' }}>
            Cache-Aside pattern with 15s TTL &amp; automatic cache invalidation on writes
          </p>
        </div>

        <button
          onClick={fetchShelters}
          disabled={loading}
          style={{ background: '#E65100', color: '#FFFFFF', padding: '12px 20px', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', boxShadow: '0 6px 16px rgba(230, 81, 0, 0.25)' }}
        >
          {loading ? 'Querying...' : 'Refresh Shelters (Test Redis Cache)'}
        </button>
      </div>

      {/* Telemetry Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="sky-card" style={{ padding: '16px 20px', borderColor: cacheStatus === 'HIT' ? '#16A34A' : '#E65100' }}>
          <div className="font-mono-tech" style={{ fontSize: 11, fontWeight: 800, color: '#44403C' }}>UPSTASH REDIS CACHE STATUS</div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: cacheStatus === 'HIT' ? '#16A34A' : '#E65100', marginTop: 4 }}>
            {cacheStatus === 'HIT' ? 'CACHE HIT (IN-MEMORY)' : 'CACHE MISS (FIRESTORE DB)'}
          </div>
        </div>

        <div className="sky-card" style={{ padding: '16px 20px' }}>
          <div className="font-mono-tech" style={{ fontSize: 11, fontWeight: 800, color: '#44403C' }}>ROUND-TRIP API LATENCY</div>
          <div className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#1C1917', marginTop: 4 }}>{latencyMs} ms</div>
        </div>

        <div className="sky-card" style={{ padding: '16px 20px' }}>
          <div className="font-mono-tech" style={{ fontSize: 11, fontWeight: 800, color: '#44403C' }}>SERVED BY CLOUD WORKER</div>
          <div className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#E65100', marginTop: 4 }}>{servedBy}</div>
        </div>
      </div>

      {/* Shelter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {shelters.map((sh) => {
          const pct = Math.round((sh.bedsFree / (sh.bedsTotal || 1)) * 100);
          return (
            <div key={sh.id} className="sky-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1917' }}>{sh.name}</h3>
                <span className="font-mono-tech" style={{ fontSize: 11, background: '#FFE0B2', color: '#E65100', padding: '4px 10px', borderRadius: 99, fontWeight: 800 }}>
                  {pct}% Free
                </span>
              </div>

              <div style={{ fontSize: 13.5, color: '#44403C', marginBottom: 6 }}>
                Available Beds: <b>{sh.bedsFree} / {sh.bedsTotal}</b>
              </div>
              <div style={{ height: 9, background: '#FFE0B2', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct > 30 ? '#16A34A' : '#DC2626' }} />
              </div>

              <div style={{ fontSize: 13.5, color: '#44403C', marginBottom: 16 }}>
                Emergency Food Rations: <b>{sh.foodPacks} packs</b>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => admitVictims(sh)}
                  style={{ flex: 1, padding: '9px', background: '#FFF3E0', color: '#1C1917', border: '1.5px solid #FFB74D', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}
                >
                  Admit 5 Evacuees
                </button>
                <button
                  onClick={() => restockShelter(sh)}
                  style={{ flex: 1, padding: '9px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}
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