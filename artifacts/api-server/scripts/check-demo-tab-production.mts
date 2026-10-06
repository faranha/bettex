import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { once } from "node:events";

if (process.env.NODE_ENV !== "production") throw new Error("Run this isolated fixture with NODE_ENV=production against the development database.");
const { default: app } = await import("../src/app.ts");
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
if (!address || typeof address === "string") throw new Error("Fixture did not start");
const base = `http://127.0.0.1:${address.port}`;
let failed = false;
try {
  const first = { "X-Bettex-Demo-Session": randomBytes(32).toString("hex") };
  const second = { "X-Bettex-Demo-Session": randomBytes(32).toString("hex") };
  const a = await fetch(`${base}/api/demo/dashboard`, { headers: first });
  const b = await fetch(`${base}/api/demo/dashboard`, { headers: second });
  assert.equal(a.status, 200); assert.equal(b.status, 200);
  const left = await a.json(), right = await b.json();
  assert.equal(left.profile.authenticated, false);
  assert.equal(right.profile.authenticated, false);
  assert.notEqual(left.profile.accountId, right.profile.accountId);
  const reloaded = await (await fetch(`${base}/api/demo/dashboard`, { headers: first })).json();
  assert.equal(reloaded.profile.accountId, left.profile.accountId);
  assert.equal((await fetch(`${base}/api/demo/dashboard`)).status, 403);
  assert.equal((await fetch(`${base}/api/demo/dashboard`, { headers: { "X-Bettex-Demo-Session": "malformed" } })).status, 400);
  assert.equal((await fetch(`${base}/api/demo/history?view=treasury`, { headers: first })).status, 403);
  const native = await fetch(`${base}/api/account/session`, { headers: first });
  if (native.status === 200) assert.equal((await native.json()).enabled, false);
  else assert.ok([401, 403].includes(native.status));
  assert.equal((await fetch(`${base}/api/demo/profile`, {
    method: "PATCH", headers: { ...first, "Content-Type": "application/json", Origin: "https://attacker.invalid" },
    body: JSON.stringify({ name: "Not permitted" }),
  })).status, 403);
  console.log("PASS production-mode anonymous tab isolation, reload, invalid capabilities, origin guard and real-account/treasury boundaries.");
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : "Production fixture failed");
} finally {
  await new Promise<void>(done => server.close(() => done()));
  process.exit(failed ? 1 : 0);
}
