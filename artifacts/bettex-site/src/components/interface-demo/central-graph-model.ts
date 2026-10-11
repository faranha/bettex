import type { Asset, T3 } from './central-data';
import { demoPath, type DemoView } from '../demo/demo-navigation';
import { PROJECT_CONNECTIONS, PROJECT_TOPICS, type ProjectTopic } from './demo-project-model';

export type P = [number, number];
export type NodeKind = 'core' | 'agent' | 'spec' | 'control' | 'hub' | 'soon';
export type NodeDef = { id: string; kind: NodeKind; name: T3; sub: T3; wide: P; tall: P; d: number; group?: 'biz' };
export type EdgeDef = { id: string; a: string; b: string; type: 'flow' | 'control' | 'hub'; label?: T3; condition?: T3; planned?: boolean; biz?: boolean };
export type Sel = { k: 'node' | 'edge'; id: string };
export type TabId = 'overview' | 'agent' | 'forecast' | 'requests' | 'capital' | 'execution' | 'markets' | 'control' | 'topic' | 'flow' | 'links';

export const WIDE_SIZE: P = [1560, 1060];
export const TALL_SIZE: P = [420, 2080];
export const SPEC: Asset[] = ['btc', 'eth', 'sol'];
export const CONTROLS = ['governance', 'risk', 'treasury', 'execution', 'reconciliation'];
export const HUBS = ['records', 'capital', 'execrec', 'markets'];

const AG: T3 = ['Núcleo interno Cripto', 'Internal Crypto core', 'Núcleo interno Cripto'];
const SP: T3 = ['Subagente de Cripto', 'Crypto subagent', 'Subagente de Cripto'];
const CT: T3 = ['Controle, não é agente', 'Control, not an agent', 'Control, no es agente'];
const SOONT: T3 = ['Em breve, desativado', 'Upcoming, disabled', 'Próximamente, desactivado'];
const HB: T3 = ['Registros', 'Records', 'Registros'];

/** Business and community nodes. Ids equal the PROJECT_TOPICS ids supplied by the shared project model. */
const BIZ: { id: string; kind: 'hub' | 'control'; sub: T3; wide: P; tall: P; d: number }[] = [
  { id: 'community', kind: 'hub', sub: ['Comunidade aberta', 'Open community', 'Comunidad abierta'], wide: [1260, 120], tall: [110, 1420], d: 60 },
  { id: 'tokenomics', kind: 'hub', sub: ['Token comunitário, 1 bi', 'Community token, 1 bn', 'Token comunitario, 1.000 M'], wide: [1440, 250], tall: [310, 1420], d: 60 },
  { id: 'games', kind: 'hub', sub: ['Loteria e 2X, ilustrativo', 'Lottery and 2X, illustrative', 'Lotería y 2X, ilustrativo'], wide: [1470, 460], tall: [310, 1560], d: 52 },
  { id: 'participation', kind: 'hub', sub: ['Peso elegível por rodada', 'Eligible weight per round', 'Peso elegible por ronda'], wide: [1320, 580], tall: [110, 1560], d: 62 },
  { id: 'settlement', kind: 'control', sub: ['Rateio condicional', 'Conditional split', 'Reparto condicional'], wide: [1190, 730], tall: [110, 1700], d: 66 },
  { id: 'buyback', kind: 'control', sub: ['USDC separado, autorizado', 'Separate USDC, authorized', 'USDC separado, autorizado'], wide: [1400, 820], tall: [310, 1700], d: 62 },
  { id: 'burn', kind: 'control', sub: ['Queima permanente', 'Permanent burn', 'Quema permanente'], wide: [1370, 960], tall: [110, 1840], d: 60 },
  { id: 'history', kind: 'hub', sub: ['Trilha e exportações', 'Trail and exports', 'Trazabilidad y exportaciones'], wide: [1100, 950], tall: [310, 1840], d: 58 },
  { id: 'dashboard', kind: 'hub', sub: ['Carteiras e saldos', 'Wallets and balances', 'Carteras y saldos'], wide: [820, 950], tall: [110, 1980], d: 58 },
  { id: 'roadmap', kind: 'hub', sub: ['Disponibilidade e redes', 'Availability and networks', 'Disponibilidad y redes'], wide: [540, 950], tall: [310, 1980], d: 58 },
];
const TOPIC_BY_ID = new Map<string, ProjectTopic>(PROJECT_TOPICS.map(t => [t.id, t]));
export const topicOf = (id: string) => TOPIC_BY_ID.get(id);

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
  ...BIZ.map((b): NodeDef => ({ id: b.id, kind: b.kind, name: topicOf(b.id)!.title, sub: b.sub, wide: b.wide, tall: b.tall, d: b.d, group: 'biz' })),
  { id: 's0', kind: 'soon', name: ['Esportes', 'Sports', 'Deportes'], sub: SOONT, wide: [300, 800], tall: [70, 1245], d: 44 },
  { id: 's1', kind: 'soon', name: ['Mercados de previsão', 'Prediction Markets', 'Mercados de predicción'], sub: SOONT, wide: [600, 810], tall: [210, 1245], d: 44 },
  { id: 's2', kind: 'soon', name: ['Cassino', 'Casino', 'Casino'], sub: SOONT, wide: [900, 800], tall: [350, 1245], d: 44 },
];
export const nodeOf = (id: string) => NODES.find(n => n.id === id)!;
export const hasNode = (id: string) => NODES.some(n => n.id === id);
export const isBiz = (id: string) => nodeOf(id)?.group === 'biz';
export const BIZ_IDS = BIZ.map(b => b.id);

