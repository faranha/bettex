import { build } from "esbuild";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";

const require = createRequire(new URL("../../../lib/db/package.json", import.meta.url));
const { Pool } = require("pg");
const admin = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = `round_archive_fixture_${randomUUID().replaceAll("-", "")}`;
let pool;
try {
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const isolated = new URL(process.env.DATABASE_URL);
  isolated.searchParams.set("options", `-csearch_path=${schema},pg_catalog`);
  process.env.DATABASE_URL = isolated.toString();
  const built = await build({
    stdin: { contents: `export { db, pool } from "@workspace/db"; export * from "./src/lib/round-archive-store";`,
      resolveDir: new URL("../", import.meta.url).pathname },
    bundle: true, write: false, platform: "node", format: "cjs", external: ["pg"],
  });
  const mod = { exports: {} };
  new Function("require", "module", "exports", built.outputFiles[0].text)(require, mod, mod.exports);
  const api = mod.exports;
  pool = api.pool;
  const searchPath = (await pool.query("SHOW search_path")).rows[0].search_path;
  assert.equal(searchPath, `${schema},pg_catalog`);
  await api.ensureRoundArchiveSchema();
  const start = Date.parse("2025-01-01T00:00:00Z");
  const rounds = Array.from({ length: 365 }, (_, i) => ({
    id: new Date(start + i * 86400000).toISOString().slice(0, 10),
    endedAt: new Date(start + (i + 1) * 86400000).toISOString(),
    status: "paid", eligibleUsdc: i, treasuryUsdc: i / 2,
    stakingUsdc: i / 4, buybackUsdc: i / 4, source: "calculated_simulation",
  })).reverse();
  const oldest = rounds.at(-1);
  const snapshot = { endedAt: oldest.endedAt, receivedUsdc: 12.5 };
  const account = { roundParticipation: { [oldest.id]: snapshot } };
  await api.db.transaction(async tx => {
    await api.archiveRounds(tx, { rounds });
    await api.archiveParticipation(tx, "fixture-a", account);
  });
  assert.equal((await api.roundArchivePage("fixture-a", 1, 10)).total, 365);
  const all = [];
  for (let page = 1; page <= 37; page++) {
    const result = await api.roundArchivePage("fixture-a", page, 10);
    assert.equal(result.page, page);
    assert.equal(result.items.length, page === 37 ? 5 : 10);
    all.push(...result.items.map(r => r.id));
  }
  assert.deepEqual(all, rounds.map(r => r.id));
  assert.equal(new Set(all).size, 365);
  assert.equal((await api.roundArchivePage("fixture-a", 999, 10)).page, 37);
  const selected = (await api.roundArchivePage("fixture-a", 1, 10, oldest.id)).selected;
  assert.equal(selected.id, oldest.id);
  assert.equal(selected.participationSnapshot.receivedUsdc, 12.5);
  assert.equal((await api.roundArchivePage("fixture-b", 1, 10, oldest.id)).selected.participationSnapshot, undefined);
  assert.equal((await api.roundArchivePage("fixture-a", 1, 10, "unknown")).selected, null);
  // Replays cannot overwrite historical snapshots or duplicate rounds.
  await api.db.transaction(tx => api.archiveRounds(tx, { rounds: [{ ...oldest, eligibleUsdc: 999 }] }));
  assert.equal((await api.roundArchivePage("fixture-a", 1, 10, oldest.id)).selected.eligibleUsdc, oldest.eligibleUsdc);
  // Trimming the working state must not remove archived participation.
  const longAccount = { roundParticipation: Object.fromEntries(rounds.map(r => [r.id, { endedAt: r.endedAt, receivedUsdc: 1 }])) };
  await api.db.transaction(tx => api.archiveParticipation(tx, "fixture-c", longAccount));
  assert.equal(Object.keys(longAccount.roundParticipation).length, 14);
  assert.equal((await api.roundArchivePage("fixture-c", 1, 10, oldest.id)).selected.participationSnapshot.receivedUsdc, 1);
  // An aborted close must not leave an archived round committed separately.
  await assert.rejects(api.db.transaction(async tx => {
    await api.archiveRounds(tx, { rounds: [{ ...oldest, id: "rollback-only" }] });
    throw new Error("rollback-fixture");
  }));
  assert.equal((await api.roundArchivePage("fixture-a", 1, 10)).total, 365);
  console.log("Round archive: 365 rounds / 37 pages, oldest-round lookup, private participation, immutable replay and atomic rollback passed.");
} finally {
  if (pool) await pool.end();
  await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await admin.end();
}
