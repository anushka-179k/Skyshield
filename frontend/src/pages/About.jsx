import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* HERO SECTION */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 32,
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          border: '1px solid #312e81',
          borderRadius: 16,
          padding: '36px 40px',
          marginBottom: 32,
          boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '4px 12px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.6px',
              marginBottom: 14,
            }}
          >
            CCSA CAPSTONE • HYBRID FOG-CLOUD ARCHITECTURE
          </span>
          <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 14, color: '#f8fafc' }}>
            Resilient Disaster Response at <span style={{ color: '#38bdf8' }}>Edge & Cloud Scale</span>
          </h1>
          <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.65, marginBottom: 24 }}>
            During urban floods and earthquakes, thousands of simultaneous SOS alerts overwhelm centralized servers while damaged cell towers drop connections. <b>SkyShield</b> combines an offline-capable <b>Edge Fog Gateway</b> with an <b>Elastic Auto-Scaling Cloud Backend</b> to guarantee zero packet loss and sub-second rescue dispatch.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/map"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #0284c7)',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 22px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              Launch Command Map →
            </Link>
            <Link
              to="/infra"
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                textDecoration: 'none',
                padding: '12px 22px',
                borderRadius: 8,
                border: '1px solid #334155',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Inspect Cloud & Fog Infra
            </Link>
          </div>
        </div>

        {/* HERO VISUAL CARD */}
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #334155' }}>
          <img
            src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80"
            alt="Urban Flood Emergency Response"
            style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(11, 17, 32, 0.95))',
              padding: '24px 18px 14px',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>● ACTIVE GRID: NEW DELHI NCR</div>
            <div style={{ fontSize: 13, color: '#e2e8f0', marginTop: 2 }}>
              6 Relief Shelters • 6 Rapid Rescue Units • Real-Time Firestore Sync
            </div>
          </div>
        </div>
      </div>

      {/* 3-TIER ARCHITECTURE FLOW */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>How SkyShield Works (3-Tier Cloud-Edge Pipeline)</h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 18 }}>
        End-to-end distributed architecture engineered for high availability, low latency, and bandwidth efficiency
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 32 }}>
        <TierCard
          tier="TIER 01 • EDGE & OFFLINE CLIENT"
          title="Fog Gateway & Spatial Deduplicator"
          img="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80"
          desc="Citizens submit SOS pins via React + IndexedDB offline storage. The local Fog Node merges duplicate pings within a ~110m radius and buffers packets in RAM if cloud uplink drops—cutting cloud ingress bandwidth by up to 85%."
          accent="#c084fc"
        />
        <TierCard
          tier="TIER 02 • CLOUD ELASTIC COMPUTE"
          title="L7 Load Balancer & Auto-Scaler"
          img="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80"
          desc="A Layer-7 reverse proxy distributes traffic across worker nodes using Round-Robin or Least-Connections policies. Under flash-crowd spikes, it dynamically spawns up to 5 Node.js workers and auto-heals crashed instances."
          accent="#38bdf8"
        />
        <TierCard
          tier="TIER 03 • CLOUD DATA & DISPATCH"
          title="Redis Cache-Aside & Heuristic Matcher"
          img="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80"
          desc="Upstash Redis caches shelter capacity (TTL + sliding-window rate limiting) while Firebase Firestore streams live state to the Command Map, matching highest-priority SOS alerts to nearest capable rescue teams."
          accent="#4ade80"
        />
      </div>

      {/* CCSA SYLLABUS CONCEPTS MATRIX */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Cloud Computing (CCSA) Core Concepts Demonstrated</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <ConceptBadge title="Fog & Edge Computing" detail="Local pre-processing, spatial deduplication & store-and-forward buffering" />
          <ConceptBadge title="Horizontal Elasticity" detail="RPS-driven dynamic worker spawning & scale-down reclamation" />
          <ConceptBadge title="Static & Dynamic LB" detail="Runtime switching between Round-Robin & Least-Connections routing" />
          <ConceptBadge title="Distributed Caching" detail="Upstash Redis Cache-Aside (HIT/MISS) + 30 req/min rate limiting" />
          <ConceptBadge title="Fault Tolerance" detail="Active /api/health probes with automated crashed-node recovery" />
        </div>
      </div>
    </div>
  );
}

function TierCard({ tier, title, img, desc, accent }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <img src={img} alt={title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
      <div style={{ padding: 18, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.5px', marginBottom: 6 }}>{tier}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.55 }}>{desc}</p>
      </div>
    </div>
  );
}

function ConceptBadge({ title, detail }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid #38bdf8' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{detail}</div>
    </div>
  );
}