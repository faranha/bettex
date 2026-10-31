/** Composition only: existing accounts/wallets, execution, ledger, reconciliation. */
import { Router } from "express";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { keccak256, toUtf8Bytes } from "ethers";
import { NativeTestJourneyCommandBody, GetTestContractResponse } from "@workspace/api-zod";
import { token, permittedOrigin, testAccountsEnabled } from "./test-accounts";
import { accountsStore, ensureAccountsSchema, limitAuthAttempts } from "../modules/accounts/infrastructure/store";
import { walletsStore, ensureWalletsSchema, associateLocalTestNetwork } from "../modules/wallets/infrastructure/store";
import { journeyStore } from "../modules/execution/infrastructure/journey-store";
import { journeyChain } from "../modules/wallets/infrastructure/journey-chain";
import { nativeJourney } from "../modules/execution";
import { participationAt } from "../modules/ledger";
import { createTestContractReader } from "../modules/reconciliation/infrastructure/chain-reader";
import { recordJourneyEvidence, recordJourneyPurchases } from "../modules/reconciliation/infrastructure/journey-evidence";
import { appendHistory, ensureHistorySchema, type HistoryClient } from "../modules/audit/infrastructure/history-store";
import { recordNativeHistory } from "./native-history";
import { localRound } from "./local-round";
import { chainJournal } from "../modules/ledger/infrastructure/chain-journal";
import { localWalletService } from "../modules/wallets/infrastructure/local-wallet-service";

const router = Router();
const treasurySystemAccounts=new Set(["local-round-system","treasury-governance-system","treasury-governance-capital"]);
journeyStore.recorder = async (client, event) => appendHistory({
  ...event, subject: treasurySystemAccounts.has(event.accountId)?"treasury:local":`native:${event.accountId}`,
  ...(treasurySystemAccounts.has(event.accountId)?{visibility:"admin" as const}:{}),
  category: event.kind === "execution_requested" && event.data.operationKind !== "distribution" ? "activity" : "automatic",
  actor: event.kind === "execution_requested" && event.data.operationKind !== "distribution" ? "user" : "system",
  epoch: event.data.epoch, transactionHash: event.data.transactionHash,
  environment: "local_evm", chainId: 31337, source: "execution", data: event.data,
}, client as HistoryClient);
const flow = nativeJourney({
  store: journeyStore, chain: journeyChain, executorId: randomUUID(), hashId: value => keccak256(toUtf8Bytes(value)),
  verifyEffects: (stage, receipt, meta, operation) => journeyChain.verifyEffects(stage.name, receipt.hash, meta,
    stage.draft as Record<string, string | number>, operation),
});
let initialization: Promise<void> | undefined;
const ready = () => initialization ??= ensureAccountsSchema().then(ensureWalletsSchema).then(ensureHistorySchema).then(() => journeyStore.initialize())
  .catch(error => { initialization = undefined; throw error; });
const reader = createTestContractReader(journeyChain.provider, 31337);

