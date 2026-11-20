import { openDB } from 'idb';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

const FOG_URL = import.meta.env.VITE_FOG_URL || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const dbPromise = openDB('skyshield-offline', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('sosQueue')) {
      db.createObjectStore('sosQueue', { keyPath: 'localId', autoIncrement: true });
    }
  },
});

function computePriority(p) {
  return (
    (Number(p.severity) || 3) * 18 +
    Math.min((Number(p.people) || 1) * 4, 24) +
    (p.vulnerable ? 15 : 0)
  );
}

async function transmitSOS(payload) {
  // 1. Try Edge Fog Gateway
  try {
    const fogRes = await fetch(`${FOG_URL}/fog/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (fogRes.ok) return 'sent-to-fog';
  } catch {
    // Fog offline — try Cloud Load Balancer next
  }

  // 2. Try Cloud L7 Load Balancer (Render)
  try {
    const cloudRes = await fetch(`${API_URL}/api/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        reportCount: 1,
        status: 'open',
        createdAt: new Date().toISOString(),
      }),
    });
    if (cloudRes.ok) return 'sent-to-cloud';
  } catch {
    // Render sleeping/unreachable — fall back directly to Firebase Firestore
  }

  // 3. Direct Firebase Firestore Cloud Fallback (100% Guaranteed Live Sync)
  if (!navigator.onLine) throw new Error('Device is offline');
  await addDoc(collection(db, 'sos'), {
    lat: Number(payload.lat),
    lng: Number(payload.lng),
    type: payload.type || 'flood',
    need: payload.need || 'general',
    severity: Number(payload.severity) || 4,
    people: Number(payload.people) || 1,
    vulnerable: Boolean(payload.vulnerable),
    landmark: payload.landmark || '',
    priority: computePriority(payload),
    reportCount: 1,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
  return 'sent-to-firestore';
}

export async function sendSOS(payload) {
  try {
    return await transmitSOS(payload);
  } catch {
    const dbLocal = await dbPromise;
    await dbLocal.add('sosQueue', { ...payload, queuedAt: Date.now() });
    return 'queued-offline';
  }
}

export async function flushQueue() {
  const dbLocal = await dbPromise;
  const all = await dbLocal.getAll('sosQueue');
  if (all.length === 0) return { synced: 0, remaining: 0 };

  let synced = 0;
  for (const item of all) {
    try {
      await transmitSOS(item);
      await dbLocal.delete('sosQueue', item.localId);
      synced++;
    } catch {
      break;
    }
  }
  const remaining = (await dbLocal.getAll('sosQueue')).length;
  return { synced, remaining };
}

window.addEventListener('online', () => {
  flushQueue();
});