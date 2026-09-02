import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';

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

test('connectDb does not exit the process when MongoDB is unavailable', async () => {
  const originalConnect = mongoose.connect;
  const originalExit = process.exit;

  mongoose.connect = async () => {
    throw new Error('MongoDB unavailable');
  };

  process.exit = ((code) => {
    throw new Error(`process.exit:${code ?? 0}`);
  });

  try {
    await assert.doesNotReject(async () => connectDb());
  } finally {
    mongoose.connect = originalConnect;
    process.exit = originalExit;
  }
});

test.after(() => {
  server.close();
});
