import pg from "pg";
import { readFile } from "node:fs/promises";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query(await readFile(new URL("../migrations/20261005_history.sql", import.meta.url), "utf8"));
  console.log("History migration applied (append-only journal; no account permissions granted).");
} catch {
  console.error("History migration failed. Ensure base schema is installed and the target database is explicitly selected.");
  process.exitCode = 1;
} finally { await client.end(); }
