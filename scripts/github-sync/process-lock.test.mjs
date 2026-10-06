import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, utimesSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { acquire } from './service.mjs';

test('live owner is protected; recycled PID/boot identity recovers only an expired lock', t => {
  const directory = mkdtempSync(path.join(tmpdir(), 'bettex-lock-'));
  try {
    const ctx = { directory };
    const lock = path.join(directory, 'daemon.lock');
    const release = acquire(ctx, 'daemon.lock');
    const owner = JSON.parse(readFileSync(path.join(lock, 'owner.json'), 'utf8'));
    assert.equal(acquire(ctx, 'daemon.lock'), null);
    release();
    if (!owner.identity) return t.skip('procfs identity unavailable');
    mkdirSync(lock);
    writeFileSync(path.join(lock, 'owner.json'), JSON.stringify({ pid: process.pid, identity: 'previous-boot:1' }));
    assert.equal(acquire(ctx, 'daemon.lock'), null, 'fresh lock write window stays protected');
    const expired = new Date(Date.now() - 60_000);
    utimesSync(lock, expired, expired);
    const recovered = acquire(ctx, 'daemon.lock');
    assert.equal(typeof recovered, 'function', 'alive PID does not imply same process');
    assert.equal(JSON.parse(readFileSync(path.join(lock, 'owner.json'), 'utf8')).identity, owner.identity);
    recovered();
    mkdirSync(lock);
    writeFileSync(path.join(lock, 'owner.json'), JSON.stringify({ pid: process.pid }));
    assert.equal(acquire(ctx, 'daemon.lock'), null, 'active legacy owner is preserved');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
