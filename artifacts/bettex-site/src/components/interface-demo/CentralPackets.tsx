/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'wouter';
import { ArrowRight, ChevronDown, ChevronUp, X as XIcon } from 'lucide-react';
import { demoPath } from '../demo/demo-navigation';
import { dec6, useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { DECISIONS, ORDERS, POSITIONS, REQUESTS, STATE } from './central-data';
import { GRAPH_EDGES, nodeOf } from './central-graph-model';
import { PACKETS, packetById, packetConversation, packetProgress, type GraphPacket } from './central-packets';
import { bez, ctrlOf, projectPoint, type Cam, type Scene } from './scene3d';
import './central-packets.css';
import { useRecordNavigation } from './CentralRecordNavigation';

const packetType = (p: GraphPacket): GraphPacket['title'] => p.exchange === 'query'
  ? ['Consulta', 'Consultation', 'Consulta']
  : p.exchange === 'opinion' ? ['Parecer', 'Opinion', 'Dictamen']
  : p.kind === 'analysis' ? ['Análise', 'Analysis', 'Análisis'] : ['Decisão', 'Decision', 'Decisión'];

/** Imperative per-frame placement on the projected Bezier of the packet's own edge. Reverse t when travelling b -> a. */
export function placePackets(els: Record<string, HTMLElement | null>, sc: Scene, cam: Cam, w: number, h: number, elapsed: number, reduced: boolean) {
  for (const p of PACKETS) {
    const el = els[p.id]; const se = sc.edges.find(q => q.e.id === p.edgeId); const e = GRAPH_EDGES.find(q => q.id === p.edgeId);
    if (!el || !se || !e) continue;
    const a = sc.centers[e.a], b = sc.centers[e.b], c = ctrlOf(a, b, se.lift);
    const rev = p.source !== e.a; const t = packetProgress(p, elapsed, reduced); const tt = rev ? 1 - t : t;
    const q = projectPoint(bez(a, c, b, tt), cam, w, h); const x0 = q.x, y0 = q.y;
    // In-flight packets only: endpoint piles would obscure nodes and steal their clicks.
    // Reduced motion keeps one accessible packet per edge/direction instead of overlapping every replay.
    const available = reduced
      ? PACKETS.find(other => other.edgeId === p.edgeId && other.kind === p.kind)?.id === p.id
      : t > 0.04 && t < 0.96;
    el.hidden = !available || q.x < 22 || q.x > w - 22 || q.y < 22 || q.y > h - 22;
    const t2 = Math.min(1, Math.max(0, tt + (rev ? -0.02 : 0.02))); const t1 = Math.min(1, Math.max(0, tt - (rev ? -0.02 : 0.02)));
    const q2 = projectPoint(bez(a, c, b, t2), cam, w, h); const x2 = q2.x, y2 = q2.y;
    const q1 = projectPoint(bez(a, c, b, t1), cam, w, h);
    const ang = Math.atan2(y2 - q1.y, x2 - q1.x) * 180 / Math.PI;
    const off = p.kind === 'decision' ? 16 : -16;
    el.style.transform = `translate3d(${x0.toFixed(1)}px,${(y0 + off).toFixed(1)}px,0)`; el.style.setProperty('--ang', `${ang.toFixed(0)}deg`);
  }
}

export function PacketButtons({ els, selectedId, onPick, onHold }: { els: React.MutableRefObject<Record<string, HTMLElement | null>>; selectedId: string | null; onPick: (id: string) => void; onHold: (v: boolean) => void }) {
  const L = useL(); const nm = (id: string) => L(nodeOf(id).name);
  return <>{PACKETS.map(p => <button key={p.id} type="button" data-demo-local ref={el => { els.current[p.id] = el; }} data-testid={`graph-packet-${p.id}`} aria-pressed={selectedId === p.id}
    className={`cg-packet ${p.kind} ${selectedId === p.id ? 'on' : ''}`} aria-label={`${L(packetType(p))}: ${nm(p.source)} → ${nm(p.target)}. ${L(p.title)}`}
    onClick={() => onPick(p.id)} onPointerEnter={() => onHold(true)} onPointerLeave={e => onHold(e.currentTarget.matches(':focus-visible'))} onFocus={() => onHold(true)} onBlur={e => onHold(e.currentTarget.matches(':hover'))}>
    <span className="pk-hit"><span className="pk-chip"><ArrowRight aria-hidden="true" /></span></span>
    <span className="pk-tag">{nm(p.source)} → {nm(p.target)}</span></button>)}</>;
}

export function PacketInspector({ packetId, onClose }: { packetId: string | null; onClose: () => void }) {
  const navigation = useRecordNavigation();
  const f = useFmt(); const { x, loc } = f; const L = useL(); const [more, setMore] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => { setMore(false); }, [packetId]);
  const p = packetId ? packetById(packetId) : undefined; const nm = (id: string) => L(nodeOf(id).name);
  const quantity = (units: string) => dec6(units, loc === 'pt' ? 'pt-BR' : loc === 'es' ? 'es-ES' : 'en-US');
  const money = (units: string) => `${quantity(units)} USDC`;
  const st = (s: string) => (STATE[s] ? L(STATE[s]) : s);
  const val = (v: GraphPacket['payload'][number]['value']) => typeof v === 'string' ? v : L(v);
  const conv = p ? packetConversation(p) : [];
  const req = p ? REQUESTS.find(r => r.id === p.requestId) : undefined;
  const decs = p ? DECISIONS.filter(d => d.requestId === p.requestId) : [];
  const ords = p ? ORDERS.filter(o => o.requestId === p.requestId) : [];
  const poss = p ? POSITIONS.filter(o => o.requestId === p.requestId) : [];
  return <Dialog.Root open={!!p} onOpenChange={o => { if (!o) { setMore(false); onClose(); } }}>
    <Dialog.Portal><Dialog.Overlay className="cg-backdrop" data-testid="packet-backdrop" />
      <Dialog.Content className="cg-packet-inspector" data-demo-local data-testid="packet-inspector" data-request-id={p?.requestId} aria-describedby={undefined}
        onOpenAutoFocus={() => { trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
        onCloseAutoFocus={event => { if (trigger.current?.isConnected) { event.preventDefault(); trigger.current.focus({ preventScroll: true }); } }}>
        {p && <>
          <div className="pki-head"><div><Dialog.Title asChild><h2>{L(p.title)}</h2></Dialog.Title>
            <p className="pki-route">{nm(p.source)} → {nm(p.target)} · {f.date(p.at)}</p></div>
            <Dialog.Close className="pki-x" aria-label={x('Fechar', 'Close', 'Cerrar')} data-testid="button-packet-close"><XIcon aria-hidden="true" width={18} height={18} /></Dialog.Close></div>
          <p className="pki-sum">{L(p.summary)}</p>
          <dl className="pki-kv"><div><dt>{x('Proposta relacionada', 'Related proposal', 'Propuesta relacionada')}</dt><dd className="font-mono">{p.requestId}</dd></div>
            {p.decisionId && <div><dt>{x('Decisão', 'Decision', 'Decisión')}</dt><dd className="font-mono">{p.decisionId}</dd></div>}
            {p.payload.filter(row => row.value !== p.requestId && row.value !== p.decisionId && row.value !== p.summary)
              .map((r, i) => <div key={i}><dt>{L(r.label)}</dt><dd>{val(r.value)}</dd></div>)}</dl>
          <div className="pki-acts">
            {navigation && <button type="button" className="pki-btn" data-testid="button-packet-request" onClick={() => navigation.openRequest(p.requestId)}>
              {x('Abrir proposta completa', 'Open full proposal', 'Abrir propuesta completa')}
            </button>}
            <button type="button" className="pki-btn" aria-expanded={more} data-testid="button-packet-expand" onClick={() => setMore(v => !v)}>{more ? <ChevronUp aria-hidden="true" width={16} height={16} /> : <ChevronDown aria-hidden="true" width={16} height={16} />}{more ? x('Recolher histórico', 'Collapse history', 'Contraer historial') : x('Expandir histórico', 'Expand history', 'Expandir historial')}</button>
            <Link data-demo-local data-testid="link-packet-journey" className="pki-btn" href={`${demoPath('wallet', loc)}?history=audit&correlationId=${encodeURIComponent(p.requestId)}`}>{x('Ver percurso no Histórico', 'View journey in History', 'Ver recorrido en el Historial')}</Link></div>
          {more && <div data-testid="packet-history">
            <ol className="pki-hist" aria-label={x('Troca correlacionada', 'Correlated exchange', 'Intercambio correlacionado')}>{conv.map(c => <li key={c.id} className={c.id === p.id ? 'cur' : ''}>
              <time>{f.date(c.at)}</time> <span className="mono">{L(packetType(c))}</span>
              <p><b>{nm(c.source)} → {nm(c.target)}</b> · {L(c.title)}</p><p>{L(c.summary)}</p></li>)}</ol>
            {req && <div className="pki-rec"><h3>{x('Proposta de origem', 'Source proposal', 'Propuesta de origen')}</h3><p className="font-mono">{req.id}</p><p>{L(req.market)} · {st(req.state)}</p><p>{L(req.reason)}</p>
              <dl className="pki-kv">
                <div><dt>{x('Capital', 'Capital', 'Capital')}</dt><dd>{money(req.capital)}</dd></div>
                <div><dt>{x('Custos estimados', 'Estimated costs', 'Costos estimados')}</dt><dd>{money(req.costs)}</dd></div>
                <div><dt>{x('Retorno estimado', 'Estimated return', 'Retorno estimado')}</dt><dd>{money(req.ret)}</dd></div>
                <div><dt>{x('Perda potencial', 'Potential loss', 'Pérdida potencial')}</dt><dd>{money(req.loss)}</dd></div>
                <div><dt>{x('Válida até', 'Valid until', 'Válida hasta')}</dt><dd>{f.date(req.validUntil)}</dd></div>
              </dl>
              {req.sources.map(source => <p key={source.ref} className="pki-source"><b>{source.name}</b> · {f.date(source.at)} · <span className="font-mono">{source.ref}</span></p>)}
            </div>}
            {decs.length > 0 && <div className="pki-rec"><h3>{x('Decisão correspondente', 'Matching decision', 'Decisión correspondiente')}</h3>{decs.map(d => <p key={d.id}><span className="font-mono">{d.id}</span> · {st(d.state)} · {L(d.reason)} · {f.date(d.at)}</p>)}</div>}
            {ords.length > 0 && <div className="pki-rec"><h3>{x('Ordens relacionadas', 'Related orders', 'Órdenes relacionadas')}</h3>{ords.map(o => <div key={o.id}>
              <p><span className="font-mono">{o.id}</span> · {st(o.state)} · {st(o.direction)}</p><p>{L(o.reason)}</p>
              <dl className="pki-kv">
                <div><dt>{x('Quantidade', 'Quantity', 'Cantidad')}</dt><dd>{quantity(o.qty)}</dd></div>
                <div><dt>{x('Executado', 'Filled', 'Ejecutado')}</dt><dd>{quantity(o.filled)}</dd></div>
                <div><dt>{x('Reservado', 'Reserved', 'Reservado')}</dt><dd>{money(o.reserved)}</dd></div>
              </dl>
              {o.fills.map(fill => <p key={fill.id} className="pki-source"><span className="font-mono">{fill.id}</span> · {f.date(fill.at)} · {money(fill.cash)} · {x('Custos', 'Costs', 'Costos')}: {money(fill.fees)}</p>)}
            </div>)}</div>}
            {poss.length > 0 && <div className="pki-rec"><h3>{x('Posições relacionadas', 'Related positions', 'Posiciones relacionadas')}</h3>{poss.map(position => <div key={position.id}>
              <p><span className="font-mono">{position.id}</span> · {st(position.state)} · {f.date(position.at)}</p>
              <dl className="pki-kv">
                <div><dt>{x('Quantidade', 'Quantity', 'Cantidad')}</dt><dd>{quantity(position.qty)}</dd></div>
                <div><dt>{x('Custo de entrada', 'Entry cost', 'Costo de entrada')}</dt><dd>{money(position.cost)}</dd></div>
                <div><dt>{x('Custos', 'Costs', 'Costos')}</dt><dd>{money(position.fees)}</dd></div>
                <div><dt>{x('Valor de saída', 'Exit value', 'Valor de salida')}</dt><dd>{position.exitValue == null ? x('Indisponível', 'Unavailable', 'No disponible') : money(position.exitValue)}</dd></div>
              </dl>
            </div>)}</div>}
          </div>}
        </>}
      </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
