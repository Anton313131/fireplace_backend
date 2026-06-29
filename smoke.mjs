// ponytail: HTTP-layer smoke check, not a test suite.
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

const request = (path, init) => fetch(`${base.base}${path}`, init).then(async (r) => ({
  status: r.status,
  body: await r.text(),
  headers: r.headers,
}));

await check('GET /health -> 200', async () => {
  const r = await request('/health');
  if (r.status !== 200) throw new Error(`status ${r.status}`);
});

await check('GET unknown route -> 404 with message', async () => {
  const r = await request('/nope');
  if (r.status !== 404) throw new Error(`status ${r.status}`);
  if (!r.body.includes('Route not found')) throw new Error(`body ${r.body}`);
});

await check('allowed origin gets CORS header', async () => {
  const r = await request('/health', { headers: { Origin: 'http://localhost:3000' } });
  if (r.headers.get('access-control-allow-origin') !== 'http://localhost:3000') {
    throw new Error(`cors: ${r.headers.get('access-control-allow-origin')}`);
  }
});

await check('disallowed origin -> 403', async () => {
  const r = await request('/health', { headers: { Origin: 'https://evil.example' } });
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

await check('GET /api-docs -> 200 (Swagger UI)', async () => {
  const r = await request('/api-docs/');
  if (r.status !== 200) throw new Error(`status ${r.status}`);
  if (!r.body.includes('Swagger UI')) throw new Error(`not swagger: ${r.body.slice(0, 80)}`);
});

await check('GET /api/bouquets/abc -> 400 with details', async () => {
  const r = await request('/api/bouquets/abc');
  if (r.status !== 400) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (body.message !== 'Validation failed') throw new Error(`message: ${body.message}`);
  if (!Array.isArray(body.details) || body.details.length === 0) {
    throw new Error(`details: ${JSON.stringify(body.details)}`);
  }
});

await check('GET /api/bouquets/-1 -> 400 (positive integer required)', async () => {
  const r = await request('/api/bouquets/-1');
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('POST /api/bouquets without auth -> 401', async () => {
  const r = await request('/api/bouquets', { method: 'POST' });
  if (r.status !== 401) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (body.message !== 'Unauthorized') throw new Error(`message: ${body.message}`);
});

await check('POST /api/bouquets with wrong Bearer -> 401', async () => {
  const r = await request('/api/bouquets', {
    method: 'POST',
    headers: { Authorization: 'Bearer wrong-key' },
  });
  if (r.status !== 401) throw new Error(`status ${r.status}`);
});

await check('POST /api/bouquets with auth but invalid body -> 400', async () => {
  const form = new FormData();
  form.append('image', new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }), 'x.jpg');
  form.append('title', 'X');
  form.append('description', 'd');
  form.append('price', '-5');
  const r = await request('/api/bouquets', {
    method: 'POST',
    headers: { Authorization: 'Bearer dev-key' },
    body: form,
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (body.message !== 'Validation failed') throw new Error(`message: ${body.message}`);
  if (!Array.isArray(body.details) || body.details.length === 0) {
    throw new Error(`details: ${JSON.stringify(body.details)}`);
  }
});

await check('POST /api/bouquets with auth but no image -> 400', async () => {
  const form = new FormData();
  form.append('title', 'No Image Bouquet');
  form.append('description', 'd');
  form.append('price', '10.00');
  const r = await request('/api/bouquets', {
    method: 'POST',
    headers: { Authorization: 'Bearer dev-key' },
    body: form,
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (!body.message.includes('Image file is required')) throw new Error(`message: ${body.message}`);
});

await check('POST /api/bouquets with non-image file -> 400', async () => {
  const form = new FormData();
  form.append('image', new Blob(['hello'], { type: 'text/plain' }), 'x.txt');
  form.append('title', 'Wrong Type');
  form.append('description', 'd');
  form.append('price', '10.00');
  const r = await request('/api/bouquets', {
    method: 'POST',
    headers: { Authorization: 'Bearer dev-key' },
    body: form,
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('PATCH .../favorite without auth -> 401', async () => {
  const r = await request('/api/bouquets/1/favorite', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorite: true }),
  });
  if (r.status !== 401) throw new Error(`status ${r.status}`);
});

await check('PATCH .../favorite with auth, missing field -> 400', async () => {
  const r = await request('/api/bouquets/1/favorite', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-key' },
    body: JSON.stringify({}),
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (body.message !== 'Validation failed') throw new Error(`message: ${body.message}`);
});

await check('PATCH .../favorite with non-boolean -> 400', async () => {
  const r = await request('/api/bouquets/1/favorite', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-key' },
    body: JSON.stringify({ favorite: 'yes' }),
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('PATCH .../favorite with extra field -> 400 (unknown(false))', async () => {
  const r = await request('/api/bouquets/1/favorite', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-key' },
    body: JSON.stringify({ favorite: true, title: 'nope' }),
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('PATCH .../favorite with malformed id -> 400', async () => {
  const r = await request('/api/bouquets/abc/favorite', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-key' },
    body: JSON.stringify({ favorite: true }),
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('PUT /:id without auth -> 401', async () => {
  const r = await request('/api/bouquets/1', { method: 'PUT' });
  if (r.status !== 401) throw new Error(`status ${r.status}`);
});

await check('PUT /:id with auth, empty body + no file -> 400', async () => {
  const r = await request('/api/bouquets/1', {
    method: 'PUT',
    headers: { Authorization: 'Bearer dev-key' },
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (!body.message.includes('At least one field')) throw new Error(`message: ${body.message}`);
});

await check('PUT /:id with auth, invalid body -> 400', async () => {
  const form = new FormData();
  form.append('price', '-1');
  const r = await request('/api/bouquets/1', {
    method: 'PUT',
    headers: { Authorization: 'Bearer dev-key' },
    body: form,
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('PUT /:id with extra field -> 400 (unknown(false))', async () => {
  const form = new FormData();
  form.append('title', 'x');
  form.append('bogus', 'nope');
  const r = await request('/api/bouquets/1', {
    method: 'PUT',
    headers: { Authorization: 'Bearer dev-key' },
    body: form,
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('PUT /:id with malformed id -> 400', async () => {
  const form = new FormData();
  form.append('title', 'x');
  const r = await request('/api/bouquets/abc', {
    method: 'PUT',
    headers: { Authorization: 'Bearer dev-key' },
    body: form,
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('PUT /:id with non-image file -> 400', async () => {
  const form = new FormData();
  form.append('image', new Blob(['hello'], { type: 'text/plain' }), 'x.txt');
  form.append('title', 'x');
  const r = await request('/api/bouquets/1', {
    method: 'PUT',
    headers: { Authorization: 'Bearer dev-key' },
    body: form,
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('DELETE /:id without auth -> 401', async () => {
  const r = await request('/api/bouquets/1', { method: 'DELETE' });
  if (r.status !== 401) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (body.message !== 'Unauthorized') throw new Error(`message: ${body.message}`);
});

await check('DELETE /:id with malformed id -> 400', async () => {
  const r = await request('/api/bouquets/abc', {
    method: 'DELETE',
    headers: { Authorization: 'Bearer dev-key' },
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('GET /api/bouquets?favorite=notbool -> 400 (query validation)', async () => {
  const r = await request('/api/bouquets?favorite=notbool');
  if (r.status !== 400) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (body.message !== 'Validation failed') throw new Error(`message: ${body.message}`);
});

await check('GET /api/bouquets?limit=0 -> 400 (query validation)', async () => {
  const r = await request('/api/bouquets?limit=0');
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('POST /api/testimonials with empty body -> 400', async () => {
  const r = await request('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (body.message !== 'Validation failed') throw new Error(`message: ${body.message}`);
});

await check('POST /api/testimonials with extra field -> 400 (unknown(false))', async () => {
  const r = await request('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', text: 'ok', bogus: true }),
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

await check('POST /api/orders with empty body -> 400', async () => {
  const r = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
  const body = JSON.parse(r.body);
  if (body.message !== 'Validation failed') throw new Error(`message: ${body.message}`);
});

await check('POST /api/orders with extra field -> 400 (unknown(false))', async () => {
  const r = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bouquetId: 1, name: 'A', phone: '555', bogus: true }),
  });
  if (r.status !== 400) throw new Error(`status ${r.status}`);
});

base.server.close();
process.exit(failed ? 1 : 0);
