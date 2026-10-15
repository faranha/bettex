import type { HistoryEntry } from '@workspace/api-client-react';
import { REQUESTS, DECISIONS, ORDERS, POSITIONS } from './central-data';
import { PACKETS } from './central-packets';

/** Correlated didactic lifecycle, not cash movements or genuine agent output. */
export function centralAuditEntries(): HistoryEntry[] {
  const out: HistoryEntry[] = [];
  const journalState: Record<string, string> = {
    awaiting_decision: 'pending', forwarded_to_execution: 'processing', allocation_confirmed: 'confirmed',
    selected: 'confirmed', filled: 'confirmed', open: 'pending', reducing: 'processing',
  };
  const add = (id: string, requestId: string, at: string, kind: string, state: string, data: Record<string, unknown>, parentId: string | null) => out.push({
    id, correlationId: requestId, parentId, category: 'automatic', kind, state: journalState[state] ?? state,
    actor: 'system', environment: 'simulation', asset: null, chainId: null, wallet: null,
    occurredAt: at, requestedAt: null, processedAt: at,
    transactionHash: null, blockHash: null, blockNumber: null, logIndex: null,
    reconstructed: false, source: 'illustrative_example',
    data: { ...data, graphState: state, graphDemoRecord: true, provenance: 'handwritten_visual_example_no_execution' },
  });
  for (const r of REQUESTS) {
    r.events.forEach((e, i) => add(i === 0 ? r.id : `${r.id}-event-${i}`, r.id, e.at,
      'agent_request', i === r.events.length - 1 ? r.state : 'recorded',
      { market: r.asset.toUpperCase(), title: e.stage, reason: e.reason, requestedCapitalUsdc: Number(r.capital) / 1e6 },
      i === 0 ? null : r.id));
  }
  for (const d of DECISIONS) add(d.id, d.requestId, d.at, 'agent_decision', d.state,
    { market: d.asset.toUpperCase(), reason: d.reason, selectedCapitalUsdc: Number(d.requested) / 1e6 }, d.requestId);
  for (const o of ORDERS) {
    add(o.id, o.requestId, o.updatedAt, 'agent_order', o.state,
      { market: o.asset.toUpperCase(), filledUnits: o.filled, reservedUsdc: Number(o.reserved) / 1e6 },
      DECISIONS.find(d => d.requestId === o.requestId)?.id ?? o.requestId);
    for (const f of o.fills) add(f.id, o.requestId, f.at, 'agent_fill', 'recorded',
      { market: o.asset.toUpperCase(), quantityUnits: f.shares, decimals: 6, feeUnits: f.fees, cashUsdc: Number(f.cash) / 1e6 }, o.id);
  }
  for (const p of POSITIONS) add(p.id, p.requestId, p.at, 'agent_position', p.state,
    { market: p.asset.toUpperCase(), costUsdc: Number(p.cost) / 1e6, exitValueUsdc: p.exitValue == null ? null : Number(p.exitValue) / 1e6, liquidity: p.exitState, resolution: p.resolution },
    ORDERS.find(o => o.requestId === p.requestId)?.id ?? p.requestId);
  for (const p of PACKETS.filter(p => p.exchange)) add(p.id, p.requestId, p.at,
    'agent_request', 'recorded',
    { title: p.title, reason: p.summary, sourceAgent: p.source, targetAgent: p.target, exchange: p.exchange },
    p.replyToId ?? p.requestId);
  return out;
}
