import { test } from "node:test";
import assert from "node:assert/strict";
import { demoTabIdentity } from "./demo-tab-session.ts";

test("different tabs have different demo identities; reload retains identity", () => {
  const a = "a".repeat(64), b = "b".repeat(64);
  assert.equal(demoTabIdentity(a), demoTabIdentity(a));
  assert.notEqual(demoTabIdentity(a), demoTabIdentity(b));
  assert.notEqual(demoTabIdentity(a), a);
});
test("anonymous demo capabilities do not identify authenticated accounts", () => {
  assert.notEqual(demoTabIdentity("a".repeat(64)), demoTabIdentity("a".repeat(64), true));
});
test("malformed tab capabilities fail explicitly, not cookie fallback", () => {
  assert.equal(demoTabIdentity(undefined), undefined);
  for (const value of ["", "a".repeat(63), "g".repeat(64), ["a".repeat(64)], null]) {
    assert.throws(() => demoTabIdentity(value), /invalid_demo_tab_session/);
  }
});
