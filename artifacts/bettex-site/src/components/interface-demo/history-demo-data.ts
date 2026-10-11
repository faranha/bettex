import type { DemoDashboard, HistoryEntry, HistoryPage, DemoRoundArchivePage, DemoTreasuryActivityPage } from '@workspace/api-client-react';
import { roundActivity } from './treasury-demo-data';

/** Local illustrative History source derived only from the visual dashboard seed. No network, no chain. */
const SAMPLE = 'illustrative_example';

function units(n: number, dec: number): string {
  const [i = '0', f = ''] = Math.abs(n).toFixed(Math.min(dec, 18)).split('.');
  const digits = (i + f.padEnd(dec, '0')).replace(/^0+(?=\d)/, '');
  return `${n < 0 ? '-' : ''}${digits}`;
}
const DEC = (asset: string) => asset === 'USDC' ? 6 : 18;

/** The seed has no past draws; none are invented, so the lottery tab keeps its honest empty state. */
export const historyDashboard = (d: DemoDashboard): DemoDashboard => d;

export function historyEntries(d: DemoDashboard): HistoryEntry[] {
  const out: HistoryEntry[] = [];
  const base = { actor: 'user', environment: 'simulation', chainId: null, wallet: null, transactionHash: null, blockHash: null, blockNumber: null, logIndex: null, reconstructed: false, source: SAMPLE, parentId: null };
  for (const m of d.history) {
    const round = /ROUND-(\d{4}-\d\d-\d\d)$/.exec(m.id)?.[1];
    const corr = round ? `SAMPLE-CORR-ROUND-${round}` : `SAMPLE-CORR-${m.id}`;
    const kind = m.kind === 'distribution' ? 'distribution_paid' : m.kind === 'receive' ? 'external_deposit' : m.kind;
    const dec = DEC(m.asset);
    const data: Record<string, unknown> = { operationKind: m.kind, amountUnits: units(m.amount, dec), decimals: String(dec) };
    if (m.kind === 'distribution') Object.assign(data, { sourceWallet: 'earnings', periodId: round ?? '', ruleVersion: 'demo-model-v1' });
    if (m.sourceWallet) data.sourceWallet = m.sourceWallet;
    if (m.kind === 'swap' && m.sourceAsset && m.sourceAmount != null) Object.assign(data, { paidAsset: m.sourceAsset, paidUnits: units(m.sourceAmount, DEC(m.sourceAsset)), paidDecimals: String(DEC(m.sourceAsset)), mechanism: 'constant_product_demo' });
    else if (['withdraw', 'send'].includes(m.kind)) Object.assign(data, { paidAsset: m.asset, paidUnits: units(m.amount, dec), paidDecimals: String(dec) });
    if (m.destination) Object.assign(data, m.kind === 'receive' ? { from: m.destination } : { to: m.destination });
    const at = m.at;
    const final: HistoryEntry = { ...base, id: m.id, correlationId: corr, category: 'financial', kind, state: m.status, actor: m.kind === 'distribution' ? 'system' : 'user', asset: m.asset, occurredAt: at, requestedAt: at, processedAt: at, data };
    out.push(final);
    if (['withdraw', 'send', 'swap'].includes(m.kind)) {
      const req = new Date(Date.parse(at) - 60_000).toISOString();
      out.push({ ...final, id: `${m.id}-requested`, kind: 'financial_requested', state: 'requested', occurredAt: req, requestedAt: req, processedAt: req, parentId: m.id });
    }
  }
  if (d.lottery) for (const e of d.lottery.entries) out.push({ ...base, id: `SAMPLE-LOTTERY-FREE-${e.number}`, correlationId: `SAMPLE-CORR-LOTTERY-${e.number}`, category: 'activity', kind: e.type === 'free' ? 'lottery_free_entry' : 'lottery_entries_purchased', state: 'confirmed', actor: 'system', asset: null, occurredAt: e.createdAt, requestedAt: null, processedAt: e.createdAt, data: { entryNumbers: e.number, entryCount: '1', drawAt: d.lottery.nextDrawAt } });
  for (const r of d.rounds) {
    const p = r.participationSnapshot;
    if (!p) continue;
    out.push({ ...base, id: `SAMPLE-PARTICIPATION-${r.id}`, correlationId: `SAMPLE-CORR-ROUND-${r.id}`, category: 'automatic', kind: 'participation_entered', state: 'recorded', actor: 'system', asset: 'BETTEX', occurredAt: p.startedAt, requestedAt: null, processedAt: p.startedAt,
      data: { quantityUnits: units(p.ownEligibleTokens, 18), decimals: '18', eligibleUnits: units(p.ownEligibleTokens, 18), poolUnits: units(p.totalEligibleTokens, 18), weightUnits: String(p.ownTokenSeconds), mechanism: 'wallet_balance', ruleVersion: 'demo-model-v1', periodId: r.id } });
  }
  return out.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || a.id.localeCompare(b.id));
}

