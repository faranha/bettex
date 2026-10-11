/** @jsxImportSource react */
import { useState, type RefObject } from 'react';
import { X as XIcon } from 'lucide-react';
import { useFmt, Tag } from '../alpha-trading/format';
import { CentralAgents, useL } from './CentralAgents';
import { CentralBettex } from './CentralBettex';
import { CentralCapital, CentralForecast } from './CentralCapital';
import { RecordsSection, Journey } from './CentralRecords';
import { MockCentralPanel } from './MockCentralPanel';
import type { Asset } from './central-data';
import { EDGES, SPEC, TAB_LABEL, nodeOf, tabsFor, type Sel, type TabSpec } from './central-graph-model';

const act = 'min-h-11 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]';

function Records({ mode, asset, onAction }: { mode: 'requests' | 'execution'; asset?: Asset; onAction: () => void }) {
  const { x } = useFmt(); const [jid, setJid] = useState<string | null>(null);
  return <div className="grid gap-3">
    {mode === 'requests' ? <RecordsSection views={['opportunities', 'decisions']} onJourney={setJid} onAction={onAction} initialAsset={asset}
      title={x('Pedidos recebidos, comparações e decisões', 'Received requests, comparisons and decisions', 'Pedidos recibidos, comparaciones y decisiones')}
      intro={x('Pedidos do agente Cripto e seus especialistas, comparados e encaminhados pela BETTEX.', 'Requests from the Crypto agent and its specialists, compared and routed by BETTEX.', 'Pedidos del agente Cripto y sus especialistas, comparados y encaminados por BETTEX.')} />
      : <RecordsSection views={['orders', 'positions', 'closed']} onJourney={setJid} onAction={onAction}
        title={x('Registros de execução: ordens e posições', 'Execution records: orders and positions', 'Registros de ejecución: órdenes y posiciones')}
        intro={x('Ordens e posições são registros de execução, separados dos pedidos e decisões.', 'Orders and positions are execution records, separate from the requests and decisions.', 'Órdenes y posiciones son registros de ejecución, separados de los pedidos y decisiones.')} />}
    <div className="flex flex-wrap gap-2">{mode === 'requests' ? <>
      <button type="button" data-demo-action data-testid="button-submit-proposal" onClick={onAction} className="min-h-11 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white">{x('Enviar proposta', 'Submit proposal', 'Enviar propuesta')}</button>
      <button type="button" data-demo-action data-testid="button-run-decision" onClick={onAction} className={act}>{x('Registrar decisão', 'Register decision', 'Registrar decisión')}</button>
      <button type="button" data-demo-action data-testid="button-run-inference" onClick={onAction} className={act}>{x('Executar análise', 'Run inference', 'Ejecutar análisis')}</button></> : <>
      <button type="button" data-demo-action data-testid="button-place-order" onClick={onAction} className={act}>{x('Enviar ordem', 'Place order', 'Enviar orden')}</button>
      <button type="button" data-demo-action data-testid="button-cancel-order" onClick={onAction} className="min-h-11 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold">{x('Cancelar ordem', 'Cancel order', 'Cancelar orden')}</button></>}</div>
    {jid && <Journey key={jid} id={jid} onClose={() => setJid(null)} />}
  </div>;
}

function Body({ t, onAction, onMarketSelect }: { t: TabSpec; onAction: () => void; onMarketSelect: (id: string) => void }) {
  const id = t.id;
  switch (t.tab) {
    case 'overview': return <CentralBettex onAction={onAction} />;
    case 'agent': return <CentralAgents scope={id === 'bettex' ? 'orchestrator' : 'agents'} initialId={id} onAction={onAction} onMarketSelect={onMarketSelect} />;
    case 'control': return <CentralAgents scope="controls" initialId={id} onAction={onAction} />;
    case 'forecast': return <CentralForecast />;
    case 'capital': return <CentralCapital onAction={onAction} />;
    case 'markets': return <MockCentralPanel embedded onAction={onAction} />;
    case 'execution': return <Records mode="execution" onAction={onAction} />;
    default: return <Records mode="requests" asset={id && SPEC.includes(id as Asset) ? id as Asset : undefined} onAction={onAction} />;
  }
}

export function CentralInspector({ sel, onClose, onAction, headRef, onPick }: { sel: Sel; onClose: () => void; onAction: () => void; headRef: RefObject<HTMLHeadingElement | null>; onPick: (sel: Sel) => void }) {
  const { x } = useFmt(); const L = useL(); const [i, setI] = useState(0);
  const tabs = tabsFor(sel); const t = tabs[Math.min(i, tabs.length - 1)];
  const e = sel.k === 'edge' ? EDGES.find(q => q.id === sel.id) : undefined;
  const n = sel.k === 'node' ? nodeOf(sel.id) : undefined;
  const title = n ? `${n.kind === 'spec' ? `${L(nodeOf('predictions').name)} · ` : ''}${L(n.name)}` : `${L(nodeOf(e!.a).name)} → ${L(nodeOf(e!.b).name)}`;
  const kind = n ? (n.kind === 'control' ? x('Controle operacional, não é agente', 'Operational control, not an agent', 'Control operativo, no es agente') : n.kind === 'hub' ? x('Registros de amostra', 'Sample records', 'Registros de muestra') : n.kind === 'spec' ? x('Mercado do agente Cripto', 'Crypto agent market', 'Mercado del agente Cripto') : n.kind === 'core' ? x('Inteligência central', 'Central intelligence', 'Inteligencia central') : x('Agente inteligente', 'Intelligent agent', 'Agente inteligente')) : x('Conexão', 'Connection', 'Conexión');
  return <aside className="cg-drawer" role="dialog" aria-modal="false" aria-labelledby="cg-insp-title" data-testid="graph-inspector" data-target={`${sel.k}:${sel.id}`}>
    <div className="cg-dhead"><div className="min-w-0"><h2 id="cg-insp-title" ref={headRef} tabIndex={-1} className="display truncate text-lg font-extrabold" data-testid="inspector-title">{title}</h2>
      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs"><Tag warn={n?.kind === 'control'}>{kind}</Tag><Tag warn>{x('Amostra ilustrativa', 'Illustrative sample', 'Muestra ilustrativa')}</Tag></p></div>
      <button type="button" onClick={onClose} data-testid="button-inspector-close" aria-label={x('Fechar painel e voltar ao grafo', 'Close panel and return to the graph', 'Cerrar panel y volver al grafo')} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-[#E9EEE5]"><XIcon className="h-5 w-5" aria-hidden="true" /></button></div>
    {tabs.length > 1 && <div className="cg-tabs" role="tablist" aria-label={x('Seções do painel', 'Panel sections', 'Secciones del panel')}>{tabs.map((s, k) =>
      <button key={`${s.tab}-${s.id ?? ''}`} type="button" role="tab" id={`cg-tab-${k}`} aria-selected={k === i} aria-controls="cg-tabpanel" data-testid={`inspector-tab-${s.tab}`} onClick={() => setI(k)} className={k === i ? 'on' : ''}>{L(TAB_LABEL[s.tab])}</button>)}</div>}
    <div className="cg-dbody" role="tabpanel" id="cg-tabpanel" aria-labelledby={tabs.length > 1 ? `cg-tab-${i}` : 'cg-insp-title'}><Body key={`${sel.k}-${sel.id}-${t.tab}-${t.id ?? ''}`} t={t} onAction={onAction} onMarketSelect={id => onPick({ k: 'node', id })} /></div>
  </aside>;
}
