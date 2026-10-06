/** @jsxImportSource react */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Coins, Gift, Landmark, Radar, Scale, ScrollText, ShieldAlert, Trophy, Waypoints, Workflow, GitCompareArrows, CircleDollarSign, TriangleAlert, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, type LucideIcon } from 'lucide-react';
import { Link } from 'wouter';
import { useGetAgentCenter, getGetAgentCenterQueryKey, type AgentRun, type AgentWorker, type GetAgentCenterParams } from '@workspace/api-client-react';
import { useFmt, dec6 } from '@/components/alpha-trading/format';
import { demoPath } from '@/components/demo/demo-navigation';
import { Help } from './AgentHelp';
import { AgentReasoningPanel } from './AgentReasoningPanel';
import { AGENT, FINDING, FACT, INPUT, OUTPUT, RULE, PERM, STATUS, DECISION, ACTIVITY, type T3 } from './copy';

const ICON: Record<string, LucideIcon> = { bettex: Workflow, treasury: Landmark, governance: ScrollText, risk: ShieldAlert, execution: Waypoints, reconciliation: GitCompareArrows, predictions: Radar, btc: CircleDollarSign, eth: Coins, sol: Scale, sports: Trophy, crypto: Bot, bonus: Gift };
const FORECAST = ['btc', 'eth', 'sol'];
const tone = (s: string) => s === 'healthy' || s === 'running' ? 'border-[#0E7C6B]/40 bg-[#E3F1EC] text-[#0A6657]' : s === 'failed' ? 'border-[#B3392A]/40 bg-[#F8E5E1] text-[#8E2A1D]' : 'border-[#C9922A]/50 bg-[#FBF0D6] text-[#7A5410]';
const safeUrl = (u: string) => /^https?:\/\//i.test(u) ? u : null;

