/**
 * HTTP isolation + pg_dump/pg_restore, ONLY a fresh, empty schema with fixtures.
 * Does not copy rows, mutate the app schema, fund wallets or send transactions.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, chmod, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const apiRequire = createRequire(new URL('../package.json', import.meta.url));
const dbRequire = createRequire(new URL('../../../lib/db/package.json', import.meta.url));
const require = name => name === 'pg' ? dbRequire(name) : apiRequire(name);
const { Pool } = require('pg');
const source = process.env.DATABASE_URL;
if (!source) throw new Error('development_database_required');
const schema = `security_fixture_${randomUUID().replaceAll('-', '')}`;
const admin = new Pool({ connectionString: source });
const directory = await mkdtemp(path.join(tmpdir(), 'bettex-security-'));
await chmod(directory, 0o700);
let server, appPool, schemaCreated = false;
const quote = value => `"${value.replaceAll('"', '""')}"`;
try {
  // Only DDL/empty structure is cloned. Source account data never leaves its schema.
  await admin.query(`CREATE SCHEMA ${quote(schema)}`);
  schemaCreated = true;
  const tables = await admin.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  for (const { tablename } of tables.rows) {
    await admin.query(`CREATE TABLE ${quote(schema)}.${quote(tablename)} (LIKE public.${quote(tablename)} INCLUDING ALL)`);
  }
  // LIKE copies nextval(public.sequence) defaults, not sequence ownership.
  // Give every cloned serial column its OWN sequence; never advance app counters.
  const serials = await admin.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema=$1 AND column_default LIKE 'nextval(%'", [schema]);
  for (const [i, { table_name, column_name }] of serials.rows.entries()) {
    const sequence = `fixture_sequence_${i}`;
    await admin.query(`CREATE SEQUENCE ${quote(schema)}.${quote(sequence)} OWNED BY ${quote(schema)}.${quote(table_name)}.${quote(column_name)}`);
    await admin.query(`ALTER TABLE ${quote(schema)}.${quote(table_name)} ALTER COLUMN ${quote(column_name)} SET DEFAULT nextval('${quote(schema)}.${quote(sequence)}'::regclass)`);
  }
  const isolated = new URL(source);
  isolated.searchParams.set('options', `-csearch_path=${schema},pg_catalog`);
  // Process-local test connection; never updates workspace secrets/configuration.
  process.env.DATABASE_URL = isolated.toString();
  process.env.NODE_ENV = 'development';
  // Native-session tests need SDK bootstrapping, not a live Clerk tenant.
  // Synthetic key only when CI has none; no Clerk-authenticated requests here.
  if (!process.env.CLERK_SECRET_KEY) {
    process.env.CLERK_SECRET_KEY = ['sk', 'test', randomUUID().replaceAll('-', '')].join('_');
  }
  const compiled = await build({
    stdin: { contents: `export {default as app} from "./src/app";
      export {db,pool} from "@workspace/db";
      export {accountsStore,ensureAccountsSchema} from "./src/modules/accounts/infrastructure/store";
      export {ensureWalletsSchema,walletsStore} from "./src/modules/wallets/infrastructure/store";
      export {passwordHash} from "./src/modules/accounts/infrastructure/security";
      export {appendHistory,ensureHistorySchema} from "./src/modules/audit/infrastructure/history-store";
      export {generatePersonalWallets} from "../bettex-site/src/components/account/wallet-vault";`,
      resolveDir: new URL('..', import.meta.url).pathname },
    platform: 'node', format: 'cjs', bundle: true, write: false,
    external: ['pg', 'express', 'cors', 'pino', 'pino-http', '@clerk/express',
      '@clerk/shared/keys', 'http-proxy-middleware'], logLevel: 'silent',
  });
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(require, mod, mod.exports);
  const api = mod.exports;
  appPool = api.pool;
  assert.equal((await appPool.query('SELECT current_schema() AS schema')).rows[0].schema, schema);
  await api.ensureAccountsSchema();
  await api.ensureWalletsSchema();
  await api.ensureHistorySchema();
  await appPool.query(await readFile(new URL('../../../lib/db/migrations/20261005_wallet_integrity.sql', import.meta.url), 'utf8'));
  await assert.rejects(appPool.query("INSERT INTO personal_test_vaults(account_id,envelope) VALUES('absent-owner','{}')"),
    error => error.code === '23503');
  const password = `Fixture-${randomUUID()}!`;
  const hash = await api.passwordHash(password);
  const owners = [];
  for (let i = 0; i < 2; i++) {
    const material = await api.generatePersonalWallets(password);
    const id = randomUUID();
    await api.accountsStore().insert({ id, registrationId: material.registrationId,
      email: `fixture-${i}@invalid.test`, displayName: `Fixture ${i}`, passwordHash: hash,
      noticeVersion: 'fixture-no-recovery', acceptedAt: new Date(), revision: 1 });
    await api.walletsStore().provision(id, material.wallets, material.vault);
    const session = await api.accountsStore().newSession(id);
    owners.push({ id, material, session });
    await api.appendHistory({ key: `fixture:${id}`, correlationId: `operation:${id}`, subject: `native:${id}`,
      category: 'activity', kind: 'account_created', state: 'confirmed', actor: 'user',
      environment: 'account_test', source: 'security_fixture', data: { fixture: true } });
  }
  server = api.app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const headers = owner => ({ Cookie: `bettex_test_session=${owner.session.token}`, Origin: 'https://bettex.ai' });
  const get = (endpoint, owner = owners[0]) => fetch(origin + endpoint, { headers: headers(owner) });
  const command = body => fetch(origin + '/api/account/commands', { method: 'POST',
    headers: { ...headers(owners[0]), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const own = await (await get('/api/account/session')).json();
  assert.equal(own.account.id, owners[0].id);
  assert.ok(own.wallets.every(wallet => !owners[1].material.wallets.some(other => other.id === wallet.id)));
  const foreignHistory = await get(`/api/account/history?accountId=${owners[1].id}`);
  const foreignPage = await foreignHistory.json();
  assert.equal(foreignHistory.status, 200);
  assert.ok(!JSON.stringify(foreignPage).includes(`operation:${owners[1].id}`));
  assert.equal((await get('/api/account/history/admin')).status, 403);
  assert.equal((await command({ action: 'private-request', csrf: owners[0].session.csrf, password,
    walletId: owners[1].material.wallets[0].id, requestId: randomUUID(), privateAction: 'private-download' })).status, 403);
  assert.equal((await command({ action: 'name', csrf: 'forged', displayName: 'attacker' })).status, 403);
  assert.equal((await command({ action: 'password', csrf: owners[0].session.csrf,
    password: 'Wrong-fixture-password!', newPassword: password, revision: 1, vault: owners[0].material.vault })).status, 401);
  assert.equal((await command({ action: 'signout', csrf: owners[0].session.csrf })).status, 200);
  assert.equal((await (await get('/api/account/session')).json()).account, null);
  console.log('HTTP: owner isolation, foreign key export, admin denial, CSRF, sensitive reauthentication and session revocation passed.');
  await new Promise(resolve => server.close(resolve));
  server = undefined;
  await appPool.end(); appPool = undefined;

  // Restore actual fixture accounts, encrypted vaults and history with PostgreSQL tools.
  // Connection secrets go ONLY in child environment, never argv, files or output.
  const dburl = new URL(source);
  const env = { ...process.env, PGHOST: dburl.hostname, PGPORT: dburl.port || '5432',
    PGUSER: decodeURIComponent(dburl.username), PGPASSWORD: decodeURIComponent(dburl.password) || process.env.PGPASSWORD || '',
    PGDATABASE: dburl.pathname.slice(1), PGSSLMODE: dburl.searchParams.get('sslmode') || 'prefer' };
  const archive = path.join(directory, 'fixture.dump');
  const dump = spawnSync('pg_dump', ['--schema', schema, '--format=custom', '--no-owner', '--no-privileges', '--file', archive], { env });
  assert.equal(dump.status, 0, 'fixture backup failed (output intentionally redacted)');
  await chmod(archive, 0o600);
  const before = await admin.query(`SELECT token_hash FROM ${quote(schema)}.test_account_sessions ORDER BY token_hash`);
  const vaultsBefore = await admin.query(`SELECT envelope FROM ${quote(schema)}.personal_test_vaults ORDER BY account_id`);
  await admin.query(`DROP SCHEMA ${quote(schema)} CASCADE`);
  schemaCreated = false;
  const restore = spawnSync('pg_restore', ['--no-owner', '--no-privileges', '--exit-on-error', '--dbname', env.PGDATABASE, archive], { env });
  assert.equal(restore.status, 0, 'fixture restoration failed (output intentionally redacted)');
  schemaCreated = true;
  assert.deepEqual((await admin.query(`SELECT token_hash FROM ${quote(schema)}.test_account_sessions ORDER BY token_hash`)).rows, before.rows);
  assert.deepEqual((await admin.query(`SELECT envelope FROM ${quote(schema)}.personal_test_vaults ORDER BY account_id`)).rows, vaultsBefore.rows);
  assert.equal((await admin.query(`SELECT count(*)::int AS count FROM ${quote(schema)}.history_events`)).rows[0].count >= 2, true);
  console.log('PostgreSQL: encrypted wallets, accounts, remaining session hashes and audit restored in isolated fixture schema.');
} catch (error) {
  console.error('Security isolation/restore verification failed:', error.code ?? error.name, '(details redacted)');
  process.exitCode = 1;
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  if (appPool) await appPool.end();
  if (schemaCreated) await admin.query(`DROP SCHEMA ${quote(schema)} CASCADE`);
  await admin.end();
  await rm(directory, { recursive: true, force: true });
  process.env.DATABASE_URL = source;
}
