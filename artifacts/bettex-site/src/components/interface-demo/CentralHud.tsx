/** @jsxImportSource react */
import { useFmt } from '../alpha-trading/format';
import { STATUS, DECISION } from '../agent-operations/copy';
import { useL } from './CentralAgents';
import { AGENTS, CAPITAL, DECISIONS, FORECASTS, ORDERS, POSITIONS, REQUESTS, SAMPLE_PROVENANCE, STATE, type Asset } from './central-data';
import { NODES, nodeOf, type Sel } from './central-graph-model';

const RAIL = NODES.filter(n => n.kind !== 'soon' && n.kind !== 'spec').map(n => n.id);

export function TopRail({ sel, onPick }: { sel: Sel | null; onPick: (s: Sel) => void }) {
  const { x } = useFmt(); const L = useL();
  return <header className="cg-top">
    <p className="cg-metrics" data-testid="hud-metrics"><span className="cg-brand">{x('BETTEX CENTRAL DE IA', 'BETTEX AI CENTER', 'BETTEX CENTRAL DE IA')}</span>
      <span>{x('AGENTES', 'AGENTS', 'AGENTES')} <b>{NODES.filter(n => n.kind === 'agent').length}</b></span>
      <span>{x('CONTROLES', 'CONTROLS', 'CONTROLES')} <b>5</b></span><span>{x('PEDIDOS', 'REQUESTS', 'PEDIDOS')} <b>{REQUESTS.length}</b></span>
      <span>{x('DECISÕES', 'DECISIONS', 'DECISIONES')} <b>{DECISIONS.length}</b></span><span>{x('ORDENS', 'ORDERS', 'ÓRDENES')} <b>{ORDERS.length}</b></span><span>{x('POSIÇÕES', 'POSITIONS', 'POSICIONES')} <b>{POSITIONS.length}</b></span>
      <span className="cg-demo" data-testid="hud-demo-badge">{x('DEMO VISUAL · AMOSTRAS ILUSTRATIVAS', 'VISUAL DEMO · ILLUSTRATIVE SAMPLES', 'DEMO VISUAL · MUESTRAS ILUSTRATIVAS')}</span></p>
    <nav className="cg-rail" aria-label={x('Ir para um nó da cena', 'Jump to a scene node', 'Ir a un nodo de la escena')}>
      {RAIL.map(id => { const active = sel?.k === 'node' && (sel.id === id || id === 'predictions' && nodeOf(sel.id)?.kind === 'spec'); return <button key={id} type="button" data-testid={`rail-${id}`} aria-pressed={active} className={active ? 'on' : ''} onClick={() => onPick({ k: 'node', id })}>{L(nodeOf(id).name)}</button>; })}
    </nav></header>;
}

export function SceneTitle({ sel }: { sel: Sel | null }) {
  const { x } = useFmt(); const L = useL();
  const n = sel?.k === 'node' ? nodeOf(sel.id) : null;
  return <div className="cg-title" data-testid="graph-title"><h2>{n ? `${n.kind === 'spec' ? `${L(nodeOf('predictions').name)} · ` : ''}${L(n.name)}` : x('Central da IA', 'AI Center', 'Central de IA')}</h2>
    <p>{n ? L(n.sub) : x('BETTEX supervisiona o agente Cripto, que reúne os mercados BTC, ETH e SOL.', 'BETTEX supervises the Crypto agent, which covers BTC, ETH and SOL markets.', 'BETTEX supervisa el agente Cripto, que reúne los mercados BTC, ETH y SOL.')}</p></div>;
}

const spark = (s: number[]) => { const mx = Math.max(...s), mn = Math.min(...s); return s.map((v, i) => `${(i / (s.length - 1)) * 100},${22 - ((v - mn) / (mx - mn || 1)) * 20}`).join(' '); };

