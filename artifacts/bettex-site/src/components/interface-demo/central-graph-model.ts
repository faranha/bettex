import type { Asset, T3 } from './central-data';

export type P = [number, number];
export type NodeKind = 'core' | 'agent' | 'spec' | 'control' | 'hub' | 'soon';
export type NodeDef = { id: string; kind: NodeKind; name: T3; sub: T3; wide: P; tall: P; d: number };
export type EdgeDef = { id: string; a: string; b: string; type: 'flow' | 'control' | 'hub' };
export type Sel = { k: 'node' | 'edge'; id: string };
export type TabId = 'overview' | 'agent' | 'forecast' | 'requests' | 'capital' | 'execution' | 'markets' | 'control';

export const WIDE_SIZE: P = [1200, 840];
export const TALL_SIZE: P = [420, 1330];
export const SPEC: Asset[] = ['btc', 'eth', 'sol'];
export const CONTROLS = ['governance', 'risk', 'treasury', 'execution', 'reconciliation'];
export const HUBS = ['records', 'capital', 'execrec', 'markets'];

const AG: T3 = ['Agente inteligente', 'Intelligent agent', 'Agente inteligente'];
const SP: T3 = ['Mercado de Cripto', 'Crypto market', 'Mercado de Cripto'];
const CT: T3 = ['Controle, não é agente', 'Control, not an agent', 'Control, no es agente'];
const SOONT: T3 = ['Em breve, desativado', 'Upcoming, disabled', 'Próximamente, desactivado'];
const HB: T3 = ['Registros de amostra', 'Sample records', 'Registros de muestra'];

export const NODES: NodeDef[] = [
  { id: 'bettex', kind: 'core', name: ['BETTEX', 'BETTEX', 'BETTEX'], sub: ['Inteligência central', 'Central intelligence', 'Inteligencia central'], wide: [600, 400], tall: [210, 470], d: 128 },
  { id: 'predictions', kind: 'agent', name: ['Cripto', 'Crypto', 'Cripto'], sub: AG, wide: [350, 400], tall: [210, 285], d: 84 },
  { id: 'btc', kind: 'spec', name: ['BTC', 'BTC', 'BTC'], sub: SP, wide: [120, 190], tall: [70, 120], d: 70 },
  { id: 'eth', kind: 'spec', name: ['ETH', 'ETH', 'ETH'], sub: SP, wide: [90, 400], tall: [210, 120], d: 70 },
  { id: 'sol', kind: 'spec', name: ['SOL', 'SOL', 'SOL'], sub: SP, wide: [120, 610], tall: [350, 120], d: 70 },
  { id: 'governance', kind: 'control', name: ['Governança', 'Governance', 'Gobernanza'], sub: CT, wide: [900, 150], tall: [70, 810], d: 62 },
  { id: 'risk', kind: 'control', name: ['Risco', 'Risk', 'Riesgo'], sub: CT, wide: [1040, 270], tall: [210, 810], d: 62 },
  { id: 'treasury', kind: 'control', name: ['Tesouraria', 'Treasury', 'Tesorería'], sub: CT, wide: [1100, 410], tall: [350, 810], d: 62 },
  { id: 'execution', kind: 'control', name: ['Execução', 'Execution', 'Ejecución'], sub: CT, wide: [1040, 550], tall: [140, 935], d: 62 },
  { id: 'reconciliation', kind: 'control', name: ['Conciliação', 'Reconciliation', 'Conciliación'], sub: CT, wide: [900, 670], tall: [280, 935], d: 62 },
  { id: 'records', kind: 'hub', name: ['Pedidos e decisões', 'Requests and decisions', 'Pedidos y decisiones'], sub: HB, wide: [470, 130], tall: [110, 650], d: 58 },
  { id: 'capital', kind: 'hub', name: ['Capital e política', 'Capital and policy', 'Capital y política'], sub: HB, wide: [730, 130], tall: [310, 650], d: 58 },
  { id: 'execrec', kind: 'hub', name: ['Ordens e posições', 'Orders and positions', 'Órdenes y posiciones'], sub: HB, wide: [470, 660], tall: [110, 1080], d: 58 },
  { id: 'markets', kind: 'hub', name: ['Mercados', 'Markets', 'Mercados'], sub: HB, wide: [730, 660], tall: [310, 1080], d: 58 },
  { id: 's0', kind: 'soon', name: ['Esportes', 'Sports', 'Deportes'], sub: SOONT, wide: [300, 775], tall: [70, 1245], d: 44 },
  { id: 's1', kind: 'soon', name: ['Mercados de previsão', 'Prediction Markets', 'Mercados de predicción'], sub: SOONT, wide: [600, 785], tall: [210, 1245], d: 44 },
  { id: 's2', kind: 'soon', name: ['Cassino', 'Casino', 'Casino'], sub: SOONT, wide: [900, 775], tall: [350, 1245], d: 44 },
];
export const nodeOf = (id: string) => NODES.find(n => n.id === id)!;

