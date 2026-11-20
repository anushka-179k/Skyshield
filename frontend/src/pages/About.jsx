import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(target / 35));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 35);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function About() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-visible')),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal-item').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px' }}>
      {/* 1. SPLIT HERO SECTION WITH POPPING RED ALERT */}
      <div
        className="reveal-item"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 32,
          alignItems: 'center',
          background: '#FFE0B2',
          border: '2px solid #FFB74D',
          borderRadius: 24,
          padding: '38px 40px',
          marginBottom: 32,
          boxShadow: '0 20px 40px -15px rgba(230, 81, 0, 0.18)',
        }}
      >
        <div>
          <span
            className="font-mono-tech"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFF3E0',
              color: '#E65100',
              border: '1px solid #FFB74D',
              padding: '5px 14px',
              borderRadius: 99,
              fontSize: 11.5,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            <span className="live-dot-wrapper" style={{ width: 8, height: 8 }}>
              <span className="live-dot-ping" style={{ background: '#E65100' }} />
              <span className="live-dot-core" style={{ width: 8, height: 8, background: '#E65100' }} />
            </span>
            CCSA CAPSTONE • HYBRID FOG-CLOUD ARCHITECTURE
          </span>

          <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.12, marginBottom: 16, color: '#1C1917' }}>
            Resilient Disaster Response at{' '}
            <span style={{ color: '#E65100', textDecoration: 'underline', textDecorationColor: '#FFB74D', textUnderlineOffset: 6 }}>
              Edge &amp; Cloud Scale
            </span>
          </h1>

          <p style={{ fontSize: 15.5, color: '#44403C', lineHeight: 1.65, marginBottom: 26 }}>
            During urban floods and earthquakes, thousands of simultaneous SOS alerts overwhelm centralized servers while damaged cell towers drop connections. <b>SkyShield</b> combines an offline-capable <b>Edge Fog Gateway</b> with an <b>Elastic Auto-Scaling Cloud Backend</b> to guarantee zero packet loss and sub-second rescue dispatch.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/map"
              style={{
                background: '#E65100',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '13px 24px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14.5,
                boxShadow: '0 8px 20px rgba(230, 81, 0, 0.32)',
              }}
            >
              Launch Command Map →
            </Link>
            <Link
              to="/sos"
              className="animate-alert-jump"
              style={{
                background: '#DC2626',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '13px 22px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14.5,
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.32)',
              }}
            >
              ● Broadcast Emergency SOS
            </Link>
            <Link
              to="/team"
              style={{
                background: '#FFF3E0',
                color: '#1C1917',
                textDecoration: 'none',
                padding: '13px 20px',
                borderRadius: 12,
                border: '1.5px solid #FFB74D',
                fontWeight: 700,
                fontSize: 14.5,
              }}
            >
              Meet Our Team
            </Link>
          </div>
        </div>

        {/* HERO VISUAL + POPPING RED ALERT CARD */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Jumping & Popping Critical Red Alert Box */}
          <div
            className="animate-alert-pop"
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              padding: '16px 20px',
              borderRadius: 16,
              border: '2px solid #FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span
                className="font-mono-tech"
                style={{
                  background: '#991B1B',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ▲ CRITICAL PRIORITY • CODE RED
              </span>
              <span className="font-mono-tech" style={{ fontSize: 11, fontWeight: 700 }}>
                ACTIVE TELEMETRY
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              Spatial Deduplication &amp; Instant Dispatch Armed
            </div>
            <p style={{ fontSize: 12.5, color: '#FEE2E2', marginTop: 4 }}>
              Merges duplicate SOS pings within 110m at the Fog Edge and routes nearest rescue teams automatically.
            </p>
          </div>

          {/* Live Grid Image Card */}
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '2px solid #1C1917' }}>
            <img
              src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80"
              alt="Urban Flood Emergency Response"
              style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(28, 25, 23, 0.96))',
                padding: '28px 18px 14px',
              }}
            >
              <div className="font-mono-tech" style={{ fontSize: 12, fontWeight: 800, color: '#FFB74D' }}>
                ● ACTIVE GRID: NEW DELHI NCR
              </div>
              <div style={{ fontSize: 13, color: '#FFF3E0', marginTop: 2 }}>
                6 Relief Shelters • 6 Rapid Rescue Units • Real-Time Firestore Sync
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRUST & ANIMATED NUMBER COUNTERS BAR */}
      <div
        className="reveal-item"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          background: '#FFFFFF',
          border: '2px solid #FFB74D',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 40,
          textAlign: 'center',
        }}
      >
        <div>
          <div className="font-display" style={{ fontSize: 38, fontWeight: 800, color: '#E65100' }}>
            <AnimatedCounter target={6} />
          </div>
          <div className="font-mono-tech" style={{ fontSize: 11.5, fontWeight: 800, color: '#1C1917', marginTop: 4 }}>
            ACTIVE RELIEF SHELTERS
          </div>
        </div>

        <div>
          <div className="font-display" style={{ fontSize: 38, fontWeight: 800, color: '#DC2626' }}>
            <AnimatedCounter target={85} suffix="%" />
          </div>
          <div className="font-mono-tech" style={{ fontSize: 11.5, fontWeight: 800, color: '#1C1917', marginTop: 4 }}>
            FOG BANDWIDTH SAVED
          </div>
        </div>

        <div>
          <div className="font-display" style={{ fontSize: 38, fontWeight: 800, color: '#1C1917' }}>
            <AnimatedCounter target={5} />
          </div>
          <div className="font-mono-tech" style={{ fontSize: 11.5, fontWeight: 800, color: '#1C1917', marginTop: 4 }}>
            AUTO-SCALING CLOUD NODES
          </div>
        </div>

        <div>
          <div className="font-display" style={{ fontSize: 38, fontWeight: 800, color: '#E65100' }}>
            <AnimatedCounter target={100} suffix="%" />
          </div>
          <div className="font-mono-tech" style={{ fontSize: 11.5, fontWeight: 800, color: '#1C1917', marginTop: 4 }}>
            OFFLINE INDEXEDDB SYNC
          </div>
        </div>
      </div>

      {/* 3. 3-TIER ARCHITECTURE FLOW */}
      <div className="reveal-item" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1C1917' }}>
          How SkyShield Works (3-Tier Cloud-Edge Pipeline)
        </h2>
        <p style={{ fontSize: 14, color: '#44403C', marginTop: 4 }}>
          End-to-end distributed architecture engineered for high availability, low latency, and bandwidth efficiency
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
          marginBottom: 36,
        }}
      >
        <TierCard
          tier="TIER 01 • EDGE & OFFLINE CLIENT"
          title="Fog Gateway & Spatial Deduplicator"
          img="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80"
          desc="Citizens submit SOS pins via React + IndexedDB offline storage. The local Fog Node merges duplicate pings within a ~110m radius and buffers packets in RAM if cloud uplink drops—cutting cloud ingress bandwidth by up to 85%."
          badgeBg="#FEE2E2"
          badgeColor="#DC2626"
        />
        <TierCard
          tier="TIER 02 • CLOUD ELASTIC COMPUTE"
          title="L7 Load Balancer & Auto-Scaler"
          img="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80"
          desc="A Layer-7 reverse proxy distributes traffic across worker nodes using Round-Robin or Least-Connections policies. Under flash-crowd spikes, it dynamically spawns up to 5 Node.js workers and auto-heals crashed instances."
          badgeBg="#FFE0B2"
          badgeColor="#E65100"
        />
        <TierCard
          tier="TIER 03 • CLOUD DATA & DISPATCH"
          title="Redis Cache-Aside & Heuristic Matcher"
          img="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80"
          desc="Upstash Redis caches shelter capacity (TTL + sliding-window rate limiting) while Firebase Firestore streams live state to the Command Map, matching highest-priority SOS alerts to nearest capable rescue teams."
          badgeBg="#DCFCE7"
          badgeColor="#15803D"
        />
      </div>

      {/* 4. CCSA SYLLABUS CONCEPTS MATRIX */}
      <div
        className="reveal-item"
        style={{
          background: '#FFE0B2',
          border: '1.5px solid #FFB74D',
          borderRadius: 18,
          padding: 26,
        }}
      >
        <h3 style={{ fontSize: 19, fontWeight: 800, color: '#1C1917', marginBottom: 16 }}>
          Cloud Computing (CCSA) Core Concepts Demonstrated
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
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

function TierCard({ tier, title, img, desc, badgeBg, badgeColor }) {
  return (
    <div className="sky-card reveal-item" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <img src={img} alt={title} style={{ width: '100%', height: 165, objectFit: 'cover' }} />
      <div style={{ padding: 20, flex: 1 }}>
        <span
          className="font-mono-tech"
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 800,
            background: badgeBg,
            color: badgeColor,
            padding: '3px 9px',
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          {tier}
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1917', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: '#44403C', lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

function ConceptBadge({ title, detail }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: '14px 16px',
        borderLeft: '4px solid #E65100',
        boxShadow: '0 4px 12px rgba(28, 25, 23, 0.05)',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: '#1C1917', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: '#44403C', lineHeight: 1.45 }}>{detail}</div>
    </div>
  );
}