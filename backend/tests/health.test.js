import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

const server = app.listen(0);

const port = new Promise((resolve) => {
  server.once('listening', () => resolve(server.address().port));
});

test('GET /api/health returns ok status', async () => {
  const url = `http://127.0.0.1:${await port}/api/health`;
  const response = await fetch(url);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
});

test.after(() => {
  server.close();
});
