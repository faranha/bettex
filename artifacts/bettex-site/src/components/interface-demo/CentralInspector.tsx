/** @jsxImportSource react */
import { useEffect, useState, type RefObject } from 'react';
import { X as XIcon } from 'lucide-react';
import { Title as DialogTitle } from '@radix-ui/react-dialog';
import { useFmt, Tag } from '../alpha-trading/format';
import { CentralAgents, useL } from './CentralAgents';
import { CentralBettex } from './CentralBettex';
import { CentralCapital, CentralForecast } from './CentralCapital';
import { RecordsSection, Journey } from './CentralRecords';
import { MockCentralPanel } from './MockCentralPanel';
import { PolymarketSimulation } from './PolymarketSimulation';
import type { Asset } from './central-data';
import { ProjectFlowPanel, ProjectLinksPanel, ProjectTopicPanel } from './ProjectFlowPanel';
import './CentralOverlayLayout.css';
import { useRecordNavigation } from './CentralRecordNavigation';
import { CentralConsultations } from './CentralConsultations';
import { SPEC, TAB_LABEL, edgeOf, isBiz, nodeOf, tabsFor, type Sel, type TabSpec } from './central-graph-model';

function Records({ mode, asset, onAction }: { mode: 'requests' | 'execution'; asset?: Asset; onAction: () => void }) {
  const { x } = useFmt(); const [jid, setJid] = useState<string | null>(null);
  return <div className="grid gap-3">
    {mode === 'requests' ? <RecordsSection views={['opportunities', 'decisions']} onJourney={setJid} onAction={onAction} initialAsset={asset}
      title={x('Pedidos recebidos, comparações e decisões', 'Received requests, comparisons and decisions', 'Pedidos recibidos, comparaciones y decisiones')}
       intro={x('Pedidos do núcleo interno Cripto e seus especialistas, comparados e encaminhados pela BETTEX.', 'Requests from the internal Crypto core and its specialists, compared and routed by BETTEX.', 'Pedidos del núcleo interno Cripto y sus especialistas, comparados y encaminados por BETTEX.')} />
      : <RecordsSection views={['orders', 'positions', 'closed']} onJourney={setJid} onAction={onAction}
        title={x('Registros de execução: ordens e posições', 'Execution records: orders and positions', 'Registros de ejecución: órdenes y posiciones')}
        intro={x('Ordens e posições são registros de execução, separados dos pedidos e decisões.', 'Orders and positions are execution records, separate from the requests and decisions.', 'Órdenes y posiciones son registros de ejecución, separados de los pedidos y decisiones.')} />}
    {jid && <Journey key={jid} id={jid} onClose={() => setJid(null)} />}
  </div>;
}

function Body({ navRequest, t, sel, onAction, onMarketSelect, onPick }: { navRequest?: string | null; t: TabSpec; sel: Sel; onAction: () => void; onMarketSelect: (id: string) => void; onPick: (s: Sel) => void }) {
  const id = t.id; const { x } = useFmt();
  switch (t.tab) {
    case 'consultations': return <CentralConsultations agentId={id ?? ''} />;
    case 'topic': return <ProjectTopicPanel id={id ?? ''} onPick={onPick} />;
    case 'flow': return <ProjectFlowPanel sel={sel.k === 'edge' ? sel : { k: 'node', id: id ?? sel.id }} />;
    case 'links': return <ProjectLinksPanel sel={sel} onPick={onPick} />;
    case 'overview': return <CentralBettex />;
    case 'agent': return <>{navRequest && id !== 'bettex' && <p className="rounded-xl border border-dashed border-[#34748A] p-3 text-xs" data-testid="monitoring-note">{x('Monitoramento entre propostas: as execuções abaixo não pertencem à proposta selecionada.', 'Monitoring across proposals: the runs below do not belong to the selected proposal.', 'Monitoreo entre propuestas: las ejecuciones siguientes no pertenecen a la propuesta seleccionada.')}</p>}{(id === 'predictions' || SPEC.includes(id as Asset)) && <PolymarketSimulation readOnly asset={SPEC.includes(id as Asset) ? id?.toUpperCase() as 'BTC' | 'ETH' | 'SOL' : undefined} />}<CentralAgents scope={id === 'bettex' ? 'orchestrator' : 'agents'} initialId={id} onAction={onAction} onMarketSelect={onMarketSelect} /></>;
    case 'control': return <><p className="rounded-xl border border-dashed border-[#34748A] p-3 text-xs" data-testid="monitoring-note">{x('Monitoramento geral do agente. Estas execuções não têm vínculo registrado com uma consulta ou proposta específica.', 'General agent monitoring. These runs have no recorded link to a specific consultation or proposal.', 'Monitoreo general del agente. Estas ejecuciones no tienen vínculo registrado con una consulta o propuesta específica.')}</p><CentralAgents scope="controls" initialId={id} onAction={onAction} /></>;
    case 'forecast': return <CentralForecast />;
    case 'capital': return <CentralCapital />;
    case 'markets': return <MockCentralPanel embedded onAction={onAction} />;
    case 'execution': return <Records mode="execution" onAction={onAction} />;
    default: return <Records mode="requests" asset={id && SPEC.includes(id as Asset) ? id as Asset : undefined} onAction={onAction} />;
  }
}