/** Only current and planned agents belong to the spatial graph.
 * NODES remains the complete panel registry so existing support links keep working. */
export const GRAPH_NODES: NodeDef[] = NODES.filter(n => n.kind === 'core' || n.kind === 'agent' || n.kind === 'spec' || n.kind === 'soon').map(n => {
  const layout: Record<string, { wide: P; tall: P }> = {
    bettex: { wide: [780, 470], tall: [210, 390] },
    predictions: { wide: [470, 390], tall: [210, 340] },
    btc: { wide: [180, 150], tall: [70, 100] },
    eth: { wide: [170, 420], tall: [210, 100] },
    sol: { wide: [180, 690], tall: [350, 100] },
    s0: { wide: [600, 810], tall: [70, 760] },
    s1: { wide: [1140, 240], tall: [210, 760] },
    s2: { wide: [1130, 750], tall: [350, 760] },
  };
  return { ...n, ...layout[n.id], ...(n.kind === 'soon' ? { sub: ['Agente em breve, desativado', 'Upcoming agent, disabled', 'Agente próximamente, desactivado'] as T3 } : {}) };
});
const GRAPH_IDS = new Set(GRAPH_NODES.map(n => n.id));
export const isGraphNode = (id: string) => GRAPH_IDS.has(id);

const FLOW_IDS = new Set(['tokenomics-treasury', 'treasury-predictions', 'settlement-treasury', 'settlement-participation', 'settlement-buyback', 'buyback-burn']);
const CTRL_IDS = new Set(['risk-execution', 'execution-reconciliation', 'reconciliation-settlement', 'governance-roadmap']);
const edgeType = (id: string): EdgeDef['type'] => FLOW_IDS.has(id) ? 'flow' : CTRL_IDS.has(id) ? 'control' : 'hub';

const PLAN_LABEL: T3 = ['Mercado planejado', 'Planned market', 'Mercado planificado'];
const PLAN_COND: T3 = ['Desativado: não opera. Só pode ser liberado onde permitido por lei, com as autorizações e controles exigidos.', 'Disabled: it does not operate. It can only be released where legally permitted, with the required authorizations and controls.', 'Desactivado: no opera. Solo puede liberarse donde la ley lo permita, con las autorizaciones y controles exigidos.'];

export const EDGES: EdgeDef[] = [
  ...SPEC.map(s => ({ id: `${s}-predictions`, a: s, b: 'predictions', type: 'flow' as const })),
  { id: 'predictions-bettex', a: 'predictions', b: 'bettex', type: 'flow' },
  ...CONTROLS.map(c => ({ id: `bettex-${c}`, a: 'bettex', b: c, type: 'control' as const })),
  ...HUBS.map(h => ({ id: `bettex-${h}`, a: 'bettex', b: h, type: 'hub' as const })),
  ...PROJECT_CONNECTIONS.filter(c => hasNode(c.a) && hasNode(c.b)).map((c): EdgeDef => ({ id: c.id, a: c.a, b: c.b, type: edgeType(c.id), label: c.label, condition: c.condition, biz: true })),
  ...(['s0', 's1', 's2'] as const).map((s): EdgeDef => ({ id: `roadmap-${s}`, a: 'roadmap', b: s, type: 'hub', label: PLAN_LABEL, condition: PLAN_COND, planned: true, biz: true })),
];
export const edgeOf = (id: string) => EDGES.find(e => e.id === id);