export function AgentOperationsDashboard({ compact = false }: { compact?: boolean }) {
  const f = useFmt(); const { x, loc } = f;
  const L = (t: T3 | undefined, raw: string) => t ? t[loc === 'pt' ? 0 : loc === 'en' ? 1 : 2] : x('Item não catalogado', 'Uncataloged item', 'Elemento no catalogado') + ` (${raw})`;
  const [sel, setSel] = useState<string>('bettex');
  const detailRef = useRef<HTMLDivElement>(null);
  const [selectionRequest, setSelectionRequest] = useState(0);
  const [stack, setStack] = useState<string[]>([]);
  const [act, setAct] = useState(''); const [q, setQ] = useState('');
  const before = stack[stack.length - 1];
  const params: GetAgentCenterParams = { ...(sel && !compact ? { agentId: sel } : {}), ...(before && !compact ? { before } : {}) };
  const qr = useGetAgentCenter(params, { query: { queryKey: getGetAgentCenterQueryKey(params), refetchInterval: before ? false : 15000, retry: 1, placeholderData: p => p } });
  // A failed refresh must not freeze a cached receipt at "20 seconds ago" forever.
  const asOf = qr.data ? Date.parse(qr.data.asOf) + (qr.dataUpdatedAt ? Math.max(0, Date.now() - qr.dataUpdatedAt) : 0) : 0;
  const d = qr.data ? { ...qr.data, agents: qr.data.agents.map(a => a.latest && asOf - Date.parse(a.latest.completedAt) > 180000 ? { ...a, activity: 'stale' as const } : a) } : undefined;
  useEffect(() => setStack([]), [sel]);
  const age = (iso: string) => { const s = Math.max(0, Math.round((asOf - Date.parse(iso)) / 1000)); return s < 60 ? `${s} s` : s < 3600 ? `${Math.floor(s / 60)} min` : `${Math.floor(s / 3600)} h`; };
  const agents = useMemo(() => (d?.agents ?? []).filter(a => (!act || a.activity === act) && (!q || L(AGENT[a.id]?.name, a.id).toLowerCase().includes(q.toLowerCase()))), [d, act, q, loc]); // eslint-disable-line react-hooks/exhaustive-deps
  const selected = d?.agents.find(a => a.id === sel);
  useEffect(() => {
    if (compact || !selectionRequest || !selected || !window.matchMedia('(max-width: 1023px)').matches) return;
    // The selection changes the query and panel height; scroll after its committed layout.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }));
    });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, [compact, selectionRequest, selected?.id]);
  const name = (id: string) => L(AGENT[id]?.name, id);
  const factText = (c: string, v: string) => c === 'forecast_usd' && Number.isFinite(Number(v)) ? Number(v).toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : /_usdc_units$/.test(c) && /^-?\d+$/.test(v) ? dec6(v, loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES') : c === 'reconciled' ? (v === 'true' || v === '1' ? x('sim', 'yes', 'sí') : x('não', 'no', 'no')) : v;
  const modeNote = x('Somente leitura e simulação, sem dinheiro real. As verificações por regras continuam separadas; a análise por IA, gerada sob demanda, usa um modelo de linguagem real.', 'Read-only and paper mode, no real money. Rule checks remain separate; AI analysis, generated on request, uses a real language model.', 'Solo lectura y simulación, sin dinero real. Las verificaciones por reglas siguen separadas; el análisis por IA, generado a pedido, usa un modelo de lenguaje real.');

  const Badge = ({ s, t }: { s: string; t: T3 | undefined }) => <span className={`inline-flex min-h-6 items-center rounded-full border px-2 text-[11px] font-bold ${tone(s)}`}>{L(t, s)}</span>;
  const card = 'rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4';

  const RunBody = ({ r }: { r: AgentRun }) => <div className="text-sm">
    <dl className="mb-2 grid gap-1 text-xs" data-testid={`run-refs-${r.id}`}>
      <div><dt className="inline text-[#5B6B85]">{x('Ciclo', 'Cycle', 'Ciclo')}: </dt><dd className="mono inline break-all font-bold">{r.cycleId}</dd></div>
      <div><dt className="inline text-[#5B6B85]">{x('Execuções de origem', 'Upstream runs', 'Ejecuciones de origen')}: </dt>{r.upstreamRunIds.length === 0 ? <dd className="inline">{x('nenhuma', 'none', 'ninguna')}</dd> : <dd className="mono mt-0.5 grid gap-0.5 break-all font-bold">{r.upstreamRunIds.map(id => <span key={id}>{id}</span>)}</dd>}</div>
    </dl>
    {r.findings.length > 0 && <ul className="mt-2 list-disc pl-5">{r.findings.map(c => <li key={c}>{L(FINDING[c], c)}</li>)}</ul>}
    {r.facts.length > 0 && <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:grid-cols-3">{r.facts.map(k => <div key={k.code} className="min-w-0"><dt className="text-[#5B6B85]">{L(FACT[k.code], k.code)}</dt><dd className="mono break-words font-bold">{factText(k.code, k.value)}</dd></div>)}</dl>}
    {r.evidence.length > 0 && <p className="mt-2 text-xs font-bold">{x('Evidência de origem', 'Source evidence', 'Evidencia de origen')} <Help label={x('Sobre a evidência histórica', 'About historical evidence', 'Sobre la evidencia histórica')}>{x('Cada item é o dado exato visto no momento do ciclo, com fonte e horários. Execuções antigas mantêm o valor original e não são recalculadas.', 'Each item is the exact data seen when the cycle ran, with source and times. Older runs keep the original value and are not recomputed.', 'Cada elemento es el dato exacto visto cuando corrió el ciclo, con fuente y horarios. Las ejecuciones antiguas conservan el valor original y no se recalculan.')}</Help></p>}
    {r.evidence.length > 0 && <ul className="mt-2 grid gap-1 text-xs">{r.evidence.map((e, i) => { const u = safeUrl(e.url); const mk = e.unit === 'market'; return <li key={i} className="break-words rounded-lg border border-[#E4DCCB] bg-[#FFFCF6] p-2">
      {mk ? <><span className="text-[#5B6B85]">{x('Título original do mercado de origem', 'Original source market title', 'Título original del mercado de origen')}:</span> <span className="font-bold">{e.value}</span></> : <span className="font-bold">{e.unit === 'USD' ? factText('forecast_usd', e.value) : e.value} {e.unit}</span>}
      {e.blockHeight && <> · {x('bloco', 'block', 'bloque')} <span className="mono">{e.blockHeight}</span></>}
      {(e.producedAt || e.targetAt) && <><br />{e.producedAt && <>{x('produzido', 'produced', 'producido')} {f.date(e.producedAt)}</>}{e.producedAt && e.targetAt && ' · '}{e.targetAt && <>{x('alvo', 'target', 'objetivo')} {f.date(e.targetAt)}</>}</>}
      <br />{u ? <a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center gap-1 font-bold text-[#0A6657] underline">{e.source}<ExternalLink className="h-3 w-3" aria-hidden="true" /></a> : <span>{e.source}</span>}</li>; })}</ul>}
  </div>;

  // Render helpers return keyed elements, not new component types on each polling render.
  // This preserves focus, open history rows and contextual help during refresh.
  const RunCard = ({ r }: { r: AgentRun }) => <li key={r.id} className="rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] text-sm" data-testid={`run-${r.id}`}><details><summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-2 px-3 py-2"><b>{name(r.agentId)}</b><Badge s={r.status} t={STATUS[r.status]} /><Badge s={r.decision === 'block' ? 'failed' : r.decision === 'hold' ? 'degraded' : 'healthy'} t={DECISION[r.decision]} /><span className="text-xs text-[#5B6B85]">{f.date(r.completedAt)} · {r.durationMs} {x('ms', 'ms', 'ms')} · {r.findings.length} {x('achados', 'findings', 'hallazgos')}</span></summary><div className="px-3 pb-3">{RunBody({r})}</div></details></li>;

  const Forecast = ({ a }: { a: AgentWorker }) => {
    const r = a.latest; const e = r?.evidence.find(v => v.source.toLowerCase().startsWith('allora')); const m = r?.facts.find(k => k.code === 'markets_observed');
    return <div className="mt-2 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3 text-xs" data-testid={`forecast-${a.id}`}>
      <p className="font-bold">{x('Previsão de preço, não probabilidade de evento', 'Price forecast, not an event probability', 'Previsión de precio, no probabilidad de evento')} <Help label={x('O que é esta previsão', 'What this forecast is', 'Qué es esta previsión')}>{x('Allora publica um preço futuro em USD. Ele não diz a chance de um evento do Polymarket; isso exige um modelo de evento validado.', 'Allora publishes a future USD price. It does not give the chance of a Polymarket event; that needs a validated event model.', 'Allora publica un precio futuro en USD. No indica la probabilidad de un evento de Polymarket; eso exige un modelo de evento validado.')}</Help></p>
      {e ? <p className="mt-1 break-words">{factText('forecast_usd', e.value)} {e.unit} · {x('bloco', 'block', 'bloque')} <span className="mono">{e.blockHeight}</span> · {f.date(e.producedAt)} → {f.date(e.targetAt)}</p> : <p className="mt-1 text-[#5B6B85]">{x('Nenhuma previsão registrada.', 'No forecast recorded.', 'Ninguna previsión registrada.')}</p>}
      <p className="mt-1">{L(FACT.markets_observed, '')}: <b className="mono">{m ? m.value : x('não informado', 'not provided', 'no informado')}</b></p></div>;
  };

  const Row = ({ a }: { a: AgentWorker }) => {
    const r = a.latest; const on = sel === a.id;
    const fresh = r ? age(r.completedAt) : null; const stale = a.activity !== 'running';
    return <li key={a.id}><button type="button" onClick={() => { setSel(a.id); setSelectionRequest(n => n + 1); }} aria-pressed={on} data-testid={`agent-${a.id}`} className={`w-full rounded-xl border p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${on ? 'border-[#0E7C6B] bg-[#E3F1EC]' : 'border-[#E4DCCB] bg-[#FFFCF6] hover:bg-[#F3EFE3]'} min-h-11`}>
      <span className="flex flex-wrap items-center gap-1.5">{(() => { const I = ICON[a.id] ?? Bot; return <I className="h-4 w-4 shrink-0 text-[#0A6657]" aria-hidden="true" />; })()}<b className="text-sm">{name(a.id)}</b><Badge s={a.activity} t={ACTIVITY[a.activity]} />{r && <Badge s={r.status} t={STATUS[r.status]} />}{r && <Badge s={r.decision === 'block' ? 'failed' : r.decision === 'hold' ? 'degraded' : 'healthy'} t={DECISION[r.decision]} />}</span>
      <span className="mt-1 block text-[11px] text-[#5B6B85]">{x('Serviço: ciclo recente. Fonte/modelo: resultado da execução.', 'Service: recent cycle. Source/model: run result.', 'Servicio: ciclo reciente. Fuente/modelo: resultado de la ejecución.')}</span><span className="mt-1 block text-xs text-[#5B6B85]">{x('Último ciclo', 'Last cycle', 'Último ciclo')}: {fresh ? `${fresh} ${x('atrás', 'ago', 'atrás')}` : x('nenhum', 'none', 'ninguno')} · {a.runCount} {x('execuções', 'runs', 'ejecuciones')} · {x('a cada', 'every', 'cada')} {a.cadenceSeconds} {x('s', 's', 's')}{stale && r ? ` · ${x('fora do prazo', 'overdue', 'fuera de plazo')}` : ''}</span></button></li>;
  };

  const header = <div className="flex flex-wrap items-center gap-2"><h2 className="display text-lg font-extrabold">{x('Agentes e serviços', 'Agents and services', 'Agentes y servicios')}</h2><Help label={x('Sobre esta área', 'About this area', 'Sobre esta área')}>{modeNote} {x('Frescor do serviço mede quando o ciclo rodou. Decisão mostra se o resultado liberaria avanço; nenhum agente aqui autoriza dinheiro.', 'Service freshness measures when the cycle ran. Decision shows whether the result would allow progress; no agent here authorizes money.', 'La frescura del servicio mide cuándo corrió el ciclo. La decisión muestra si el resultado permitiría avanzar; ningún agente aquí autoriza dinero.')}</Help>
    {d && <span className="text-xs text-[#5B6B85]">{x('Atualizado', 'Updated', 'Actualizado')} {f.date(d.asOf)}</span>}<span className="ml-auto" />
    <button type="button" onClick={() => void qr.refetch()} data-testid="button-agents-refresh" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E4DCCB] px-3 text-sm font-bold"><RefreshCw className={`h-4 w-4 ${qr.isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />{x('Atualizar', 'Refresh', 'Actualizar')}</button></div>;

  if (qr.isLoading && !d) return <section className={card} aria-busy="true" aria-label={x('Carregando', 'Loading', 'Cargando')}>{header}<div className="mt-3 grid gap-2 sm:grid-cols-2">{[0, 1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-[#EFE9DA]" />)}</div></section>;
  if (qr.isError && !d) return <section role="alert" className={`${card} grid justify-items-start gap-3`}><p className="font-bold">{x('Não conseguimos carregar os agentes.', 'We could not load the agents.', 'No pudimos cargar los agentes.')}</p><button type="button" data-testid="button-agents-retry" onClick={() => void qr.refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></section>;
  if (!d) return null;

  const warn = qr.isError || qr.failureCount > 0 ? <div role="alert" data-testid="agents-refresh-warning" className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-[#B3392A]/40 bg-[#F8E5E1] p-2 text-xs font-bold text-[#8E2A1D]"><TriangleAlert className="h-4 w-4" aria-hidden="true" />{x('A atualização falhou; os dados exibidos podem estar desatualizados.', 'The refresh failed; the data shown may be out of date.', 'La actualización falló; los datos mostrados pueden estar desactualizados.')}<button type="button" onClick={() => void qr.refetch()} className="min-h-9 rounded-lg border border-[#B3392A]/40 px-2">{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div> : null;

  if (compact) {
    const counts = { running: 0, stale: 0, not_started: 0 } as Record<string, number>; d.agents.forEach(a => { counts[a.activity] = (counts[a.activity] ?? 0) + 1; });
    return <section className={card} data-testid="agent-ops-compact">{header}{warn}
      <p className="mt-2 text-xs text-[#5B6B85]">{modeNote}</p>
      <p className="mt-1 text-xs text-[#5B6B85]" data-testid="agents-ai-note">{x('A análise por IA fica no centro completo e só é gerada ao clicar.', 'AI analysis lives in the full center and is only generated when you click.', 'El análisis por IA está en el centro completo y solo se genera al hacer clic.')}</p>
      <ul className="mt-3 flex flex-wrap gap-2">{(['running', 'stale', 'not_started'] as const).map(k => <li key={k}><Badge s={k} t={ACTIVITY[k]} /> <b className="mono text-sm">{counts[k]}</b></li>)}</ul>
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">{d.agents.map(a => <li key={a.id} className="flex min-h-9 items-center justify-between gap-2 rounded-lg border border-[#E4DCCB] px-2 text-xs"><span className="font-bold">{name(a.id)}</span><span className="text-[#5B6B85]">{a.latest ? age(a.latest.completedAt) : '-'}</span><span className="flex gap-1"><Badge s={a.activity} t={ACTIVITY[a.activity]} />{a.latest && <Badge s={a.latest.status} t={STATUS[a.latest.status]} />}</span></li>)}</ul>
      <Link href={demoPath('central', loc)} data-testid="link-agents-central" className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Abrir operações completas', 'Open full operations', 'Abrir operaciones completas')}<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link></section>;
  }

  const docs = (a: AgentWorker) => { const ag = AGENT[a.id]; return <div className="mt-3 grid gap-3 text-sm" data-testid={`docs-${a.id}`}>
    <p>{ag ? L(ag.role, a.id) : ''}</p>
    {ag && <div><h4 className="font-bold">{x('Passos', 'Steps', 'Pasos')}</h4><ol className="list-decimal pl-5">{ag.steps.map((s, i) => <li key={i}>{L(s, '')}</li>)}</ol></div>}
    <div className="grid gap-3 sm:grid-cols-2">
      <div><h4 className="font-bold">{x('Entradas', 'Inputs', 'Entradas')} <Help label={x('Saúde das entradas', 'Input health', 'Salud de las entradas')}>{x('A análise verifica as entradas e condições de validade do procedimento, não apenas uma resposta da fonte. Serviço recente, análise saudável e decisão são estados diferentes. Nenhum deles prova modelo calibrado ou retorno.', 'The assessment checks inputs and validity conditions of the procedure, not just a source response. Recent service activity, healthy analysis and decision are different states. None proves a calibrated model or return.', 'La evaluación comprueba las entradas y condiciones de validez del procedimiento, no solo una respuesta de la fuente. Servicio reciente, análisis saludable y decisión son estados distintos. Ninguno prueba un modelo calibrado ni un retorno.')}</Help></h4><ul className="list-disc pl-5">{a.inputs.length ? a.inputs.map(c => <li key={c}>{L(INPUT[c], c)}</li>) : <li>{x('Nenhuma', 'None', 'Ninguna')}{(a.id === 'crypto' || a.id === 'bonus') && ` (${x('nenhuma entrada configurada', 'no inputs configured', 'ninguna entrada configurada')})`}</li>}</ul></div>
      <div><h4 className="font-bold">{x('Saídas', 'Outputs', 'Salidas')}</h4><ul className="list-disc pl-5">{a.outputs.map(c => <li key={c}>{L(OUTPUT[c], c)}</li>)}</ul></div>
      <div><h4 className="font-bold">{x('Dependências', 'Dependencies', 'Dependencias')}</h4><ul className="list-disc pl-5">{a.dependencies.length ? a.dependencies.map(c => <li key={c}>{name(c)}</li>) : <li>{x('Nenhuma', 'None', 'Ninguna')}</li>}</ul></div>
      <div><h4 className="font-bold">{x('Permissões', 'Permissions', 'Permisos')}</h4><ul className="list-disc pl-5">{a.permissions.map(c => <li key={c}>{L(PERM[c], c)}</li>)}</ul></div>
    </div>
    <div><h4 className="font-bold">{x('Regras', 'Rules', 'Reglas')} <Help label={x('Regras de orquestração', 'Orchestration rules', 'Reglas de orquestación')}>{x('A rodada avalia primeiro as dependências e registra um relatório por serviço. BETTEX consolida suas dependências declaradas no mesmo ciclo. Os impedimentos aparecem nos achados e podem manter ou bloquear o avanço; não há votação nem aprovação por modelo.', 'The round evaluates dependencies first and records one report per service. BETTEX consolidates its declared dependencies in the same cycle. Obstacles appear as findings and can hold or block progress; there is no vote or model approval.', 'La ronda evalúa primero las dependencias y registra un informe por servicio. BETTEX consolida sus dependencias declaradas en el mismo ciclo. Los impedimentos aparecen como hallazgos y pueden mantener o bloquear el avance; no hay votación ni aprobación por modelo.')}</Help></h4><ul className="list-disc pl-5">{a.rules.map(c => <li key={c}>{L(RULE[c], c)}</li>)}</ul></div>
    <p><b>{x('Periodicidade', 'Cadence', 'Periodicidad')}:</b> {x('a cada', 'every', 'cada')} {a.cadenceSeconds} {x('s', 's', 's')}. {x('A leitura desta tela não inicia ciclos.', 'Reading this screen does not start cycles.', 'Leer esta pantalla no inicia ciclos.')}</p>
    <p><b>{x('Em caso de falha', 'On failure', 'En caso de fallo')}:</b> {x('fontes ou pré-requisitos ausentes geram achados e podem degradar ou bloquear a análise. Falha de captura pode gerar relatório falho; sem persistência não existe novo recibo. A observação é tentada no próximo ciclo nominal de 60 s. Ordens financeiras incertas nunca são reenviadas automaticamente.', 'missing sources or prerequisites generate findings and may degrade or block the assessment. A snapshot failure may produce a failed report; without persistence there is no new receipt. Observation is attempted on the next nominal 60 s cycle. Uncertain financial orders are never resubmitted automatically.', 'las fuentes o requisitos ausentes generan hallazgos y pueden degradar o bloquear la evaluación. Un fallo de captura puede producir un informe fallido; sin persistencia no hay nuevo recibo. La observación se intenta en el próximo ciclo nominal de 60 s. Las órdenes financieras inciertas nunca se reenvían automáticamente.')}</p>
    <p><b>{x('Limites', 'Limits', 'Límites')}:</b> {x('a análise do serviço é determinística por regras sobre dados públicos e estado simulado, sem confiança estimada e sem ordens. A análise por IA é um recurso separado, sob demanda.', 'the service analysis is deterministic and rule-based over public data and paper state, with no estimated confidence and no orders. AI analysis is a separate on-request feature.', 'el análisis del servicio es determinista por reglas sobre datos públicos y estado simulado, sin confianza estimada ni órdenes. El análisis por IA es una función separada, a pedido.')}</p>
    <p className="rounded-xl border border-[#C9922A]/50 bg-[#FBF0D6] p-2 text-xs"><b>{x('Não é autorização financeira', 'Not a financial authorization', 'No es autorización financiera')}.</b> <Help label={x('Orçamento e bloqueio', 'Budget gating', 'Límite de presupuesto')}>{x('O servidor verifica política e orçamento simulado. Monitorar acompanha controles; manter ou bloquear indica impedimentos. Nenhuma dessas decisões reserva ou gasta fundos, nem substitui a autorização financeira.', 'The server checks policy and paper budget. Monitor observes controls; hold or block indicates obstacles. None of these decisions reserves or spends funds or replaces financial authorization.', 'El servidor comprueba la política y el presupuesto simulado. Monitorizar observa controles; mantener o bloquear indica impedimentos. Ninguna de estas decisiones reserva ni gasta fondos ni sustituye la autorización financiera.')}</Help> {x('Esta análise não assina, não move saldo e não substitui política, orçamento ou aprovação.', 'This analysis does not sign, move balances or replace policy, budget or approval.', 'Este análisis no firma, no mueve saldos y no sustituye política, presupuesto o aprobación.')} {a.executionAllowed ? '' : x('Execução permitida: não.', 'Execution allowed: no.', 'Ejecución permitida: no.')}</p>
  </div>; };

  return <section className={card} data-testid="agent-ops-full">{header}{warn}
    <p className="mt-2 text-xs text-[#5B6B85]">{modeNote}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <input type="search" value={q} onChange={e => setQ(e.target.value)} aria-label={x('Buscar agente', 'Search agent', 'Buscar agente')} placeholder={x('Buscar agente', 'Search agent', 'Buscar agente')} data-testid="input-agent-search" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm" />
      <select value={act} onChange={e => setAct(e.target.value)} aria-label={x('Frescor do serviço', 'Service freshness', 'Frescura del servicio')} data-testid="select-agent-activity" className="min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm"><option value="">{x('Todos os estados', 'All states', 'Todos los estados')}</option>{Object.keys(ACTIVITY).map(k => <option key={k} value={k}>{L(ACTIVITY[k], k)}</option>)}</select>
    </div>
    <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div>{agents.length === 0 ? <p className="rounded-xl border border-dashed border-[#E4DCCB] p-6 text-center text-sm text-[#5B6B85]">{x('Nenhum agente para estes filtros.', 'No agents for these filters.', 'Ningún agente para estos filtros.')}</p> : <ul className="grid gap-1.5">{agents.map(a => Row({a}))}</ul>}</div>
      <div className="min-w-0">
      {selected && <div ref={detailRef} className="mb-4 scroll-mt-40 rounded-xl border border-[#E4DCCB] p-3" data-testid="agent-detail">
          <div className="flex flex-wrap items-center gap-2"><h3 className="display text-base font-extrabold">{name(selected.id)}</h3><Badge s={selected.activity} t={ACTIVITY[selected.activity]} />{selected.latest && <Badge s={selected.latest.status} t={STATUS[selected.latest.status]} />}
            <Help label={x('Como ler este agente', 'How to read this agent', 'Cómo leer este agente')}>{x('Estado do serviço indica se o ciclo roda no prazo. Decisão indica se o resultado libera avanço. São coisas diferentes.', 'Service state says whether the cycle runs on time. Decision says whether the result allows progress. They are different things.', 'El estado del servicio indica si el ciclo corre a tiempo. La decisión indica si el resultado permite avanzar. Son cosas distintas.')}</Help></div>
          {selected.parentId && <p className="mt-1 text-xs text-[#5B6B85]">{x('Subordinado a', 'Reports to', 'Subordinado a')}: <b>{name(selected.parentId)}</b></p>}
          <div className="mt-2 rounded-xl border border-[#0E7C6B]/30 bg-[#F1F7F3] p-3" data-testid="latest-report"><h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0A6657]">{x('Último relatório', 'Latest report', 'Último informe')}{selected.latest ? ` · ${f.date(selected.latest.completedAt)}` : ''}</h4>{selected.latest ? RunBody({r:selected.latest}) : <p className="text-sm text-[#5B6B85]">{x('Nenhuma execução registrada ainda.', 'No runs recorded yet.', 'Ninguna ejecución registrada aún.')}</p>}</div>
          {FORECAST.includes(selected.id) && Forecast({a:selected})}
          <AgentReasoningPanel key={`${selected.id}|${loc}`} agentId={selected.id} agentName={name(selected.id)} />
          <details className="mt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-[#0A6657]">{x('Documentação do agente', 'Agent documentation', 'Documentación del agente')}</summary>{docs(selected)}</details>
        </div>}
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{x('Histórico de execuções', 'Run history', 'Historial de ejecuciones')}{sel ? ` · ${name(sel)}` : ''}</h3><Help label={x('Sobre o histórico', 'About history', 'Sobre el historial')}>{x('Registros persistidos de cada ciclo. Páginas antigas não são atualizadas automaticamente.', 'Persisted records of each cycle. Older pages are not auto-refreshed.', 'Registros persistidos de cada ciclo. Las páginas antiguas no se actualizan automáticamente.')}</Help>{before && <span className="text-xs text-[#5B6B85]">{x('página antiga, sem atualização automática', 'older page, no auto-refresh', 'página antigua, sin actualización automática')}</span>}</div>
        {sel && <button type="button" onClick={() => setSel('')} data-testid="button-history-all" className="mt-2 min-h-11 rounded-xl border border-[#E4DCCB] px-3 text-sm font-bold">{x('Histórico de todos os agentes', 'History of all agents', 'Historial de todos los agentes')}</button>}
        {qr.isPlaceholderData ? <div className="mt-2 grid gap-2" aria-busy="true">{[0, 1, 2].map(i => <div key={i} className="h-11 animate-pulse rounded-xl bg-[#EFE9DA]" />)}</div> : d.history.length === 0 ? <p className="mt-2 rounded-xl border border-dashed border-[#E4DCCB] p-6 text-center text-sm text-[#5B6B85]">{x('Nenhuma execução registrada ainda.', 'No runs recorded yet.', 'Ninguna ejecución registrada aún.')}</p> : <ul className="mt-2 grid max-h-[28rem] gap-2 overflow-y-auto pr-1">{d.history.map(r => RunCard({r}))}</ul>}
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={stack.length === 0} onClick={() => setStack(s => s.slice(0, -1))} data-testid="button-history-newer" className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40"><ChevronLeft className="h-4 w-4" aria-hidden="true" />{x('Mais recentes', 'Newer', 'Más recientes')}</button>
          <button type="button" disabled={!d.hasMore || !d.nextBefore} onClick={() => d.nextBefore && setStack(s => [...s, d.nextBefore as string])} data-testid="button-history-older" className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40">{x('Mais antigas', 'Older', 'Más antiguas')}<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>
    </div></section>;
}
