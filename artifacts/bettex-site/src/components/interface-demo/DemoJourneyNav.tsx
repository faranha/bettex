/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useFmt } from '../alpha-trading/format';
import { demoPath, type DemoView } from '../demo/demo-navigation';
import { recalledSel, selQuery } from './central-graph-model';

/** Read-only reading journey between demo areas. Plain links, never routed through the operational notice. */
export function DemoJourneyNav({ view }: { view: DemoView }) {
  const { x, loc } = useFmt();
  const [q, setQ] = useState(() => selQuery(recalledSel()));
  useEffect(() => { setQ(selQuery(recalledSel())); }, [view]);
  const graph = (id: string) => `${demoPath('central', loc)}?node=${id}`;
  const areas: { v: DemoView; label: string; href: string }[] = [
    { v: 'home', label: x('Painel', 'Dashboard', 'Panel'), href: demoPath('home', loc) },
    { v: 'central', label: x('Central da IA', 'AI Center', 'Central de IA'), href: `${demoPath('central', loc)}${q ? `?${q}` : ''}` },
    { v: 'treasury', label: x('Tesouraria', 'Treasury', 'Tesorería'), href: demoPath('treasury', loc) },
    { v: 'wallet', label: x('Histórico', 'History', 'Historial'), href: demoPath('wallet', loc) },
  ];
  const ctx: Partial<Record<DemoView, { id: string; label: string }[]>> = {
    home: [{ id: 'dashboard', label: x('Como o painel se liga ao projeto', 'How the dashboard connects to the project', 'Cómo se conecta el panel al proyecto') }],
    treasury: [{ id: 'settlement', label: x('Ver condições do rateio no grafo', 'See split conditions in the graph', 'Ver condiciones del reparto en el grafo') }, { id: 'burn', label: x('Ver recompra e queima', 'See buyback and burn', 'Ver recompra y quema') }],
    wallet: [{ id: 'history', label: x('Ver trilha no grafo', 'See the trail in the graph', 'Ver trazabilidad en el grafo') }, { id: 'participation', label: x('Ver participação', 'See participation', 'Ver participación') }],
  };
  return <nav className="cg-journey" aria-label={x('Percurso de leitura da demonstração', 'Demo reading journey', 'Recorrido de lectura de la demostración')} data-testid="demo-journey">
    <ol>{areas.map(a => <li key={a.v}>{a.v === view
      ? <span aria-current="page" data-testid={`journey-${a.v}`}>{a.label}</span>
      : <Link href={a.href} data-demo-local data-testid={`journey-${a.v}`}>{a.label}</Link>}</li>)}</ol>
    {(ctx[view] ?? []).map(c => <Link key={c.id} href={graph(c.id)} data-demo-local className="ctx" data-testid={`journey-graph-${c.id}`}>{c.label}</Link>)}
  </nav>;
}
