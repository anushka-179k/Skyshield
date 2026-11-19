require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Redis } = require('@upstash/redis');
const { Ratelimit } = require('@upstash/ratelimit');
const { priority, allocate } = require('./matcher');

const cred = process.env.FIREBASE_SERVICE_ACCOUNT_B64
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString())
  : require(require('path').resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT));

initializeApp({ credential: cert(cred) });
const db = getFirestore();
const redis = Redis.fromEnv();
const limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m') });

const ID = process.env.INSTANCE_ID || 'api-local';
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.set('X-Instance', ID);
  next();
});

app.get('/api/health', (_, res) => res.json({ ok: true, instance: ID }));
app.get('/api/ping', (_, res) => res.json({ pong: true, instance: ID }));

async function saveSOS(s) {
  const doc = {
    ...s,
    status: 'open',
    reportCount: s.reportCount || 1,
    createdAt: s.firstSeen || s.ts || Date.now(),
  };
  doc.priority = priority(doc);
  await db.collection('sos').add(doc);
}

app.post('/api/sos', async (req, res) => {
  const { success } = await limiter.limit(req.ip || 'local');
  if (!success) return res.status(429).json({ error: 'slow down' });
  await saveSOS(req.body);
  res.json({ ok: true, instance: ID });
});

app.post('/api/sos/batch', async (req, res) => {
  if (req.get('x-fog-key') !== process.env.FOG_API_KEY) return res.sendStatus(401);
  await Promise.all(req.body.batch.map(saveSOS));
  res.json({ ok: true, saved: req.body.batch.length, instance: ID });
});

app.get('/api/shelters', async (_, res) => {
  const hit = await redis.get('shelters');
  if (hit) return res.set('X-Cache', 'HIT').json(hit);
  const data = (await db.collection('shelters').get()).docs.map((d) => ({ id: d.id, ...d.data() }));
  await redis.set('shelters', data, { ex: 10 });
  res.set('X-Cache', 'MISS').json(data);
});

app.patch('/api/shelters/:id', async (req, res) => {
  const { bedsFree, foodPacks } = req.body;
  await db.collection('shelters').doc(req.params.id).update({ bedsFree, foodPacks, updatedAt: Date.now() });
  await redis.del('shelters');
  res.json({ ok: true });
});

app.post('/api/allocate', async (_, res) => {
  const get = async (q) => (await q.get()).docs.map((d) => ({ id: d.id, ...d.data() }));
  const [reqs, teams, shelters] = await Promise.all([
    get(db.collection('sos').where('status', '==', 'open')),
    get(db.collection('teams').where('status', '==', 'free')),
    get(db.collection('shelters')),
  ]);
  const plan = allocate(reqs, teams, shelters);
  const b = db.batch();
  plan.forEach((a) => {
    b.update(db.collection('sos').doc(a.sosId), {
      status: 'assigned',
      teamId: a.teamId,
      shelterId: a.shelterId,
      etaMin: a.etaMin,
    });
    b.update(db.collection('teams').doc(a.teamId), { status: 'busy' });
  });
  await b.commit();
  res.json(plan);
});

app.listen(process.env.PORT || 4001, () => console.log(ID, 'running on port', process.env.PORT || 4001));