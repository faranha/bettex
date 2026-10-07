import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { ensureProfileNickname } from "../modules/accounts/domain/nickname";
import { db, demoAccounts, demoEngine, demoCommands } from "@workspace/db";
import type { DemoMovementInput } from "@workspace/api-zod";
import { logger } from "./logger";
import { ensureTreasuryTracking } from "./treasury-round";
import { flushTreasuryActivity } from "./treasury-activity-store";
import { advanceScheduledStory, ensureScheduledStory } from "./scheduled-demo-story";
import { demoCycleStart } from "./demo-cycle-clock";
import { prepareScheduledAccount } from "./scheduled-demo-account";
import { separateEarningsWallet } from "./earnings-wallet";
import { ensureHistorySchema, appendHistory } from "../modules/audit/infrastructure/history-store";
import { recordDemoMovements, recordDemoAutomations, recordDemoRound, recordDemoTreasury, recordDemoPools } from "../modules/audit/infrastructure/demo-recorder";
import { decimalUnits } from "../modules/audit";
import {
  seedAccount, seedEngine, dashboard, closeCycles, settleMovements,
  submitMovement, DemoInputError, accountWeight, DAY, type AccountState, type EngineState,
} from "./demo-state";

type Command = { movement: DemoMovementInput } | { name: string; email?: string; nickname?: string; avatarPath?: string | null } | { distributionPreview: string } | { avatarUpload: NonNullable<AccountState["avatarUpload"]> };
export type AccountIdentity = {
  browserId: string;
  tabScoped?: boolean;
  userId?: string;
  nativeAccountId?: string;
  name?: string;
  email?: string;
  memberSince?: string;
};
export class ClaimedBrowserAccountError extends Error {}
const INTERNAL_DEMO_RUNTIME = Symbol("internal-demo-runtime");
const seedDemoAccount = (now: number) => { const account = seedAccount(now); prepareScheduledAccount(account, now); return account; };
export async function loadDashboard(identity?: string | AccountIdentity, command?: Command, resolved?: (id: string) => void, runtimeToken?: symbol) {
  const internalTick = runtimeToken === INTERNAL_DEMO_RUNTIME && identity === undefined && command === undefined;
  if (process.env.NODE_ENV === "production" && !internalTick &&
    (typeof identity !== "object" || !identity?.tabScoped || identity.userId || identity.nativeAccountId)) {
    throw new Error("demo_internal_only");
  }
  await ensureHistorySchema();
  return db.transaction(async tx => {
    const now = Date.now();
    await tx.insert(demoEngine).values({ id: "main", state: seedEngine(now) }).onConflictDoNothing();
    const [engineRow] = await tx.select().from(demoEngine).where(eq(demoEngine.id, "main")).for("update");
    const engine = engineRow!.state as EngineState;
    // Keep the previous append-only journal and snapshots; replace only the
    // automated display scenario, never customer wallets, commands or balances.
    if (!engine.scheduledStory) await flushTreasuryActivity(tx, engine);
    ensureScheduledStory(engine, now);
    ensureTreasuryTracking(engine, now);
    // All instances acquire the same DB lock; timers cannot duplicate execution.
    if (engine.dayAt < demoCycleStart(now)) {
      const accounts = await tx.select().from(demoAccounts).for("update");
      const states = accounts.map(row => row.state as AccountState);
      states.forEach(separateEarningsWallet);
      const previousHistories = states.map(state => structuredClone(state.history));
      const previousRoundIds = new Set(engine.rounds.map(r => r.id));
      closeCycles(engine, states, now);
      for (const cycle of engine.rounds.filter(c => !previousRoundIds.has(c.id))) await recordDemoPools(tx, cycle, "scheduled:");
      for (const [index, row] of accounts.entries()) {
        await recordDemoMovements(tx, row.id, previousHistories[index]!, states[index]!.history, undefined,
          states[index]!.history.filter(m => !previousHistories[index]!.some(old => old.id === m.id)).map(m => m.id), now);
        for (const cycle of engine.rounds.filter(c => !previousRoundIds.has(c.id))) {
          const end = Date.parse(cycle.endedAt);
          const payment = states[index]!.history.find(m => m.id === `SCRIPT-ROUND-${cycle.id}-${states[index]!.profile.accountId}`);
          await recordDemoRound(tx, row.id, cycle.id, cycle.endedAt, String(cycle.stakingUsdc),
            String(accountWeight(states[index]!, end - DAY, end)), String(payment?.amount ?? 0), !!payment,
            payment?.id ?? `SCRIPT-ROUND-${cycle.id}-${states[index]!.profile.accountId}`);
        }
        await tx.update(demoAccounts).set({ state: states[index]!, updatedAt: new Date(now) }).where(eq(demoAccounts.id, row.id));
      }
    }
    const beforeOperations = structuredClone(engine.operations);
    advanceScheduledStory(engine, now);
    await recordDemoTreasury(tx, beforeOperations, engine.operations);
    await recordDemoAutomations(tx, engine.events);
    // Settle personal transfers on the script timer, even when the UI is closed.
    if (!identity) {
      const rows = await tx.select().from(demoAccounts).for("update");
      for (const row of rows) {
        const state = row.state as AccountState;
        // Chart values now come from the shared cycle ledger, not a private
        // accelerated/random scenario for each account.
        if (state.history.some(movement => movement.status === "pending")) {
          const before = structuredClone(state.history);
          settleMovements(state, now, engine);
          await recordDemoMovements(tx, row.id, before, state.history, undefined, undefined, now);
          await tx.update(demoAccounts).set({ state, updatedAt: new Date(now) }).where(eq(demoAccounts.id, row.id));
        }
      }
      await flushTreasuryActivity(tx, engine);
      await tx.update(demoEngine).set({ state: engine, updatedAt: new Date(now) }).where(eq(demoEngine.id, "main"));
      return null;
    }
    const actor: AccountIdentity = typeof identity === "string" ? { browserId: identity } : identity;
    let accountId = actor.nativeAccountId ? `native:${actor.nativeAccountId}` : actor.browserId;
    if (!actor.nativeAccountId && actor.userId) {
      const [owned] = await tx.select({ id: demoAccounts.id }).from(demoAccounts).where(eq(demoAccounts.clerkUserId, actor.userId));
      if (owned) {
        accountId = owned.id;
      } else {
        await tx.insert(demoAccounts).values({ id: accountId, state: seedDemoAccount(now) }).onConflictDoNothing();
        const [claimed] = await tx.update(demoAccounts).set({ clerkUserId: actor.userId })
          .where(and(eq(demoAccounts.id, accountId), isNull(demoAccounts.clerkUserId))).returning({ id: demoAccounts.id });
        if (!claimed) {
          // A different authenticated user can never inherit this browser's owned balance.
          accountId = `clerk:${actor.userId}`;
          await tx.insert(demoAccounts).values({ id: accountId, clerkUserId: actor.userId, state: seedDemoAccount(now) }).onConflictDoNothing();
        }
      }
    } else if (!actor.nativeAccountId) {
      const [browser] = await tx.select({ owner: demoAccounts.clerkUserId }).from(demoAccounts).where(eq(demoAccounts.id, accountId));
      if (browser?.owner) throw new ClaimedBrowserAccountError();
    }
    const opening = actor.nativeAccountId ? seedAccount(now) : seedDemoAccount(now);
    if (actor.nativeAccountId) {
      opening.usdc = 0; opening.bettex = 0; opening.receivedYield = 0; opening.lots = []; opening.history = [];
      opening.profile.accountId = actor.nativeAccountId;
    }
    await tx.insert(demoAccounts).values({ id: accountId, state: opening }).onConflictDoNothing();
    const [row] = await tx.select().from(demoAccounts).where(eq(demoAccounts.id, accountId)).for("update");
    const account = row!.state as AccountState;
    separateEarningsWallet(account);
    resolved?.(accountId);
    const initialHistory = structuredClone(account.history);
    // Recover legacy JSON facts once, explicitly non-authoritative simulation.
    await recordDemoMovements(tx, accountId, [], initialHistory);
    settleMovements(account, now, engine);
    const operationPrice = String(engine.price);
    if (command && "movement" in command) {
      const input = command.movement;
      const [existing] = await tx.select().from(demoCommands).where(and(eq(demoCommands.accountId, accountId), eq(demoCommands.requestId, input.requestId)));
      if (existing) {
        const saved = existing.input as DemoMovementInput;
        if (saved.kind !== input.kind || saved.asset !== input.asset || saved.amount !== input.amount || (saved.sourceWallet ?? "dollar") !== (input.sourceWallet ?? "dollar") || (saved.destination ?? "") !== (input.destination ?? "")) {
          throw new DemoInputError("invalid_movement");
        }
      } else {
        submitMovement(account, engine, input, now);
         await appendHistory({ key: `demo:${accountId}:${input.requestId}:pending`, subject: `demo:${accountId}`,
           correlationId: `demo:${accountId}:${input.requestId}`, category: "activity", actor: "user",
           kind: "financial_requested", state: "pending", asset: input.asset, environment: "simulation", source: "demo_engine",
           occurredAt: new Date(now), requestedAt: new Date(now),
            data: { operationKind: input.kind, sourceWallet: input.sourceWallet ?? "dollar", ...(input.kind === "transfer" ? { targetWallet: "dollar" } : {}), feeUnits: decimalUnits(String(account.history.find(m => m.id === input.requestId)!.feeUsdc), 6), paidAsset: input.asset, paidUnits: decimalUnits(String(input.amount), input.asset === "USDC" ? 6 : 18),
             amountUnits: decimalUnits(String(input.amount), input.asset === "USDC" ? 6 : 18), decimals: input.asset === "USDC" ? "6" : "18",
             priceUnits: decimalUnits(operationPrice, 6), priceDecimals: "6", priceUnit: "USDC/BETTEX", mechanism: "simulation" } }, tx);
        if (input.asset === "BETTEX" && ["send", "withdraw", "swap"].includes(input.kind)) await appendHistory({
          key: `demo:${accountId}:${input.requestId}:participation:exit`, subject: `demo:${accountId}`,
          correlationId: `demo:${accountId}:${input.requestId}`, category: "automatic", actor: "system",
          kind: "participation_exit", state: "confirmed", environment: "simulation", asset: "BETTEX", source: "demo_engine",
          data: { quantityUnits: decimalUnits(String(input.amount), 18), eligibleUnits: decimalUnits(String(account.bettex), 18),
            decimals: "18", priorWeightCancelled: "true", mechanism: "wallet_balance", ruleVersion: "demo-model-v1",
            trigger: input.requestId, periodId: new Date(engine.dayAt).toISOString().slice(0, 10) } }, tx);
        await tx.insert(demoCommands).values({ accountId, requestId: input.requestId, input });
      }
    } else if (command && "name" in command) {
      if (command.email !== undefined && (actor.userId || actor.nativeAccountId)) {
        throw new DemoInputError("managed_profile_required");
      }
      account.profile.name = command.name.trim();
      if (command.email !== undefined) account.profile.email = command.email.trim();
      if (command.nickname !== undefined) account.profile.nickname = command.nickname.trim();
      if (command.avatarPath !== undefined) {
        if (command.avatarPath !== null && command.avatarPath !== account.profile.avatarPath
          && (account.avatarUpload?.objectPath !== command.avatarPath || account.avatarUpload.expiresAt < now)) {
          throw new DemoInputError("invalid_avatar");
        }
        account.profile.avatarPath = command.avatarPath;
        delete account.avatarUpload;
      }
      await appendHistory({ key: `demo:profile:${accountId}:${now}`, subject: `demo:${accountId}`, correlationId: `profile:${now}`,
        category: "activity", kind: "profile_changed", state: "confirmed", actor: "user", environment: "simulation",
        source: "demo_profile", data: { field: command.email !== undefined ? "profile" : "name" } }, tx);
    } else if (command && "avatarUpload" in command) {
      account.avatarUpload = command.avatarUpload;
    } else if (command && "distributionPreview" in command) {
      const all = await tx.select({ state: demoAccounts.state }).from(demoAccounts);
      const preview = dashboard(account, engine, now, all.map(a => a.state as AccountState));
      await appendHistory({ key: `demo:distribution-preview:${accountId}:${command.distributionPreview}`, subject: `demo:${accountId}`,
        correlationId: `demo:distribution-preview:${command.distributionPreview}`, category: "automatic",
        kind: "distribution_calculated", state: "calculated", actor: "system", environment: "simulation", asset: "USDC", source: "demo_model_preview",
        data: { periodId: new Date(engine.dayAt).toISOString().slice(0, 10), amountUnits: decimalUnits(String(preview.staking.estimatedUsdc), 6),
          decimals: "6", weightUnits: decimalUnits(String(preview.staking.weightTokenSeconds), 18), weightDecimals: "18", ruleVersion: "demo-model-v1",
          mechanism: "simulation_calculation_only", paid: "false", trigger: command.distributionPreview } }, tx);
    }
    if (actor.userId || actor.nativeAccountId) {
      account.profile.name = actor.name!;
      account.profile.email = actor.email!;
      account.profile.memberSince = actor.memberSince!;
    }
    account.profile.authenticated = !!(actor.nativeAccountId || actor.userId);
    account.profile.provider = actor.nativeAccountId ? "native" : actor.userId ? "clerk" : "anonymous";
    // Persist generated nicknames for existing accounts as well as new ones.
    ensureProfileNickname(account.profile, randomUUID);
    await recordDemoMovements(tx, accountId, initialHistory, account.history, operationPrice,
      command && "movement" in command ? command.movement.requestId : undefined, now);
    await tx.update(demoAccounts).set({ state: account, updatedAt: new Date(now) }).where(eq(demoAccounts.id, accountId));
    await flushTreasuryActivity(tx, engine);
    await tx.update(demoEngine).set({ state: engine, updatedAt: new Date(now) }).where(eq(demoEngine.id, "main"));
    const allAccounts = await tx.select({ state: demoAccounts.state }).from(demoAccounts);
    return dashboard(account, engine, now, allAccounts.map(item => item.state as AccountState));
  });
}

let busy = false;
export function startDemoScripts() {
  if(process.env.NODE_ENV!=="development" && process.env.NODE_ENV!=="production")return undefined;
  const timer = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      // Private scheduler capability: advance the simulated engine and pending
      // demo transfers without impersonating or creating a customer account.
      await loadDashboard(undefined, undefined, undefined, INTERNAL_DEMO_RUNTIME);
    } catch (error) {
      logger.error({ err: error }, "Demo emulation tick failed");
    } finally {
      busy = false;
    }
  }, 6000);
  timer.unref();
  return timer;
}