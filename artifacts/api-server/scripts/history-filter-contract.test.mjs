import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Compile only the query contract: no database, application boot, or shared fixtures.
const { outputFiles } = await build({
  stdin: {
    contents: 'export {historyQuery} from "./src/modules/audit/transport/history-filters.ts";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
    loader: "ts",
  },
  bundle: true, platform: "node", format: "esm", write: false,
});
const { historyQuery } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`);

test("timeline accepts the complete correlation of a hashed demo account and UUID movement", () => {
  const correlationId = `demo:${"a".repeat(64)}:00000000-0000-4000-8000-000000000001`;
  assert.equal(correlationId.length, 106);
  assert.equal(historyQuery.parse({ view: "general", correlationId, limit: "20" }).correlationId, correlationId);
});

test("timeline still bounds arbitrary correlation input", () => {
  assert.equal(historyQuery.safeParse({ correlationId: "x".repeat(257) }).success, false);
});
