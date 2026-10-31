/** @jsxImportSource react */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useFmt } from '../alpha-trading/format';
import { CentralInspector } from './CentralInspector';
import { PacketInspector } from './CentralPackets';
import { REQUESTS } from './central-data';
import { CentralRecordNavigation } from './CentralRecordNavigation';
import { CentralScene } from './CentralScene';
import { SceneTitle, TelemetryStrip, TopRail } from './CentralHud';
import { SupportNav, GROUPS } from './CentralSupport';
import { CentralSupportReports } from './CentralSupportReports';
import { isGraphSelection, parseSel, rememberSel, type Sel } from './central-graph-model';
import { readCentralView, writeCentralView, transitionCentralView, type CentralAction, type CentralView } from './central-view';
import './central-graph.css';

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;
function useMedia(q: string) {
  const [m, setM] = useState(() => mq(q));
  useEffect(() => { const l = window.matchMedia(q); const h = () => setM(l.matches); h(); l.addEventListener('change', h); return () => l.removeEventListener('change', h); }, [q]);
  return m;
}
const SECTIONS = ['agents', ...GROUPS.map(g => g.key)];
const sectionOf = (search: string, sel: Sel | null) => {
  const q = new URLSearchParams(search).get('section');
  if (q && SECTIONS.includes(q)) return q;
  if (sel && !isGraphSelection(sel)) { const g = GROUPS.find(g => g.ids.includes(sel.id)); if (g) return g.key; }
  return 'agents';
};

/** Agent constellation, modal inspector and telemetry strip. Public quotes are read-only; financial examples are local.
 *  Selection lives in the URL (?node= or ?edge=), so deep links, back/forward and language switches keep it. */
