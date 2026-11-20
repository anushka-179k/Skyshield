const { spawn } = require('child_process');

// Render assigns process.env.PORT (usually 10000) to the main public web service (Load Balancer)
process.env.LB_PORT = process.env.PORT || '4000';

// Start Edge Fog Node on internal port 5000 (or expose via /fog proxy on LB)
const fog = spawn('node', ['fog/fog.js'], {
  stdio: 'inherit',
  env: { ...process.env, LB_URL: `http://localhost:${process.env.LB_PORT}` },
});

// Start L7 Load Balancer & Auto-Scaler on public Render PORT
const lb = spawn('node', ['lb/lb.js'], {
  stdio: 'inherit',
  env: { ...process.env },
});

fog.on('exit', (code) => console.error('Fog exited:', code));
lb.on('exit', (code) => process.exit(code || 0));