export function TelemetryStrip({ onPick }: { onPick: (s: Sel) => void }) {
  const { x, loc } = useFmt(); const L = useL(); const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const usdc = (v: string) => `${(Number(v) / 1e6).toLocaleString(lc, { maximumFractionDigits: 0 })}`;
  const states = [...new Set(REQUESTS.map(r => r.state))];
  const go = (id: string) => () => onPick({ k: 'node', id });
  const cap: [string, string, string][] = [[x('total', 'total', 'total'), CAPITAL.total, 'c'], [x('alocado', 'allocated', 'asignado'), CAPITAL.allocated, 'c'], [x('reservado', 'reserved', 'reservado'), CAPITAL.reserved, 'a'], [x('disponível', 'available', 'disponible'), CAPITAL.available, 'g']];
  return <footer className="cg-hud" data-testid="graph-hud">
    <button type="button" className="cg-pan" onClick={go('bettex')} data-testid="hud-runs" aria-label={x('Abrir BETTEX: execuções de amostra', 'Open BETTEX: sample runs', 'Abrir BETTEX: ejecuciones de muestra')}>
      <h3>{x('EXECUÇÕES DE AMOSTRA', 'SAMPLE RUNS', 'EJECUCIONES DE MUESTRA')}</h3>
      <ul>{AGENTS.slice(0, 6).map(a => <li key={a.id}><span>{a.latest.id.replace('demo-run-', '')}</span><b className={a.latest.status}>{L(STATUS[a.latest.status])}</b><em>{L(DECISION[a.latest.decision])}</em></li>)}</ul></button>
    <button type="button" className="cg-pan" onClick={go('records')} data-testid="hud-requests" aria-label={x('Abrir pedidos e decisões', 'Open requests and decisions', 'Abrir pedidos y decisiones')}>
      <h3>{x('PEDIDOS POR ESTADO', 'REQUESTS BY STATE', 'PEDIDOS POR ESTADO')} <i>{REQUESTS.length}</i></h3>
      <ul>{states.map(s => { const n = REQUESTS.filter(r => r.state === s).length; return <li key={s} className="bar"><span>{L(STATE[s])}</span><u style={{ width: `${(n / REQUESTS.length) * 100}%` }} /><b>{n}</b></li>; })}</ul></button>
    <button type="button" className="cg-pan" onClick={go('capital')} data-testid="hud-capital" aria-label={x('Abrir capital e política', 'Open capital and policy', 'Abrir capital y política')}>
      <h3>{x('CAPITAL (USDC, AMOSTRA)', 'CAPITAL (USDC, SAMPLE)', 'CAPITAL (USDC, MUESTRA)')}</h3>
      <ul>{cap.map(([k, v, c]) => <li key={k} className={`bar ${c}`}><span>{k}</span><u style={{ width: `${(Number(v) / Number(CAPITAL.total)) * 100}%` }} /><b>{usdc(v)}</b></li>)}</ul></button>
    <button type="button" className="cg-pan" onClick={go('capital')} data-testid="hud-exposure" aria-label={x('Abrir exposição', 'Open exposure', 'Abrir exposición')}>
      <h3>{x('EXPOSIÇÃO (USDC)', 'EXPOSURE (USDC)', 'EXPOSICIÓN (USDC)')}</h3>
      <ul>{CAPITAL.exposure.map(e => <li key={e.asset} className="bar a"><span>{e.asset.toUpperCase()}</span><u style={{ width: `${(Number(e.units) / 150000000) * 100}%` }} /><b>{usdc(e.units)}</b></li>)}</ul></button>
    <button type="button" className="cg-pan" onClick={go('predictions')} data-testid="hud-forecast" aria-label={x('Abrir previsões Allora de amostra', 'Open sample Allora forecasts', 'Abrir previsiones Allora de muestra')}>
      <h3>{x('PREVISÃO ALLORA (AMOSTRA)', 'ALLORA FORECAST (SAMPLE)', 'PREVISIÓN ALLORA (MUESTRA)')}</h3>
      <ul>{(['btc', 'eth', 'sol'] as Asset[]).map(a => <li key={a} className="spk"><span>{a.toUpperCase()}</span><svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><polyline points={spark(FORECASTS[a].series)} fill="none" /></svg><b>{Number(FORECASTS[a].usd).toLocaleString(lc, { maximumFractionDigits: 2 })}</b></li>)}</ul></button>
    <div className="cg-pan cg-prov" data-testid="hud-provenance"><h3>{x('PROVENIÊNCIA', 'PROVENANCE', 'PROCEDENCIA')}</h3><p><b>{x('Amostra ilustrativa', 'Illustrative sample', 'Muestra ilustrativa')}</b></p><p>{L(SAMPLE_PROVENANCE)}</p></div>
  </footer>;
}
