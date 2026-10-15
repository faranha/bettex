/** @jsxImportSource react */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useFmt } from '../alpha-trading/format';
import { CentralInspector } from './CentralInspector';
import { PacketInspector } from './CentralPackets';
import { packetById } from './central-packets';
import { REQUESTS } from './central-data';
import { CentralRecordNavigation } from './CentralRecordNavigation';
import { CentralScene } from './CentralScene';
import { SceneTitle, TelemetryStrip, TopRail } from './CentralHud';
import { SupportNav, GROUPS } from './CentralSupport';
import { CentralSupportReports } from './CentralSupportReports';
import { isGraphSelection, parseSel, rememberSel, selQuery, tabsFor, type Sel } from './central-graph-model';
import './central-graph.css';

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;
function useMedia(q: string) {
  const [m, setM] = useState(() => mq(q));
  useEffect(() => { const l = window.matchMedia(q); const h = () => setM(l.matches); h(); l.addEventListener('change', h); return () => l.removeEventListener('change', h); }, [q]);
  return m;
}
const same = (a: Sel | null, b: Sel | null) => a?.k === b?.k && a?.id === b?.id;
const SECTIONS = ['agents', ...GROUPS.map(g => g.key)];
const sectionOf = (search: string, sel: Sel | null) => {
  const q = new URLSearchParams(search).get('section');
  if (q && SECTIONS.includes(q)) return q;
  if (sel && !isGraphSelection(sel)) { const g = GROUPS.find(g => g.ids.includes(sel.id)); if (g) return g.key; }
  return 'agents';
};
const validRequest = (id: string | null) => id && REQUESTS.some(r => r.id === id) ? id : null;
const urlFor = (sel: Sel | null, section?: string, packet?: string | null, request?: string | null) => {
  const q = new URLSearchParams(window.location.search); q.delete('node'); q.delete('edge');
  if (packet !== undefined) { q.delete('packet'); if (packet) q.set('packet', packet); }
  if (request !== undefined) { q.delete('request'); if (request) q.set('request', request); }
  if (section) q.set('section', section);
  if (sel) q.set(sel.k, sel.id);
  const s = q.toString(); return `${window.location.pathname}${s ? `?${s}` : ''}${window.location.hash}`;
};

/** Agent constellation, modal inspector and telemetry strip. Public quotes are read-only; financial examples are local.
 *  Selection lives in the URL (?node= or ?edge=), so deep links, back/forward and language switches keep it. */
