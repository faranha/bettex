/** @jsxImportSource react */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { NODES, nodeOf, type Sel } from './central-graph-model';
import './CentralSupport.css';

const GROUPS: { key: string; t: [string, string, string]; cap: [string, string, string]; ids: string[] }[] = [
  { key: 'controls', t: ['Controles', 'Controls', 'Controles'], cap: ['Governança, risco e operação', 'Governance, risk and operations', 'Gobernanza, riesgo y operación'], ids: ['governance', 'risk', 'treasury', 'execution', 'reconciliation'] },
  { key: 'records', t: ['Registros', 'Records', 'Registros'], cap: ['Registros e mercados', 'Records and markets', 'Registros y mercados'], ids: ['records', 'capital', 'execrec', 'markets', 'btc', 'eth', 'sol'] },
  { key: 'community', t: ['Comunidade', 'Community', 'Comunidad'], cap: ['Comunidade e token', 'Community and token', 'Comunidad y token'], ids: ['community', 'tokenomics', 'games', 'participation', 'settlement', 'buyback', 'burn', 'history', 'dashboard', 'roadmap'] },
];

export function SupportNav({ sel, onPick }: { sel: Sel | null; onPick: (s: Sel) => void }) {
  const { x } = useFmt(); const L = useL();
  const [cat, setCat] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const selId = sel?.k === 'node' ? sel.id : null;
  useEffect(() => {
    if (!selId) return;
    const i = GROUPS.findIndex(g => g.ids.includes(selId));
    if (i >= 0) setCat(i);
  }, [selId]);
  const onKey = (e: KeyboardEvent) => {
    const n = GROUPS.length; let i = cat;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (cat + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (cat + n - 1) % n;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else return;
    e.preventDefault(); setCat(i); tabs.current[i]?.focus();
  };
  const g = GROUPS[cat];
  const ids = g.ids.filter(id => NODES.some(n => n.id === id));
  return <nav className="cg-snav" aria-label={x('Apoio fora do grafo', 'Support outside the graph', 'Apoyo fuera del grafo')}>
    <div className="cg-scats" role="tablist" aria-label={x('Categorias de apoio', 'Support categories', 'Categorías de apoyo')} onKeyDown={onKey}>
      {GROUPS.map((c, i) => <button key={c.key} ref={el => { tabs.current[i] = el; }} type="button" data-demo-local role="tab" id={`cg-scat-${c.key}`} aria-selected={cat === i} aria-controls="cg-spanel" tabIndex={cat === i ? 0 : -1} className={cat === i ? 'on' : ''} onClick={() => setCat(i)}>
        <span>{x(...c.t)}</span>
      </button>)}
    </div>
    <div id="cg-spanel" role="tabpanel" aria-labelledby={`cg-scat-${g.key}`} className="cg-sitems">
      <p className="cg-scap">{x(...g.cap)} · {x('amostras somente leitura', 'read-only samples', 'muestras de solo lectura')}</p>
      <div className="cg-slist">
        {ids.map(id => { const on = sel?.k === 'node' && sel.id === id; return <button key={id} type="button" data-demo-local data-testid={`support-${id}`} aria-pressed={on} className={on ? 'on' : ''} onClick={() => onPick({ k: 'node', id })}><span>{L(nodeOf(id).name)}</span><span className="cg-sarrow" aria-hidden="true">↗</span></button>; })}
      </div>
    </div>
  </nav>;
}
