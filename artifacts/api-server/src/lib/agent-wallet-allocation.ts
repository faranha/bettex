import type { DemoAgentWalletAllocation, DemoOperation } from "@workspace/api-zod";

/** Share the reservation definition with orchestration without importing its runtime cycle. */
export const APPROVED_CAPITAL_STATUSES = new Set(["approved", "validated", "executing", "open", "result", "reconciling"]);
export function isCryptoAllocationPosition(op: Pick<DemoOperation, "agent" | "market">) {
  // BTC/ETH/SOL event markets retain their predictions protocol identity.
  // This does not activate the future general Prediction Markets sector.
  return op.agent === "crypto" || op.agent === "predictions" && /^(BTC|ETH|SOL)(?:[\s/-]|$)/i.test(op.market);
}

export function cryptoAgentAllocation(operations: DemoOperation[]): DemoAgentWalletAllocation {
  const positions = operations.filter(op => APPROVED_CAPITAL_STATUSES.has(op.status) && isCryptoAllocationPosition(op));
  if (new Set(positions.map(op => op.id)).size !== positions.length ||
    positions.some(op => !Number.isFinite(op.capitalUsdc) || op.capitalUsdc < 0)) {
    throw new Error("invalid_crypto_wallet_allocation");
  }
  const allocatedUsdc = positions.reduce((sum, op) => sum + Math.round(op.capitalUsdc * 1e6), 0) / 1e6;
  return {
    agent: "crypto", walletPurpose: "crypto_agent", allocatedUsdc,
    committedUsdc: allocatedUsdc, availableUsdc: 0, activePositions: positions.length,
    source: "approved_operations",
  };
}
