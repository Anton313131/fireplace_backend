// ponytail: single HTTP-layer check, not a test suite.
// Run with: npm run smoke
process.env.NODE_ENV = 'production';
const { app } = await import('./app.js');
const { errorHandler } = await import('./middleware/errorHandler.js');

const base = await new Promise((resolve) => {
  const server = app.listen(0, () => {
    const { port } = server.address();
    resolve({ server, base: `http://127.0.0.1:${port}` });
  });
});

let failed = 0;
const check = async (label, fn) => {
  try {
    await fn();
    console.log(`ok   ${label}`);
  } catch (error) {
    console.error(`FAIL ${label}: ${error.message}`);
    failed += 1;
  }
};

const get = (path, init) => fetch(`${base.base}${path}`, init).then(async (r) => ({
  status: r.status,
  body: await r.text(),
  headers: r.headers,
}));

await check('GET /health -> 200', async () => {
  const r = await get('/health');
  if (r.status !== 200) throw new Error(`status ${r.status}`);
});

await check('GET unknown route -> 404 with message', async () => {
  const r = await get('/nope');
  if (r.status !== 404) throw new Error(`status ${r.status}`);
  if (!r.body.includes('Route not found')) throw new Error(`body ${r.body}`);
});

await check('allowed origin gets CORS header', async () => {
  const r = await get('/health', { headers: { Origin: 'http://localhost:3000' } });
  if (r.headers.get('access-control-allow-origin') !== 'http://localhost:3000') {
    throw new Error(`cors: ${r.headers.get('access-control-allow-origin')}`);
  }
});

await check('disallowed origin -> 403', async () => {
  const r = await get('/health', { headers: { Origin: 'https://evil.example' } });
  if (r.status !== 403) throw new Error(`status ${r.status}`);
});

await check('unexpected error -> 500 with safe body in production', async () => {
  const captured = { status: 0, body: null };
  const res = {
    status(code) { captured.status = code; return this; },
    json(b) { captured.body = b; return this; },
  };
  await errorHandler(new Error('leak: db password=hunter2'), {}, res, () => {});
  if (captured.status !== 500) throw new Error(`status ${captured.status}`);
  if (captured.body.message.includes('hunter2')) throw new Error(`leaked: ${captured.body.message}`);
});

base.server.close();
process.exit(failed ? 1 : 0);
