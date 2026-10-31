// Profile picture upload/serve against Postgres, in a fresh private schema with
// fixture accounts only. Never touches the live demo or any external storage.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";

const requireDb = createRequire(new URL("../../../lib/db/package.json", import.meta.url));
const requireApi = createRequire(new URL("../package.json", import.meta.url));
const { Pool } = requireDb("pg");
if (!process.env.DATABASE_URL) throw new Error("development_database_required");
const admin = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = `avatar_fixture_${randomUUID().replaceAll("-", "")}`;
let pool, server;
try {
  await admin.query(`CREATE SCHEMA "${schema}"`);
  await admin.query(`CREATE TABLE "${schema}".demo_accounts (id text PRIMARY KEY, clerk_user_id text UNIQUE, state jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`);
  const isolated = new URL(process.env.DATABASE_URL);
  isolated.searchParams.set("options", `-csearch_path=${schema},pg_catalog`);
  process.env.DATABASE_URL = isolated.toString();
  const built = await build({
    stdin: { contents: 'export * from "./src/lib/profile-avatar"; export {db,pool,demoAccounts} from "@workspace/db";',
      resolveDir: new URL("..", import.meta.url).pathname },
    bundle: true, platform: "node", format: "cjs", write: false,
    external: ["pg", "express"], logLevel: "silent",
  });
  const mod = { exports: {} };
  new Function("require", "module", "exports", built.outputFiles[0].text)(name => name === "pg" ? requireDb(name) : requireApi(name), mod, mod.exports);
  const lib = mod.exports;
  pool = lib.pool;
  await pool.query(await readFile(new URL("../../../lib/db/migrations/20261031_profile_avatars.sql", import.meta.url), "utf8"));
  const express = requireApi("express");
  const app = express();
  app.put("/api/demo/profile/avatar/upload/:id", express.raw({ type: [...lib.AVATAR_TYPES], limit: lib.AVATAR_LIMIT }), async (req, res) => {
    try { await lib.storeAvatarUpload(req.params.id, req.headers["content-type"], req.body); res.sendStatus(200); }
    catch (error) { res.status(error instanceof lib.ProfileAvatarError ? 400 : 500).json({ error: "invalid_avatar" }); }
  });
  app.get("/api/profile-pictures/:id", async (req, res) => {
    if (!lib.validAvatarId(req.params.id)) { res.sendStatus(404); return; }
    await lib.serveProfileAvatar(req.params.id, res);
  });
  server = await new Promise(resolve => { const s = app.listen(0, "127.0.0.1", () => resolve(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;

  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(40, 7)]);
  const account = randomUUID(), other = randomUUID();
  const owner = `demo:${account}`;
  const upload = lib.createAvatarUpload();
  assert.match(upload.uploadURL, /^\/api\/demo\/profile\/avatar\/upload\/[a-f0-9-]{36}$/);
  assert.match(upload.objectPath, /^\/objects\/uploads\/[a-f0-9-]{36}$/);
  const id = upload.objectPath.split("/").pop();
  const put = (url, body, type = "image/png") => fetch(base + url, { method: "PUT", headers: { "Content-Type": type }, body });

  // No permit yet: rejected.
  assert.equal((await put(upload.uploadURL, png)).status, 400);
  const state = { profile: { avatarPath: null }, avatarUpload: { objectPath: upload.objectPath, size: png.length, contentType: "image/png", expiresAt: Date.now() + 60_000 } };
  await lib.db.insert(lib.demoAccounts).values({ id: account, state });
  // Wrong size, wrong declared type and non-image bytes are rejected.
  assert.equal((await put(upload.uploadURL, Buffer.concat([png, Buffer.from([1])]))).status, 400);
  assert.equal((await put(upload.uploadURL, png, "image/jpeg")).status, 400);
  assert.equal((await put(upload.uploadURL, Buffer.alloc(png.length, 1))).status, 400);
  // Valid upload succeeds exactly once and stays private until the profile is saved.
  assert.equal((await put(upload.uploadURL, png)).status, 200);
  assert.equal((await put(upload.uploadURL, png)).status, 400);
  assert.equal((await fetch(`${base}/api/profile-pictures/${id}`)).status, 404);
  await assert.rejects(lib.validateProfileAvatar(`demo:${other}`, upload.objectPath), lib.ProfileAvatarError);
  await lib.validateProfileAvatar(owner, upload.objectPath);
  const served = await fetch(`${base}/api/profile-pictures/${id}`);
  assert.equal(served.status, 200);
  assert.equal(served.headers.get("content-type"), "image/png");
  assert.equal(served.headers.get("x-content-type-options"), "nosniff");
  assert.equal(served.headers.get("content-security-policy"), "default-src 'none'; sandbox");
  assert.ok(Buffer.from(await served.arrayBuffer()).equals(png));
  // Only the owner can remove it.
  await lib.removeProfileAvatar(upload.objectPath, `demo:${other}`);
  assert.equal((await fetch(`${base}/api/profile-pictures/${id}`)).status, 200);
  await lib.removeProfileAvatar(upload.objectPath, owner);
  assert.equal((await fetch(`${base}/api/profile-pictures/${id}`)).status, 404);
  // Expired permit is rejected.
  const late = lib.createAvatarUpload();
  await pool.query("UPDATE demo_accounts SET state = $2 WHERE id = $1", [account, { ...state, avatarUpload: { ...state.avatarUpload, objectPath: late.objectPath, expiresAt: Date.now() - 1 } }]);
  assert.equal((await put(late.uploadURL, png)).status, 400);
  console.log("Profile avatar integration: Postgres upload, privacy, validation, serving and removal verified.");
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  if (pool) await pool.end();
  await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`).catch(() => {});
  await admin.end();
}