export const EDGES: EdgeDef[] = [
  ...SPEC.map(s => ({ id: `${s}-predictions`, a: s, b: 'predictions', type: 'flow' as const })),
  { id: 'predictions-bettex', a: 'predictions', b: 'bettex', type: 'flow' },
  ...CONTROLS.map(c => ({ id: `bettex-${c}`, a: 'bettex', b: c, type: 'control' as const })),
  ...HUBS.map(h => ({ id: `bettex-${h}`, a: 'bettex', b: h, type: 'hub' as const })),
];

export function route(sel: Sel | null): { edges: Set<string>; nodes: Set<string> } {
  const edges = new Set<string>(); const nodes = new Set<string>();
  if (!sel) return { edges, nodes };
  if (sel.k === 'edge') { edges.add(sel.id); if (SPEC.some(a => sel.id.startsWith(a))) edges.add('predictions-bettex'); }
  else { EDGES.forEach(e => { if (e.a === sel.id || e.b === sel.id) edges.add(e.id); }); if (SPEC.includes(sel.id as Asset)) edges.add('predictions-bettex'); }
  EDGES.forEach(e => { if (edges.has(e.id)) { nodes.add(e.a); nodes.add(e.b); } });
  if (sel.k === 'node') nodes.add(sel.id);
  return { edges, nodes };
}

export type TabSpec = { tab: TabId; id?: string };
export function tabsFor(sel: Sel): TabSpec[] {
  if (sel.k === 'node') {
    const id = sel.id;
    if (id === 'bettex') return [{ tab: 'overview' }, { tab: 'agent', id }, { tab: 'requests' }];
    if (id === 'predictions') return [{ tab: 'agent', id }, { tab: 'forecast' }, { tab: 'requests' }];
    if (SPEC.includes(id as Asset)) return [{ tab: 'agent', id }, { tab: 'forecast' }, { tab: 'requests', id }];
    if (id === 'execution' || id === 'reconciliation') return [{ tab: 'control', id }, { tab: 'execution' }];
    if (CONTROLS.includes(id)) return [{ tab: 'control', id }, { tab: 'capital' }];
    return [{ tab: id === 'records' ? 'requests' : id === 'capital' ? 'capital' : id === 'execrec' ? 'execution' : 'markets' }];
  }
  const e = EDGES.find(q => q.id === sel.id)!;
  if (SPEC.includes(e.a as Asset)) return [{ tab: 'requests', id: e.a }, { tab: 'agent', id: e.a }, { tab: 'forecast' }];
  if (e.id === 'predictions-bettex') return [{ tab: 'requests' }, { tab: 'agent', id: 'predictions' }];
  if (e.type === 'control') return e.b === 'execution' || e.b === 'reconciliation' ? [{ tab: 'control', id: e.b }, { tab: 'execution' }] : [{ tab: 'control', id: e.b }, { tab: 'capital' }];
  return tabsFor({ k: 'node', id: e.b });
}

export const TAB_LABEL: Record<TabId, T3> = {
  overview: ['Resumo e mandatos', 'Summary and mandates', 'Resumen y mandatos'], agent: ['Raciocínio e relatórios', 'Reasoning and reports', 'Razonamiento e informes'],
  forecast: ['Previsão Allora', 'Allora forecast', 'Previsión Allora'], requests: ['Pedidos e decisões', 'Requests and decisions', 'Pedidos y decisiones'],
  capital: ['Capital e política', 'Capital and policy', 'Capital y política'], execution: ['Ordens e posições', 'Orders and positions', 'Órdenes y posiciones'],
  markets: ['Mercados', 'Markets', 'Mercados'], control: ['Política de controle', 'Control policy', 'Política de control'],
};

export const SCENE_Z: Record<string, number> = { bettex: 0, predictions: -80, btc: 90, eth: -40, sol: 110, governance: -120, risk: 80, treasury: -60, execution: 100, reconciliation: -110, records: -90, capital: 70, execrec: 80, markets: -100, s0: -260, s1: -300, s2: -250 };
