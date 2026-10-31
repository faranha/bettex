/** @jsxImportSource react */
import { Link } from 'wouter';
import { demoPath } from '../demo/demo-navigation';
import { useFmt } from '../alpha-trading/format';
import { STATE, type T3 } from './central-data';
import { requestJourney, type JourneyEntry } from './central-journey';
import { nodeOf } from './central-graph-model';
import { useL } from './CentralAgents';
import { useRecordNavigation } from './CentralRecordNavigation';
import './CentralJourneyView.css';

const KIND: Record<JourneyEntry['kind'], T3> = {
  proposal: ['Proposta', 'Proposal', 'Propuesta'], analysis: ['Análise', 'Analysis', 'Análisis'],
  query: ['Consulta', 'Consultation', 'Consulta'], opinion: ['Parecer', 'Opinion', 'Dictamen'],
  decision: ['Decisão', 'Decision', 'Decisión'], order: ['Ordem', 'Order', 'Orden'],
  fill: ['Execução', 'Fill', 'Ejecución'], position: ['Posição', 'Position', 'Posición'],
};

/** The single chronological projection of a request: shared by packets, reports, records and consultations. */
export function JourneyView({ requestId, currentId, tone = 'dark', showAudit = true }: { requestId: string; currentId?: string; tone?: 'dark' | 'light'; showAudit?: boolean }) {
  const { x, date, loc } = useFmt(); const L = useL(); const nav = useRecordNavigation();
  const j = requestJourney(requestId); if (!j) return null;
  const st = (s: string) => (STATE[s] ? L(STATE[s]) : s);
  const dec = j.decisions[j.decisions.length - 1];
  let status: string;
  if (!dec) status = x('Pendente: a BETTEX ainda não decidiu. Nenhuma ordem ou posição foi registrada.', 'Pending: BETTEX has not decided. No order or position is recorded.', 'Pendiente: BETTEX aún no decidió. No hay orden ni posición registrada.');
  else {
    const d = `${x('Decisão da BETTEX', 'BETTEX decision', 'Decisión de BETTEX')}: ${st(dec.state)}.`;
    const o = j.orders.length
      ? `${x('Ordem', 'Order', 'Orden')}: ${j.orders.map(q => st(q.state)).join(', ')}${j.orders.every(q => !q.fills.length) ? ` · ${x('sem execução registrada', 'no fill recorded', 'sin ejecución registrada')}` : ''}.`
      : x('Nenhuma ordem registrada para esta proposta.', 'No order recorded for this proposal.', 'Ninguna orden registrada para esta propuesta.');
    status = `${d} ${o}`;
  }
  return <div className={`cjv ${tone === 'light' ? 'cjv--light' : ''}`} data-testid={`journey-view-${requestId}`}>
    <div className="cjv-state" data-testid="journey-state"><b>{x('Estado atual', 'Current state', 'Estado actual')} · {L(j.request.market)}</b><span>{status}</span></div>
    <ol className="cjv-list" aria-label={x('Percurso cronológico', 'Chronological journey', 'Recorrido cronológico')}>{j.entries.map(e => <li key={e.id} className={`cjv-item ${e.id === currentId ? 'cur' : ''}`} data-testid={`journey-entry-${e.id}`}>
      <time>{date(e.at)}</time><span className="cjv-kind">{e.kind === 'decision' && e.packetId ? x('Mensagem de decisão', 'Decision message', 'Mensaje de decisión') : L(KIND[e.kind])}</span>
      {e.source && e.target && <div className="cjv-route">{L(nodeOf(e.source).name)} → {L(nodeOf(e.target).name)}</div>}
      <p><b>{L(e.title)}</b></p><p>{L(e.detail)}</p>
      <span className="cjv-record-id">{e.id}</span>
      {e.packetId && nav && <button type="button" data-demo-local className="cjv-link" data-testid={`journey-open-${e.packetId}`} onClick={() => nav.openPacket(e.packetId!)}>{x('Abrir pacote', 'Open packet', 'Abrir paquete')}</button>}
    </li>)}</ol>
    {showAudit && <div className="cjv-acts">
      <Link data-demo-local data-testid="link-journey-audit" className="cjv-link" href={`${demoPath('wallet', loc)}?history=audit&correlationId=${encodeURIComponent(requestId)}`}>{x('Ver no Histórico', 'View in History', 'Ver en el Historial')} ({j.auditIds.length})</Link>
    </div>}
  </div>;
}
