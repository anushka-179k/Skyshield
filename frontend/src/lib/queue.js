import { openDB } from 'idb';

const FOG_URL = import.meta.env.VITE_FOG_URL || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const dbPromise = openDB('skyshield-offline', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('sosQueue')) {
      db.createObjectStore('sosQueue', { keyPath: 'localId', autoIncrement: true });
    }
  },
});

async function transmitSOS(payload) {
  // 1. Primary Path: Try Edge Fog Gateway (for spatial deduplication)
  try {
    const fogRes = await fetch(`${FOG_URL}/fog/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (fogRes.ok) return 'sent-to-fog';
  } catch {
    // Fog unreachable — fall through to Cloud Load Balancer
  }

  // 2. Failover Path: Direct to Cloud L7 Load Balancer (Render)
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

  if (!cloudRes.ok) throw new Error('Cloud uplink unreachable');
  return 'sent-to-fog';
}

export async function sendSOS(payload) {
  try {
    return await transmitSOS(payload);
  } catch {
    const db = await dbPromise;
    await db.add('sosQueue', { ...payload, queuedAt: Date.now() });
    return 'queued-offline';
  }
}

export async function flushQueue() {
  const db = await dbPromise;
  const all = await db.getAll('sosQueue');
  for (const item of all) {
    try {
      await transmitSOS(item);
      await db.delete('sosQueue', item.localId);
    } catch {
      break;
    }
  }
}

window.addEventListener('online', flushQueue);