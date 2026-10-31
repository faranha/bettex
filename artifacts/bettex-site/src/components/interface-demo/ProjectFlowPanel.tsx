/** @jsxImportSource react */
import { ArrowRight, BookOpen, Check, ExternalLink, X as XIcon } from 'lucide-react';
import { Link } from 'wouter';
import type { ReactNode } from 'react';
import { useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { CAPITAL } from './central-data';
import { CHAPTERS, chaptersFor, docHref, edgeOf, edgeText, edgesOf, nodeOf, topicHref, topicOf, type Sel } from './central-graph-model';
import { PROJECT_RULES, projectSnapshot } from './demo-project-model';

type Section = 'alloc' | 'treasury' | 'gates' | 'split' | 'participation' | 'burn' | 'balances' | 'rounds';
const NODE_SECTIONS: Record<string, Section[]> = {
  tokenomics: ['alloc', 'treasury'], treasury: ['treasury', 'gates'], reconciliation: ['gates'], settlement: ['gates', 'split'], participation: ['participation', 'split'],
  buyback: ['split', 'burn'], burn: ['burn'], dashboard: ['balances', 'treasury'], history: ['rounds', 'burn'],
};
const EDGE_SECTIONS: Record<string, Section[]> = {
  'tokenomics-participation': ['alloc', 'participation'], 'tokenomics-treasury': ['alloc', 'treasury'], 'reconciliation-settlement': ['gates'],
  'settlement-treasury': ['gates', 'split'], 'settlement-participation': ['gates', 'split', 'participation'], 'settlement-buyback': ['gates', 'split', 'burn'],
  'buyback-burn': ['burn'], 'burn-history': ['burn', 'rounds'], 'history-dashboard': ['balances', 'rounds'], 'dashboard-community': ['balances'],
};

const sec = 'pf-sec';
function useMoney() {
  const { loc } = useFmt(); const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  return {
    usdc: (n: number) => `${n.toLocaleString(lc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
    num: (n: number, d = 0) => n.toLocaleString(lc, { maximumFractionDigits: d }),
    units: (v: string) => `${(Number(v) / 1e6).toLocaleString(lc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
  };
}
function Row({ k, v, note }: { k: string; v: string; note?: string }) { return <div className="pf-row"><dt>{k}</dt><dd>{v}{note && <small>{note}</small>}</dd></div>; }
function Bar({ label, value, total, tone, text }: { label: string; value: number; total: number; tone: 'c' | 'a' | 'g' | 'm'; text: string }) {
  return <li className="pf-bar"><span>{label}</span><i aria-hidden="true"><u className={tone} style={{ width: `${total > 0 ? Math.max(1, (value / total) * 100) : 0}%` }} /></i><b>{text}</b></li>;
}

function Treasury() {
  const { x } = useFmt(); const { units } = useMoney();
  return <section className={sec} data-testid="flow-treasury" aria-label={x('Tesouraria compartilhada', 'Shared Treasury', 'Tesorería compartida')}>
    <h3>{x('Tesouraria: mesmos valores de Tesouraria e Painel', 'Treasury: same values as Treasury and Dashboard', 'Tesorería: mismos valores que Tesorería y Panel')}</h3>
    <dl>
      <Row k={x('Ativos totais da tesouraria', 'Total Treasury assets', 'Activos totales de la tesorería')} v={units(CAPITAL.total)} />
      <Row k={x('Capital de trabalho', 'Working capital', 'Capital de trabajo')} v={units(CAPITAL.allocated)} note={x('total menos reserva protegida e pool', 'total minus protected reserve and pool', 'total menos reserva protegida y pool')} />
      <Row k={x('Comprometido, incluindo posições', 'Committed, including positions', 'Comprometido, incluyendo posiciones')} v={units(CAPITAL.reserved)} />
      <Row k={x('Livre do capital de trabalho', 'Free working capital', 'Libre del capital de trabajo')} v={units(CAPITAL.available)} />
      <Row k={x('Reserva protegida', 'Protected reserve', 'Reserva protegida')} v={units(CAPITAL.reserve)} />
      <Row k={x('Liquidez do pool', 'Pool liquidity', 'Liquidez del pool')} v={units(CAPITAL.pool)} note={x('já faz parte dos ativos, não somar de novo', 'already part of assets, do not add again', 'ya forma parte de los activos, no sumar de nuevo')} />
      <Row k={x('Carteira Cripto: alocado, comprometido, livre', 'Crypto wallet: allocated, committed, free', 'Cartera Cripto: asignado, comprometido, libre')} v={`${units(CAPITAL.agentAllocated)} / ${units(CAPITAL.agentCommitted)} / ${units(CAPITAL.agentAvailable)}`} />
    </dl>
    <p className="pf-note">{x('A carteira de recompra é separada e não entra como capital operacional.', 'The buyback wallet is separate and is not operating capital.', 'La cartera de recompra es separada y no entra como capital operativo.')}</p>
  </section>;
}

function Gates() {
  const { x } = useFmt(); const { usdc, num } = useMoney();
  const cur = projectSnapshot.treasury.currentRound; const last = projectSnapshot.rounds[0];
  const total = Number(CAPITAL.total), reserve = Number(CAPITAL.reserve), pool = Number(CAPITAL.pool), work = Number(CAPITAL.allocated), free = Number(CAPITAL.available);
  const weight = last?.participationSnapshot?.totalEligibleTokens ?? 0;
  const gates: { id: string; ok: boolean | null; name: string; detail: string }[] = [
    { id: 'net', ok: !!cur && cur.realizedNetUsdc > 0, name: x('Resultado líquido realizado após custos', 'Net realized result after costs', 'Resultado neto realizado tras costos'), detail: cur ? `${usdc(cur.realizedNetUsdc)} · ${x('custos de execução', 'execution costs', 'costos de ejecución')} ${usdc(cur.executionCostsUsdc ?? 0)}` : x('indisponível', 'unavailable', 'no disponible') },
    { id: 'open', ok: null, name: x('Posições abertas avaliadas', 'Open positions assessed', 'Posiciones abiertas evaluadas'), detail: cur ? `${x('não realizado', 'unrealized', 'no realizado')} ${usdc(cur.unrealizedUsdc)} · ${x('exige avaliação final e atualização das cotações', 'requires final assessment and updated quotes', 'exige evaluación final y cotizaciones actualizadas')}` : x('indisponível', 'unavailable', 'no disponible') },
    { id: 'rec', ok: cur?.coverage === 'complete', name: x('Conciliação completa', 'Reconciliation complete', 'Conciliación completa'), detail: cur?.coverage === 'complete' ? x('cobertura completa na amostra', 'complete coverage in the sample', 'cobertura completa en la muestra') : x('cobertura incompleta', 'incomplete coverage', 'cobertura incompleta') },
    { id: 'res', ok: total - reserve - pool !== work || free < 0 ? false : null, name: x('Reservas protegidas e segregadas', 'Protected, segregated reserves', 'Reservas protegidas y segregadas'), detail: `${usdc(reserve / 1e6)} · ${x('segregação demonstrada; piso administrativo a validar', 'segregation shown; administrative floor requires validation', 'segregación demostrada; piso administrativo por validar')}` },
    { id: 'liq', ok: free <= 0 ? false : null, name: x('Liquidez para obrigações e distribuição', 'Liquidity for obligations and distribution', 'Liquidez para obligaciones y distribución'), detail: `${usdc(free / 1e6)} ${x('livres; obrigações e liquidez final a validar', 'free; obligations and final liquidity require validation', 'libres; obligaciones y liquidez final por validar')}` },
    { id: 'w', ok: null, name: x('Peso elegível de participantes', 'Eligible participant weight', 'Peso elegible de participantes'), detail: `${num(weight)} BETTEX ${x('na última rodada; a atual precisa de seu próprio fechamento', 'in the last round; the current one needs its own closing snapshot', 'en la última ronda; la actual necesita su propio cierre')}` },
  ];
  const pass = gates.every(g => g.ok === true);
  return <section className={sec} data-testid="flow-gates" aria-label={x('Condições de rateio', 'Split conditions', 'Condiciones de reparto')}>
    <h3>{x('Condições para qualquer rateio', 'Conditions for any split', 'Condiciones para cualquier reparto')}</h3>
    <ul className="pf-gates">{gates.map(g => <li key={g.id} className={g.ok ? 'ok' : 'no'} data-testid={`gate-${g.id}`}><span aria-hidden="true">{g.ok == null ? '·' : g.ok ? <Check /> : <XIcon />}</span><div><b>{g.name}</b><small>{g.detail}</small></div><em>{g.ok == null ? x('pendente', 'pending', 'pendiente') : g.ok ? x('atende', 'met', 'cumple') : x('falha', 'failed', 'falla')}</em></li>)}</ul>
    <p className={`pf-verdict ${pass ? 'ok' : 'no'}`} data-testid="flow-verdict">{pass
      ? x('Todas as condições atendem na amostra: o lucro elegível da rodada seria dividido 50% / 25% / 25% no fechamento.', 'All conditions are met in the sample: the round’s eligible profit would be divided 50% / 25% / 25% at closing.', 'Todas las condiciones se cumplen en la muestra: el beneficio elegible de la ronda se dividiría 50% / 25% / 25% al cierre.')
      : x('Sem fechamento e validação de todas as condições, não há liberação de rateio. Se uma condição falhar, o resultado fica retido na tesouraria.', 'Without closing and validation of every condition, no split is released. If a condition fails, the result stays retained in the Treasury.', 'Sin cierre y validación de todas las condiciones, no se libera el reparto. Si una condición falla, el resultado queda retenido en la tesorería.')}</p>
    <p className="pf-note">{x('A rodada atual ainda não fechou; o rateio só ocorre no fechamento. Limiares de reserva e liquidez são da política administrativa e não são definidos aqui.', 'The current round has not closed; the split only happens at closing. Reserve and liquidity thresholds belong to administrative policy and are not defined here.', 'La ronda actual aún no cerró; el reparto solo ocurre al cierre. Los umbrales de reserva y liquidez pertenecen a la política administrativa y no se definen aquí.')}</p>
  </section>;
}

function Split() {
  const { x, date } = useFmt(); const { usdc } = useMoney();
  const r = projectSnapshot.rounds[0]; if (!r) return null;
  const retained = r.status === 'retained'; const sum = r.treasuryUsdc + r.stakingUsdc + r.buybackUsdc;
  const pct = (v: number) => r.eligibleUsdc > 0 ? `${(v / r.eligibleUsdc * 100).toFixed(1)}%` : '0%';
  return <section className={sec} data-testid="flow-split" aria-label={x('Último rateio concluído', 'Last completed split', 'Último reparto completado')}>
    <h3>{x('Último rateio concluído', 'Last completed split', 'Último reparto completado')} <small>{r.id} · {date(r.endedAt)}</small></h3>
    <p className="pf-total">{x('Lucro elegível', 'Eligible profit', 'Beneficio elegible')}: <b>{usdc(r.eligibleUsdc)}</b> · {retained ? x('retido, sem rateio', 'retained, no split', 'retenido, sin reparto') : x('pago', 'paid', 'pagado')}</p>
    <ul className="pf-bars">
      <Bar label={x('Tesouraria', 'Treasury', 'Tesorería')} value={r.treasuryUsdc} total={r.eligibleUsdc} tone="c" text={`${usdc(r.treasuryUsdc)} · ${pct(r.treasuryUsdc)}`} />
      <Bar label={x('Participantes', 'Participants', 'Participantes')} value={r.stakingUsdc} total={r.eligibleUsdc} tone="g" text={`${usdc(r.stakingUsdc)} · ${pct(r.stakingUsdc)}`} />
      <Bar label={x('Recompra, USDC separado', 'Buyback, separate USDC', 'Recompra, USDC separado')} value={r.buybackUsdc} total={r.eligibleUsdc} tone="a" text={`${usdc(r.buybackUsdc)} · ${pct(r.buybackUsdc)}`} />
    </ul>
    <p className="pf-note">{x('Soma das partes', 'Sum of parts', 'Suma de las partes')}: {usdc(sum)} {sum === r.eligibleUsdc ? x('= lucro elegível', '= eligible profit', '= beneficio elegible') : x('difere do lucro elegível', 'differs from eligible profit', 'difiere del beneficio elegible')}. {x('Regra: ', 'Rule: ', 'Regla: ')}{PROJECT_RULES.profit.treasury}% / {PROJECT_RULES.profit.participants}% / {PROJECT_RULES.profit.buyback}%. {x('Sem lucro elegível positivo não há rateio.', 'Without positive eligible profit there is no split.', 'Sin beneficio elegible positivo no hay reparto.')}</p>
  </section>;
}

function Participation() {
  const { x } = useFmt(); const { usdc, num } = useMoney();
  const p = projectSnapshot.rounds[0]?.participationSnapshot; const b = projectSnapshot.balances;
  return <section className={sec} data-testid="flow-participation" aria-label={x('Participação por rodada', 'Participation per round', 'Participación por ronda')}>
    <h3>{x('Participação: carteira de BETTEX e rodadas', 'Participation: BETTEX wallet and rounds', 'Participación: cartera BETTEX y rondas')}</h3>
    <dl>
      <Row k={x('BETTEX na carteira de exemplo', 'BETTEX in the sample wallet', 'BETTEX en la cartera de ejemplo')} v={num(b.bettex)} />
      {p && <Row k={x('Peso elegível da carteira / total na última rodada', 'Wallet eligible weight / total in the last round', 'Peso elegible de la cartera / total en la última ronda')} v={`${num(p.ownEligibleTokens)} / ${num(p.totalEligibleTokens)}`} note={`${num(p.payoutSharePercent, 2)}% · ${usdc(p.receivedUsdc)}`} />}
    </dl>
    <ul className="pf-rules">
      <li>{x('Quem mantém BETTEX em carteira própria entra na rodada seguinte.', 'Holding BETTEX in the holding wallet starts in the next round.', 'Quien mantiene BETTEX en cartera propia entra en la ronda siguiente.')}</li>
      <li>{x('Sair cancela os direitos ainda não pagos.', 'Exiting cancels unpaid rights.', 'Salir cancela los derechos aún no pagados.')}</li>
      <li>{x('Frações não pagas vão para a tesouraria.', 'Unpaid fractions go to the Treasury.', 'Las fracciones no pagadas van a la tesorería.')}</li>
      <li>{x('Cada rodada é única: sem acúmulo entre rodadas.', 'Each round is unique: no carry-over between rounds.', 'Cada ronda es única: sin acumulación entre rondas.')}</li>
    </ul>
  </section>;
}

function Burn() {
  const { x, date } = useFmt(); const { usdc, num } = useMoney();
  const burn = projectSnapshot.treasury.burn; if (!burn) return null;
  const last = burn.entries.find(e => e.kind === 'tokens_burned');
  return <section className={sec} data-testid="flow-burn" aria-label={x('Recompra e queima', 'Buyback and burn', 'Recompra y quema')}>
    <h3>{x('Recompra autorizada e queima permanente', 'Authorized buyback and permanent burn', 'Recompra autorizada y quema permanente')}</h3>
    <dl>
      <Row k={x('USDC acumulado na carteira de recompra', 'USDC accumulated in the buyback wallet', 'USDC acumulado en la cartera de recompra')} v={usdc(burn.walletUsdc)} note={x('pode acumular; não há compra diária automática', 'may accumulate; there is no automatic daily purchase', 'puede acumular; no hay compra diaria automática')} />
      <Row k={x('BETTEX adquirido aguardando queima', 'Acquired BETTEX awaiting burn', 'BETTEX adquirido pendiente de quema')} v={num(burn.walletBettex)} note={x('estoque, ainda não queimado', 'inventory, not burned yet', 'inventario, aún no quemado')} />
      <Row k={x('Total queimado acumulado', 'Cumulative burned', 'Total quemado acumulado')} v={`${num(burn.totalBurnedBettex)} BETTEX`} note={x('queima permanente', 'permanent burn', 'quema permanente')} />
      {last && <Row k={x('Última queima registrada', 'Last recorded burn', 'Última quema registrada')} v={`${num(last.tokensBettex)} BETTEX`} note={`${last.roundId} · ${date(last.at)}`} />}
    </dl>
    <p className="pf-note">{x('Toda a BETTEX adquirida pela recompra é queimada permanentemente. A recompra tem autorização administrativa e multisig própria, separada da execução dos mandatos. Valores de demonstração ilustrativa.', 'All BETTEX acquired by the buyback is burned permanently. The buyback has its own administrative and multisig authorization, separate from mandate execution. Illustrative demo values.', 'Todo el BETTEX adquirido por la recompra se quema de forma permanente. La recompra tiene autorización administrativa y multisig propia, separada de la ejecución de mandatos. Valores de demostración ilustrativa.')}</p>
  </section>;
}

function Balances() {
  const { x } = useFmt(); const { usdc, num } = useMoney(); const b = projectSnapshot.balances;
  return <section className={sec} data-testid="flow-balances" aria-label={x('Saldos de carteira', 'Wallet balances', 'Saldos de cartera')}>
    <h3>{x('Carteiras do painel', 'Dashboard wallets', 'Carteras del panel')}</h3>
    <dl>
      <Row k={x('Carteira de dólares (USDC)', 'Dollar wallet (USDC)', 'Cartera de dólares (USDC)')} v={usdc(b.usdc)} />
      <Row k="BETTEX" v={num(b.bettex)} note={`${usdc(b.bettex * b.bettexUsdc)} ${x('a preço de referência', 'at reference price', 'a precio de referencia')}`} />
      <Row k={x('Rendimentos recebidos', 'Earnings received', 'Rendimientos recibidos')} v={usdc(b.receivedYield)} note={x('carteira de rendimentos, separada', 'earnings wallet, separate', 'cartera de rendimientos, separada')} />
    </dl>
    <p className="pf-note">{x('Pedido pendente ou falho não altera saldo. Valores em BRL são estimativas de referência.', 'A pending or failed request does not change balances. BRL values are reference estimates.', 'Un pedido pendiente o fallido no altera saldos. Los valores en BRL son estimaciones de referencia.')}</p>
  </section>;
}

function Rounds() {
  const { x } = useFmt(); const { usdc } = useMoney();
  return <section className={sec} data-testid="flow-rounds" aria-label={x('Rodadas recentes', 'Recent rounds', 'Rondas recientes')}>
    <h3>{x('Rodadas recentes no Histórico', 'Recent rounds in History', 'Rondas recientes en el Historial')}</h3>
    <ul className="pf-rounds">{projectSnapshot.rounds.slice(0, 5).map(r => <li key={r.id}><b>{r.id}</b><span>{r.status === 'paid' ? x('paga', 'paid', 'pagada') : x('retida', 'retained', 'retenida')}</span><em>{usdc(r.eligibleUsdc)}</em></li>)}</ul>
  </section>;
}

function Alloc() {
  const { x } = useFmt(); const { num } = useMoney(); const a = PROJECT_RULES.allocations;
  const rows: [string, number, 'c' | 'g' | 'a' | 'm'][] = [[x('Mint inicial', 'Initial mint', 'Mint inicial'), a.mint, 'm'], [x('Comunidade', 'Community', 'Comunidad'), a.community, 'g'], [x('Fundador e equipe', 'Founder and team', 'Fundador y equipo'), a.team, 'c'], [x('Investidores', 'Investors', 'Inversores'), a.investors, 'a']];
  return <section className={sec} data-testid="flow-alloc" aria-label={x('Distribuição do token', 'Token allocation', 'Distribución del token')}>
    <h3>{x('Token comunitário: 1 bilhão de BETTEX', 'Community token: 1 billion BETTEX', 'Token comunitario: 1.000 millones de BETTEX')}</h3>
    <ul className="pf-bars">{rows.map(([l, v, t]) => <Bar key={l} label={l} value={v} total={100} tone={t} text={`${v}% · ${num(PROJECT_RULES.supply * v / 100)}`} />)}</ul>
    <p className="pf-note">{x('Mint previsto para 10 de dezembro de 2026; sistema/ALFA e vesting de 24 meses previstos para março de 2027. São previsões. Nenhuma rede de lançamento foi escolhida: Starknet e Arbitrum One estão em avaliação, sem subsídio, parceria ou integração afirmados.', 'Mint forecast for December 10, 2026; system/ALFA and 24-month vesting forecast for March 2027. These are forecasts. No launch network has been chosen: Starknet and Arbitrum One are under evaluation, with no grant, partnership or integration asserted.', 'Mint previsto para el 10 de diciembre de 2026; sistema/ALFA y vesting de 24 meses previstos para marzo de 2027. Son previsiones. No se eligió red de lanzamiento: Starknet y Arbitrum One están en evaluación, sin subvención, alianza ni integración afirmadas.')}</p>
  </section>;
}

export function ProjectFlowPanel({ sel }: { sel: Sel }) {
  const { x } = useFmt();
  const list = sel.k === 'node' ? NODE_SECTIONS[sel.id] ?? [] : EDGE_SECTIONS[sel.id] ?? [];
  const parts: Record<Section, ReactNode> = { alloc: <Alloc key="alloc" />, treasury: <Treasury key="treasury" />, gates: <Gates key="gates" />, split: <Split key="split" />, participation: <Participation key="participation" />, burn: <Burn key="burn" />, balances: <Balances key="balances" />, rounds: <Rounds key="rounds" /> };
  return <div className="pf" data-testid="project-flow">
    <p className="pf-lede">{x('Valores lidos do mesmo retrato ilustrativo usado por Painel, Tesouraria e Histórico. Nada aqui executa operação.', 'Values read from the same illustrative snapshot used by Dashboard, Treasury and History. Nothing here executes an operation.', 'Valores leídos del mismo retrato ilustrativo que usan Panel, Tesorería e Historial. Nada aquí ejecuta operaciones.')}</p>
    {list.map(s => parts[s])}
  </div>;
}

function ChaptersMap({ sel }: { sel: Sel }) {
  const { x, loc } = useFmt(); const L = useL(); const mine = chaptersFor(sel);
  return <section className={sec} data-testid="chapters-map" aria-label={x('Capítulos da documentação', 'Documentation chapters', 'Capítulos de la documentación')}>
    <h3><BookOpen aria-hidden="true" />{x('Os seis capítulos da documentação', 'The six documentation chapters', 'Los seis capítulos de la documentación')}</h3>
    <ol className="pf-chapters">{CHAPTERS.map((c, i) => <li key={c.id} className={mine.includes(c.id) ? 'on' : ''}>
      <a href={docHref(c.id, loc)} data-demo-local data-testid={`doc-${c.id}`} aria-current={mine.includes(c.id) ? 'true' : undefined}><span className="n">{i + 1}</span><span><b>{L(c.title)}</b><small>{L(c.text)}</small></span><ExternalLink aria-hidden="true" /></a></li>)}</ol>
    <p className="pf-note">{x('Os capítulos em destaque explicam esta seleção. Os links abrem a documentação na mesma aba.', 'Highlighted chapters explain this selection. Links open the documentation in the same tab.', 'Los capítulos destacados explican esta selección. Los enlaces abren la documentación en la misma pestaña.')}</p>
  </section>;
}

export function ProjectTopicPanel({ id, onPick }: { id: string; onPick: (s: Sel) => void }) {
  const { x, loc } = useFmt(); const L = useL(); const t = topicOf(id);
  if (!t) return null;
  const sel: Sel = { k: 'node', id };
  return <div className="pf" data-testid="project-topic">
    <section className={sec}>
      <p className="pf-lede">{L(t.summary)}</p>
      <ul className="pf-rules" data-testid="topic-rules">{t.rules.map((r, i) => <li key={i}>{L(r)}</li>)}</ul>
      <div className="pf-links">
        <Link href={topicHref(t, loc)} data-demo-local data-testid={`topic-open-${id}`} className="pf-btn">{x('Ler na área do app', 'Read in the app area', 'Leer en el área de la app')}<ArrowRight aria-hidden="true" /></Link>
        <a href={docHref(t.chapter, loc)} data-demo-local data-testid={`topic-doc-${id}`} className="pf-btn alt">{x('Capítulo da documentação', 'Documentation chapter', 'Capítulo de la documentación')}<BookOpen aria-hidden="true" /></a>
      </div>
    </section>
    <ConnectionList sel={sel} onPick={onPick} />
    <ChaptersMap sel={sel} />
  </div>;
}

function ConnectionList({ sel, onPick }: { sel: Sel; onPick: (s: Sel) => void }) {
  const { x } = useFmt(); const L = useL();
  if (sel.k !== 'node') return null;
  const list = edgesOf(sel.id);
  return <section className={sec} data-testid="connection-list" aria-label={x('Conexões direcionais', 'Directional connections', 'Conexiones direccionales')}>
    <h3>{x('Conexões direcionais', 'Directional connections', 'Conexiones direccionales')}</h3>
    <ul className="pf-conn">{list.map(e => { const out = e.a === sel.id; const other = nodeOf(out ? e.b : e.a); const tx = edgeText(e);
      return <li key={e.id}><button type="button" data-demo-local data-testid={`conn-${e.id}`} onClick={() => onPick({ k: 'edge', id: e.id })}>
        <span className="dir">{out ? x('sai para', 'goes to', 'va a') : x('chega de', 'comes from', 'viene de')}</span><b>{L(other.name)}</b>{e.planned && <em>{x('planejado', 'planned', 'planificado')}</em>}<small>{L(tx.label)}: {L(tx.condition)}</small></button></li>; })}</ul>
  </section>;
}

export function ProjectLinksPanel({ sel, onPick }: { sel: Sel; onPick: (s: Sel) => void }) {
  const { x, loc } = useFmt(); const L = useL();
  if (sel.k === 'node') return <div className="pf" data-testid="project-links"><ConnectionList sel={sel} onPick={onPick} /><ChaptersMap sel={sel} /></div>;
  const e = edgeOf(sel.id); if (!e) return null; const tx = edgeText(e); const A = nodeOf(e.a), B = nodeOf(e.b);
  const ta = topicOf(e.a), tb = topicOf(e.b);
  const end = (n: typeof A, t: ReturnType<typeof topicOf>, role: string) => <li key={n.id}>
    <button type="button" data-demo-local data-testid={`edge-end-${n.id}`} disabled={n.kind === 'soon'} onClick={() => onPick({ k: 'node', id: n.id })}><span className="dir">{role}</span><b>{L(n.name)}</b><small>{t ? L(t.summary) : L(n.sub)}</small></button>
    {t && <Link href={topicHref(t, loc)} data-demo-local className="pf-mini" data-testid={`edge-read-${n.id}`}>{x('Ler na área do app', 'Read in the app area', 'Leer en el área de la app')}</Link>}</li>;
  return <div className="pf" data-testid="project-links">
    <section className={sec}>
      <p className="pf-dirline" data-testid="edge-direction"><b>{L(A.name)}</b><ArrowRight aria-hidden="true" /><b>{L(B.name)}</b></p>
      <p className="pf-lede" data-testid="edge-label">{L(tx.label)}</p>
      <p className="pf-cond" data-testid="edge-condition"><span>{x('Condição', 'Condition', 'Condición')}</span>{L(tx.condition)}</p>
      {e.planned && <p className="pf-note" data-testid="edge-planned">{x('Relação planejada, tracejada na cena. O mercado de destino permanece desativado como agente operacional.', 'Planned relation, dashed in the scene. The target market stays disabled as an operating agent.', 'Relación planificada, discontinua en la escena. El mercado de destino sigue desactivado como agente operativo.')}</p>}
      <ul className="pf-conn">{end(A, ta, x('origem', 'from', 'origen'))}{end(B, tb, x('destino', 'to', 'destino'))}</ul>
    </section>
    <ChaptersMap sel={sel} />
  </div>;
}
