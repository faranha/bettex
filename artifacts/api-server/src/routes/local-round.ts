/** Composition for the bounded local test mandate; not a production signer. */
import { keccak256, toUtf8Bytes } from "ethers";
import { localRoundPlan, participationAt } from "../modules/ledger";
import { localRoundStore, type RoundRow } from "../modules/ledger/infrastructure/local-round-store";
import { walletsStore } from "../modules/wallets/infrastructure/store";
import { journeyChain, type LocalMetadata } from "../modules/wallets/infrastructure/journey-chain";
import { journeyStore } from "../modules/execution/infrastructure/journey-store";
import { appendHistory } from "../modules/audit/infrastructure/history-store";
import { localRoundAllowed } from "../modules/risk";
import { withTreasuryLock, treasuryProtection } from "../modules/ledger/infrastructure/treasury-reservations";

type TransferPort = { transferTest(account: string, meta: LocalMetadata, id: string, sender: string,
  to: string, units: string, submit: boolean, condition?: { holder: string; nonce: string; roundStart: number }): Promise<{ confirmed: boolean;
   stage: { state: string; transactionHash: string | null } | undefined }>;
};
const hash = (value: string) => keccak256(toUtf8Bytes(value));
const resultUnits = "1000000"; // Explicit synthetic fixture, never read from client.
export async function localRound(accountId: string, meta: LocalMetadata, flow: TransferPort, submit: boolean, previous?: RoundRow) {
  if(!submit)return runLocalRound(accountId,meta,flow,submit,previous);
  return withTreasuryLock(meta.epoch,async()=>{
    if((await treasuryProtection(meta.epoch)).paused)throw new Error("operations_paused");
    return runLocalRound(accountId,meta,flow,submit,previous);
  });
}
async function runLocalRound(accountId: string, meta: LocalMetadata, flow: TransferPort, submit: boolean, previous?: RoundRow) {
  await localRoundStore.initialize();
  let block = await journeyChain.provider.getBlock("latest");
  if (!block?.hash || meta.chainId !== 31337 || process.env.NODE_ENV !== "development") throw new Error("wrong_network");
  const start = previous ? Number(previous.starts_at) : Math.floor(block.timestamp / 86400) * 86400;
  const id = `${meta.epoch}:${start}`;
  let round = previous ?? await localRoundStore.round(id, meta.epoch, start);
  if (!previous) for (const older of await localRoundStore.older(meta.epoch, start)) {
    await localRound(accountId, meta, flow, false, older);
  }
  const fundingId = hash(`${id}:synthetic-result`);
  const fundingExists = await journeyStore.stage(fundingId, "distribution");
  const funding = submit || fundingExists ? await flow.transferTest("local-round-system", meta, fundingId,
    meta.reserve, meta.treasury, resultUnits, submit && block.timestamp < Number(round.ends_at)) : null;
  const accounts = await journeyChain.provider.send("eth_accounts", []) as string[];
  const buyback = accounts[6];
  if (!buyback || [meta.reserve, meta.treasury, meta.operating].some(a => a.toLowerCase() === buyback.toLowerCase())) {
    throw new Error("invalid_buyback_destination");
  }
  if (funding?.confirmed && !round.plan) {
    block = await journeyChain.provider.getBlock("latest");
    if (!block?.hash) throw new Error("block_unavailable");
    if (block.timestamp < Number(round.ends_at)) {
      const participants = [];
      for (const owner of await walletsStore().localAccountIds()) {
        const material = await walletsStore().read(owner);
        const wallet = material.wallets.find(w => w.purpose === "bettex")!;
        const deposit = material.wallets.find(w => w.purpose === "deposits")!;
        // Protocol/test-node wallets are not customer eligibility, even if someone registers their public test keys.
        const protocol = [...accounts, ...Object.values(meta).filter((v): v is string => typeof v === "string" && /^0x[0-9a-f]{40}$/i.test(v))];
        if (protocol.some(a => a.toLowerCase() === wallet.address.toLowerCase())) continue;
        const logs = await journeyChain.logs(meta, meta.token, wallet.address, block.number);
        const p = participationAt(wallet.address, logs, block.timestamp);
        participants.push({ accountId: owner, wallet: deposit.address, weight: p.tokenSeconds });
      }
      if ((await journeyChain.provider.getBlock(block.number))?.hash !== block.hash) throw new Error("chain_reorganized");
      let plan = localRoundPlan(resultUnits, participants);
      const allowed = localRoundAllowed({ chainId: meta.chainId, development: process.env.NODE_ENV === "development",
        result: resultUnits, transferable: await journeyChain.balance(meta.usdc, meta.treasury, block.number),
         payments: plan.participants, buyback: plan.buyback, otherObligations: String(
           BigInt(await localRoundStore.obligations(meta.epoch, id)) + BigInt((await treasuryProtection(meta.epoch)).protectedUnits)) });
      if (!allowed) plan = localRoundPlan(resultUnits, []);
      await appendHistory({ key: `round:${id}:risk`, subject: "treasury:local", visibility: "admin",
        correlationId: id, category: "automatic", kind: allowed ? "test_round_risk_allowed" : "test_round_withheld",
        state: allowed ? "authorized" : "rejected", actor: "system", environment: "local_evm", chainId: 31337,
        epoch: meta.epoch, source: "risk", data: { ruleVersion: "local-round-test-v1", requiredDefensiveUnits: "0",
          hypothesis: "zero_test_costs_and_defensive_requirement", reason: allowed ? "exact_budget_and_liquidity" : "insufficient_coverage" } });
      await localRoundStore.plan(round, plan, block.number, block.hash);
      round = await localRoundStore.round(id, meta.epoch, start);
    } else {
      await localRoundStore.plan(round, localRoundPlan(resultUnits, []), block.number, block.hash);
      round = await localRoundStore.round(id, meta.epoch, start);
    }
  }
  if (round.snapshot_block !== null && (await journeyChain.provider.getBlock(round.snapshot_block))?.hash !== round.snapshot_hash) {
    throw new Error("chain_reorganized");
  }
  if (round.plan) {
    const plan = round.plan;
    if (submit && meta.distributionGuard && BigInt(plan.participants) > 0n
      && block.timestamp < Number(round.ends_at)) await journeyChain.authorizeRound(meta, start, plan.participants);
    for (const payment of await localRoundStore.payouts(id)) {
      if (["cancelled", "expired", "failed"].includes(payment.state)) continue;
      const material = await walletsStore().read(payment.account_id);
      const holder = material.wallets.find(w => w.purpose === "bettex")!;
      const now = await journeyChain.provider.getBlock("latest");
      if (!now?.hash) throw new Error("block_unavailable");
      const stage = await journeyStore.stage(hash(payment.operation_id), "distribution");
      const logs = await journeyChain.logs(meta, meta.token, holder.address, now.number);
      const exited = logs.some(e => e.blockNumber > round.snapshot_block!
        && e.from.toLowerCase() === holder.address.toLowerCase() && e.from.toLowerCase() !== e.to.toLowerCase());
      // Never reinterpret already sent/uncertain transfers as money recovered.
      if ((!stage || stage.state === "requested") && (exited || now.timestamp >= Number(round.ends_at))) {
        if (stage) await journeyStore.cancelUnsentDistribution(`${hash(payment.operation_id)}:distribution`);
        await localRoundStore.state(id, payment.account_id, exited ? "cancelled" : "expired", null);
        await appendHistory({ key: `round:${payment.operation_id}:cancelled`, subject: `native:${payment.account_id}`,
          correlationId: payment.operation_id, category: "financial", kind: "distribution_cancelled", state: "cancelled",
          actor: "system", environment: "local_evm", chainId: 31337, epoch: meta.epoch, source: "ledger",
          data: { amountUnits: payment.units, periodId: id, reason: exited ? "bettex_outflow" : "round_closed" } });
        continue;
      }
      const result = await flow.transferTest(payment.account_id, meta, hash(payment.operation_id),
        meta.treasury, payment.wallet, payment.units, submit && !exited && now.timestamp < Number(round.ends_at),
        meta.distributionGuard ? { holder: holder.address, roundStart: start,
          nonce: await journeyChain.exitNonce(meta, holder.address, round.snapshot_block!) } : undefined);
      const state = result.confirmed ? "paid" : result.stage?.state ?? "pending";
      await localRoundStore.state(id, payment.account_id, state, result.stage?.transactionHash ?? null);
      await appendHistory({ key: `round:${payment.operation_id}:${state}`, subject: `native:${payment.account_id}`,
        correlationId: payment.operation_id, category: "financial",
        kind: result.confirmed ? "distribution_received" : "distribution_pending", state: result.confirmed ? "confirmed" : state,
        actor: "system", environment: "local_evm", chainId: 31337, epoch: meta.epoch, source: "ledger",
        asset: "USDC", wallet: payment.wallet, transactionHash: result.stage?.transactionHash ?? undefined,
        data: { amountUnits: payment.units, decimals: "6", periodId: id, evidence: "synthetic_local_test_result",
          ruleVersion: "local-round-test-v1", trigger: "confirmed_test_funding" } });
    }
    const buybackId = hash(`${id}:buyback-reserve`);
    const existingBuyback = await journeyStore.stage(buybackId, "distribution");
    const latest = await journeyChain.provider.getBlock("latest");
    if (!latest?.hash) throw new Error("block_unavailable");
    if (BigInt(plan.buyback) > 0n && (submit && latest.timestamp < Number(round.ends_at) || existingBuyback)) {
      const buybackResult = await flow.transferTest("local-round-system", meta, buybackId, meta.treasury,
        buyback, plan.buyback, submit && latest.timestamp < Number(round.ends_at));
      await localRoundStore.buyback(id, buybackResult.confirmed ? "paid" : buybackResult.stage?.state ?? "not_started",
        buybackResult.stage?.transactionHash ?? null);
      round = await localRoundStore.round(id, meta.epoch, start);
    }
    await appendHistory({ key: `round:${id}:plan`, subject: "treasury:local", correlationId: id,
      category: "financial", visibility: "admin", kind: "test_round_assessed", state: "confirmed", actor: "system",
      environment: "local_evm", chainId: 31337, epoch: meta.epoch, source: "ledger",
      data: { periodId: id, profitUnits: resultUnits, retainedUnits: plan.retained,
        participantPoolUnits: plan.participants, buybackUnits: plan.buyback,
        resultSource: "explicit_synthetic_fixture", ruleVersion: "local-round-test-v1" } });
  }
  const payouts = await localRoundStore.payouts(id);
  const own = payouts.find(row => row.account_id === accountId);
  const reserved = payouts.filter(r => !["paid", "cancelled", "expired", "failed"].includes(r.state)).reduce((v, r) => v + BigInt(r.units), 0n);
  const paid = payouts.filter(r => r.state === "paid").reduce((v, r) => v + BigInt(r.units), 0n);
  const reverted = payouts.filter(r => ["cancelled", "expired", "failed"].includes(r.state)).reduce((v, r) => v + BigInt(r.units), 0n);
  return { id, source: "synthetic_local_test" as const, resultUnits: funding?.confirmed ? resultUnits : "0",
    retainedUnits: String(BigInt(round.plan?.retained ?? "0") + reverted), buybackUnits: round.plan?.buyback ?? "0",
    buybackAddress: buyback, pendingUnits: String(reserved), paidUnits: String(paid),
    buybackState: round.buyback_state, buybackTransactionHash: round.buyback_hash,
    ownUnits: own?.units ?? "0", ownState: own?.state ?? (round.plan ? "not_eligible" : fundingExists ? "pending" : "not_started"),
    ownTransactionHash: own?.transaction_hash ?? null,
    snapshotBlock: round.snapshot_block, snapshotHash: round.snapshot_hash };
}
