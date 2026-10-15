import { DECISIONS, REQUESTS, type T3 } from './central-data';
import { supportPackets } from './central-support-packets';

/** A visual replay of existing sample records, not a transport or an agent runtime.
 * Animation never creates decisions, changes balances, or rewrites historical time. */
export type GraphPacket = {
  id: string;
  source: string;
  target: string;
  edgeId: string;
  kind: 'analysis' | 'decision';
  requestId: string;
  at: string;
  title: T3;
  summary: T3;
  payload: { label: T3; value: T3 | string }[];
  replyToId?: string;
  decisionId?: string;
  exchange?: 'query' | 'opinion';
};

const text = (pt: string, en: string, es: string): T3 => [pt, en, es];
const shift = (at: string, milliseconds: number) => new Date(Date.parse(at) + milliseconds).toISOString();
const amount = (units: string): T3 => ['pt-BR', 'en-US', 'es-ES'].map(locale =>
  `${(Number(units) / 1e6).toLocaleString(locale, { maximumFractionDigits: 6 })} USDC`) as T3;
const samplePackets: GraphPacket[] = [];

for (const request of REQUESTS) {
  const at = request.events[0]?.at ?? request.sources[0].at;
  const specialistId = `packet-${request.id}-analysis`;
  const consolidatedId = `packet-${request.id}-consolidated`;
  const payload: GraphPacket['payload'] = [
    { label: text('Proposta', 'Proposal', 'Propuesta'), value: request.id },
    { label: text('Mercado', 'Market', 'Mercado'), value: request.market },
    { label: text('Operação', 'Operation', 'Operación'), value: request.operation },
    { label: text('Capital proposto', 'Proposed capital', 'Capital propuesto'), value: amount(request.capital) },
    { label: text('Custos estimados', 'Estimated costs', 'Costos estimados'), value: amount(request.costs) },
    { label: text('Incerteza', 'Uncertainty', 'Incertidumbre'), value: request.uncertainty },
  ];
  samplePackets.push({
    id: specialistId, source: request.asset, target: 'predictions',
    edgeId: `${request.asset}-predictions`, kind: 'analysis', requestId: request.id,
    at: shift(at, -1000),
    title: text(`Análise ${request.asset.toUpperCase()}`, `${request.asset.toUpperCase()} analysis`, `Análisis ${request.asset.toUpperCase()}`),
    summary: request.events[0]?.reason ?? request.reason, payload,
  }, {
    id: consolidatedId, source: 'predictions', target: 'bettex',
    edgeId: 'predictions-bettex', kind: 'analysis', requestId: request.id, at,
    title: text('Proposta encaminhada à BETTEX', 'Proposal forwarded to BETTEX', 'Propuesta enviada a BETTEX'),
    summary: request.events[0]?.reason ?? request.reason,
    payload, replyToId: specialistId,
  });

  // An undecided proposal has no invented response. Only existing decisions travel back.
  for (const decision of DECISIONS.filter(d => d.requestId === request.id)) {
    const responseId = `packet-${decision.id}-response`;
    const decisionPayload: GraphPacket['payload'] = [
      { label: text('Decisão', 'Decision', 'Decisión'), value: decision.id },
      { label: text('Proposta', 'Proposal', 'Propuesta'), value: request.id },
      { label: text('Justificativa', 'Rationale', 'Justificación'), value: decision.reason },
      { label: text('Capital analisado', 'Capital reviewed', 'Capital analizado'), value: amount(decision.requested) },
    ];
    samplePackets.push({
      id: responseId, source: 'bettex', target: 'predictions',
      edgeId: 'predictions-bettex', kind: 'decision', requestId: request.id,
      at: decision.at,
      title: text('Decisão da BETTEX', 'BETTEX decision', 'Decisión de BETTEX'),
      summary: decision.reason, payload: decisionPayload,
      replyToId: consolidatedId, decisionId: decision.id,
    }, {
      id: `packet-${decision.id}-specialist`, source: 'predictions', target: request.asset,
      edgeId: `${request.asset}-predictions`, kind: 'decision', requestId: request.id,
      at: shift(decision.at, 1000),
      title: text('Resposta ao especialista', 'Response to specialist', 'Respuesta al especialista'),
      summary: decision.reason, payload: decisionPayload,
      replyToId: responseId, decisionId: decision.id,
    });
  }
}

export const PACKETS: GraphPacket[] = [...samplePackets, ...supportPackets()].sort((a, b) =>
  Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id));
const packetsById = new Map(PACKETS.map(packet => [packet.id, packet]));
const requestSlots = new Map(REQUESTS.map((request, index) => [request.id, index]));
export const PACKET_REPLAY_MS = 12000;

export function packetById(id: string): GraphPacket | undefined {
  return packetsById.get(id);
}

export function packetConversation(packet: GraphPacket): GraphPacket[] {
  return PACKETS.filter(p => p.requestId === packet.requestId);
}

/** Position along source -> target, independent of camera/edge orientation.
 * Four causal stages: specialist analysis, consolidation, decision, specialist response.
 * Successive replay waves overlap, so analysis and replies remain visible together.
 * Stage offsets preserve the journey; these repetitions never add historical records.
 * Endpoints are held between transmissions; callers may hide them to avoid node clutter. */
export function packetProgress(packet: GraphPacket, elapsedMs: number, reduced = false): number {
  const slot = requestSlots.get(packet.requestId) ?? 0;
  const stage = packet.kind === 'analysis'
    ? packet.source === 'predictions' ? 1 : 0
    : packet.source === 'bettex' ? 2 : 3;
  if (reduced) return 0.18 + slot * 0.095 + (stage % 2) * 0.035;
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const supportSlot = ['governance', 'risk', 'treasury', 'execution', 'reconciliation'].indexOf(packet.source === 'bettex' ? packet.target : packet.source);
  const start = packet.exchange
    ? 800 + Math.max(0, supportSlot) * 1800 + slot * 350 + (packet.exchange === 'opinion' ? 6000 : 0)
    : 500 + slot * 1100 + stage * 6000;
  // Include in-flight messages from the preceding wave rather than waiting for
  // every reply to finish before starting another analysis.
  const phase = ((elapsed - start) % PACKET_REPLAY_MS + PACKET_REPLAY_MS) % PACKET_REPLAY_MS;
  return Math.min(1, phase / 5000);
}
