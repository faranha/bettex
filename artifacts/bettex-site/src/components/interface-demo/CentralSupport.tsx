/** @jsxImportSource react */
import { useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { NODES, nodeOf, type Sel } from './central-graph-model';

const GROUPS: { t: [string, string, string]; ids: string[] }[] = [
  { t: ['Controles (não são agentes)', 'Controls (not agents)', 'Controles (no son agentes)'], ids: ['governance', 'risk', 'treasury', 'execution', 'reconciliation'] },
  { t: ['Registros e mercados', 'Records and markets', 'Registros y mercados'], ids: ['records', 'capital', 'execrec', 'markets', 'btc', 'eth', 'sol'] },
  { t: ['Comunidade e token', 'Community and token', 'Comunidad y token'], ids: ['community', 'tokenomics', 'games', 'participation', 'settlement', 'buyback', 'burn', 'history', 'dashboard', 'roadmap'] },
];

export function SupportNav({ sel, onPick }: { sel: Sel | null; onPick: (s: Sel) => void }) {
  const { x } = useFmt(); const L = useL();
  return <nav className="cg-snav" aria-label={x('Apoio fora do grafo', 'Support outside the graph', 'Apoyo fuera del grafo')}>
    <p className="cg-snote">{x('Controles e áreas do projeto · amostras somente leitura', 'Controls and project areas · read-only samples', 'Controles y áreas del proyecto · muestras de solo lectura')}</p>
    {GROUPS.map(g => <div key={g.ids[0]} className="cg-sgrp"><h3>{x(...g.t)}</h3><div>
      {g.ids.filter(id => NODES.some(n => n.id === id)).map(id => { const on = sel?.k === 'node' && sel.id === id; return <button key={id} type="button" data-demo-local data-testid={`support-${id}`} aria-pressed={on} className={on ? 'on' : ''} onClick={() => onPick({ k: 'node', id })}>{L(nodeOf(id).name)}</button>; })}
    </div></div>)}
  </nav>;
}
