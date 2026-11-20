import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Anushka Katiyar',
    rollNo: '03301012024',
    role: 'Cloud Architecture & Load Balancing',
    module: 'TIER 02 • ELASTIC COMPUTE',
    basePath: 'member1',
    bio: 'Designed and implemented the Layer-7 reverse proxy load balancer, dynamic RPS-based auto-scaling workers, and automated health-check failover recovery.',
  },
  {
    id: 2,
    name: 'Anushka',
    rollNo: '03101012024',
    role: 'Edge Fog Gateway & Offline Sync',
    module: 'TIER 01 • EDGE & OFFLINE',
    basePath: 'member2',
    bio: 'Built the local Fog Node spatial deduplicator (~110m radius clustering), RAM store-and-forward buffer for severed uplinks, and IndexedDB offline SOS queue.',
  },
  {
    id: 3,
    name: 'Anushka Nandan',
    rollNo: '03401012024',
    role: 'Command Map & Priority Dispatch',
    module: 'TIER 03 • TACTICAL DISPATCH',
    basePath: 'member3',
    bio: 'Engineered the real-time Leaflet GIS command dashboard, priority scoring heuristic matcher, and live Firestore rescue unit routing pipeline.',
  },
  {
    id: 4,
    name: 'Akshita',
    rollNo: '01401012024',
    role: 'Redis Caching & System UX',
    module: 'TIER 03 • CACHE & INTERFACE',
    basePath: 'member4',
    bio: 'Implemented Upstash Redis Cache-Aside shelter inventory management with TTL invalidation, sliding-window rate limiting, and the high-visibility alert UI.',
  },
];

const COLLAB_WORKFLOW = [
  {
    step: '01',
    title: 'Joint System Design & Schema',
    detail: 'Collaboratively architected the end-to-end 3-tier Fog-to-Cloud data flow, Firestore collections, and REST API contracts.',
  },
  {
    step: '02',
    title: 'Modular Parallel Development',
    detail: 'Each member owned a dedicated vertical slice—Edge Fog, L7 Cloud Compute, Redis Caching, and GIS Command UI—tracked via Git.',
  },
  {
    step: '03',
    title: 'End-to-End Chaos & Surge Testing',
    detail: 'Tested together under simulated 60-ping disaster surges, severed cloud links, and worker node crashes to verify zero packet loss.',
  },
];

