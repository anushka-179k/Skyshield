const http = require('http');
const path = require('path');
const { fork } = require('child_process');

let MODE = 'leastconn';
const MIN = 1, MAX = 5;
let nodes = [], nextPort = 4001, rr = 0, hits = 0, rps = 0;
const CORS = { 'Access-Control-Allow-Origin': '*' };
const LB_PORT = process.env.LB_PORT || process.env.PORT || 4000;

function spawn() {
  const port = nextPort++;
  const proc = fork(path.join(__dirname, '../backend/server.js'), [], {
    env: { ...process.env, PORT: port, INSTANCE_ID: 'api-' + port },
  });
  const node = { port, proc, healthy: false, active: 0, served: 0 };
  proc.on('exit', () => {
    nodes = nodes.filter((n) => n !== node);
  });
  nodes.push(node);
}

function pick() {
  const up = nodes.filter((n) => n.healthy);
  if (!up.length) return null;
  return MODE === 'roundrobin'
    ? up[rr++ % up.length]
    : up.reduce((a, b) => (a.active <= b.active ? a : b));
}

setInterval(async () => {
  for (const n of nodes) {
    try {
      n.healthy = (await fetch('http://localhost:' + n.port + '/api/health')).ok;
    } catch (e) {
      n.healthy = false;
    }
  }
}, 2000);

setInterval(() => {
  rps = hits / 5;
  hits = 0;
  while (nodes.length < MIN) spawn();
  if (rps > 30 && nodes.length < MAX) spawn();
  else if (rps < 8 && nodes.length > MIN) {
    const n = nodes.pop();
    n.proc.removeAllListeners('exit');
    n.proc.kill();
  }
}, 5000);

http
  .createServer((req, res) => {
    // Forward /fog/* requests to Edge Fog Node on port 5000 (for single-URL cloud deployment)
    if (req.url.startsWith('/fog')) {
      const fogReq = http.request(
        { port: 5000, path: req.url, method: req.method, headers: req.headers },
        (r) => {
          res.writeHead(r.statusCode, r.headers);
          r.pipe(res);
        }
      );
      fogReq.on('error', () => {
        if (!res.headersSent) {
          res.writeHead(502, CORS);
          res.end('Fog node unavailable');
        }
      });
      return req.pipe(fogReq);
    }

    if (req.url.startsWith('/lb/stats')) {
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          mode: MODE,
          rps,
          nodes: nodes.map(({ port, healthy, active, served }) => ({ port, healthy, active, served })),
        })
      );
    }
    if (req.url.startsWith('/lb/kill')) {
      const n = nodes[Math.floor(Math.random() * nodes.length)];
      if (n) n.proc.kill();
      res.writeHead(200, CORS);
      return res.end('killed');
    }
    if (req.url.startsWith('/lb/mode/')) {
      MODE = req.url.split('/').pop();
      res.writeHead(200, CORS);
      return res.end(MODE);
    }

    const n = pick();
    if (!n) {
      res.writeHead(503, CORS);
      return res.end('no healthy instance');
    }
    hits++;
    n.active++;
    n.served++;
    res.on('close', () => {
      n.active--;
    });

    const up = http.request(
      { port: n.port, path: req.url, method: req.method, headers: req.headers },
      (r) => {
        res.writeHead(r.statusCode, { ...r.headers, 'x-served-by': 'api-' + n.port });
        r.pipe(res);
      }
    );
    up.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(502);
        res.end();
      }
    });
    req.pipe(up);
  })
  .listen(LB_PORT, () => console.log('Load Balancer running on port', LB_PORT));

spawn();