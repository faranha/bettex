/** @jsxImportSource react */
import { useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { nodeOf } from './central-graph-model';
import { PACKETS } from './central-packets';
import { useRecordNavigation } from './CentralRecordNavigation';

export function CentralConsultations({ agentId }: { agentId: string }) {
  const { x, date } = useFmt(); const L = useL(); const nav = useRecordNavigation();
  const queries = PACKETS.filter(p => p.exchange === 'query' && p.target === agentId);
  return <section className="grid gap-4" data-testid={`support-consultations-${agentId}`}>
    <div>
      <h3 className="display text-lg font-extrabold">{x('Consultas da BETTEX', 'BETTEX consultations', 'Consultas de BETTEX')}</h3>
      <p className="mt-2 text-sm">{x('A BETTEX pede uma análise, recebe o parecer e mantém a responsabilidade pela decisão. Um parecer não é uma autorização de operação.', 'BETTEX requests an analysis, receives the opinion and retains responsibility for the decision. An opinion is not an authorization to trade.', 'BETTEX solicita un análisis, recibe el dictamen y mantiene la responsabilidad por la decisión. Un dictamen no es una autorización para operar.')}</p>
    </div>
    {queries.map(query => {
      const reply = PACKETS.find(p => p.replyToId === query.id);
      return <article key={query.id} className="grid gap-3 rounded-xl border border-[#8A763E] p-4">
        <h4 className="font-bold">{L(query.title)}</h4>
        <div className="grid gap-1 text-sm"><b>BETTEX → {L(nodeOf(agentId).name)}</b><p>{L(query.summary)}</p><time className="text-xs">{date(query.at)}</time></div>
        {reply && <div className="grid gap-1 border-l-2 border-[#CCA85A] pl-3 text-sm"><b>{L(nodeOf(agentId).name)} → BETTEX</b><p>{L(reply.summary)}</p><time className="text-xs">{date(reply.at)}</time></div>}
        <div className="flex flex-wrap gap-2">
          <button type="button" data-demo-local data-testid={`support-query-${query.id}`} className="pki-btn" onClick={() => nav?.openPacket(query.id)}>{x('Abrir consulta', 'Open consultation', 'Abrir consulta')}</button>
          {reply && <button type="button" data-demo-local className="pki-btn" data-testid={`support-opinion-${reply.id}`} onClick={() => nav?.openPacket(reply.id)}>{x('Abrir parecer', 'Open opinion', 'Abrir dictamen')}</button>}
          <button type="button" data-demo-local className="pki-btn" onClick={() => nav?.openRequest(query.requestId)}>{x('Ver proposta e decisão', 'View proposal and decision', 'Ver propuesta y decisión')}</button>
        </div>
      </article>;
    })}
  </section>;
}