export const GRAPH_EDGES: EdgeDef[] = [
  ...EDGES.filter(e => isGraphNode(e.a) && isGraphNode(e.b)),
  ...(['s0', 's1', 's2'] as const).map(id => ({
    id: `bettex-${id}`, a: 'bettex', b: id, type: 'hub' as const,
    label: ['Agente planejado', 'Planned agent', 'Agente planificado'] as T3,
    condition: PLAN_COND, planned: true,
  })),
];
export const isGraphSelection = (sel: Sel | null) => !!sel && (sel.k === 'node' ? isGraphNode(sel.id) : GRAPH_EDGES.some(e => e.id === sel.id));
export function graphRoute(sel: Sel | null): { edges: Set<string>; nodes: Set<string> } {
  const edges = new Set<string>(); const nodes = new Set<string>();
  if (!isGraphSelection(sel) || !sel) return { edges, nodes };
  for (const e of GRAPH_EDGES) {
    if (sel.k === 'edge' ? e.id === sel.id : e.a === sel.id || e.b === sel.id) {
      edges.add(e.id); nodes.add(e.a); nodes.add(e.b);
    }
  }
  if (sel.k === 'node') nodes.add(sel.id);
  if (SPEC.includes(sel.id as Asset) || (sel.k === 'edge' && GRAPH_EDGES.some(e => e.id === sel.id && SPEC.includes(e.a as Asset)))) {
    edges.add('predictions-bettex'); nodes.add('predictions'); nodes.add('bettex');
  }
  return { edges, nodes };
}

const LEGACY: Record<EdgeDef['type'], { label: T3; condition: T3 }> = {
  flow: { label: ['Pedido do mercado ao agente', 'Market request to the agent', 'Pedido del mercado al agente'], condition: ['Especialistas só enviam pedidos; a BETTEX compara e decide dentro dos mandatos.', 'Specialists only send requests; BETTEX compares and decides within mandates.', 'Los especialistas solo envían pedidos; BETTEX compara y decide dentro de los mandatos.'] },
  control: { label: ['Verificação de controle', 'Control check', 'Verificación de control'], condition: ['O controle verifica regras e limites. Não é agente e não cria operações próprias.', 'The control checks rules and limits. It is not an agent and creates no operations of its own.', 'El control verifica reglas y límites. No es agente y no crea operaciones propias.'] },
  hub: { label: ['Registros de amostra', 'Sample records', 'Registros de muestra'], condition: ['Registros ilustrativos separados por função: pedidos, capital, execução e mercados.', 'Illustrative records separated by function: requests, capital, execution and markets.', 'Registros ilustrativos separados por función: pedidos, capital, ejecución y mercados.'] },
};
export function edgeText(e: EdgeDef): { label: T3; condition: T3 } {
  return e.label && e.condition ? { label: e.label, condition: e.condition } : LEGACY[e.type];
}
export const edgesOf = (id: string) => EDGES.filter(e => e.a === id || e.b === id);

export function route(sel: Sel | null): { edges: Set<string>; nodes: Set<string> } {
  const edges = new Set<string>(); const nodes = new Set<string>();
  if (!sel) return { edges, nodes };
  if (sel.k === 'edge') { edges.add(sel.id); const e = edgeOf(sel.id); if (e && SPEC.includes(e.a as Asset)) edges.add('predictions-bettex'); }
  else { EDGES.forEach(e => { if (e.a === sel.id || e.b === sel.id) edges.add(e.id); }); if (SPEC.includes(sel.id as Asset)) edges.add('predictions-bettex'); }
  EDGES.forEach(e => { if (edges.has(e.id)) { nodes.add(e.a); nodes.add(e.b); } });
  if (sel.k === 'node') nodes.add(sel.id);
  return { edges, nodes };
}

export type TabSpec = { tab: TabId; id?: string };
const FLOW_NODES = new Set(['treasury', 'reconciliation', 'tokenomics', 'participation', 'settlement', 'buyback', 'burn', 'dashboard', 'history']);
const FLOW_EDGES = new Set(['tokenomics-treasury', 'tokenomics-participation', 'reconciliation-settlement', 'settlement-treasury', 'settlement-participation', 'settlement-buyback', 'buyback-burn', 'burn-history', 'history-dashboard', 'dashboard-community']);