export function CentralInspector({ sel, onClose, onAction, headRef, onPick }: { sel: Sel; onClose: () => void; onAction: () => void; headRef: RefObject<HTMLHeadingElement | null>; onPick: (sel: Sel) => void }) {
  const { x } = useFmt(); const L = useL(); const navigation = useRecordNavigation();
  const requestId = navigation?.requestId;
  const tabs = tabsFor(sel); const consultTab = tabs.findIndex(t => t.tab === 'consultations');
  const contextTab = Math.max(0, consultTab >= 0 ? consultTab : tabs.findIndex(t => t.tab === 'requests'));
  const requestTab = navigation?.agentMonitoring ? Math.max(0, tabs.findIndex(t => t.tab === 'control' || t.tab === 'agent')) : contextTab;
  const [i, setI] = useState(() => requestId || navigation?.agentMonitoring ? requestTab : 0);
  useEffect(() => { if (requestId || navigation?.agentMonitoring) setI(requestTab); }, [requestId, requestTab, navigation?.agentMonitoring]);
  const t = tabs[Math.min(i, tabs.length - 1)];
  const e = sel.k === 'edge' ? edgeOf(sel.id) : undefined;
  const n = sel.k === 'node' ? nodeOf(sel.id) : undefined;
  if (!n && !e) return null;
  const title = n ? `${n.kind === 'spec' ? `${L(nodeOf('predictions').name)} · ` : ''}${L(n.name)}` : `${L(nodeOf(e!.a).name)} → ${L(nodeOf(e!.b).name)}`;
  const kind = n ? (isBiz(n.id) ? (n.kind === 'control' ? x('Regra de liquidação e recompra', 'Settlement and buyback rule', 'Regla de liquidación y recompra') : x('Negócio e comunidade', 'Business and community', 'Negocio y comunidad')) : n.kind === 'control' ? x('Subagente de apoio à BETTEX', 'BETTEX support subagent', 'Subagente de apoyo a BETTEX') : n.kind === 'hub' ? x('Registros', 'Records', 'Registros') : n.kind === 'spec' ? x('Mercado do agente Cripto', 'Crypto agent market', 'Mercado del agente Cripto') : n.kind === 'core' ? x('Inteligência central', 'Central intelligence', 'Inteligencia central') : x('Agente inteligente', 'Intelligent agent', 'Agente inteligente')) : e?.planned ? x('Conexão planejada, desativada', 'Planned connection, disabled', 'Conexión planificada, desactivada') : x('Conexão direcional', 'Directional connection', 'Conexión direccional');
  return <section className="cg-drawer" data-demo-local data-testid="graph-inspector" data-target={`${sel.k}:${sel.id}`}>
    <div className="cg-dhead"><div className="min-w-0"><DialogTitle asChild><h2 ref={headRef} tabIndex={-1} className="display text-lg font-extrabold" data-testid="inspector-title">{title}</h2></DialogTitle>
      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs"><Tag warn={n?.kind === 'control'}>{n?.kind === 'spec' ? x('Subagente de Cripto', 'Crypto subagent', 'Subagente de Cripto') : kind}</Tag></p></div>
      <button type="button" data-demo-local onClick={onClose} data-testid="button-inspector-close" aria-label={x('Fechar painel e voltar ao grafo', 'Close panel and return to the graph', 'Cerrar panel y volver al grafo')} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-[#E9EEE5]"><XIcon className="h-5 w-5" aria-hidden="true" /></button></div>
    {requestId && <div className="cg-inspector-context" data-testid="inspector-request-context">
      <span>{x('Proposta em foco', 'Proposal in focus', 'Propuesta en foco')}: <b>{requestId.replace('demo-req-', '').toUpperCase()}</b></span>
      <button type="button" className="pki-btn" data-demo-local onClick={() => navigation?.openReports(requestId, n?.kind === 'control' ? n.id : undefined)}>{x('Relatórios e percurso', 'Reports and journey', 'Informes y recorrido')}</button>
      <button type="button" className="pki-btn" data-demo-local onClick={() => navigation?.openRequest(requestId)}>{x('Proposta e decisão', 'Proposal and decision', 'Propuesta y decisión')}</button>
    </div>}
    {tabs.length > 1 && <div className="cg-tabs" role="tablist" aria-label={x('Seções do painel', 'Panel sections', 'Secciones del panel')}>{tabs.map((s, k) =>
      <button key={`${s.tab}-${s.id ?? ''}`} type="button" data-demo-local role="tab" id={`cg-tab-${k}`} aria-selected={k === i} aria-controls="cg-tabpanel" data-testid={`inspector-tab-${s.tab}`} onClick={() => setI(k)} className={k === i ? 'on' : ''}>{L(TAB_LABEL[s.tab])}</button>)}</div>}
    <div className="cg-dbody" role="tabpanel" id="cg-tabpanel" aria-labelledby={tabs.length > 1 ? `cg-tab-${i}` : undefined} aria-label={tabs.length === 1 ? title : undefined}><div className="cgo-stack"><Body navRequest={requestId} key={`${sel.k}-${sel.id}-${t.tab}-${t.id ?? ''}-${requestId ?? ''}`} t={t} sel={sel} onAction={onAction} onMarketSelect={id => onPick({ k: 'node', id })} onPick={onPick} /></div></div>
  </section>;
}