router.all(["/account/execution", "/test-account/journey"], async (req, res) => {
  let auditAccount: string | undefined, auditCorrelation: string = randomUUID();
  res.set("Cache-Control", "no-store, private");
  try {
    if (!testAccountsEnabled()) { res.status(403).json({ code: "test_environment_required" }); return; }
    await ready();
    const session = await accountsStore().session(token(req));
    if (!session) { res.status(401).json({ code: "session_required" }); return; }
    auditAccount = session.accountId;
    const material = await walletsStore().read(session.accountId);
    const deposit = material.wallets.find(w => w.purpose === "deposits");
    const holder = material.wallets.find(w => w.purpose === "bettex");
    if (!deposit || !holder) throw new Error("wallets_unavailable");
    const meta = await journeyChain.metadata();
    // Existing attestation: runtime AND constructor links, supply, schedule, assets.
    const attestation = await reader.read(meta.token);
    const source = GetTestContractResponse.parse(attestation.state);
    if (source.allocations.find(a => a.kind === "public")?.address.toLowerCase() !== meta.sale.toLowerCase()
      || source.treasury?.toLowerCase() !== meta.treasury.toLowerCase()
      || source.operatingWallet?.toLowerCase() !== meta.operating.toLowerCase()) throw new Error("invalid_source");
    await flow.reconcileAll(session.accountId, meta);
    if (req.method === "POST") {
      if (!permittedOrigin(req) || !req.is("application/json")) { res.status(403).json({ code: "origin_not_allowed" }); return; }
      const parsed = NativeTestJourneyCommandBody.strict().safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ code: "invalid_input" }); return; }
      const body = parsed.data;
      auditCorrelation = body.operationId ?? auditCorrelation;
      const expected = Buffer.from(session.csrf), actual = Buffer.from(body.csrf);
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) { res.status(403).json({ code: "session_required" }); return; }
      await limitAuthAttempts(`journey:${session.accountId}`, 80);
      if (body.action === "fund") {
        if (!body.acknowledgeLocal) throw new Error("local_acknowledgement_required");
        await associateLocalTestNetwork(material.wallets.map(w => w.id));
        await appendHistory({ key: `association:${session.accountId}:31337`, subject: `native:${session.accountId}`,
          correlationId: `association:${session.accountId}:31337`, category: "activity", kind: "wallets_associated",
          state: "confirmed", actor: "user", environment: "local_evm", chainId: 31337, epoch: meta.epoch,
          source: "wallets", data: { mechanism: "explicit_local_acknowledgement", walletCount: "2" } });
        const block = await journeyChain.provider.getBlockNumber();
        await flow.fund(session.accountId, meta, deposit.address, holder.address,
          await journeyChain.balance(meta.usdc, meta.reserve, block), true);
      } else {
        if (!deposit.chainIds.includes(31337) || !holder.chainIds.includes(31337)) throw new Error("local_acknowledgement_required");
        if (body.action === "distribution-test") {
          if (!meta.distributionGuard) throw new Error("guarded_runtime_required");
          await appendHistory({ key: `local-round-request:${randomUUID()}`, subject: `native:${session.accountId}`,
            correlationId: auditCorrelation, category: "activity", kind: "test_distribution_requested", state: "requested",
            actor: "user", environment: "local_evm", chainId: 31337, epoch: meta.epoch, source: "ledger",
            data: { trigger: "explicit_test_mandate_request" } });
          await localRound(session.accountId, meta, flow, true);
        } else if (body.action === "quote-withdrawal") {
          if (!body.operationId || !body.asset || !body.units || !body.destination) throw new Error("invalid_input");
          const block = await journeyChain.provider.getBlockNumber();
          const executor = await localWalletService(meta);
          await flow.withdrawal(session.accountId, meta, body.operationId, { asset: body.asset,
            units: body.units, destination: body.destination, executor, deposit: deposit.address, holder: holder.address },
          { usdc: await journeyChain.balance(meta.usdc, deposit.address, block),
            bettex: await journeyChain.balance(meta.token, holder.address, block) });
        } else if (body.action === "quote") {
          if (!body.operationId || !body.quantity) throw new Error("invalid_quantity");
          const block = await journeyChain.provider.getBlockNumber();
          await flow.quote(session.accountId, meta, deposit.address, holder.address, body.operationId, body.quantity,
            await journeyChain.sale(meta, block), await journeyChain.balance(meta.usdc, deposit.address, block));
        } else {
          if (!body.operationId || !body.stage || !body.signedTransaction) throw new Error("invalid_input");
          await flow.sign(session.accountId, meta, body.operationId, body.stage, body.signedTransaction);
        }
      }
    } else if (req.method !== "GET") { res.status(405).json({ code: "method_not_allowed" }); return; }

    const settlement = await localRound(session.accountId, meta, flow, false);
    const block = await journeyChain.provider.getBlock("latest");
    if (!block?.hash) throw new Error("block_unavailable");
    const tag = block.number;
    await chainJournal.initialize();
    await chainJournal.reconcile(meta.epoch, async height => (await journeyChain.provider.getBlock(height))?.hash ?? null);
    await chainJournal.record(meta.epoch, meta.usdc, 6, await journeyChain.logs({ ...meta, deploymentBlock: 0 }, meta.usdc, "*", tag));
    await chainJournal.record(meta.epoch, meta.token, 18, await journeyChain.logs(meta, meta.token, "*", tag));
    const [depositEvents, holderEvents, purchases, sale, usdc, bettex, depositGas, bettexGas, reserveUsdc, treasuryUsdc, list] = await Promise.all([
      journeyChain.logs(meta, meta.usdc, deposit.address, tag), journeyChain.logs(meta, meta.token, holder.address, tag),
      journeyChain.purchases(meta, tag), journeyChain.sale(meta, tag),
      journeyChain.balance(meta.usdc, deposit.address, tag), journeyChain.balance(meta.token, holder.address, tag),
      journeyChain.provider.getBalance(deposit.address, tag), journeyChain.provider.getBalance(holder.address, tag),
      journeyChain.balance(meta.usdc, meta.reserve, tag), journeyChain.balance(meta.usdc, meta.treasury, tag),
      journeyStore.list(session.accountId, meta.epoch),
    ]);
    for (const [asset, wallet, actual] of [[meta.usdc, deposit.address, usdc], [meta.token, holder.address, bettex],
      [meta.usdc, meta.treasury, treasuryUsdc], [meta.usdc, meta.reserve, reserveUsdc]]) {
      if (await chainJournal.balance(meta.epoch, asset!, wallet!) !== actual) throw new Error("ledger_mismatch");
    }
    const verifiedPurchases = [];
    for (const purchase of purchases) {
      const tx = await journeyChain.provider.getTransaction(purchase.hash);
      const receipt = await journeyChain.receipt(purchase.hash);
      const mined = await journeyChain.provider.getBlock(purchase.blockNumber);
      if (!tx || !receipt || receipt.status !== 1 || receipt.blockHash !== purchase.blockHash || mined?.hash !== purchase.blockHash) throw new Error("chain_reorganized");
      await journeyChain.verifyEffects("buy", purchase.hash, meta, { data: tx.data }, {
        id: purchase.operationId, quantity: String(BigInt(purchase.tokenUnits) / 10n ** 18n), principal: purchase.principal, fee: purchase.fee,
      });
      verifiedPurchases.push({ ...purchase, timestamp: mined.timestamp, gasWei: String(receipt.gasUsed * receipt.gasPrice) });
    }
    const participation = participationAt(holder.address, holderEvents, block.timestamp);
    if (participation.balance !== bettex) throw new Error("participation_balance_mismatch");
    const fundingHashes = new Set(list.operations.filter(o => o.kind === "fund")
      .flatMap(o => o.stages.filter(s => s.name === "usdc-deposit" && s.state === "confirmed" && s.transactionHash).map(s => s.transactionHash)));
    const events = [
      ...depositEvents.filter(e => e.to.toLowerCase() === deposit.address.toLowerCase()).map(e => ({
        ...e, kind: fundingHashes.has(e.hash) ? "free_test_funding" : "external_deposit",
      })),
      ...verifiedPurchases.filter(p => p.buyer.toLowerCase() === deposit.address.toLowerCase()
        && p.recipient.toLowerCase() === holder.address.toLowerCase()).map(p => ({
        id: `${p.hash}:${p.logIndex}:${p.blockHash}`, kind: "purchase", hash: p.hash, blockNumber: p.blockNumber,
        blockHash: p.blockHash, logIndex: p.logIndex, timestamp: p.timestamp, value: p.principal,
        bettex: p.tokenUnits, principal: p.principal, fee: p.fee, treasuryReceived: p.principal, gasWei: p.gasWei,
      })),
    ];
    if ((await journeyChain.provider.getBlock(tag))?.hash !== block.hash) throw new Error("chain_reorganized");
    await Promise.all([recordJourneyEvidence(meta.epoch, meta.usdc, deposit.address, depositEvents),
      recordJourneyEvidence(meta.epoch, meta.token, holder.address, holderEvents)]);
    await recordJourneyPurchases(meta.epoch, meta.token, meta.sale, verifiedPurchases);
    await recordNativeHistory(session.accountId, meta, deposit.address, holder.address, depositEvents, holderEvents, verifiedPurchases, list.operations);
    res.json({ epoch: meta.epoch, chainId: 31337, environment: "local_evm",
      updatedAt: new Date(block.timestamp * 1000).toISOString(), blockNumber: tag, blockHash: block.hash,
      depositWallet: deposit.address, bettexWallet: holder.address,
      balances: { usdc, bettex, depositGas: String(depositGas), bettexGas: String(bettexGas) },
      sale: { ...sale, address: meta.sale, token: meta.token, usdc: meta.usdc, reserveUsdc },
      treasury: { address: meta.treasury, operatingAddress: meta.operating, balanceUsdc: treasuryUsdc,
        principalUsdc: String(purchases.reduce((sum, p) => sum + BigInt(p.principal), 0n)),
        soldBettex: sale.sold, accountingAvailable: true },
      participation: { ...participation, settlement: settlement.ownState,
        assessedUsdc: settlement.ownUnits, paidUsdc: settlement.ownState === "paid" ? settlement.ownUnits : "0",
        availableUsdc: usdc }, settlement: { ...settlement,
        atomicProtection: meta.distributionGuard ? "on_chain_exit_nonce" : "legacy_runtime_blocked" },
      events, archivedCount: list.archivedCount,
      operations: list.operations.map(o => ({ ...o, stages: o.stages.map(s => ({
        name: s.name, state: s.state, transactionHash: s.transactionHash, draft: s.state === "requested" ? s.draft : undefined,
      })) })),
    });
  } catch (error) {
    const known = new Set(["reserve_insufficient", "local_acknowledgement_required", "wrong_network", "invalid_quantity", "sale_paused",
      "inventory_insufficient", "usdc_insufficient", "bettex_insufficient", "invalid_destination", "previous_withdrawal_pending",
      "previous_purchase_pending", "operation_conflict", "quote_changed", "transaction_mismatch", "chain_reorganized", "gas_insufficient",
      "guarded_runtime_required"]);
    const code = error instanceof Error && known.has(error.message) ? error.message : "service_unavailable";
    if (auditAccount && req.method === "POST") await appendHistory({
      key: `native:attempt:${randomUUID()}`, subject: `native:${auditAccount}`, correlationId: auditCorrelation,
      category: "activity", kind: "financial_requested", state: "failed", actor: "user", environment: "local_evm",
      chainId: 31337, source: "execution", data: { reason: code } }).catch(() => req.log.warn({ code: "audit_unavailable" }, "Operation failure could not be recorded"));
    req.log.warn({ code }, "Native test journey unavailable; no confirmation inferred");
    res.status(503).json({ code });
  }
});
export default router;
