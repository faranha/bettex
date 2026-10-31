import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { generateNickname, ensureProfileNickname } from "../src/modules/accounts/domain/nickname.ts";
import { seedAccount } from "../src/lib/demo-state.ts";

test("every newly created profile has a generated alias that fits the nickname field", () => {
  const names = new Set();
  for (let i = 0; i < 500; i++) {
    const profile = seedAccount(Date.now()).profile;
    assert.match(profile.nickname, /^[A-Z][a-z]+[A-Z][a-z]+-[a-f0-9]{10}$/);
    assert.ok(profile.nickname.length <= 32);
    assert.notEqual(profile.nickname, profile.name);
    names.add(profile.nickname);
  }
  assert.equal(names.size, 500);
});

test("legacy missing and blank nicknames are generated once and survive repeated loads", () => {
  for (const nickname of [undefined, null, "", "  "]) {
    const profile = { nickname };
    const assigned = ensureProfileNickname(profile, randomUUID);
    assert.ok(assigned.trim());
    assert.equal(ensureProfileNickname(profile, () => { throw new Error("must not regenerate"); }), assigned);
  }
});

test("owner-selected nicknames survive logins, loads and profile updates", () => {
  const profile = { nickname: "MyChosenNickname" };
  assert.equal(ensureProfileNickname(profile, () => { throw new Error("must preserve custom alias"); }), "MyChosenNickname");
  assert.equal(profile.nickname, "MyChosenNickname");
});

test("generation uses random entropy rather than names, emails or account identifiers", () => {
  assert.equal(generateNickname("00000000-0000-0000-0000-000000000000"), "BrightFalcon-0000000000");
  assert.throws(() => generateNickname("someone@example.com"), /invalid_nickname_entropy/);
});