function baseTabs(sel: Sel): TabSpec[] {
  if (sel.k === 'node') {
    const id = sel.id;
    if (isBiz(id)) return [{ tab: 'topic', id }];
    if (id === 'bettex') return [{ tab: 'overview' }, { tab: 'agent', id }, { tab: 'requests' }];
    if (id === 'predictions') return [{ tab: 'agent', id }, { tab: 'forecast' }, { tab: 'requests' }];
    if (SPEC.includes(id as Asset)) return [{ tab: 'agent', id }, { tab: 'forecast' }, { tab: 'requests', id }];
    if (id === 'execution' || id === 'reconciliation') return [{ tab: 'control', id }, { tab: 'execution' }];
    if (CONTROLS.includes(id)) return [{ tab: 'control', id }, { tab: 'capital' }];
    return [{ tab: id === 'records' ? 'requests' : id === 'capital' ? 'capital' : id === 'execrec' ? 'execution' : 'markets' }];
  }
  const e = edgeOf(sel.id);
  if (!e) return [{ tab: 'links' }];
  if (e.biz) return [{ tab: 'links', id: e.id }];
  if (SPEC.includes(e.a as Asset)) return [{ tab: 'requests', id: e.a }, { tab: 'agent', id: e.a }, { tab: 'forecast' }];
  if (e.id === 'predictions-bettex') return [{ tab: 'requests' }, { tab: 'agent', id: 'predictions' }];
  if (e.type === 'control') return e.b === 'execution' || e.b === 'reconciliation' ? [{ tab: 'control', id: e.b }, { tab: 'execution' }] : [{ tab: 'control', id: e.b }, { tab: 'capital' }];
  return baseTabs({ k: 'node', id: e.b });
}
export function tabsFor(sel: Sel): TabSpec[] {
  const t = baseTabs(sel);
  if (sel.k === 'node') {
    if ((sel.id === 'bettex' || sel.id === 'governance') && topicOf(sel.id)) t.push({ tab: 'topic', id: sel.id });
    if (FLOW_NODES.has(sel.id) && !t.some(s => s.tab === 'flow')) t.push({ tab: 'flow', id: sel.id });
    t.push({ tab: 'links', id: sel.id });
  } else {
    const e = edgeOf(sel.id);
    if (e && FLOW_EDGES.has(e.id)) t.push({ tab: 'flow', id: e.id });
    if (e && !e.biz) t.push({ tab: 'links', id: e.id });
  }
  return t;
}

export const TAB_LABEL: Record<TabId, T3> = {
  overview: ['Resumo e mandatos', 'Summary and mandates', 'Resumen y mandatos'], agent: ['Raciocínio e relatórios', 'Reasoning and reports', 'Razonamiento e informes'],
  forecast: ['Previsão Allora', 'Allora forecast', 'Previsión Allora'], requests: ['Pedidos e decisões', 'Requests and decisions', 'Pedidos y decisiones'],
  capital: ['Capital e política', 'Capital and policy', 'Capital y política'], execution: ['Ordens e posições', 'Orders and positions', 'Órdenes y posiciones'],
  markets: ['Mercados', 'Markets', 'Mercados'], control: ['Política de controle', 'Control policy', 'Política de control'],
  topic: ['Regras e documentação', 'Rules and documentation', 'Reglas y documentación'], flow: ['Fluxo e valores', 'Flow and values', 'Flujo y valores'],
  links: ['Conexões e leitura', 'Connections and reading', 'Conexiones y lectura'],
};

export const SCENE_Z: Record<string, number> = {
  bettex: 0, predictions: -80, btc: 90, eth: -40, sol: 110, governance: -120, risk: 80, treasury: -60, execution: 100, reconciliation: -110, records: -90, capital: 70, execrec: 80, markets: -100,
  community: -70, tokenomics: 90, games: -110, participation: 60, settlement: -30, buyback: 100, burn: -90, history: 70, dashboard: -80, roadmap: 50, s0: -260, s1: -300, s2: -250,
};

