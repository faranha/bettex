/** @jsxImportSource react */
import { Link } from 'wouter';
import { demoPath } from '../demo/demo-navigation';
import { useFmt } from '../alpha-trading/format';
import { AGENT, FINDING, FACT } from '../agent-operations/copy';
import { AGENTS, DECISIONS, ORDERS, REQUESTS, STATE } from './central-data';
import { PACKETS, packetById } from './central-packets';
import { useL } from './CentralAgents';
import { useRecordNavigation } from './CentralRecordNavigation';
import { JourneyView } from './CentralJourneyView';
import './CentralSupportReports.css';

const ROLES = ['governance', 'risk', 'treasury', 'execution', 'reconciliation'];

export function CentralSupportReports({ onSelect }: { onSelect: (id: string) => void }) {
  const { x, date, loc } = useFmt(); const L = useL(); const nav = useRecordNavigation();
  const requestId = nav?.requestId ?? null; const role = nav?.reportAgentId ?? null;
  const request = requestId ? REQUESTS.find(r => r.id === requestId) : undefined;
  const op = role && requestId ? PACKETS.find(p => p.exchange === 'opinion' && p.source === role && p.requestId === requestId) : undefined;
  const query = op?.replyToId ? packetById(op.replyToId) : undefined;
  const decisions = request ? DECISIONS.filter(d => d.requestId === request.id) : [];
  const orders = request ? ORDERS.filter(o => o.requestId === request.id) : [];
  const run = role ? AGENTS.find(a => a.id === role)?.latest : undefined;
  const st = (s: string) => (STATE[s] ? L(STATE[s]) : s);
  const badge = (s: string) => s === 'selected' ? 'ok' : s === 'rejected' ? 'no' : '';
  const roleName = (id: string) => L(AGENT[id]?.name) || id;
  const openAgent = (id: string) => (nav ? nav.openAgent(id) : onSelect(id));
  return <section className="csr" data-demo-local data-testid="support-reports">
    <h2>{x('Relatórios dos subagentes de apoio', 'Support subagent reports', 'Informes de los subagentes de apoyo')}</h2>
    <p className="csr-note">{x('Escolha uma proposta e um subagente: consulta, parecer, decisão e percurso são da mesma proposta.', 'Choose a proposal and a subagent: consultation, opinion, decision and journey belong to the same proposal.', 'Elija una propuesta y un subagente: consulta, dictamen, decisión y recorrido son de la misma propuesta.')}</p>
    <label className="csr-label">{x('Proposta', 'Proposal', 'Propuesta')}
      <select className="csr-select" data-testid="support-report-request" value={requestId ?? ''} disabled={!nav}
        onChange={e => e.target.value && nav?.selectRequest(e.target.value)}>
        <option value="">{x('Selecione uma proposta', 'Select a proposal', 'Seleccione una propuesta')}</option>
        {REQUESTS.map(r => <option key={r.id} value={r.id}>{r.asset.toUpperCase()} · {L(r.market)} · {st(r.state)}</option>)}
      </select></label>
    <div className="csr-tabs" style={{ marginTop: 10 }}>{ROLES.map(id => <button key={id} type="button" className="csr-tab" aria-pressed={role === id}
      data-testid={`support-report-agent-${id}`} onClick={() => nav?.selectReportAgent(id)}>{roleName(id)}</button>)}</div>
    {!requestId && <div className="csr-empty" data-testid="support-report-pick-request">{x('Selecione uma proposta para ver os pareceres. Nenhuma é escolhida por padrão.', 'Select a proposal to see opinions. None is chosen by default.', 'Seleccione una propuesta para ver los dictámenes. Ninguna se elige por defecto.')}</div>}
    {requestId && !role && <div className="csr-empty">{x('Selecione um subagente para ver o parecer desta proposta.', 'Select a subagent to see its opinion on this proposal.', 'Seleccione un subagente para ver su dictamen sobre esta propuesta.')}</div>}
    {requestId && role && !op && <div className="csr-empty" data-testid="support-report-none">{roleName(role)}: {x('nenhum parecer registrado para esta proposta.', 'no opinion recorded for this proposal.', 'ningún dictamen registrado para esta propuesta.')}
      <div className="csr-actions" style={{ justifyContent: 'center', marginTop: 8 }}>
        <button type="button" className="csr-btn" onClick={() => nav?.openRequest(requestId)}>{x('Abrir proposta', 'Open proposal', 'Abrir propuesta')}</button></div></div>}
    {requestId && role && op && request && <div className="csr-body">
      <div className="csr-actions">
        {query && <button type="button" className="csr-btn" data-testid="support-report-open-query" onClick={() => nav?.openPacket(query.id)}>{x('Abrir consulta', 'Open query', 'Abrir consulta')}</button>}
        <button type="button" className="csr-btn" data-testid="support-report-open-packet" onClick={() => nav?.openPacket(op.id)}>{x('Abrir parecer', 'Open opinion', 'Abrir dictamen')}</button>
        <button type="button" className="csr-btn" data-testid="support-report-open-proposal" onClick={() => nav?.openRequest(request.id)}>{x('Abrir proposta', 'Open proposal', 'Abrir propuesta')}</button>
        <Link data-demo-local data-testid="support-report-audit" className="csr-btn" style={{ display: 'inline-flex', alignItems: 'center' }} href={`${demoPath('wallet', loc)}?history=audit&correlationId=${encodeURIComponent(request.id)}`}>{x('Ver no Histórico', 'View in History', 'Ver en el Historial')}</Link>
      </div>
      <div className="csr-two" style={{ display: 'grid', gap: 12 }}>
        {query && <div className="csr-card"><h3>{x('Consulta da BETTEX', 'BETTEX consultation', 'Consulta de BETTEX')} · {date(query.at)}</h3><b>{L(query.title)}</b><div>{L(query.summary)}</div></div>}
        <div className="csr-card csr-op"><h3>{x('Parecer do subagente', 'Subagent opinion', 'Dictamen del subagente')} · {date(op.at)}</h3>{L(op.summary)}</div>
        <div className="csr-card"><h3>{x('Proposta', 'Proposal', 'Propuesta')}</h3><b>{L(request.market)}</b>
          <div><span className="csr-badge">{st(request.state)}</span></div>
          {orders.length > 0 ? orders.map(o => <div key={o.id}>{x('Ordem', 'Order', 'Orden')}: {st(o.state)} · {L(o.reason)}</div>) : <div>{x('Nenhuma ordem registrada.', 'No order recorded.', 'Ninguna orden registrada.')}</div>}</div>
        <div className="csr-card csr-out"><h3>{x('Resultado', 'Outcome', 'Resultado')}</h3>
          {decisions.length ? decisions.map(d => <div key={d.id}><span className={`csr-badge ${badge(d.state)}`}>{x('Decisão da BETTEX', 'BETTEX decision', 'Decisión de BETTEX')}: {st(d.state)}</span> · {date(d.at)}<div>{L(d.reason)}</div></div>)
            : <span className="csr-badge">{x('Pendente: BETTEX ainda não decidiu', 'Pending: BETTEX has not decided', 'Pendiente: BETTEX aún no decidió')}</span>}</div>
      </div>
      <details className="csr-card"><summary>{x('Evidências da proposta', 'Proposal evidence', 'Evidencias de la propuesta')}</summary><dl>
        {request.sources.map(s => <div key={s.ref}><dt>{s.name} · {date(s.at)}: </dt><dd>{L(s.evidence)}</dd></div>)}</dl></details>
    </div>}
    {request && <details className="csr-card" open style={{ marginTop: 12 }}><summary>{x('Percurso da proposta', 'Proposal journey', 'Recorrido de la propuesta')}</summary><JourneyView requestId={request.id} currentId={op?.id} /></details>}
    {role && <details className="csr-card csr-monitor" style={{ marginTop: 12 }} data-testid="support-report-technical"><summary>{x('Monitoramento do agente, geral (não é evidência desta proposta)', 'Agent monitoring, general (not evidence for this proposal)', 'Monitoreo del agente, general (no es evidencia de esta propuesta)')}</summary>
      {run && <><p className="csr-note">{x('Última execução do agente em', 'Latest agent run on', 'Última ejecución del agente el')} {date(run.completedAt)}. {x('Monitoramento geral, sem vínculo registrado com esta consulta.', 'General monitoring, with no recorded link to this consultation.', 'Monitoreo general, sin vínculo registrado con esta consulta.')}</p>
        <ul>{run.findings.map(c => <li key={c}>{L(FINDING[c]) || c}</li>)}</ul>
        <dl>{run.facts.map(k => <div key={k.code}><dt>{L(FACT[k.code]) || k.code}: </dt><dd>{k.value}</dd></div>)}</dl></>}
      <div className="csr-actions" style={{ marginTop: 8 }}><button type="button" className="csr-btn" data-testid="support-report-full" onClick={() => openAgent(role)}>{x('Monitoramento do agente', 'Agent monitoring', 'Monitoreo del agente')}</button></div></details>}
  </section>;
}
