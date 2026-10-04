/** @jsxImportSource react */
import { useState, type Dispatch, type ReactNode } from 'react';
import type { AgentId, DemoAction, DemoState, Operation, Status } from './types';
import { AGENTS, Btn, Panel, STATUS, STATUS_COLOR, useX } from './ui';
import { AgentView, OperationDetail, isActive, useSelection } from './Operations';
import { Chat } from './Chat';

const UW = 34, UH = 19, UZ = 26, CX = 500, CY = 70;
type Pt = [number, number];
const P = (gx: number, gy: number, z = 0): Pt => [CX + (gx - gy) * UW, CY + (gx + gy) * UH - z * UZ];
const poly = (...a: Pt[]) => a.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const SECTORS: { id: AgentId; gx: number; gy: number }[] = [{ id: 'predictions', gx: 5, gy: 0 }, { id: 'sports', gx: 0, gy: 5 }, { id: 'crypto', gx: 10, gy: 5 }, { id: 'bonus', gx: 5, gy: 10 }];

function Box({ x, y, w, d, h, z = 0, top, left, right, stroke }: { x: number; y: number; w: number; d: number; h: number; z?: number; top: string; left: string; right: string; stroke?: string }): ReactNode {
  const H = z + h;
  return <g stroke={stroke ?? 'rgba(95,134,255,.25)'} strokeWidth=".8" strokeLinejoin="round">
    <polygon points={poly(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, H), P(x, y + d, H))} fill={left} />
    <polygon points={poly(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, H), P(x + w, y, H))} fill={right} />
    <polygon points={poly(P(x, y, H), P(x + w, y, H), P(x + w, y + d, H), P(x, y + d, H))} fill={top} />
  </g>;
}
function robotPos(s: { gx: number; gy: number }, k: number, st: Status | null): Pt {
  const cx = s.gx + 2, cy = s.gy + 2;
  const idle: Pt = [s.gx + 1.2 + k * 1.8, s.gy + 3.5], desk: Pt = [s.gx + 1.2 + k * 1.8, s.gy + 1.9];
  const hub: Pt = [cx + (7 - cx) * 0.6 + k * 0.5, cy + (7 - cy) * 0.6];
  const mid: Pt = [(hub[0] + desk[0]) / 2, (hub[1] + desk[1]) / 2];
  if (st === 'proposed' || st === 'analyzing') return hub;
  if (st === 'authorized') return mid;
  if (st === 'open' || st === 'partial' || st === 'uncertain') return desk;
  return idle;
}

