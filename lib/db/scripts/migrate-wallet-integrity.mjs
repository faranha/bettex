import pg from 'pg';
import { readFile } from 'node:fs/promises';

if (process.env.NODE_ENV !== 'development') throw new Error('explicit_development_environment_required');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query(await readFile(new URL('../migrations/20261005_wallet_integrity.sql', import.meta.url), 'utf8'));
  console.log('Wallet-owner constraints installed and validated; no rows deleted.');
} catch {
  console.error('Wallet integrity migration failed; review orphan ownership privately. No data or credentials logged.');
  process.exitCode = 1;
} finally { await client.end(); }
