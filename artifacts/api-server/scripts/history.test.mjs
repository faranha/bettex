import test from "node:test";
import assert from "node:assert/strict";
import { safeHistoryData, decimalUnits } from "../src/modules/audit/domain/history.ts";
test("exact units without floats, scientific notation and precision rejection", () => {
  assert.equal(decimalUnits("7.5", 6), "7500000");
  assert.equal(decimalUnits("100", 18), "100000000000000000000");
  assert.equal(decimalUnits("1e-6", 6), "1");
  assert.equal(decimalUnits("-0.005", 6), "-5000");
  assert.throws(() => decimalUnits("0.0000001", 6));
  assert.throws(() => decimalUnits("Infinity", 6));
});
test("journal payloads reject secret fields recursively and monetary floats", () => {
  for (const key of ["password","privateKey","mnemonic","seed","sessionToken","cookie","ciphertext","backupContent"]) {
    assert.throws(() => safeHistoryData({ nested: { [key]: "never_store_this" } }));
  }
  assert.throws(() => safeHistoryData({ paidUnits: 7.5 }));
  assert.throws(() => safeHistoryData({ paidUnits: "7.5" }));
  assert.deepEqual(safeHistoryData({ paidUnits: "7500000", tokenUnits: "100", ruleVersion: "v1" }),
    { paidUnits: "7500000", tokenUnits: "100", ruleVersion: "v1" });
});