function TeamPhoto({ basePath, alt }) {
  const candidates = [
    `/team/${basePath}.jpg`,
    `/team/${basePath}.jpeg`,
    `/team/${basePath}.png`,
    `/team/${basePath}.webp`,
    `/team/${basePath}.JPG`,
    `/team/${basePath}.jpg.jpg`,
    `/Team/${basePath}.jpg`,
    `/Team/${basePath}.jpeg`,
    `/Team/${basePath}.png`,
  ];

  function handleImgError(e) {
    const img = e.currentTarget;
    const nextIdx = Number(img.dataset.tryIdx || 0) + 1;
    if (nextIdx < candidates.length) {
      img.dataset.tryIdx = String(nextIdx);
      img.src = candidates[nextIdx];
    }
  }

  return (
    <img
      src={candidates[0]}
      data-try-idx="0"
      onError={handleImgError}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function Team() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-visible')),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal-item').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ maxWidth: 1220, margin: '0 auto', padding: '36px 24px 64px' }}>
      {/* HEADER */}
      <div className="reveal-item" style={{ marginBottom: 32 }}>
        <span
          className="font-mono-tech"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#FFE0B2',
            color: '#E65100',
            border: '1px solid #FFB74D',
            padding: '5px 14px',
            borderRadius: 99,
            fontSize: 11.5,
            fontWeight: 800,
            marginBottom: 14,
          }}
        >
          <span className="live-dot-wrapper" style={{ width: 8, height: 8 }}>
            <span className="live-dot-ping" style={{ background: '#E65100' }} />
            <span className="live-dot-core" style={{ width: 8, height: 8, background: '#E65100' }} />
          </span>
          CCSA CAPSTONE PROJECT • 4-MEMBER COLLABORATIVE BUILD
        </span>

        <h1 style={{ fontSize: 38, fontWeight: 800, color: '#1C1917', lineHeight: 1.15 }}>
          Meet the Team Behind <span style={{ color: '#E65100' }}>SkyShield</span>
        </h1>

        <p style={{ fontSize: 15.5, color: '#44403C', marginTop: 10, maxWidth: 760, lineHeight: 1.65 }}>
          SkyShield was collaboratively conceptualized, architected, and engineered as a unified team effort—combining Edge Fog computing, elastic cloud load balancing, distributed Redis caching, and real-time GIS emergency dispatch into one resilient disaster response platform.
        </p>
      </div>

      {/* 4 TEAM MEMBER CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 22,
          marginBottom: 36,
        }}
      >
        {TEAM_MEMBERS.map((m, idx) => (
          <div
            key={m.id}
            className="sky-card reveal-item"
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transitionDelay: `${idx * 0.1}s`,
            }}
          >
            <div>
              <div
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  background: '#FFE0B2',
                  border: '1.5px solid #FFB74D',
                  marginBottom: 16,
                }}
              >
                <TeamPhoto basePath={m.basePath} alt={m.name} />
              </div>

              <span
                className="font-mono-tech"
                style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#E65100',
                  background: '#FFF3E0',
                  border: '1px solid #FFB74D',
                  padding: '3px 10px',
                  borderRadius: 6,
                }}
              >
                {m.role}
              </span>

              <h3 style={{ fontSize: 21, fontWeight: 800, color: '#1C1917', marginTop: 10 }}>
                {m.name}
              </h3>

              <div
                className="font-mono-tech"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#78716C',
                  marginTop: 2,
                }}
              >
                ID: {m.rollNo}
              </div>

              <p style={{ fontSize: 13.5, color: '#44403C', lineHeight: 1.58, marginTop: 10 }}>
                {m.bio}
              </p>
            </div>

            <div
              className="font-mono-tech"
              style={{
                marginTop: 18,
                paddingTop: 12,
                borderTop: '1px solid #FFE0B2',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
                fontWeight: 800,
                color: '#E65100',
              }}
            >
              <span>{m.module}</span>
              <span style={{ color: '#16A34A' }}>● VERIFIED</span>
            </div>
          </div>
        ))}
      </div>

      {/* HOW WE BUILT IT TOGETHER */}
      <div
        className="reveal-item"
        style={{
          background: '#FFE0B2',
          border: '2px solid #FFB74D',
          borderRadius: 20,
          padding: '28px 30px',
          marginBottom: 32,
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <span
            className="font-mono-tech"
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#E65100',
              letterSpacing: '0.5px',
            }}
          >
            TEAMWORK &amp; INTEGRATION METHODOLOGY
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1C1917', marginTop: 4 }}>
            How Our Team Built &amp; Integrated SkyShield
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {COLLAB_WORKFLOW.map((item) => (
            <div
              key={item.step}
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '18px 20px',
                borderLeft: '4px solid #E65100',
                boxShadow: '0 6px 16px rgba(28, 25, 23, 0.05)',
              }}
            >
              <span
                className="font-mono-tech"
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: '#DC2626',
                }}
              >
                PHASE {item.step}
              </span>
              <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#1C1917', marginTop: 4, marginBottom: 6 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13, color: '#44403C', lineHeight: 1.55 }}>
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ACTION BANNER */}
      <div
        className="reveal-item"
        style={{
          background: '#1C1917',
          color: '#FFF3E0',
          borderRadius: 18,
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFB74D' }}>
            Explore the Live SkyShield Command System
          </h3>
          <p style={{ fontSize: 14, color: '#E7E5E4', marginTop: 4 }}>
            Test real-time SOS broadcasting, Fog deduplication surges, and auto-scaling cloud workers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to="/sos"
            className="animate-alert-jump"
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '12px 20px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            ● Report Emergency SOS
          </Link>
          <Link
            to="/shelters"
            style={{
              background: '#E65100',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '12px 20px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            View Relief Shelters →
          </Link>
        </div>
      </div>
    </div>
  );
}