import test from "node:test";
import assert from "node:assert/strict";
import { reasoningSchema } from "../src/modules/agents/infrastructure/reasoning-schema.ts";

test("no evidence forbids citations and monitoring at the model contract", () => {
  const s = reasoningSchema(0).properties;
  assert.equal(s.evidenceIndices.maxItems, 0);
  assert.deepEqual(s.recommendation.enum, ["abstain", "review"]);
});
test("model citations are bounded to the real supplied evidence indices", () => {
  const s = reasoningSchema(4).properties;
  assert.equal(s.evidenceIndices.items.minimum, 0);
  assert.equal(s.evidenceIndices.items.maximum, 3);
  assert.equal(s.evidenceIndices.maxItems, 20);
  assert.deepEqual(s.recommendation.enum, ["monitor", "abstain", "review"]);
});
test("model output text bounds match domain validation", () => {
  const s = reasoningSchema(1).properties;
  assert.equal(s.summary.maxLength, 2400);
  for (const name of ["observations", "uncertainties", "nextSteps"]) {
    assert.equal(s[name].maxItems, 10);
    assert.equal(s[name].items.maxLength, 1200);
  }
  assert.throws(() => reasoningSchema(-1), /invalid_evidence_count/);
});
