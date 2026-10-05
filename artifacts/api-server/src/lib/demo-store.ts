import { and, eq, isNull } from "drizzle-orm";
import { db, demoAccounts, demoEngine, demoCommands } from "@workspace/db";
import type { DemoMovementInput } from "@workspace/api-zod";
import { logger } from "./logger";
import {
  seedAccount, seedEngine, dashboard, tickEngine, closeCycles, settleMovements,
  submitMovement, DemoInputError, type AccountState, type EngineState, utcStart,
} from "./demo-state";

type Command = { movement: DemoMovementInput } | { name: string };
export type AccountIdentity = {
  browserId: string;
  userId?: string;
  name?: string;
  email?: string;
  memberSince?: string;
};
export class ClaimedBrowserAccountError extends Error {}
export async function loadDashboard(identity?: string | AccountIdentity, command?: Command) {
  return db.transaction(async tx => {
    const now = Date.now();
    await tx.insert(demoEngine).values({ id: "main", state: seedEngine(now) }).onConflictDoNothing();
    const [engineRow] = await tx.select().from(demoEngine).where(eq(demoEngine.id, "main")).for("update");
    const engine = engineRow!.state as EngineState;
    // All instances acquire the same DB lock; timers cannot duplicate execution.
    if (engine.dayAt < utcStart(now)) {
      const accounts = await tx.select().from(demoAccounts).for("update");
      const states = accounts.map(row => row.state as AccountState);
      closeCycles(engine, states, now);
      for (const [index, row] of accounts.entries()) await tx.update(demoAccounts).set({ state: states[index]!, updatedAt: new Date(now) }).where(eq(demoAccounts.id, row.id));
    }
    tickEngine(engine, now);
    // Settle personal transfers on the script timer, even when the UI is closed.
    if (!identity) {
      const rows = await tx.select().from(demoAccounts).for("update");
      for (const row of rows) {
        const state = row.state as AccountState;
        if (state.history.some(movement => movement.status === "pending")) {
          settleMovements(state, now);
          await tx.update(demoAccounts).set({ state, updatedAt: new Date(now) }).where(eq(demoAccounts.id, row.id));
        }
      }
      await tx.update(demoEngine).set({ state: engine, updatedAt: new Date(now) }).where(eq(demoEngine.id, "main"));
      return null;
    }
    const actor: AccountIdentity = typeof identity === "string" ? { browserId: identity } : identity;
    let accountId = actor.browserId;
    if (actor.userId) {
      const [owned] = await tx.select({ id: demoAccounts.id }).from(demoAccounts).where(eq(demoAccounts.clerkUserId, actor.userId));
      if (owned) {
        accountId = owned.id;
      } else {
        await tx.insert(demoAccounts).values({ id: accountId, state: seedAccount(now) }).onConflictDoNothing();
        const [claimed] = await tx.update(demoAccounts).set({ clerkUserId: actor.userId })
          .where(and(eq(demoAccounts.id, accountId), isNull(demoAccounts.clerkUserId))).returning({ id: demoAccounts.id });
        if (!claimed) {
          // A different authenticated user can never inherit this browser's owned balance.
          accountId = `clerk:${actor.userId}`;
          await tx.insert(demoAccounts).values({ id: accountId, clerkUserId: actor.userId, state: seedAccount(now) }).onConflictDoNothing();
        }
      }
    } else {
      const [browser] = await tx.select({ owner: demoAccounts.clerkUserId }).from(demoAccounts).where(eq(demoAccounts.id, accountId));
      if (browser?.owner) throw new ClaimedBrowserAccountError();
    }
    await tx.insert(demoAccounts).values({ id: accountId, state: seedAccount(now) }).onConflictDoNothing();
    const [row] = await tx.select().from(demoAccounts).where(eq(demoAccounts.id, accountId)).for("update");
    const account = row!.state as AccountState;
    settleMovements(account, now);
    if (command && "movement" in command) {
      const input = command.movement;
      const [existing] = await tx.select().from(demoCommands).where(and(eq(demoCommands.accountId, accountId), eq(demoCommands.requestId, input.requestId)));
      if (existing) {
        const saved = existing.input as DemoMovementInput;
        if (saved.kind !== input.kind || saved.asset !== input.asset || saved.amount !== input.amount || (saved.destination ?? "") !== (input.destination ?? "")) {
          throw new DemoInputError("invalid_movement");
        }
      } else {
        submitMovement(account, engine, input, now);
        await tx.insert(demoCommands).values({ accountId, requestId: input.requestId, input });
      }
    } else if (command && "name" in command) {
      account.profile.name = command.name.trim();
    }
    if (actor.userId) {
      account.profile.name = actor.name!;
      account.profile.email = actor.email!;
      account.profile.memberSince = actor.memberSince!;
    }
    await tx.update(demoAccounts).set({ state: account, updatedAt: new Date(now) }).where(eq(demoAccounts.id, accountId));
    await tx.update(demoEngine).set({ state: engine, updatedAt: new Date(now) }).where(eq(demoEngine.id, "main"));
    const allAccounts = await tx.select({ state: demoAccounts.state }).from(demoAccounts);
    return dashboard(account, engine, now, allAccounts.map(item => item.state as AccountState));
  });
}

let busy = false;
export function startDemoScripts() {
  const timer = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      await loadDashboard();
    } catch (error) {
      logger.error({ err: error }, "Demo emulation tick failed");
    } finally {
      busy = false;
    }
  }, 6000);
  timer.unref();
  return timer;
}