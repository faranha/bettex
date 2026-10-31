import type { AccountState } from "./demo-state.ts";

export const TRANSACTION_FEE_USDC = 2.5;
const money = (n: number) => Math.round(n * 1e6) / 1e6;

/** Legacy yield was included in dollars. Split once without creating money. */
export function separateEarningsWallet(account: AccountState) {
  if (account.earningsSeparated === 1) return;
  const available = money(Math.min(Math.max(0, account.usdc), Math.max(0, account.receivedYield)));
  account.usdc = money(account.usdc - available);
  account.receivedYield = available;
  account.earningsSeparated = 1;
}
