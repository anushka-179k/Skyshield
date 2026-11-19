require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function seedDatabase() {
  const cred = require(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(cred) });
const db = getFirestore();

  const shelters = [
    { name: 'Yamuna Sports Complex Relief Camp', lat: 28.659, lng: 77.311, bedsTotal: 200, bedsFree: 145, foodPacks: 500 },
    { name: 'AIIMS Trauma & Shelter Center', lat: 28.567, lng: 77.210, bedsTotal: 150, bedsFree: 90, foodPacks: 320 },
    { name: 'Dwarka Sector 10 Community Hall', lat: 28.582, lng: 77.058, bedsTotal: 180, bedsFree: 160, foodPacks: 450 },
    { name: 'Rohini Sector 14 School Camp', lat: 28.716, lng: 77.129, bedsTotal: 120, bedsFree: 80, foodPacks: 250 },
    { name: 'Connaught Place Civic Shelter', lat: 28.631, lng: 77.216, bedsTotal: 100, bedsFree: 65, foodPacks: 200 },
    { name: 'Okhla Phase II Industrial Camp', lat: 28.535, lng: 77.273, bedsTotal: 160, bedsFree: 110, foodPacks: 380 },
  ];

  const teams = [
    { name: 'NDRF Alpha Boat Unit', lat: 28.645, lng: 77.295, skills: ['boat', 'general'], speedKmh: 35, status: 'free' },
    { name: 'Rapid Medics Team 1', lat: 28.575, lng: 77.220, skills: ['medical'], speedKmh: 50, status: 'free' },
    { name: 'Heavy Rescue Squad Bravo', lat: 28.610, lng: 77.180, skills: ['general', 'boat'], speedKmh: 40, status: 'free' },
    { name: 'Swift Water Unit Charlie', lat: 28.680, lng: 77.230, skills: ['boat'], speedKmh: 35, status: 'free' },
    { name: 'Emergency Trauma Van 2', lat: 28.590, lng: 77.080, skills: ['medical', 'general'], speedKmh: 45, status: 'free' },
    { name: 'North Zone Rescue Delta', lat: 28.705, lng: 77.150, skills: ['general'], speedKmh: 40, status: 'free' },
  ];

  const batch = db.batch();
  shelters.forEach((s) => batch.set(db.collection('shelters').doc(), { ...s, updatedAt: Date.now() }));
  teams.forEach((t) => batch.set(db.collection('teams').doc(), t));
  await batch.commit();
  console.log('Seeded 6 shelters and 6 rescue teams into Firestore!');
  process.exit(0);
}

async function simulateFlood(n) {
  const hotspots = [
    [28.65, 77.29],
    [28.58, 77.22],
    [28.62, 77.19],
  ];
  console.log(`Sending ${n} SOS pings to Fog node...`);
  for (let i = 0; i < n; i++) {
    const [la, ln] = hotspots[i % 3];
    await fetch('http://localhost:5000/fog/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: la + (Math.random() - 0.5) * 0.004,
        lng: ln + (Math.random() - 0.5) * 0.004,
        type: ['flood', 'medical', 'trapped'][i % 3],
        need: ['boat', 'medical', 'general'][i % 3],
        severity: 1 + Math.floor(Math.random() * 5),
        people: 1 + Math.floor(Math.random() * 8),
        vulnerable: Math.random() < 0.2,
      }),
    });
  }
  console.log('Flood simulation complete!');
}

const arg = process.argv[2];
if (arg === 'init') seedDatabase();
else simulateFlood(Number(arg) || 100);