const VIEW: Record<string, RegExp> = { swapping: /swap|purchase|conversion|onramp/, staking: /participation|stake|staking/, distributions: /distribution/ };

export function historyPage(all: HistoryEntry[], q: URLSearchParams): HistoryPage {
  const view = q.get('view') ?? 'general';
  const limit = Math.min(50, Math.max(1, Number(q.get('limit') ?? 20) || 20));
  const offset = Number(q.get('cursor') ? atob(q.get('cursor')!).replace('o:', '') : 0) || 0;
  const from = q.get('from') ? Date.parse(q.get('from')!) : -Infinity, to = q.get('to') ? Date.parse(q.get('to')!) : Infinity;
  const wallet = q.get('wallet')?.toLowerCase(), corr = q.get('correlationId');
  let rows = view === 'treasury' ? [] : all.filter(e => {
    const k = `${e.kind} ${String((e.data as Record<string, unknown>).operationKind ?? '')}`;
    const t = Date.parse(e.occurredAt);
    return (view === 'general' || view === 'activity' && e.category === 'activity' || VIEW[view]?.test(k))
      && (!q.get('category') || e.category === q.get('category')) && (!q.get('state') || e.state === q.get('state'))
      && (!q.get('asset') || e.asset === q.get('asset')) && (!q.get('kind') || e.kind === q.get('kind'))
      && (!q.get('environment') || e.environment === q.get('environment')) && (!q.get('chainId') || String(e.chainId) === q.get('chainId'))
      && (!corr || e.correlationId === corr) && (!wallet || (e.wallet ?? '').toLowerCase() === wallet) && t >= from && t <= to;
  });
  if (corr) rows = rows.slice().reverse();
  const items = rows.slice(offset, offset + limit);
  const next = offset + limit < rows.length ? btoa(`o:${offset + limit}`) : null;
  return { items, nextCursor: next, completeFrom: all.length ? all[all.length - 1]!.occurredAt : new Date(0).toISOString(), limitations: [], timezone: 'America/Sao_Paulo' };
}

export function archivePage(d: DemoDashboard, q: URLSearchParams): DemoRoundArchivePage {
  const page = Math.max(1, Number(q.get('page') ?? 1) || 1), size = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 10) || 10));
  const all = d.rounds.slice().sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt));
  const id = q.get('round');
  return { items: all.slice((page - 1) * size, page * size), page, pageSize: size, total: all.length, selected: id ? all.find(r => r.id === id) ?? null : null };
}

export function activityPage(d: DemoDashboard, q: URLSearchParams): DemoTreasuryActivityPage {
  const roundId = q.get('roundId') ?? '';
  const cur = d.treasury.currentRound;
  const snap = cur?.id === roundId ? cur : d.rounds.find(r => r.id === roundId)?.treasurySnapshot;
  const endAt = cur?.id === roundId ? d.serverNow : d.rounds.find(r => r.id === roundId)?.endedAt ?? d.serverNow;
  const view = q.get('view') ?? 'history';
  const all = snap ? roundActivity(snap, endAt) : [];
  const rows = view === 'closed' ? all.filter(i => i.kind === 'position_closed') : view === 'fees' ? all.filter(i => i.kind === 'operator_fee') : all;
  const page = Math.max(1, Number(q.get('page') ?? 1) || 1), size = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 20) || 20));
  return { roundId, items: rows.slice((page - 1) * size, page * size), total: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / size)), page, pageSize: size, snapshot: '1', source: 'emulated' };
}
