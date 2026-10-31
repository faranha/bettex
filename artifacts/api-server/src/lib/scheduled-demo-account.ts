import type { AccountState } from "./demo-state.ts";
import { DEMO_DAY, demoCycleId, demoCycleStart } from "./demo-cycle-clock.ts";
import { storyFinalNet } from "./scheduled-demo-story.ts";

/** A coherent starting wallet story for NEW demo accounts, never a balance reset. */
export function prepareScheduledAccount(account: AccountState, now: number) {
  const start = demoCycleStart(now), tokens = 12500, total = 8_000_000 + tokens;
  const iso = (n: number) => new Date(n).toISOString();
  const id = (name: string) => `SCRIPT-SEED-${account.profile.accountId}-${name}`;
  let paid = 0;
  account.roundParticipation = {};
  const distributions = Array.from({ length: 7 }, (_, i) => {
    const day = start - (i + 1) * DEMO_DAY;
    const amount = Math.floor(Math.max(0, storyFinalNet(day)) * .25 * tokens / total * 1e6) / 1e6;
    paid += amount;
    account.roundParticipation![demoCycleId(day)] = {
      ownEligibleTokens: tokens, totalEligibleTokens: total, ownTokenSeconds: tokens * 86400,
      totalTokenSeconds: total * 86400, payoutSharePercent: 100 * tokens / total, receivedUsdc: amount,
      startedAt: iso(day), endedAt: iso(day + DEMO_DAY),
    };
    return { id: id(`ROUND-${demoCycleId(day)}`), kind: "distribution" as const, asset: "USDC" as const,
      amount, feeUsdc: 0, at: iso(day + DEMO_DAY), status: "confirmed" as const, destination: "" };
  }).filter(p => p.amount > 0);
  account.scriptedAccount = 1;
  account.lots = [{ amount: tokens, since: start - 8 * DEMO_DAY + 30 * 60000 - 1000 }];
  // Opening deposit, fees, conversions and the seven prepared distributions
  // reconcile to the two USDC wallets. Distributions credit earnings only;
  // the modeled dollar withdrawal does not consume earnings.
  const movements: AccountState["history"] = [...distributions,
    { id: id("WITHDRAW"), kind: "withdraw", asset: "USDC", amount: 25, feeUsdc: 2.5, sourceWallet: "dollar", at: iso(start - DEMO_DAY + 45 * 60000 - 1000), status: "confirmed", destination: "0x1111111111111111111111111111111111111111" },
    { id: id("SWAP"), kind: "swap", asset: "BETTEX", amount: tokens, feeUsdc: 2.5, sourceAsset: "USDC", sourceAmount: 500, at: iso(start - 8 * DEMO_DAY + 30 * 60000 - 1000), status: "confirmed", destination: "" },
    { id: id("ADD"), kind: "onramp", asset: "USDC", amount: 1000, feeUsdc: 0, at: iso(start - 9 * DEMO_DAY + 15 * 60000 - 1000), status: "confirmed", destination: "" },
    { id: id("RECEIVE"), kind: "receive", asset: "USDC", amount: Math.round((810.5 - paid) * 1e6) / 1e6, feeUsdc: 0, at: iso(start - 11 * DEMO_DAY), status: "confirmed", destination: "" },
  ];
  account.receivedYield = Math.round(paid * 1e6) / 1e6;
  account.usdc = Math.round((1280.5 - paid) * 1e6) / 1e6;
  account.earningsSeparated = 1;
  account.history = movements.sort((a, b) => b.at.localeCompare(a.at));
}
