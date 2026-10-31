import type { AccountState } from "./demo-state";
import { DEMO_DAY, demoCycleStart } from "./demo-cycle-clock";

/** Pre-opening, net-zero examples. Existing transactions and wallet balances are
 * never replaced. Applied once, only to the anonymous scripted account. */
export function populateDemoHistory(account: AccountState) {
  if (!account.scriptedAccount || account.profile.authenticated || account.profile.provider === "native" || account.demoHistoryPopulated) return;
  const opening = account.history.find(m => m.id.endsWith("-RECEIVE") && m.id.startsWith("SCRIPT-SEED-"));
  if (!opening) return;
  const anchor = demoCycleStart(Date.parse(opening.at));
  const history: AccountState["history"] = [];
  for (let day = 0; day < 7; day++) {
    const at = anchor - (day + 1) * DEMO_DAY + 3600000;
    const amount = [25, 50, 80, 100, 45, 60, 120][day];
    const id = `SCRIPT-POPULATE-${account.profile.accountId}-${day}`;
    history.push(
      { id: `${id}-IN`, kind: day % 2 ? "onramp" : "receive", asset: "USDC", amount, feeUsdc: 0,
        at: new Date(at).toISOString(), status: "confirmed", destination: "", sourceWallet: "dollar" },
      { id: `${id}-OUT`, kind: day % 3 ? "withdraw" : "send", asset: "USDC", amount: amount - 2.5, feeUsdc: 2.5,
        at: new Date(at + 6 * 3600000).toISOString(), status: "confirmed",
        destination: "0x1111111111111111111111111111111111111111", sourceWallet: "dollar" },
    );
  }
  account.history = [...account.history, ...history].sort((a, b) => b.at.localeCompare(a.at));
  account.demoHistoryPopulated = 1;
}
