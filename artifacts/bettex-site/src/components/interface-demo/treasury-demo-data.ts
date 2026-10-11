import type { DemoDashboard, DemoRound, DemoTreasuryActivityItem, DemoTreasuryRound, TreasuryStatementBalance, TreasuryStatementEntry } from '@workspace/api-client-react';
const brazilDate = (v: string | number | Date) => new Date(v).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
import { MOCK_TREASURY_ADDRESSES } from './mock-addresses';

/** Local illustrative Treasury data derived only from the visual dashboard seed. No network. */
export const walletsSeed = {
  wallets: (Object.keys(MOCK_TREASURY_ADDRESSES) as (keyof typeof MOCK_TREASURY_ADDRESSES)[]).map(purpose => ({ purpose, address: MOCK_TREASURY_ADDRESSES[purpose] })),
};

export type StatementFilters = { account: 'all' | 'treasury' | 'buyback'; asset: 'all' | 'USDC' | 'BETTEX'; category: string; q: string; from: string; to: string };
export type RawEntry = TreasuryStatementEntry;

const usdc = (n: number) => n.toFixed(2);
const tok = (n: number) => Math.round(n).toFixed(0);

export function statementEntries(d: DemoDashboard): RawEntry[] {
  const out: RawEntry[] = [];
  const base = { status: 'recorded' as const, principal: null };
  const current = d.treasury.currentRound;
  if (current) out.push({ ...base, id: `SAMPLE-STM-${current.id}-current-income`, at: d.serverNow, account: 'treasury', asset: 'USDC', amount: usdc(current.realizedNetUsdc ?? 0), category: 'investment_income', reference: current.id, counterparty: 'operations', source: 'modeled_demo', internal: false, income: true });
  for (const r of d.rounds) {
    out.push({ ...base, id: `STM-${r.id}-income`, at: r.endedAt, account: 'treasury', asset: 'USDC', amount: usdc(r.eligibleUsdc), category: 'investment_income', reference: r.id, counterparty: 'operations', source: 'modeled_settlement', internal: false, income: true });
    out.push({ ...base, id: `STM-${r.id}-staking`, at: r.endedAt, account: 'treasury', asset: 'USDC', amount: usdc(-r.stakingUsdc), category: 'transfer', reference: r.id, counterparty: 'staking_pool', source: 'modeled_settlement', internal: true, income: false });
    out.push({ ...base, id: `STM-${r.id}-buyback`, at: r.endedAt, account: 'treasury', asset: 'USDC', amount: usdc(-r.buybackUsdc), category: 'buyback_funding', reference: r.id, counterparty: 'buyback_wallet', source: 'modeled_settlement', internal: true, income: false });
  }
  for (const e of d.treasury.burn?.entries ?? []) {
    const b = { ...base, at: e.at, reference: e.roundId ?? e.id, source: 'modeled_demo' as const, income: false };
    if (e.kind === 'wallet_funded') out.push({ ...b, id: `STM-${e.id}`, account: 'buyback', asset: 'USDC', amount: usdc(e.amountUsdc), category: 'buyback_funding', counterparty: 'treasury', internal: true });
    else if (e.kind === 'tokens_purchased') {
      out.push({ ...b, id: `STM-${e.id}-usdc`, account: 'buyback', asset: 'USDC', amount: usdc(-e.amountUsdc), category: 'buyback_purchase', counterparty: 'swap_pool', internal: false });
      out.push({ ...b, id: `STM-${e.id}-bettex`, account: 'buyback', asset: 'BETTEX', amount: tok(e.tokensBettex), category: 'token_purchase', counterparty: 'swap_pool', internal: false });
    } else if (e.kind === 'tokens_burned') out.push({ ...b, id: `STM-${e.id}`, account: 'buyback', asset: 'BETTEX', amount: tok(-e.tokensBettex), category: 'token_burn', counterparty: 'burn', internal: false });
  }
  const start = d.rounds.reduce((t, r) => Math.min(t, Date.parse(r.treasurySnapshot?.startedAt ?? r.endedAt)), Date.parse(current?.startedAt ?? d.serverNow));
  const accounts = [
    ['treasury', 'USDC', d.treasury.assetsUsdc],
    ['buyback', 'USDC', d.treasury.burn?.walletUsdc ?? 0],
    ['buyback', 'BETTEX', d.treasury.burn?.walletBettex ?? 0],
  ] as const;
  for (const [account, asset, closing] of accounts) {
    const movement = out.filter(e => e.account === account && e.asset === asset).reduce((s, e) => s + Number(e.amount), 0);
    out.push({ ...base, id: `SAMPLE-OPENING-${account}-${asset}`, at: new Date(start).toISOString(), account, asset,
      amount: asset === 'USDC' ? usdc(closing - movement) : tok(closing - movement), category: 'opening_snapshot', reference: 'MOCK-OPENING-BALANCE',
      counterparty: 'opening_snapshot', source: 'modeled_demo', internal: false, income: false });
  }
  return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || a.id.localeCompare(b.id));
}

