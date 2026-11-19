import { get, set } from 'idb-keyval';

const FOG = import.meta.env.VITE_FOG_URL || 'http://localhost:5000';

const post = (item) =>
  fetch(FOG + '/fog/sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }).then((r) => {
    if (!r.ok) throw new Error();
  });

export async function sendSOS(sos) {
  const item = { ...sos, clientId: crypto.randomUUID(), ts: Date.now() };
  try {
    await post(item);
    return 'sent-to-fog';
  } catch (e) {
    await set('queue', [...((await get('queue')) || []), item]);
    return 'saved-on-device';
  }
}

export async function flushQueue() {
  const left = [];
  for (const item of (await get('queue')) || []) {
    try {
      await post(item);
    } catch (e) {
      left.push(item);
    }
  }
  await set('queue', left);
}

window.addEventListener('online', flushQueue);
setInterval(flushQueue, 10000);