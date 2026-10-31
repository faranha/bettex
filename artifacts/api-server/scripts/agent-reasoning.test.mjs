import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
const compiled = buildSync({
  entryPoints: [new URL("../src/modules/agents/application/reasoning.ts", import.meta.url).pathname],
  bundle: true, platform: "node", format: "esm", write: false,
}).outputFiles[0].text;
const { reasonAgent } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const output = { summary: "Evidence is insufficient.", observations: [], uncertainties: ["No calibrated event model."],
  nextSteps: ["Collect validated observations."], recommendation: "review", evidenceIndices: [] };
const context = { agentId: "btc", language: "en", sourceAt: new Date().toISOString(), rules: [], dependencies: [], run: null };
test("real model port output is required, provenance is retained, no execution permission", async () => {
  let calls = 0;
  const report = await reasonAgent(context, { infer: async () => { calls++; return { value: output, model: "fixture-model", responseId: "fixture-response" }; } }, "fixture-report");
  assert.equal(calls, 1); assert.equal(report.executionAllowed, false);
  assert.equal(report.model, "fixture-model"); assert.equal(report.providerResponseId, "fixture-response");
  assert.deepEqual(report.analysis, output);
});
test("inference failure never yields a scripted substitute", async () => {
  await assert.rejects(reasonAgent(context, { infer: async () => { throw new Error("provider_offline"); } }, "fixture"), /provider_offline/);
});
test("invented evidence and unsupported monitoring are rejected", async () => {
  for (const value of [{ ...output, evidenceIndices: [0] }, { ...output, recommendation: "monitor" }]) {
    await assert.rejects(reasonAgent(context, { infer: async () => ({ value, model: "fixture-model", responseId: "fixture" }) }, "fixture"));
  }
});
test("invalid model output or missing provenance is rejected", async () => {
  for (const result of [{ value: {}, model: "fixture", responseId: "fixture" }, { value: output, model: "", responseId: "fixture" }]) {
    await assert.rejects(reasonAgent(context, { infer: async () => result }, "fixture"));
  }
});
