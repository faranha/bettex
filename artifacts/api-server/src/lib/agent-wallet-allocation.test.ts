import { strict as assert } from "node:assert";
import { test } from "node:test";
import type { DemoOperation } from "@workspace/api-zod";
import { cryptoAgentAllocation, APPROVED_CAPITAL_STATUSES } from "./agent-wallet-allocation.ts";
import { treasuryRoundSnapshot } from "./treasury-round.ts";
import type { EngineState } from "./demo-state.ts";
const op = (id: string, agent: string, market: string, status: string, capitalUsdc: number) =>
  ({ id, agent, market, status, capitalUsdc } as DemoOperation);

test("only approved capital is attributed, preserving BTC/ETH/SOL protocol identifiers", () => {
  const allocation = cryptoAgentAllocation([
    op("a", "crypto", "BTC/USDC", "approved", 220),
    op("b", "predictions", "ETH-updown", "open", 180),
    op("c", "predictions", "SOL-150-USD", "validated", 75),
    op("d", "crypto", "BTC/USDC", "queued", 900),
    op("e", "sports", "Aurora FC", "open", 260),
    op("f", "predictions", "election-2026", "approved", 90),
    op("g", "crypto", "BTC/USDC", "closed", 500),
  ]);
  assert.equal(allocation.allocatedUsdc, 475);
  assert.equal(allocation.committedUsdc, 475);
  assert.equal(allocation.availableUsdc, 0);
  assert.equal(allocation.activePositions, 3);
});
test("capital releases on closing and every reservation phase counts once", () => {
  for (const status of APPROVED_CAPITAL_STATUSES) assert.equal(cryptoAgentAllocation([op(status, "crypto", "BTC/USDC", status, 25)]).allocatedUsdc, 25);
  for (const status of ["closed", "rejected", "expired", "cancelled", "failed", "queued", "awaiting_budget"])
    assert.equal(cryptoAgentAllocation([op(status, "crypto", "BTC/USDC", status, 25)]).allocatedUsdc, 0);
});
test("repartitioning operating capital never creates new assets or a fixed budget", () => {
  const allocation = cryptoAgentAllocation([op("a", "crypto", "BTC/USDC", "open", 120.123456)]);
  const assets = 240000, reserve = 60000, working = assets - reserve;
  const operational = working - allocation.allocatedUsdc;
  assert.ok(Math.abs(operational + allocation.allocatedUsdc + reserve - assets) < 1e-6);
  assert.equal(cryptoAgentAllocation([]).allocatedUsdc, 0);
  assert.throws(() => cryptoAgentAllocation([op("x", "crypto", "BTC", "open", NaN)]));
  assert.throws(() => cryptoAgentAllocation([op("x", "crypto", "BTC", "open", 1), op("x", "crypto", "BTC", "open", 1)]));
});
test("round photos preserve their own allocation instead of borrowing the next round", () => {
  const start = Date.UTC(2026, 9, 7, 19);
  const engine = {
    dayAt: start, treasury: { assetsUsdc: 240000, reserveUsdc: 60000, cycleResultUsdc: 0 },
    operations: [{ ...op("a", "crypto", "BTC/USDC", "open", 250), pnlUsdc: 0 }],
  } as EngineState;
  const photo = JSON.parse(JSON.stringify(treasuryRoundSnapshot(engine, start)));
  assert.equal(photo.agentAllocations[0].allocatedUsdc, 250);
  assert.equal(photo.operationalWalletUsdc, 179750);
  assert.equal(photo.operationalWalletCommittedUsdc, 0);
  assert.equal(photo.operationalWalletUsdc + photo.agentAllocations[0].allocatedUsdc + photo.reserveUsdc, photo.assetsUsdc);
  engine.operations[0]!.status = "closed";
  engine.dayAt += 86400000;
  assert.equal(treasuryRoundSnapshot(engine, engine.dayAt).agentAllocations?.[0]?.allocatedUsdc, 0);
  assert.equal(photo.agentAllocations[0].allocatedUsdc, 250);
  const { agentAllocations, operationalWalletUsdc, operationalWalletCommittedUsdc, ...legacy } = photo;
  assert.ok(!Object.hasOwn(legacy, "agentAllocations")); // absence is unknown, not measured zero
});
