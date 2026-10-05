import { walletsStore, ensureWalletsSchema } from "../modules/wallets/infrastructure/store";
import { ensureAccountsSchema } from "../modules/accounts/infrastructure/store";
import { journeyChain } from "../modules/wallets/infrastructure/journey-chain";
import { journeyStore } from "../modules/execution/infrastructure/journey-store";
import { createTestContractReader } from "../modules/reconciliation/infrastructure/chain-reader";
import { recordJourneyEvidence, recordJourneyPurchases } from "../modules/reconciliation/infrastructure/journey-evidence";
import { recordNativeHistory } from "./native-history";
import { testAccountsEnabled } from "./test-accounts";
import { logger } from "../lib/logger";
import { GetTestContractResponse } from "@workspace/api-zod";
export async function refreshNativeHistory(accountId: string) {
  if (!testAccountsEnabled()) return;
  await Promise.all([ensureAccountsSchema(), ensureWalletsSchema()]);
  await journeyStore.initialize();
  const material = await walletsStore().read(accountId);
  const deposit = material.wallets.find(w => w.purpose === "deposits"), holder = material.wallets.find(w => w.purpose === "bettex");
  if (!deposit?.chainIds.includes(31337) || !holder?.chainIds.includes(31337)) return;
  const meta = await journeyChain.metadata();
  const attestation = await createTestContractReader(journeyChain.provider, 31337).read(meta.token);
  const source = GetTestContractResponse.parse(attestation.state);
  if (source.allocations.find(a => a.kind === "public")?.address.toLowerCase() !== meta.sale.toLowerCase()
    || source.treasury?.toLowerCase() !== meta.treasury.toLowerCase()
    || source.operatingWallet?.toLowerCase() !== meta.operating.toLowerCase()) throw new Error("invalid_source");
  const block = await journeyChain.provider.getBlock("latest");
  if (!block?.hash) throw new Error("block_unavailable");
  const [deposits, holdings, purchases, operations] = await Promise.all([
    journeyChain.logs(meta, meta.usdc, deposit.address, block.number), journeyChain.logs(meta, meta.token, holder.address, block.number),
    journeyChain.purchases(meta, block.number), journeyStore.list(accountId, meta.epoch),
  ]);
  const verified = [];
  for (const p of purchases.filter(p => p.buyer.toLowerCase() === deposit.address.toLowerCase())) {
    const [tx, receipt, mined] = await Promise.all([journeyChain.provider.getTransaction(p.hash), journeyChain.receipt(p.hash), journeyChain.provider.getBlock(p.blockNumber)]);
    if (!tx || !receipt || receipt.status !== 1 || receipt.blockHash !== p.blockHash || mined?.hash !== p.blockHash) throw new Error("chain_reorganized");
    await journeyChain.verifyEffects("buy", p.hash, meta, { data: tx.data }, { id: p.operationId,
      quantity: String(BigInt(p.tokenUnits) / 10n ** 18n), principal: p.principal, fee: p.fee });
    verified.push({ ...p, timestamp: mined.timestamp, gasWei: String(receipt.gasUsed * receipt.gasPrice) });
  }
  if ((await journeyChain.provider.getBlock(block.number))?.hash !== block.hash) throw new Error("chain_reorganized");
  await recordJourneyEvidence(meta.epoch, meta.usdc, deposit.address, deposits);
  await recordJourneyEvidence(meta.epoch, meta.token, holder.address, holdings);
  await recordJourneyPurchases(meta.epoch, meta.token, meta.sale, verified);
  await recordNativeHistory(accountId, meta, deposit.address, holder.address, deposits, holdings, verified, operations.operations);
}
export function startNativeHistoryObserver() {
  if (!testAccountsEnabled()) return;
  let busy = false;
  const tick = async () => {
    if (busy) return; busy = true;
    try {
      await Promise.all([ensureAccountsSchema(), ensureWalletsSchema()]);
      for (const accountId of await walletsStore().localAccountIds()) await refreshNativeHistory(accountId);
    } catch { logger.warn({ code: "native_history_sync_unavailable" }, "History reconciliation will retry; no confirmation inferred"); }
    finally { busy = false; }
  };
  const timer = setInterval(() => void tick(), 15_000); timer.unref(); void tick(); return timer;
}