export function statementBalances(d: DemoDashboard, all: RawEntry[], f: Pick<StatementFilters, 'account' | 'asset' | 'from' | 'to'>): TreasuryStatementBalance[] {
  const combos = [['treasury', 'USDC'], ['buyback', 'USDC'], ['buyback', 'BETTEX']] as const;
  return combos.filter(([a, s]) => (f.account === 'all' || f.account === a) && (f.asset === 'all' || f.asset === s)).map(([account, asset]) => {
    const mine = all.filter(e => e.account === account && e.asset === asset);
    const inP = mine.filter(e => { const day = brazilDate(e.at); return day >= f.from && day <= f.to; });
    const sum = (xs: RawEntry[]) => xs.reduce((s, e) => s + Number(e.amount), 0);
    const inflows = sum(inP.filter(e => Number(e.amount) > 0));
    const outflows = -sum(inP.filter(e => Number(e.amount) < 0));
    const fmt = (n: number) => asset === 'USDC' ? usdc(n) : tok(n);
    const result = sum(inP.filter(e => e.income));
    const opening = sum(mine.filter(e => brazilDate(e.at) < f.from));
    return { account, asset, opening: fmt(opening), inflows: fmt(inflows), outflows: fmt(outflows), closing: fmt(opening + inflows - outflows), income: fmt(result), otherIncome: fmt(0), reconciled: true };
  });
}

export function firstStatementDay(all: RawEntry[], d: DemoDashboard) {
  return brazilDate(all.length ? all[all.length - 1].at : d.serverNow);
}

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h ^= h >>> 13; return ((h >>> 0) % 10000) / 10000; };
}

const MARKETS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ARB/USDC', 'LINK/USDC'];

/** Deterministic illustrative records whose totals reconcile with the saved snapshot. */
export function roundActivity(s: DemoTreasuryRound, endAt: string): DemoTreasuryActivityItem[] {
  const n = Math.max(0, s.closedOperations ?? 0);
  const rnd = rng(s.id);
  const t0 = Date.parse(s.startedAt);
  const t1 = Math.max(t0 + 60_000, Math.min(Date.parse(endAt), Date.parse(s.endsAt)));
  const w = Array.from({ length: n }, () => 0.3 + rnd());
  const v = Array.from({ length: n }, () => 0.5 + rnd());
  const sw = w.reduce((a, b) => a + b, 0) || 1; const sv = v.reduce((a, b) => a + b, 0) || 1;
  const cents = (x: number) => Math.round(x * 100) / 100;
  const exec = s.executionCostsUsdc ?? 0; const net0 = s.realizedNetUsdc ?? 0;
  let netLeft = cents(net0); let costLeft = cents(exec);
  const items: DemoTreasuryActivityItem[] = [];
  for (let i = 0; i < n; i++) {
    const last = i === n - 1;
    const net = last ? netLeft : cents(net0 * w[i] / sw);
    const cost = last ? costLeft : cents(exec * v[i] / sv);
    netLeft = cents(netLeft - net); costLeft = cents(costLeft - cost);
    items.push({ id: `SAMPLE-${s.id}-${String(i + 1).padStart(4, '0')}`, at: new Date(t0 + ((i + 1) / (n + 1)) * (t1 - t0)).toISOString(), kind: 'position_closed', source: 'emulated', agent: 'crypto', market: MARKETS[Math.floor(rnd() * MARKETS.length)], capitalUsdc: Math.round(40 + rnd() * 360), grossUsdc: cents(net + cost), costUsdc: cost, netUsdc: net, feeKind: null, feeUsdc: null } as DemoTreasuryActivityItem);
  }
  (Object.entries(s.feeBreakdown ?? {}) as [string, number][]).filter(([, a]) => a > 0).forEach(([k, a], i) => {
    items.push({ id: `SAMPLE-${s.id}-fee-${k}`, at: new Date(t0 + (0.2 + i * 0.2) * (t1 - t0)).toISOString(), kind: 'operator_fee', source: 'emulated', agent: null, market: null, capitalUsdc: null, grossUsdc: null, costUsdc: null, netUsdc: null, feeKind: k, feeUsdc: a } as DemoTreasuryActivityItem);
  });
  items.push({ id: `SAMPLE-${s.id}-open`, at: s.startedAt, kind: 'checkpoint', source: 'modeled_baseline', agent: null, market: null, capitalUsdc: s.openingAssetsUsdc ?? null, grossUsdc: null, costUsdc: null, netUsdc: null, feeKind: null, feeUsdc: null } as DemoTreasuryActivityItem);
  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || a.id.localeCompare(b.id));
}

export type ArchivedRound = DemoRound & { treasurySnapshot: DemoTreasuryRound };
export const archivedRounds = (d: DemoDashboard): ArchivedRound[] => d.rounds.filter((r): r is ArchivedRound => !!r.treasurySnapshot);
