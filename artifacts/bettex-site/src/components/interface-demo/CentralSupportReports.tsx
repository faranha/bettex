/** @jsxImportSource react */
import { useEffect, useMemo, useState } from 'react';
import { useFmt } from '../alpha-trading/format';
import { AGENT, FINDING, FACT } from '../agent-operations/copy';
import { AGENTS, DECISIONS, REQUESTS, STATE } from './central-data';
import { PACKETS, packetById } from './central-packets';
import { useL } from './CentralAgents';
import { useRecordNavigation } from './CentralRecordNavigation';
import './CentralSupportReports.css';

const ROLES = ['governance', 'risk', 'treasury', 'execution', 'reconciliation'];

export function CentralSupportReports({ onSelect }: { onSelect: (id: string) => void }) {
  const { x, date } = useFmt(); const L = useL(); const nav = useRecordNavigation();
  const [role, setRole] = useState<string | null>('risk');
  const [opId, setOpId] = useState<string | null>(null);
  const ops = useMemo(() => role
    ? PACKETS.filter(p => p.exchange === 'opinion' && p.source === role).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)) : [], [role]);
  useEffect(() => { setOpId(ops[0]?.id ?? null); }, [ops]);
  const op = ops.find(p => p.id === opId);
  const query = op?.replyToId ? packetById(op.replyToId) : undefined;
  const request = op ? REQUESTS.find(r => r.id === op.requestId) : undefined;
  const decisions = op ? DECISIONS.filter(d => d.requestId === op.requestId) : [];
  const run = role ? AGENTS.find(a => a.id === role)?.latest : undefined;
  const stateBadge = (s: string) => s === 'selected' ? 'ok' : s === 'rejected' ? 'no' : '';
  return <section className="csr" data-demo-local data-testid="support-reports">
    <h2>{x('Relatórios dos subagentes de apoio', 'Support subagent reports', 'Informes de los subagentes de apoyo')}</h2>
    <p className="csr-note">{x('Consultas, pareceres e decisões relacionados, por subagente.', 'Related consultations, opinions and decisions by subagent.', 'Consultas, dictámenes y decisiones relacionados, por subagente.')}</p>
    <div className="csr-tabs">{ROLES.map(id => <button key={id} type="button" className="csr-tab" aria-pressed={role === id}
      data-testid={`support-report-agent-${id}`} onClick={() => setRole(id)}>{L(AGENT[id]?.name) || id}</button>)}</div>
    {!role && <div className="csr-empty" style={{ marginTop: 10 }}>{x('Selecione um subagente para ver o parecer mais recente e a consulta associada.', 'Select a subagent to see its latest opinion and linked consultation.', 'Seleccione un subagente para ver su dictamen más reciente y la consulta asociada.')}</div>}
    {role && !op && <div className="csr-empty" style={{ marginTop: 10 }}>{x('Nenhum parecer registrado para este subagente.', 'No opinion recorded for this subagent.', 'Ningún dictamen registrado para este subagente.')}</div>}
    {role && op && <div className="csr-body">
      {ops.length > 1 && <div className="csr-chips">{ops.map(p => <button key={p.id} type="button" className="csr-chip" aria-pressed={p.id === opId}
        data-testid={`support-report-choice-${p.id}`} onClick={() => setOpId(p.id)}>{p.requestId.replace('demo-req-', '')}</button>)}</div>}
      {query && <div className="csr-card"><h3>{x('Consulta da BETTEX', 'BETTEX consultation', 'Consulta de BETTEX')} · {date(query.at)}</h3><b>{L(query.title)}</b><div>{L(query.summary)}</div></div>}
      <div className="csr-card csr-op"><h3>{x('Parecer do subagente', 'Subagent opinion', 'Dictamen del subagente')} · {date(op.at)}</h3>{L(op.summary)}</div>
      {request && <div className="csr-card"><h3>{x('Proposta', 'Proposal', 'Propuesta')}</h3><b>{L(request.market)}</b>
        <div><span className="csr-badge">{L(STATE[request.state])}</span></div></div>}
      <div className="csr-card csr-out"><h3>{x('Resultado', 'Outcome', 'Resultado')}</h3>
        {decisions.length ? decisions.map(d => <div key={d.id}><span className={`csr-badge ${stateBadge(d.state)}`}>{x('Decisão da BETTEX', 'BETTEX decision', 'Decisión de BETTEX')}: {L(STATE[d.state])}</span> · {date(d.at)}<div>{L(d.reason)}</div></div>)
          : <span className="csr-badge">{x('Pendente: BETTEX ainda não decidiu', 'Pending: BETTEX has not decided', 'Pendiente: BETTEX aún no decidió')}</span>}</div>
      {request && <details className="csr-card csr-evidence"><summary>{x('Evidências e histórico da proposta', 'Proposal evidence and history', 'Evidencias e historial de la propuesta')}</summary><dl>
        {request.sources.map(s => <div key={s.ref}><dt>{s.name} · {date(s.at)}: </dt><dd>{L(s.evidence)}</dd></div>)}
        {request.events.map((e, i) => <div key={i}><dt>{date(e.at)}: </dt><dd>{L(e.stage)}</dd></div>)}</dl></details>}
      <div className="csr-actions">
        <button type="button" className="csr-btn" data-testid="support-report-open-packet" disabled={!nav} onClick={() => nav?.openPacket(op.id)}>{x('Abrir pacote', 'Open packet', 'Abrir paquete')}</button>
        <button type="button" className="csr-btn" data-testid="support-report-open-proposal" disabled={!nav || !request} onClick={() => request && nav?.openRequest(request.id)}>{x('Abrir proposta', 'Open proposal', 'Abrir propuesta')}</button>
        <button type="button" className="csr-btn" data-testid="support-report-full" onClick={() => onSelect(role)}>{x('Relatório completo', 'Full report', 'Informe completo')}</button>
      </div>
      {run && <details className="csr-card" data-testid="support-report-technical"><summary>{x('Relatório técnico do agente', 'Agent technical report', 'Informe técnico del agente')}</summary>
        <p className="csr-note">{x('Última execução do agente, em', 'Latest agent run, on', 'Última ejecución del agente, el')} {date(run.completedAt)}. {x('Independe da data do parecer acima.', 'Independent of the opinion date above.', 'Independiente de la fecha del dictamen.')}</p>
        <ul>{run.findings.map(c => <li key={c}>{L(FINDING[c]) || c}</li>)}</ul>
        <dl>{run.facts.map(k => <div key={k.code}><dt>{L(FACT[k.code]) || k.code}: </dt><dd>{k.value}</dd></div>)}</dl></details>}
    </div>}
  </section>;
}