export function CentralGraph({ onAction }: { onAction: () => void }) {
  const { x } = useFmt();
  const narrow = useMedia('(max-width: 768px)'); const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const [view, setView] = useState<CentralView>(() => readCentralView(typeof window === 'undefined' ? '' : window.location.search));
  const viewRef = useRef(view); viewRef.current = view;
  const { selection: sel, packetId, requestId, reportsOpen, reportAgentId, agentMonitoring } = view;
  const [section, setSection] = useState(() => typeof window === 'undefined' ? 'agents' : sectionOf(window.location.search, parseSel(window.location.search)));
  const secRef = useRef(section); secRef.current = section;
  const explicit = useRef(typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('section'));
  const [imm, setImm] = useState(false);
  const head = useRef<HTMLHeadingElement>(null); const back = useRef<HTMLElement | null>(null);
  const gsel = sel && isGraphSelection(sel) ? sel : null; const ssel = sel && !gsel ? sel : null;
  const home = useRef(typeof window === 'undefined' ? '' : window.location.pathname);
  const navigate = useCallback((action: CentralAction, replace = false) => {
    const current = viewRef.current;
    const next = transitionCentralView(current, action);
    if (next === current) return;
    const active = document.activeElement;
    if (!current.selection && !current.packetId && !current.reportsOpen && active instanceof HTMLElement) back.current = active;
    viewRef.current = next; setView(next); rememberSel(next.selection);
    const q = new URLSearchParams(writeCentralView(window.location.search, next));
    if (explicit.current) q.set('section', secRef.current);
    const search = q.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    if (replace) window.history.replaceState(window.history.state, '', url);
    else window.history.pushState(window.history.state, '', url);
  }, []);
  const choosePacket = (id: string | null) => navigate(id ? { type: 'packet', id } : { type: 'close' });
  const openRequest = (id: string) => navigate({ type: 'request', id });
  const openReports = (rid?: string | null, aid?: string | null) => navigate({ type: 'reports', requestId: rid, agentId: aid });
  const pick = (s: Sel) => navigate({ type: 'selection', selection: s });
  const close = () => navigate({ type: 'close' });
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    const current = viewRef.current;
    if (current.selection || current.packetId || current.reportsOpen) return;
    const b = back.current; back.current = null;
    if (b?.isConnected) b.focus({ preventScroll: true });
  };

  useEffect(() => { rememberSel(viewRef.current.selection); }, []);
  useEffect(() => {
    const sync = (ev: Event) => {
      if (window.location.pathname !== home.current) return;
      const q = new URLSearchParams(window.location.search);
      const hasContext = ['node', 'edge', 'packet', 'request', 'view'].some(key => q.has(key));
      // Browser back is authoritative; language helpers may omit all reading parameters.
      if (ev.type !== 'popstate' && !hasContext) {
        const current = viewRef.current;
        if (current.selection || current.packetId || current.requestId || current.reportsOpen) {
          const fixed = writeCentralView(window.location.search, current);
          window.history.replaceState(window.history.state, '', `${window.location.pathname}${fixed ? `?${fixed}` : ''}${window.location.hash}`);
        }
        return;
      }
      const next = readCentralView(window.location.search);
      viewRef.current = next; setView(next); rememberSel(next.selection);
      const sc = sectionOf(window.location.search, next.selection);
      explicit.current = q.has('section'); secRef.current = sc; setSection(sc);
    };
    const types = ['popstate', 'pushState', 'replaceState'];
    types.forEach(t => window.addEventListener(t, sync));
    return () => types.forEach(t => window.removeEventListener(t, sync));
  }, []);
  useEffect(() => {
    if (!sel) return;
    head.current?.focus({ preventScroll: true });
  }, [sel?.k, sel?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const cat = GROUPS.findIndex(g => g.key === section);
  const activeRequest = REQUESTS.find(r => r.id === requestId);
  return <CentralRecordNavigation.Provider value={{ requestId, reportAgentId, agentMonitoring, openRequest, openPacket: id => choosePacket(id), openReports,
    openAgent: id => navigate({ type: 'agent', id }), selectRequest: id => navigate({ type: 'selectRequest', id }),
    selectReportAgent: id => navigate({ type: 'selectAgent', id }), clearRequest: () => navigate({ type: 'clearRequest' }) }}>
    <div className="cg-wrap" id="central-panel">
    <div className={`cg-stage ${imm && !sel && !packetId && !reportsOpen ? "cg-imm" : ""}`} data-testid="central-graph" onKeyDown={e => { if (e.key === 'Escape' && imm) setImm(false); }}
      aria-label={x('Central da IA BETTEX: cena interativa de agentes', 'BETTEX AI Center: interactive agent scene', 'Central de IA BETTEX: escena interactiva de agentes')}>
      <TopRail sel={gsel} onPick={pick} />
      <SceneTitle sel={gsel} />
      <Dialog.Root open={reportsOpen} onOpenChange={open => { if (open) openReports(); else close(); }}>
        {activeRequest && <div className="cg-report-tools">
          <div className="cg-active-context" data-testid="graph-request-context"><span>{x('Proposta em foco', 'Proposal in focus', 'Propuesta en foco')}: <b>{activeRequest.id.replace('demo-req-', '').toUpperCase()}</b></span>
            <button type="button" data-demo-local onClick={() => navigate({ type: 'clearRequest' })}>{x('Limpar foco', 'Clear focus', 'Quitar foco')}</button></div>
        </div>}
        <Dialog.Portal>
          <Dialog.Overlay className="cg-backdrop" />
          <Dialog.Content className="cg-reports-panel" data-demo-local data-testid="graph-reports-panel" aria-describedby={undefined}
            onCloseAutoFocus={restoreFocus}>
            <div className="cg-reports-head">
              <Dialog.Title>{x('Relatórios', 'Reports', 'Informes')}</Dialog.Title>
              <Dialog.Close className="cg-reports-close" aria-label={x('Fechar relatórios', 'Close reports', 'Cerrar informes')} data-testid="button-close-graph-reports"><X size={20} aria-hidden="true" /></Dialog.Close>
            </div>
            <div className="cg-reports-body"><CentralSupportReports onSelect={id => navigate({ type: 'agent', id })} /></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="cg-main">
        <CentralScene narrow={narrow} reduced={reduced} sel={gsel} onSelect={pick} packetId={packetId} onPacket={choosePacket} immersive={imm} onImmersive={() => setImm(v => !v)} />
      </div>
    </div>
    <section className="cg-support" data-testid="central-support" aria-label={x('Apoio fora do grafo: controles, registros, capital e tópicos', 'Support outside the graph: controls, records, capital and topics', 'Apoyo fuera del grafo: controles, registros, capital y temas')}>
      {cat >= 0 && <SupportNav sel={ssel} onPick={pick} cat={cat} />}
      <TelemetryStrip onPick={pick} />
    </section>
    <PacketInspector packetId={packetId} onClose={() => choosePacket(null)} />
    <Dialog.Root open={!!sel && !packetId} onOpenChange={open => { if (!open) close(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="cg-backdrop" data-testid="central-modal-backdrop" />
        <Dialog.Content className="cg-modal" data-demo-local data-testid="central-modal" aria-modal="true" aria-describedby={undefined}
          onOpenAutoFocus={event => { event.preventDefault(); head.current?.focus({ preventScroll: true }); }}
          onCloseAutoFocus={restoreFocus}>
          {sel && <CentralInspector key={`${sel.k}:${sel.id}`} sel={sel} onClose={close} onAction={onAction} headRef={head} onPick={pick} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div></CentralRecordNavigation.Provider>;
}