export function CentralGraph({ onAction }: { onAction: () => void }) {
  const { x } = useFmt();
  const narrow = useMedia('(max-width: 768px)'); const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const [sel, setSel] = useState<Sel | null>(() => (typeof window === 'undefined' ? null : parseSel(window.location.search)));
  const [section, setSection] = useState(() => typeof window === 'undefined' ? 'agents' : sectionOf(window.location.search, parseSel(window.location.search)));
  const secRef = useRef(section); secRef.current = section;
  const explicit = useRef(typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('section'));
  const secUrl = () => explicit.current ? secRef.current : undefined;
  const [imm, setImm] = useState(false);
  const [packetId, setPacketId] = useState<string | null>(() => { if (typeof window === 'undefined') return null; const v = new URLSearchParams(window.location.search).get('packet'); return v && packetById(v) ? v : null; });
  const packetRef = useRef(packetId); packetRef.current = packetId;
  const [requestId, setRequestId] = useState<string | null>(() => typeof window === 'undefined' ? null : validRequest(new URLSearchParams(window.location.search).get('request')));
  const requestRef = useRef(requestId); requestRef.current = requestId;
  const choosePacket = (id: string | null, fromRecord = false) => {
    if (id && !packetById(id)) return;
    if (id && fromRecord) { const rid = packetById(id)!.requestId; requestRef.current = rid; setRequestId(rid); }
    packetRef.current = id; setPacketId(id);
    const next = urlFor(selRef.current, secUrl(), id, requestRef.current);
    if (id) window.history.pushState(window.history.state, '', next);
    else window.history.replaceState(window.history.state, '', next);
  };
  const head = useRef<HTMLHeadingElement>(null); const back = useRef<HTMLElement | null>(null);
  const gsel = sel && isGraphSelection(sel) ? sel : null; const ssel = sel && !gsel ? sel : null;
  const selRef = useRef(sel); selRef.current = sel;
  const home = useRef(typeof window === 'undefined' ? '' : window.location.pathname);
  const openRequest = (id: string) => {
    if (!validRequest(id)) return;
    const nextSel: Sel = selRef.current && tabsFor(selRef.current).some(t => t.tab === 'requests') ? selRef.current : { k: 'node', id: 'predictions' };
    requestRef.current = id; setRequestId(id);
    packetRef.current = null; setPacketId(null);
    selRef.current = nextSel; setSel(nextSel); rememberSel(nextSel);
    window.history.pushState(window.history.state, '', urlFor(nextSel, secUrl(), null, id));
  };
  const clearRequest = () => {
    requestRef.current = null; setRequestId(null);
    window.history.replaceState(window.history.state, '', urlFor(selRef.current, secUrl(), undefined, null));
  };

  const commit = useCallback((s: Sel | null) => {
    if (s && !parseSel(`?${selQuery(s)}`)) return;
    if (same(selRef.current, s)) return;
    requestRef.current = null; setRequestId(null);
    selRef.current = s; setSel(s); rememberSel(s);
    const next = urlFor(s, secUrl(), undefined, null);
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.pushState(window.history.state, '', next);
  }, []);
  const pick = (s: Sel) => { const a = document.activeElement; if (!back.current || !back.current.isConnected || !selRef.current) back.current = a instanceof HTMLElement ? a : null; commit(s); };
  const close = () => commit(null);
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    const b = back.current; back.current = null;
    if (b?.isConnected) b.focus({ preventScroll: true });
  };

  useEffect(() => { rememberSel(selRef.current); }, []);
  useEffect(() => {
    const sync = (ev: Event) => {
      if (window.location.pathname !== home.current) return;
      const p = parseSel(window.location.search);
      const rawPacket = new URLSearchParams(window.location.search).get('packet');
      const nextPacket = rawPacket && packetById(rawPacket) ? rawPacket : null;
      const rawRequest = new URLSearchParams(window.location.search).get('request');
      const nextRequest = validRequest(rawRequest);
      if (ev.type === 'popstate') {
        requestRef.current = nextRequest; setRequestId(nextRequest);
        packetRef.current = nextPacket; setPacketId(nextPacket);
        selRef.current = p; setSel(p); rememberSel(p);
        const sc = sectionOf(window.location.search, p); explicit.current = new URLSearchParams(window.location.search).has('section'); secRef.current = sc; setSection(sc); return;
      }
      if (nextPacket && nextPacket !== packetRef.current) { packetRef.current = nextPacket; setPacketId(nextPacket); }
      if (nextRequest && nextRequest !== requestRef.current) { requestRef.current = nextRequest; setRequestId(nextRequest); }
      if (requestRef.current && !rawRequest) {
        window.history.replaceState(window.history.state, '', urlFor(p ?? selRef.current, secUrl(), undefined, requestRef.current));
      }
      if (packetRef.current && !rawPacket) {
        const fix = urlFor(p ?? selRef.current, secUrl(), packetRef.current);
        window.history.replaceState(window.history.state, '', fix);
      }
      if (p) { if (!same(selRef.current, p)) { selRef.current = p; setSel(p); rememberSel(p); } return; }
      // A language switch or route helper rewrote the URL without our parameter: keep the reading position.
      if (selRef.current || explicit.current) {
        const fix = urlFor(selRef.current, secUrl());
        if (fix !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(window.history.state, '', fix);
      }
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
  return <CentralRecordNavigation.Provider value={{ requestId, openRequest, openPacket: id => choosePacket(id, true), clearRequest }}>
    <div className="cg-wrap" id="central-panel">
    <div className={`cg-stage ${imm && !sel && !packetId ? "cg-imm" : ""}`} data-testid="central-graph" onKeyDown={e => { if (e.key === 'Escape' && imm) setImm(false); }}
      aria-label={x('Central da IA BETTEX: cena interativa de agentes', 'BETTEX AI Center: interactive agent scene', 'Central de IA BETTEX: escena interactiva de agentes')}>
      <TopRail sel={gsel} onPick={pick} />
      <SceneTitle sel={gsel} />
      <div className="cg-main">
        <CentralScene narrow={narrow} reduced={reduced} sel={gsel} onSelect={pick} packetId={packetId} onPacket={choosePacket} immersive={imm} onImmersive={() => setImm(v => !v)} />
      </div>
    </div>
    <section className="cg-support" data-testid="central-support" aria-label={x('Apoio fora do grafo: controles, registros, capital e tópicos', 'Support outside the graph: controls, records, capital and topics', 'Apoyo fuera del grafo: controles, registros, capital y temas')}>
      {cat >= 0 && <SupportNav sel={ssel} onPick={pick} cat={cat} />}
      <TelemetryStrip onPick={pick} />
    </section>
    <CentralSupportReports onSelect={id => pick({ k: 'node', id })} />
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
