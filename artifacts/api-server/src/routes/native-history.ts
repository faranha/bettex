/** Composition of verified reconciliation facts and the shared append-only journal. */
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { appendHistory, ensureHistorySchema, historyId } from "../modules/audit/infrastructure/history-store";
import type { LocalMetadata } from "../modules/wallets/infrastructure/journey-chain";
import { participationAt } from "../modules/ledger";
import { journeyChain } from "../modules/wallets/infrastructure/journey-chain";
type Transfer = { id: string; hash: string; blockHash: string; blockNumber: number; logIndex: number; from: string; to: string; value: string; timestamp: number };
type Purchase = { hash: string; blockHash: string; blockNumber: number; logIndex: number; operationId: string; buyer: string; recipient: string; tokenUnits: string; principal: string; fee: string; timestamp: number; gasWei: string };
export async function recordNativeHistory(accountId: string, meta: LocalMetadata, deposit: string, holder: string,
  deposits: Transfer[], holdings: Transfer[], purchases: Purchase[], operations: { id: string; createdAt: Date; kind: string;
  stages: { name: string; state: string; transactionHash: string | null }[] }[]) {
  await ensureHistorySchema();
  const subject = `native:${accountId}`, cutover = new Date(String((await db.execute(sql`SELECT started_at FROM history_coverage WHERE id='recording-start'`)).rows[0]!.started_at));
  const base = { subject, environment: "local_evm" as const, chainId: 31337, epoch: meta.epoch, source: "blockchain_receipt" };
  const mine = purchases.filter(p => p.buyer.toLowerCase() === deposit.toLowerCase() && p.recipient.toLowerCase() === holder.toLowerCase());
  const canonicalGas = new Set<string>();
  for (const op of operations) for (const stage of op.stages) {
    if (stage.state !== "confirmed" || !stage.transactionHash) continue;
    const [receipt, tx] = await Promise.all([journeyChain.receipt(stage.transactionHash), journeyChain.provider.getTransaction(stage.transactionHash)]);
    if (!receipt || !tx || receipt.status !== 1) continue;
    const block = await journeyChain.provider.getBlock(receipt.blockNumber);
    if (block?.hash !== receipt.blockHash) continue;
    canonicalGas.add(`${receipt.hash}:${receipt.blockHash}`);
    const gasCredit = stage.name === "gas-deposit" || stage.name === "gas-bettex";
    await appendHistory({ ...base, key: `receipt:${meta.epoch}:${receipt.hash}:${receipt.blockHash}`, correlationId: op.id,
      category: gasCredit ? "financial" : "automatic", actor: op.kind === "fund" ? "system" : "user",
      kind: gasCredit ? "free_test_funding" : stage.name === "approve" ? "approve" : "execution_transition",
      state: "confirmed", asset: gasCredit ? "ETH" : stage.name === "approve" ? "USDC" : "BETTEX",
      wallet: gasCredit ? tx.to ?? undefined : tx.from, transactionHash: receipt.hash, blockHash: receipt.blockHash, blockNumber: receipt.blockNumber,
      occurredAt: new Date(block.timestamp * 1000), requestedAt: op.createdAt, reconstructed: new Date(block.timestamp * 1000) < cutover,
      source: "blockchain_gas_receipt", data: { stage: stage.name, operationKind: op.kind, trigger: op.id, gasWei: String(receipt.gasUsed * receipt.gasPrice),
        ...(gasCredit ? { amountUnits: String(tx.value), decimals: "18", from: tx.from, to: tx.to } : { contract: tx.to }) } });
  }
  for (const p of mine) {
    const op = operations.find(o => o.id === p.operationId), occurredAt = new Date(p.timestamp * 1000);
    const key = `native:${meta.epoch}:${p.hash}:${p.logIndex}:${p.blockHash}`;
    const event = { ...base, key, correlationId: p.operationId, category: "financial" as const, actor: "user" as const,
      kind: "purchase", state: "confirmed", asset: "BETTEX", wallet: deposit, transactionHash: p.hash,
      blockHash: p.blockHash, blockNumber: p.blockNumber, logIndex: p.logIndex, occurredAt, requestedAt: op?.createdAt,
      reconstructed: occurredAt < cutover, data: { paidAsset: "USDC", paidUnits: String(BigInt(p.principal) + BigInt(p.fee)),
        paidDecimals: "6", receivedAsset: "BETTEX", receivedUnits: p.tokenUnits, receivedDecimals: "18", principalUnits: p.principal,
        feeUnits: p.fee, gasWei: p.gasWei, priceUnits: String(BigInt(p.principal) / (BigInt(p.tokenUnits) / 10n ** 18n)),
        priceDecimals: "6", priceUnit: "USDC/BETTEX", targetWallet: holder, contract: meta.sale, treasury: meta.treasury } };
    await appendHistory(event);
    await appendHistory({ ...event, key: `${key}:treasury`, subject: `treasury:${meta.epoch}`, visibility: "admin",
      kind: "treasury_principal", actor: "contract", asset: "USDC", wallet: meta.treasury,
      data: { amountUnits: p.principal, decimals: "6", feeExcludedUnits: p.fee, contract: meta.sale } });
  }
  const purchasedHashes = new Set(mine.map(p => p.hash));
  const all = [...deposits.map(e => ({ ...e, asset: "USDC", decimals: "6" })), ...holdings.map(e => ({ ...e, asset: "BETTEX", decimals: "18" }))];
  for (const e of all) {
    const occurredAt = new Date(e.timestamp * 1000), key = `native:${meta.epoch}:${e.hash}:${e.logIndex}:${e.blockHash}`;
    const purchase = mine.find(p => p.hash === e.hash);
    const fund = operations.find(o => o.kind === "fund" && o.stages.some(s => s.name === "usdc-deposit" && s.transactionHash === e.hash));
    const correlationId = purchase?.operationId ?? fund?.id ?? `chain:${e.hash}`;
    const incoming = [deposit, holder].some(w => w.toLowerCase() === e.to.toLowerCase());
    const internal = [deposit, holder].some(w => w.toLowerCase() === e.from.toLowerCase()) && incoming;
    if (!purchasedHashes.has(e.hash)) await appendHistory({ ...base, key, correlationId, category: "financial", actor: fund ? "system" : "contract",
      kind: fund ? "free_test_funding" : internal ? "internal_transfer" : incoming ? "external_deposit" : "outgoing_transfer",
      state: "confirmed", asset: e.asset, wallet: incoming ? e.to : e.from, transactionHash: e.hash, blockHash: e.blockHash,
      blockNumber: e.blockNumber, logIndex: e.logIndex, occurredAt, requestedAt: fund?.createdAt, reconstructed: occurredAt < cutover,
      data: { amountUnits: e.value, decimals: e.decimals, from: e.from, to: e.to, contract: e.asset === "USDC" ? meta.usdc : meta.token } });
    if (e.asset === "BETTEX") {
      if (e.from.toLowerCase() === e.to.toLowerCase()) continue;
      const upto = holdings.filter(h => h.blockNumber < e.blockNumber || h.blockNumber === e.blockNumber && h.logIndex <= e.logIndex);
      const after = participationAt(holder, upto, e.timestamp);
      await appendHistory({ ...base, key: `${key}:participation`, correlationId, category: "automatic", actor: "system",
        kind: incoming ? "participation_entry" : "participation_exit", state: "confirmed", asset: "BETTEX", wallet: holder,
        occurredAt, reconstructed: occurredAt < cutover, parentId: historyId(purchase ? `native:${meta.epoch}:${purchase.hash}:${purchase.logIndex}:${purchase.blockHash}` : key),
        data: { quantityUnits: e.value, eligibleUnits: after.eligible, decimals: "18", ruleVersion: "wallet-quantity-time-v1",
          weightUnits: after.tokenSeconds, eligibilityStartedAt: after.startedAt === null ? null : new Date(after.startedAt * 1000).toISOString(),
          periodId: new Date(after.roundStart * 1000).toISOString().slice(0, 10),
          mechanism: "wallet_balance", trigger: `chain:${e.hash}:${e.logIndex}`, priorWeightCancelled: !incoming ? "true" : "false" } });
    }
  }
  // Append corrections; preserve original confirmed facts instead of silent deletion.
  const canonical = new Set([...canonicalGas, ...all.map(e => `${e.hash}:${e.blockHash}`), ...mine.map(p => `${p.hash}:${p.blockHash}`)]);
  const old = await db.execute(sql`SELECT id,correlation_id,category,transaction_hash,block_hash,asset,wallet,data
    FROM history_events WHERE subject=${subject} AND epoch=${meta.epoch} AND category IN ('financial','automatic') AND source IN ('blockchain_receipt','blockchain_gas_receipt')`);
  for (const r of old.rows) if (!canonical.has(`${r.transaction_hash}:${r.block_hash}`)) {
    await appendHistory({ ...base, key: `reversal:${r.id}`, correlationId: r.correlation_id as string, category: r.category as "financial" | "automatic",
      actor: "system", kind: r.category === "financial" ? "reversal" : "execution_correction", state: "reversed", asset: r.asset as string, wallet: r.wallet as string,
      parentId: r.id as string, source: "reconciliation", data: { reason: "chain_reorganization", originalId: r.id } });
    const participation = await db.execute(sql`SELECT id FROM history_events WHERE parent_id=${r.id} AND kind IN ('participation_entry','participation_exit')`);
    for (const entry of participation.rows) await appendHistory({ ...base, key: `eligibility-reversal:${entry.id}`, correlationId: r.correlation_id as string,
      category: "automatic", actor: "system", kind: "participation_correction", state: "reversed", asset: "BETTEX",
      parentId: entry.id as string, source: "reconciliation", data: { reason: "chain_reorganization", ruleVersion: "wallet-quantity-time-v1", trigger: r.id } });
    const peers = await db.execute(sql`SELECT id FROM history_events WHERE visibility='admin' AND correlation_id=${r.correlation_id} AND kind='treasury_principal'`);
    for (const peer of peers.rows) await appendHistory({ ...base, subject: `treasury:${meta.epoch}`, visibility: "admin",
      key: `reversal:${peer.id}`, correlationId: r.correlation_id as string, category: "financial", actor: "system",
      kind: "reversal", state: "reversed", source: "reconciliation", parentId: peer.id as string,
      data: { reason: "chain_reorganization", originalId: peer.id } });
  }
}
