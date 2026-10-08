import { db, demoAccounts, demoEngine } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { keccak256 } from "ethers";
import { randomInt } from "node:crypto";
import type { DemoDouble2x, Double2xPlay } from "@workspace/api-zod";
import type { AccountState, EngineState } from "./demo-state";
import { double2xExecutionMode, finishDouble2x } from "./double2x-rules";
import { doubleChain, doubleSigner, doubleProvider, gamePlayerKey, gameRequestKey } from "./double2x-chain";
import { appendHistory, ensureHistorySchema } from "../modules/audit/infrastructure/history-store";
import { recordTreasuryCashMovement } from "./treasury-statement-store";
import { logger } from "./logger";

export type StoredDoublePlay = Double2xPlay & { signedRequest?: string; scanBlock?: number };
async function accountState(id: string) {
  const [row] = await db.select().from(demoAccounts).where(eq(demoAccounts.id, id));
  if (!row) throw new Error("DOUBLE2X_ACCOUNT_NOT_FOUND");
  return row.state as AccountState;
}
export async function doubleSnapshot(id: string): Promise<DemoDouble2x> {
  const account = await accountState(id);
  const plays = (account.double2x?.plays ?? []).map(p => {
    const { signedRequest: _signed, scanBlock: _scan, ...publicPlay } = p as StoredDoublePlay;
    return publicPlay;
  });
  let chain: Awaited<ReturnType<typeof doubleChain>> = null;
  let reason: DemoDouble2x["reason"] = "deploying";
  try { chain = await doubleChain(); if (chain) reason = chain.reason; }
  catch (e) { reason = (e as NodeJS.ErrnoException).code === "ENOENT" ? "deploying" : "testnet_unavailable"; }
  if (account.profile.provider === "native") reason = "native_account_unavailable";
  const executionMode = double2xExecutionMode(reason, account.profile.provider);
  const ready = reason === "ready" || executionMode === "simulation";
  const pending = plays.some(p => p.status === "pending");
  const next = plays.find(p => p.status !== "refunded")?.nextPlayAt ?? null;
  return { chainId: executionMode === "simulation" ? 0 : 421614, network: executionMode === "simulation" ? "Simulation" : "Arbitrum Sepolia", executionMode, ready, reason,
    balanceUsdc: account.receivedYield, canPlay: ready && account.receivedYield > 0 && !pending && (!next || Date.parse(next) <= Date.now()),
    pending, nextPlayAt: next, plays,
    ...(chain && executionMode === "testnet" ? { gameAddress: chain.manifest.gameAddress, tokenAddress: chain.manifest.tokenAddress, treasuryAddress: chain.manifest.treasuryAddress } : {}) };
}
async function updatePlay(id: string, playId: string, patch: Partial<StoredDoublePlay>, result?: "red" | "black" | "refunded") {
  await ensureHistorySchema();
  await db.transaction(async tx => {
    // Same lock order as the rest of the financial app.
    const [er] = await tx.select().from(demoEngine).where(eq(demoEngine.id, "main")).for("update");
    const [ar] = await tx.select().from(demoAccounts).where(eq(demoAccounts.id, id)).for("update");
    if (!ar || !er) throw new Error("DOUBLE2X_ACCOUNT_NOT_FOUND");
    const account = ar.state as AccountState, engine = er.state as EngineState;
    const play = account.double2x?.plays.find(p => p.id === playId) as StoredDoublePlay | undefined;
    if (!play || play.status !== "pending") return;
    Object.assign(play, patch);
    if (result) {
      const done = finishDouble2x(account, engine, playId, result, patch.settledAt ? Date.parse(patch.settledAt) : Date.now())!;
      delete play.signedRequest;
      const data = { sourceWallet: "earnings", quantityUnits: String(Math.round(done.stakeUsdc * 1e6)),
        payoutUnits: String(Math.round(done.payoutUsdc * 1e6)), decimals: "6", color: done.color,
        result: done.result ?? "refunded", executionMode: done.executionMode ?? "testnet", chainId: done.executionMode === "simulation" ? "0" : "421614", requestHash: done.requestHash ?? "",
        transactionHash: done.settlementHash ?? done.requestHash ?? "", feeUnits: "0" };
      await appendHistory({ key: `double2x:${id}:${playId}:settled`, subject: `demo:${id}`, correlationId: `double2x:${id}:${playId}`,
        category: "financial", kind: `double2x_${done.status}`, state: "confirmed", actor: "system", asset: "USDC",
        environment: "simulation", source: done.executionMode === "simulation" ? "double2x_simulation" : "double2x_testnet_mirror", occurredAt: new Date(done.settledAt!), data }, tx);
      if (result !== "refunded") {
        const amount = done.status === "won" ? -done.stakeUsdc : done.stakeUsdc;
        await recordTreasuryCashMovement(tx, {
          id: `double2x:${id}:${playId}:treasury`, at: done.settledAt!, asset: "USDC", account: "treasury",
          category: "transfer", amount: String(amount), principal: null,
          income: false, reference: done.settlementHash ?? `double2x:${id}:${playId}`, source: "recorded_simulation",
          counterparty: "Double 2X", internal: false, status: "recorded",
        });
      }
      await tx.update(demoEngine).set({ state: engine, updatedAt: new Date() }).where(eq(demoEngine.id, "main"));
    }
    await tx.update(demoAccounts).set({ state: account, updatedAt: new Date() }).where(eq(demoAccounts.id, id));
  });
}
export async function settleSimulatedDouble(id: string) {
  const account = await accountState(id);
  const play = account.double2x?.plays.find(p => p.status === "pending" && p.executionMode === "simulation") as StoredDoublePlay | undefined;
  // Never substitute a mock for a signed/broadcast transaction.
  if (!play || play.signedRequest || play.requestHash || account.profile.provider === "native") return;
  await updatePlay(id, play.id, {}, randomInt(2) === 0 ? "red" : "black");
}
let queue = Promise.resolve();
export function reconcileDouble(id: string) {
  const job = queue.then(() => reconcileAccount(id));
  queue = job.catch(() => undefined);
  return job;
}
async function reconcileAccount(id: string) {
  const account = await accountState(id);
  const play = account.double2x?.plays.find(p => p.status === "pending") as StoredDoublePlay | undefined;
  if (!play) return;
  if (play.executionMode === "simulation") { await settleSimulatedDouble(id); return; }
  const chain = await doubleChain();
  if (!chain) return;
  const key = gameRequestKey(id, play.id);
  const onchain = await chain.game.plays(key);
  if (Number(onchain.status) !== 0) {
    if (onchain.player !== gamePlayerKey(id) || onchain.stake !== BigInt(Math.round(play.stakeUsdc * 1e6)) ||
      Number(onchain.choice) !== (play.color === "red" ? 0 : 1)) throw new Error("DOUBLE2X_PLAY_MISMATCH");
    const nextPlayAt = new Date(Number(onchain.startedAt) * 1000 + 86400000).toISOString();
    if (Number(onchain.status) === 1) {
      await updatePlay(id, play.id, { sequence: String(onchain.sequence), nextPlayAt });
      return;
    }
    const receipt = play.requestHash ? await doubleProvider.getTransactionReceipt(play.requestHash) : null;
    if (!receipt || receipt.status !== 1) throw new Error("DOUBLE2X_REQUEST_PROOF_MISSING");
    const latest = await doubleProvider.getBlockNumber();
    const from = play.scanBlock ?? receipt.blockNumber, to = Math.min(from + 999, latest - 1);
    if (to < from) return;
    const logs = await chain.game.queryFilter(chain.game.filters.PlaySettled(key), from, to);
    if (!logs.length) { await updatePlay(id, play.id, { scanBlock: to + 1 }); return; }
    const log = logs[0]!;
    const settlement = await doubleProvider.getTransactionReceipt(log.transactionHash);
    if (!settlement || settlement.status !== 1) return;
    await updatePlay(id, play.id, { sequence: String(onchain.sequence), nextPlayAt, settlementHash: log.transactionHash,
      settledAt: new Date(Number(onchain.settledAt) * 1000).toISOString() }, Number(onchain.result) === 0 ? "red" : "black");
    return;
  }
  if (!play.signedRequest) {
    if (!chain.ready) {
      await updatePlay(id, play.id, { error: "test_gas_unavailable" }, "refunded");
      return;
    }
    let signedRequest: string;
    try {
      const signer = await doubleSigner();
      const tx = await chain.game.play.populateTransaction(gamePlayerKey(id), key, BigInt(Math.round(play.stakeUsdc * 1e6)),
        play.color === "red" ? 0 : 1, { value: chain.fee });
      const populated = await signer.populateTransaction(tx);
      signedRequest = await signer.signTransaction(populated);
    } catch {
      // Nothing can have been broadcast: broadcasting is strictly after the
      // durable signed-request write below. Restore only this unused reserve.
      await updatePlay(id, play.id, { error: "testnet_preflight_failed" }, "refunded");
      return;
    }
    play.signedRequest = signedRequest;
    play.requestHash = keccak256(signedRequest);
    // Persist the signed operation BEFORE broadcast, so reload/restart can
    // resend precisely the same transaction without placing a second bet.
    await updatePlay(id, play.id, { signedRequest, requestHash: play.requestHash });
  }
  const receipt = await doubleProvider.getTransactionReceipt(play.requestHash!);
  if (receipt) {
    if (receipt.status === 0) await updatePlay(id, play.id, { error: "testnet_transaction_reverted" }, "refunded");
    return;
  }
  try {
    const transaction = await doubleProvider.broadcastTransaction(play.signedRequest);
    await transaction.wait(1, 45000);
  } catch {
    // An uncertain broadcast must never be treated as a lost bet or refunded.
    // The persisted signed transaction and public receipt resolve it on retry.
  }
}
let workerStarted = false;
export function startDouble2xWorker() {
  if (workerStarted) return;
  workerStarted = true;
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const rows = await db.select({ id: demoAccounts.id }).from(demoAccounts)
        .where(sql`state->'double2x'->'plays' @> '[{"status":"pending"}]'::jsonb`).limit(20);
      for (const row of rows) await reconcileDouble(row.id);
    } catch { logger.warn({ code: "double2x_reconcile_failed" }, "Double 2X will retry public settlement"); }
    finally { running = false; }
  };
  setInterval(tick, 10000).unref();
}
