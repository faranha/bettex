/** @jsxImportSource react */
import { useRef } from 'react';
import { useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { NODES, nodeOf, type Sel } from './central-graph-model';
// These labels are already localized by useL; use native primitives to avoid translating them twice.
import { Root as DropdownMenu, Content as DropdownMenuContent, Item as DropdownMenuItem, Trigger as DropdownMenuTrigger, Portal as DropdownMenuPortal } from '@radix-ui/react-dropdown-menu';
import './CentralSupport.css';

export const GROUPS: { key: string; t: [string, string, string]; cap: [string, string, string]; ids: string[] }[] = [
  { key: 'controls', t: ['Controles', 'Controls', 'Controles'], cap: ['Governança, risco e operação', 'Governance, risk and operations', 'Gobernanza, riesgo y operación'], ids: ['governance', 'risk', 'treasury', 'execution', 'reconciliation'] },
  { key: 'records', t: ['Registros', 'Records', 'Registros'], cap: ['Registros e mercados', 'Records and markets', 'Registros y mercados'], ids: ['records', 'capital', 'execrec', 'markets', 'btc', 'eth', 'sol'] },
  { key: 'community', t: ['Comunidade', 'Community', 'Comunidad'], cap: ['Comunidade e token', 'Community and token', 'Comunidad y token'], ids: ['community', 'tokenomics', 'games', 'participation', 'settlement', 'buyback', 'burn', 'history', 'dashboard', 'roadmap'] },
];

export function SupportNav({ sel, onPick, cat }: { sel: Sel | null; onPick: (s: Sel) => void; cat: number }) {
  const { x } = useFmt(); const L = useL();
  const g = GROUPS[cat];
  const ids = g.ids.filter(id => NODES.some(n => n.id === id));
  const trig = useRef<HTMLButtonElement>(null);
  const openingPanel = useRef(false);
  const pickItem = (id: string) => { openingPanel.current = true; trig.current?.focus({ preventScroll: true }); onPick({ k: 'node', id }); };
  return <nav className="cg-snav" aria-label={x('Apoio fora do grafo', 'Support outside the graph', 'Apoyo fuera del grafo')}>
    <div className="cg-schooser" id="cg-spanel">
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button ref={trig} type="button" data-demo-local className="cg-schoose" data-testid="support-chooser">
          <span>{x('Escolher painel', 'Choose panel', 'Elegir panel')}</span><span className="cg-sarrow" aria-hidden="true">▾</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal><DropdownMenuContent align="end" sideOffset={6} className="cg-smenu z-50 overflow-y-auto overflow-x-hidden" aria-label={L(g.t)} onCloseAutoFocus={e => { if (openingPanel.current) { e.preventDefault(); openingPanel.current = false; } }}>
        {ids.map(id => { const on = sel?.k === 'node' && sel.id === id; return <DropdownMenuItem key={id} data-demo-local data-testid={`support-${id}`} aria-current={on ? 'true' : undefined} className={on ? 'on' : ''} onSelect={() => pickItem(id)}>{L(nodeOf(id).name)}</DropdownMenuItem>; })}
      </DropdownMenuContent></DropdownMenuPortal>
    </DropdownMenu>
    </div>
  </nav>;
}
