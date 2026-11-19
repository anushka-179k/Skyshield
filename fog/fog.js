const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CLOUD = process.env.CLOUD_URL || 'http://localhost:4000';
const KEY = process.env.FOG_API_KEY || 'skyshield_secret_key_123';

let buffer = new Map();
let offline = false;
const stats = { received: 0, forwarded: 0, batches: 0, cloudUp: true };

const cell = (lat, lng) => Number(lat).toFixed(3) + ',' + Number(lng).toFixed(3);

app.post('/fog/sos', (req, res) => {
  const s = req.body;
  stats.received++;
  const key = cell(s.lat, s.lng) + ':' + s.type;
  const ex = buffer.get(key);
  if (ex) {
    ex.reportCount++;
    ex.people = Math.max(ex.people || 1, s.people || 1);
    ex.severity = Math.max(ex.severity || 1, s.severity || 1);
  } else {
    buffer.set(key, { ...s, reportCount: 1, firstSeen: Date.now() });
  }
  res.json({ ok: true, ackBy: 'fog', pending: buffer.size });
});

async function flush() {
  if (!buffer.size || offline) {
    stats.cloudUp = !offline;
    return;
  }
  const batch = [...buffer.values()];
  try {
    const r = await fetch(CLOUD + '/api/sos/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-fog-key': KEY },
      body: JSON.stringify({ batch }),
    });
    if (!r.ok) throw new Error('cloud error');
    stats.forwarded += batch.length;
    stats.batches++;
    stats.cloudUp = true;
    buffer.clear();
  } catch (e) {
    stats.cloudUp = false;
  }
}

setInterval(flush, 5000);

app.get('/fog/stats', (_, res) => res.json({ stats, pending: buffer.size, offline }));
app.post('/fog/link', (req, res) => {
  offline = !!req.body.offline;
  res.json({ offline });
});

app.listen(5000, () => console.log('Fog node running on port 5000'));