export function Live({ state, dispatch }: { state: DemoState; dispatch: Dispatch<DemoAction> }) {
  const { x, tx, n } = useX();
  const sel = useSelection(state);
  const [zoom, setZoom] = useState(false);
  const mid = P(7, 7, 0.2);
  const robots = SECTORS.flatMap(s => [0, 1].map(k => {
    const op: Operation | undefined = state.operations.filter(o => o.agent === s.id)[k];
    const gp = robotPos(s, k, op ? op.status : null); const sp = P(gp[0], gp[1], 0.5);
    return { s, k, op, sp };
  })).sort((a, b) => a.sp[1] - b.sp[1]);
  const pick = (id: AgentId, op?: Operation) => { sel.setAgent(id); if (op) sel.setOpId(op.id); };
  return <div className="flex flex-col gap-4">
    <style>{`.demo-robot{transition:transform 1.4s ease-in-out}@media (prefers-reduced-motion:reduce){.demo-robot{transition:none}}`}</style>
    <div className="order-1 grid gap-4 lg:order-2 lg:grid-cols-2">
      <AgentView agent={sel.agent} state={state} opId={sel.opId} onOp={sel.setOpId} />
      {sel.op ? <OperationDetail op={sel.op} state={state} /> : <Panel><p className="p-6 text-center text-sm text-[#9AA9D6]">{x('Clique em um robô ou escolha uma operação para ver o detalhe.', 'Click a robot or choose an operation to see its detail.', 'Haga clic en un robot o elija una operación para ver el detalle.')}</p></Panel>}
    </div>
    <div className="order-2 lg:order-1"><Panel title="Live Trading" tag={x('Posição dos robôs = etapa da operação', 'Robot position = operation stage', 'Posición de los robots = etapa de la operación')}>
      <div className="mb-2 flex flex-wrap gap-2"><Btn tone="ghost" pressed={zoom} onClick={() => setZoom(z => !z)}>{zoom ? x('Ver cena inteira', 'Fit scene', 'Ver escena completa') : x('Ampliar cena', 'Enlarge scene', 'Ampliar escena')}</Btn></div>
      <p className="mb-2 text-xs text-[#C5D2F1]">{x('Centro = análise pedida; meio do caminho = autorizada; mesa = execução; base = encerrada, rejeitada ou sem operação.', 'Center = analysis requested; halfway = authorized; desk = execution; base = closed, rejected or no operation.', 'Centro = análisis pedido; a medio camino = autorizada; mesa = ejecución; base = cerrada, rechazada o sin operación.')}</p>
      <div className={`${zoom ? 'overflow-auto' : 'overflow-x-auto'} rounded-xl bg-[#070B1F]`} role="region" aria-label={x('Sala de robôs', 'Robot room', 'Sala de robots')} tabIndex={0}>
        <svg viewBox="0 0 1000 620" className={`h-auto ${zoom ? 'w-[1400px]' : 'min-w-[620px] w-full'}`}>
          <Box x={0} y={0} w={14} d={14} h={0.5} z={-0.5} top="#0A1230" left="#060B22" right="#080E2A" stroke="rgba(95,134,255,.4)" />
          {Array.from({ length: 13 }, (_, i) => i + 1).map(i => <g key={i} stroke="rgba(95,134,255,.1)"><line x1={P(i, 0)[0]} y1={P(i, 0)[1]} x2={P(i, 14)[0]} y2={P(i, 14)[1]} /><line x1={P(0, i)[0]} y1={P(0, i)[1]} x2={P(14, i)[0]} y2={P(14, i)[1]} /></g>)}
          {[...SECTORS].map(sc => { const a = AGENTS[sc.id]; const ops = state.operations.filter(o => o.agent === sc.id); const act = ops.some(isActive); const c = P(sc.gx + 2, sc.gy + 0.2, 0);
            return <g key={sc.id} role="button" tabIndex={0} aria-label={tx(a.name)} onClick={() => pick(sc.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && pick(sc.id)} style={{ cursor: 'pointer' }}>
              <Box x={sc.gx} y={sc.gy} w={4} d={4} h={0.15} top={act ? '#15275f' : '#0C1536'} left="#0A1235" right="#0A1235" stroke={sel.agent === sc.id ? '#F4F1E8' : a.color + '88'} />
              {[0, 1].map(r => <g key={r}><Box x={sc.gx + 0.4} y={sc.gy + 0.3 + r * 1.5} w={3.2} d={0.8} h={0.45} z={0.15} top="#1b2d6b" left="#0D1740" right="#0A1235" stroke={a.color + '66'} />
                {[0, 1, 2].map(m => <Box key={m} x={sc.gx + 0.6 + m * 1.0} y={sc.gy + 0.4 + r * 1.5} w={0.7} d={0.1} h={0.65} z={0.6} top="#1d2a5e" left={act ? a.color : '#06102c'} right="#0F1840" stroke={a.color} />)}</g>)}
              <text x={c[0]} y={c[1] - 58} textAnchor="middle" fill={a.color} fontWeight="800" fontSize="15" stroke="#070B1F" strokeWidth="4" paintOrder="stroke">{tx(a.name).toUpperCase()}</text>
            </g>; })}
          <g role="button" tabIndex={0} aria-label={tx(AGENTS.orchestrator.name)} onClick={() => pick('orchestrator')} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && pick('orchestrator')} style={{ cursor: 'pointer' }}>
            <Box x={5.2} y={5.2} w={3.6} d={3.6} h={0.35} top="#13204F" left="#0D1740" right="#0A1235" stroke={sel.agent === 'orchestrator' ? '#F4F1E8' : '#5F86FF'} />
            <Box x={6.5} y={6.5} w={1} d={1} h={1.1} z={0.35} top="#2B59FF" left="#1E44D6" right="#16339f" />
            <text x={mid[0]} y={mid[1] - 52} textAnchor="middle" fill="#F4F1E8" fontWeight="800" fontSize="15" stroke="#070B1F" strokeWidth="4" paintOrder="stroke">BETTEX</text>
          </g>
          {robots.map(({ s, k, op, sp }) => { const col = op ? STATUS_COLOR[op.status] : '#5b6690';
            return <g key={`${s.id}${k}`} className="demo-robot" style={{ transform: `translate(${sp[0]}px, ${sp[1]}px)`, cursor: 'pointer' }} role="button" tabIndex={0}
              aria-label={op ? `${op.id}, ${tx(STATUS[op.status])}, ${n(op.capital)} USDC` : `${tx(AGENTS[s.id].name)}, ${x('sem operação', 'no operation', 'sin operación')}`}
              onClick={() => pick(s.id, op)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') pick(s.id, op); }} data-testid={`robot-${s.id}-${k}`}>
              <ellipse rx="13" ry="5" fill="#0007" />
              <rect x="-9" y="-30" width="18" height="22" rx="5" fill="#1B2D6B" stroke={col} strokeWidth="1.6" /><rect x="-10" y="-46" width="20" height="14" rx="5" fill="#F4F1E8" /><rect x="-7" y="-43" width="14" height="8" rx="3" fill="#070B1F" /><circle cx="-3" cy="-39" r="1.8" fill={col} /><circle cx="3" cy="-39" r="1.8" fill={col} />
              <g transform="translate(0 -58)"><rect x="-62" y="-14" width="124" height="26" rx="6" fill="#070B1F" stroke={col} /><text y="-3" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#F4F1E8">{op ? op.id : tx(AGENTS[s.id].name)}</text><text y="8" textAnchor="middle" fontSize="9" fill={col}>{op ? `${tx(STATUS[op.status])} · ${n(op.capital, 0)} USDC` : x('Ocioso', 'Idle', 'Inactivo')}</text></g>
            </g>; })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={x('Alternativa por teclado à cena', 'Keyboard alternative to the scene', 'Alternativa de teclado a la escena')}>
        {(['orchestrator', ...SECTORS.map(s => s.id)] as AgentId[]).map(id => <Btn key={id} tone={sel.agent === id ? 'warn' : 'ghost'} pressed={sel.agent === id} onClick={() => sel.setAgent(id)}>{tx(AGENTS[id].name)}</Btn>)}
      </div>
    </Panel></div>
    <div className="order-3"><Chat state={state} dispatch={dispatch} compact /></div>
  </div>;
}
