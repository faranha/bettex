import { test } from "node:test";
import assert from "node:assert/strict";
import { statementUnits, statementDecimal, statementFilters, statementPeriod, treasuryStatementEntries,
  matchingStatementEntries, statementBalances } from "../src/lib/treasury-statement.ts";

const at = "2026-10-07T19:00:00.000Z";
const filters = (override = {}) => ({ ...statementFilters({ from: "2026-10-07", to: "2026-10-07" }), asOf: "2026-10-08T02:59:59Z", ...override });
const positions = [{ id: "P1", at, kind: "position_closed", agent: "sports", market: "A vs B",
  capitalUsdc: "500.000001", grossUsdc: "12.345678", costUsdc: "0.123456" },
{ id: "OPERATOR", at, kind: "operator_fee", grossUsdc: "2000" }];
test("wallet filters separate Crypto settlements from Operational and preserve the consolidated ledger", () => {
  const sample = [...positions,
    { ...positions[0], id: "CRYPTO", agent: "crypto", market: "SOL/USDC" },
    { ...positions[0], id: "BTC", agent: "predictions", market: "BTC up or down" },
    { ...positions[0], id: "ETH", agent: "predictions", market: "ETH/USDC" },
    { ...positions[0], id: "SOL", agent: "predictions", market: "SOL-USD" },
    { ...positions[0], id: "POLITICS", agent: "predictions", market: "Election" }];
  const entries = treasuryStatementEntries(sample,
    [{ id: "R1", endedAt: at, stakingUsdc: 2, buybackUsdc: 1 }],
    [{ id: "B1", at, roundId: "R1", kind: "wallet_funded", amountUsdc: 1, tokensBettex: 0 }]);
  const ids = wallet => matchingStatementEntries(entries, filters({ wallet })).map(e => e.id).sort();
  assert.deepEqual(ids("crypto_agent"), ["BTC:cost", "BTC:result", "CRYPTO:cost", "CRYPTO:result", "ETH:cost", "ETH:result", "SOL:cost", "SOL:result"]);
  assert.deepEqual(ids("operational"), ["P1:cost", "P1:result", "POLITICS:cost", "POLITICS:result", "R1:buyback-funding", "R1:distribution"]);
  assert.deepEqual(ids("buyback"), ["B1:USDC"]);
  assert.deepEqual(ids("reserve"), []);
  assert.deepEqual([...ids("crypto_agent"), ...ids("operational"), ...ids("buyback")].sort(), ids("all"));
  for (const wallet of ["operational", "reserve", "crypto_agent"]) {
    assert.deepEqual(statementBalances(entries, filters({ wallet }), new Map([["treasury:USDC", 1000000n]])), []);
    assert.equal(statementFilters({ from: "2026-10-07", to: "2026-10-07", wallet }).wallet, wallet);
  }
  assert.throws(() => statementFilters({ from: "2026-10-07", to: "2026-10-07", wallet: "unknown" }));
});
test("exact decimal arithmetic never rounds ledger quantities or uses floating point", () => {
  assert.equal(statementUnits("9007199254740993.000001"), 9007199254740993000001n);
  assert.equal(statementDecimal(-12n), "-0.000012");
  assert.equal(statementDecimal(statementUnits("500.000001")), "500.000001");
  assert.throws(() => statementUnits("0.0000001"));
  assert.throws(() => statementUnits("NaN"));
});
test("only observed settlement result and cost are projected; principal and operator fees are not revenue", () => {
  const entries = treasuryStatementEntries(positions, [], []);
  assert.equal(entries.length, 2);
  assert.equal(entries.find(e => e.category === "investment_result").amount, "12.345678");
  assert.equal(entries.find(e => e.category === "investment_result").principal, "500.000001");
  assert.equal(entries.find(e => e.category === "execution_cost").amount, "-0.123456");
  assert.ok(entries.every(e => e.source === "modeled_settlement"));
  assert.ok(entries.every(e => e.category !== "investment_funding" && e.category !== "principal_return"));
  assert.ok(!entries.some(e => e.id.includes("OPERATOR")));
});
test("distribution and internal funding have separate owners; burns have no USDC expense", () => {
  const entries = treasuryStatementEntries([], [{ id: "R", endedAt: at, stakingUsdc: 25, buybackUsdc: 25 }], [
    { id: "B1", at, roundId: "R", kind: "wallet_funded", amountUsdc: 25, tokensBettex: 0 },
    { id: "B2", at, roundId: "R", kind: "tokens_purchased", amountUsdc: 20, tokensBettex: 500 },
    { id: "B3", at, roundId: "R", kind: "tokens_burned", amountUsdc: 0, tokensBettex: 500 },
  ]);
  assert.equal(entries.filter(e => e.internal).reduce((n, e) => n + statementUnits(e.amount), 0n), 0n);
  const burn = entries.find(e => e.category === "token_burn");
  assert.equal(burn.asset, "BETTEX"); assert.equal(burn.amount, "-500.000000");
  const opening = new Map([["treasury:USDC", 100_000_000n], ["buyback:USDC", 0n], ["buyback:BETTEX", 0n]]);
  const balances = statementBalances(entries, filters(), opening);
  assert.equal(balances.find(b => b.account === "treasury").closing, "50.000000");
  assert.equal(balances.find(b => b.account === "buyback" && b.asset === "USDC").closing, "5.000000");
  assert.equal(balances.find(b => b.asset === "BETTEX").closing, "0.000000");
});
test("income supports other Treasury investments, excludes returned principal, and reports unavailable sources", () => {
  const entries = treasuryStatementEntries(positions, [], []);
  const template = entries[0];
  entries.push({ ...template, id: "I", amount: "3.000001", principal: null, category: "investment_income", source: "recorded_simulation" },
    { ...template, id: "C", amount: "500.000001", category: "principal_return", income: false, principal: null });
  const balances = statementBalances(entries, filters(), new Map([["treasury:USDC", 100_000_000n]]));
  const main = balances.find(b => b.account === "treasury");
  assert.equal(main.otherIncome, "3.000001");
  assert.equal(main.income, "15.222223"); // gross result + yield - execution costs; not principal.
  assert.equal(main.reconciled, false); // Algebra alone is NOT independent reconciliation.
  const unknown = statementBalances([], filters(), new Map()).find(b => b.account === "treasury");
  assert.equal(unknown.opening, null); assert.equal(unknown.closing, null); assert.equal(unknown.otherIncome, null);
});
test("São Paulo inclusive calendar dates, validated filters and frozen as-of prevent future events", () => {
  assert.equal(statementPeriod("2026-10-07", "2026-10-07").start, Date.parse("2026-10-07T03:00:00Z"));
  assert.throws(() => statementFilters({ from: "2026-02-30", to: "2026-03-01" }));
  assert.throws(() => statementFilters({ from: "2026-10-01", to: "2026-11-01" }));
  assert.throws(() => statementFilters({ from: "2026-10-01", to: "2026-10-07", account: "personal" }));
  assert.throws(() => statementFilters({ from: "2026-10-01", to: "2026-10-07", category: "fee" }));
  assert.throws(() => statementFilters({ from: ["2026-10-01"], to: "2026-10-07" }));
  const entries = treasuryStatementEntries(positions, [], []);
  assert.equal(matchingStatementEntries(entries, filters({ asOf: "2026-10-07T18:00:00Z" })).length, 0);
  assert.equal(matchingStatementEntries(entries, filters({ direction: "out" }))[0].category, "execution_cost");
  assert.equal(matchingStatementEntries(entries, filters({ search: "A VS B", category: "investment_result" })).length, 1);
});
