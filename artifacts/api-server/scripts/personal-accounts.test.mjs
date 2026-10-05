import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const directory = await mkdtemp(path.join(tmpdir(), 'bettex-account-tests-'));
const outfile = path.join(directory, 'account.mjs');
await build({ entryPoints: ['src/modules/accounts/index.ts'], bundle: true, platform: 'node', format: 'esm', outfile });
const { registerPersonalTestAccount, normalizedEmail, NO_RECOVERY_NOTICE_VERSION, canUsePersonalTestAccounts } = await import(pathToFileURL(outfile).href);
test.after(async () => { await rm(directory, { recursive: true, force: true }); });
const input = { registrationId: 'registration', email: 'Example@Example.test', displayName: 'Example',
  password: 'only-a-test-password', accepted: true, noticeVersion: NO_RECOVERY_NOTICE_VERSION, passwordHash: 'hash' };
function ports(existing) {
  const state = { inserted: [], provisioned: [], originals: [], sessions: [] };
  return { state, byRegistration: async () => existing, byEmail: async () => undefined,
    verifyPassword: async (password, hash) => { assert.ok(password === input.password && hash === 'hash'); },
    insert: async value => { state.inserted.push(value); },
    provisionPersonalWallets: async id => { state.provisioned.push(id); },
    assertOriginalWallets: async id => { state.originals.push(id); },
    newSession: async id => { state.sessions.push(id); return { token: 'opaque-test-token' }; },
    nextId: () => 'immutable-server-id', now: () => new Date('2026-10-05T00:00:00Z'),
  };
}
test('normalizes email without declaring ownership or verification', () => {
  assert.equal(normalizedEmail(' A@EXAMPLE.TEST '), 'a@example.test');
  assert.throws(() => normalizedEmail('bad-email'), { message: 'invalid_email' });
});
test('test registration is blocked in production, mainnet and absent configuration', () => {
  assert.ok(canUsePersonalTestAccounts('development'));
  for (const mode of ['production', 'mainnet', 'test', undefined]) assert.equal(canUsePersonalTestAccounts(mode), false);
});
test('no account is provisioned without explicit current notice consent', async () => {
  const p = ports();
  await assert.rejects(registerPersonalTestAccount({ ...input, accepted: false }, p), { message: 'consent_required' });
  await assert.rejects(registerPersonalTestAccount({ ...input, noticeVersion: 'old' }, p), { message: 'consent_required' });
  assert.equal(p.state.inserted.length, 0);
});
test('creates immutable owner before wallets, then session only after successful provisioning', async () => {
  const p = ports();
  await registerPersonalTestAccount(input, p);
  assert.equal(p.state.inserted.length, 1);
  assert.equal(p.state.inserted[0].email, 'example@example.test');
  assert.deepEqual(p.state.provisioned, ['immutable-server-id']);
  assert.deepEqual(p.state.sessions, ['immutable-server-id']);
});
test('retry returns original account without replacing wallets or owner', async () => {
  const p = ports({ id: 'original-owner', email: 'example@example.test', passwordHash: 'hash' });
  await registerPersonalTestAccount(input, p);
  assert.equal(p.state.inserted.length, 0);
  assert.equal(p.state.provisioned.length, 0);
  assert.deepEqual(p.state.originals, ['original-owner']);
  assert.deepEqual(p.state.sessions, ['original-owner']);
});
test('registration retry cannot change identity or bypass original password', async () => {
  const p = ports({ id: 'original-owner', email: 'different@example.test', passwordHash: 'hash' });
  await assert.rejects(registerPersonalTestAccount(input, p), { message: 'registration_conflict' });
  const wrong = ports({ id: 'original-owner', email: 'example@example.test', passwordHash: 'hash' });
  wrong.verifyPassword = async () => { throw new Error('invalid_credentials'); };
  await assert.rejects(registerPersonalTestAccount(input, wrong), { message: 'invalid_credentials' });
  assert.equal(wrong.state.sessions.length, 0);
});
test('duplicate email and failed wallet provisioning never issue a session', async () => {
  const duplicate = ports();
  duplicate.byEmail = async () => ({ id: 'other' });
  await assert.rejects(registerPersonalTestAccount(input, duplicate), { message: 'email_in_use' });
  const failed = ports();
  failed.provisionPersonalWallets = async () => { throw new Error('provisioning_failed'); };
  await assert.rejects(registerPersonalTestAccount(input, failed), { message: 'provisioning_failed' });
  assert.equal(failed.state.sessions.length, 0);
  // Real adapter wraps insert/provision/session in PostgreSQL transaction.
});