/** Six public documentation chapters. Ids are the existing anchors in WhitepaperChapters.tsx. */
export type Chapter = { id: string; title: T3; text: T3 };
export const CHAPTERS: Chapter[] = [
  { id: 'documentacao-como-funciona', title: ['Visão do projeto', 'Project vision', 'Visión del proyecto'], text: ['Comunidade aberta, propósito e o agente BETTEX.', 'Open community, purpose and the BETTEX agent.', 'Comunidad abierta, propósito y el agente BETTEX.'] },
  { id: 'documentacao-agentes', title: ['Agente e mercados', 'Agent and markets', 'Agente y mercados'], text: ['BETTEX, Cripto com BTC/ETH/SOL, controles, recompra e queima.', 'BETTEX, Crypto with BTC/ETH/SOL, controls, buyback and burn.', 'BETTEX, Cripto con BTC/ETH/SOL, controles, recompra y quema.'] },
  { id: 'documentacao-emissao', title: ['Tokenomics', 'Tokenomics', 'Tokenomics'], text: ['1 bilhão, alocações, mint previsto e vesting.', '1 billion, allocations, forecast mint and vesting.', '1.000 millones, asignaciones, mint previsto y vesting.'] },
  { id: 'documentacao-staking', title: ['Participação e resultados', 'Participation and results', 'Participación y resultados'], text: ['Elegibilidade, rodadas, rateio condicional e carteiras.', 'Eligibility, rounds, conditional split and wallets.', 'Elegibilidad, rondas, reparto condicional y carteras.'] },
  { id: 'documentacao-roadmap', title: ['Roadmap', 'Roadmap', 'Roadmap'], text: ['Previsões, redes em avaliação e mercados futuros.', 'Forecasts, networks under evaluation and future markets.', 'Previsiones, redes en evaluación y mercados futuros.'] },
  { id: 'documentacao-riscos', title: ['Administração, segurança e riscos', 'Administration, security and risks', 'Administración, seguridad y riesgos'], text: ['Administração dos fundadores, multisig, controles e riscos.', 'Founder administration, multisig, controls and risks.', 'Administración de los fundadores, multisig, controles y riesgos.'] },
];
export const chapterOf = (id: string) => CHAPTERS.find(c => c.id === id);
const NODE_CHAPTER: Record<string, string[]> = {
  predictions: ['documentacao-agentes'], btc: ['documentacao-agentes'], eth: ['documentacao-agentes'], sol: ['documentacao-agentes'],
  treasury: ['documentacao-agentes', 'documentacao-riscos'], risk: ['documentacao-riscos'], execution: ['documentacao-riscos'], reconciliation: ['documentacao-riscos'],
  records: ['documentacao-agentes'], capital: ['documentacao-riscos'], execrec: ['documentacao-agentes'], markets: ['documentacao-agentes'],
  s0: ['documentacao-roadmap'], s1: ['documentacao-roadmap'], s2: ['documentacao-roadmap'],
};
export function chaptersFor(sel: Sel): string[] {
  const ids = sel.k === 'node' ? [sel.id] : (() => { const e = edgeOf(sel.id); return e ? [e.a, e.b] : []; })();
  const out = new Set<string>();
  ids.forEach(i => { const t = topicOf(i); if (t) out.add(t.chapter); (NODE_CHAPTER[i] ?? []).forEach(c => out.add(c)); });
  return CHAPTERS.map(c => c.id).filter(c => out.has(c));
}

/** URL selection: ?node=<id> or ?edge=<id>. Unknown values are ignored. */
export function parseSel(search: string): Sel | null {
  const q = new URLSearchParams(search);
  const n = q.get('node'); if (n && hasNode(n)) { return nodeOf(n).kind === 'soon' ? null : { k: 'node', id: n }; }
  const e = q.get('edge'); if (e && edgeOf(e)) return { k: 'edge', id: e };
  return null;
}
export function selQuery(sel: Sel | null): string { return sel ? `${sel.k}=${encodeURIComponent(sel.id)}` : ''; }
const SEL_KEY = 'bettex-central-selection';
export function rememberSel(sel: Sel | null) { try { if (sel) sessionStorage.setItem(SEL_KEY, JSON.stringify(sel)); else sessionStorage.removeItem(SEL_KEY); } catch { /* storage unavailable */ } }
export function recalledSel(): Sel | null {
  try { const v = JSON.parse(sessionStorage.getItem(SEL_KEY) ?? 'null') as Sel | null; return v && typeof v.id === 'string' && (v.k === 'node' || v.k === 'edge') ? parseSel(`?${selQuery(v)}`) : null; } catch { return null; }
}

type Loc = 'pt' | 'en' | 'es';
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
/** Same-tab, language-aware link to a documentation chapter anchor. */
export const docHref = (chapter: string, loc: Loc) => `${BASE}${loc === 'pt' ? '/documentacao' : loc === 'en' ? '/en/documentation' : '/es/documentacion'}#${chapter}`;
/** Language-aware route for the app area a topic is read in (wallet is the History area). */
export function topicHref(t: ProjectTopic, loc: Loc): string {
  const view: DemoView = t.app === 'wallet' ? 'wallet' : t.app;
  return `${demoPath(view, loc)}${t.query ?? ''}${t.hash ?? ''}`;
}
