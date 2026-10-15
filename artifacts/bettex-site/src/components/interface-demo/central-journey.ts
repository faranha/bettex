import { DECISIONS, ORDERS, POSITIONS, REQUESTS, STATE, type T3 } from './central-data';
import { PACKETS } from './central-packets';
import { centralAuditEntries } from './central-audit-data';

export type JourneyEntry = {
  id: string;
  at: string;
  kind: 'proposal' | 'analysis' | 'query' | 'opinion' | 'decision' | 'order' | 'fill' | 'position';
  title: T3;
  detail: T3;
  source?: string;
  target?: string;
  packetId?: string;
  parentId?: string;
};
const t = (pt: string, en: string, es: string): T3 => [pt, en, es];

/** One projection of existing sample records. It never manufactures a missing stage
 * and never attributes an agent-wide monitoring run to an individual proposal. */
export function requestJourney(requestId: string) {
  const request = REQUESTS.find(r => r.id === requestId);
  if (!request) return null;
  const packets = PACKETS.filter(p => p.requestId === requestId);
  const decisions = DECISIONS.filter(d => d.requestId === requestId);
  const orders = ORDERS.filter(o => o.requestId === requestId);
  const positions = POSITIONS.filter(p => p.requestId === requestId);
  const entries: JourneyEntry[] = [];
  request.events.forEach((e, i) => entries.push({
    id: i ? `${request.id}-event-${i}` : request.id, at: e.at, kind: 'proposal',
    title: e.stage, detail: e.reason, parentId: i ? request.id : undefined,
  }));
  packets.forEach(p => entries.push({
    id: p.id, at: p.at, kind: p.exchange ?? (p.kind === 'analysis' ? 'analysis' : 'decision'),
    title: p.title, detail: p.summary, source: p.source, target: p.target,
    packetId: p.id, parentId: p.replyToId ?? requestId,
  }));
  decisions.forEach(d => entries.push({
    id: d.id, at: d.at, kind: 'decision',
    title: t(`Decisão BETTEX · ${STATE[d.state]?.[0] ?? d.state}`, `BETTEX decision · ${STATE[d.state]?.[1] ?? d.state}`, `Decisión BETTEX · ${STATE[d.state]?.[2] ?? d.state}`),
    detail: d.reason, parentId: requestId,
  }));
  orders.forEach(o => {
    entries.push({
      id: o.id, at: o.updatedAt, kind: 'order',
      title: t(`Ordem · ${STATE[o.state]?.[0] ?? o.state}`, `Order · ${STATE[o.state]?.[1] ?? o.state}`, `Orden · ${STATE[o.state]?.[2] ?? o.state}`),
      detail: o.reason, parentId: decisions[0]?.id ?? requestId,
    });
    o.fills.forEach(f => entries.push({
      id: f.id, at: f.at, kind: 'fill', title: t('Preenchimento registrado', 'Recorded fill', 'Ejecución registrada'),
      detail: t('Quantidade, custo e taxas no registro da ordem.', 'Quantity, cost and fees in the order record.', 'Cantidad, costo y comisiones en el registro de la orden.'),
      parentId: o.id,
    }));
  });
  positions.forEach(p => entries.push({
    id: p.id, at: p.at, kind: 'position',
    title: t(`Posição · ${STATE[p.state]?.[0] ?? p.state}`, `Position · ${STATE[p.state]?.[1] ?? p.state}`, `Posición · ${STATE[p.state]?.[2] ?? p.state}`),
    detail: p.event, parentId: orders[0]?.id ?? requestId,
  }));
  entries.sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id));
  const auditIds = centralAuditEntries().filter(e => e.correlationId === requestId).map(e => e.id);
  return { request, packets, decisions, orders, positions, entries, auditIds };
}
