/** @jsxImportSource react */
import { useMemo, useState } from 'react';
import { Bot, ChevronLeft, ChevronRight, CircleDollarSign, Coins, GitCompareArrows, Landmark, Radar, RefreshCw, Scale, ScrollText, ShieldAlert, Sparkles, Waypoints, Workflow, type LucideIcon } from 'lucide-react';
import { useFmt, dec6 } from '../alpha-trading/format';
import { Help } from '../agent-operations/AgentHelp';
import { AGENT, FINDING, FACT, INPUT, OUTPUT, RULE, PERM, STATUS, DECISION, ACTIVITY } from '../agent-operations/copy';
import { defaultSelection, scopeItems, type OpsScope } from '../agent-operations/roles';
import { AGENTS, REASONING, REASONING_PROVENANCE, SAMPLE_PROVENANCE, FORECASTS, type Run, type Agent, type T3, type Asset } from './central-data';

const ICON: Record<string, LucideIcon> = { bettex: Workflow, treasury: Landmark, governance: ScrollText, risk: ShieldAlert, execution: Waypoints, reconciliation: GitCompareArrows, predictions: Radar, btc: CircleDollarSign, eth: Coins, sol: Scale };
const tone = (s: string) => s === 'healthy' || s === 'running' ? 'border-[#0E7C6B]/40 bg-[#E3F1EC] text-[#0A6657]' : s === 'failed' ? 'border-[#B3392A]/40 bg-[#F8E5E1] text-[#8E2A1D]' : 'border-[#C9922A]/50 bg-[#FBF0D6] text-[#7A5410]';
const PAGE = 2;
type Props = { scope: OpsScope; onAction: () => void };

export function useL() { const { loc } = useFmt(); return (t: T3 | undefined) => t ? t[loc === 'pt' ? 0 : loc === 'en' ? 1 : 2] : ''; }

export function CentralAgents({ scope, onAction }: Props) {
  const f = useFmt(); const { x, loc } = f; const L = useL();
  const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const [sel, setSel] = useState(defaultSelection(scope));
  const [page, setPage] = useState(0);
  const [act, setAct] = useState(''); const [q, setQ] = useState('');
  const isOrch = scope === 'orchestrator'; const isCtl = scope === 'controls';
  const name = (id: string) => L(AGENT[id]?.name);
  const list = useMemo(() => scopeItems(scope, AGENTS).filter(a => (!act || a.activity === act) && (!q || L(AGENT[a.id]?.name).toLowerCase().includes(q.toLowerCase()))), [scope, act, q, loc]); // eslint-disable-line react-hooks/exhaustive-deps
  const selected = scopeItems(scope, AGENTS).find(a => a.id === sel);
  const age = (iso: string) => { const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000)); return s < 60 ? `${s} s` : s < 3600 ? `${Math.floor(s / 60)} min` : `${Math.floor(s / 3600)} h`; };
  const Badge = ({ s, t }: { s: string; t: T3 | undefined }) => <span className={`inline-flex min-h-6 items-center rounded-full border px-2 text-[11px] font-bold ${tone(s)}`}>{L(t)}</span>;
  const dTone = (r: Run) => r.decision === 'block' ? 'failed' : r.decision === 'hold' ? 'degraded' : 'healthy';
  const factText = (c: string, v: string) => c === 'forecast_usd' ? Number(v).toLocaleString(lc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : /_units$/.test(c) ? dec6(v, lc) : v;
  const known = (m: Record<string, T3>, ks: string[]) => ks.filter(k => m[k]);

  const RunBody = (r: Run) => <div className="text-sm">
    <dl className="mb-2 grid gap-1 text-xs" data-testid={`run-refs-${r.id}`}>
      <div><dt className="inline text-[#5B6B85]">{x('Ciclo', 'Cycle', 'Ciclo')}: </dt><dd className="mono inline break-all font-bold">{r.cycleId}</dd></div>
      <div><dt className="inline text-[#5B6B85]">{x('Execuções de origem', 'Upstream runs', 'Ejecuciones de origen')}: </dt>{r.upstreamRunIds.length === 0 ? <dd className="inline">{x('nenhuma', 'none', 'ninguna')}</dd> : <dd className="mono mt-0.5 grid gap-0.5 break-all font-bold">{r.upstreamRunIds.map(id => <span key={id}>{id}</span>)}</dd>}</div>
    </dl>
    <ul className="mt-2 list-disc pl-5">{r.findings.map(c => <li key={c}>{L(FINDING[c]) || c}</li>)}</ul>
    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:grid-cols-3">{r.facts.map(k => <div key={k.code} className="min-w-0"><dt className="text-[#5B6B85]">{L(FACT[k.code]) || k.code}</dt><dd className="mono break-words font-bold">{factText(k.code, k.value)}</dd></div>)}</dl>
    {r.evidence.length > 0 && <><p className="mt-2 text-xs font-bold">{x('Evidência de origem (amostra)', 'Source evidence (sample)', 'Evidencia de origen (muestra)')}</p>
      <ul className="mt-1 grid gap-1 text-xs">{r.evidence.map((e, i) => <li key={i} className="break-words rounded-lg border border-[#E4DCCB] bg-[#FFFCF6] p-2">
        <span className="font-bold">{e.unit === 'market' ? e.value : `${e.unit === 'USD' ? factText('forecast_usd', e.value) : e.value} ${e.unit}`}</span>
        {e.blockHeight && <> · {x('bloco', 'block', 'bloque')} <span className="mono">{e.blockHeight}</span></>}
        {e.producedAt && <><br />{x('produzido', 'produced', 'producido')} {f.date(e.producedAt)}{e.targetAt && ` · ${x('alvo', 'target', 'objetivo')} ${f.date(e.targetAt)}`}</>}
        <br /><span className="inline-flex items-center gap-1 font-bold text-[#0A6657]">{e.source.startsWith('Allora') ? <CircleDollarSign className="h-3 w-3" aria-hidden="true" /> : <Radar className="h-3 w-3" aria-hidden="true" />}{e.source}</span></li>)}</ul></>}
  </div>;

  const Reasoning = ({ a }: { a: Agent }) => {
    const r = REASONING[a.id]; if (!r) return null;
    const rec = r.rec === 'monitor' ? x('Monitorar', 'Monitor', 'Monitorear') : r.rec === 'abstain' ? x('Abster-se', 'Abstain', 'Abstenerse') : x('Revisar', 'Review', 'Revisar');
    const List = ({ title, items }: { title: string; items: T3[] }) => <div><h5 className="font-bold">{title}</h5><ul className="list-disc pl-5">{items.map((s, i) => <li key={i}>{L(s)}</li>)}</ul></div>;
    return <section className="mt-3 rounded-xl border border-[#0E7C6B]/30 bg-[#F1F7F3] p-3" data-testid={`ai-reasoning-panel-${a.id}`}>
      <h4 className="flex flex-wrap items-center gap-2 text-sm font-extrabold"><Sparkles className="h-4 w-4 text-[#0A6657]" aria-hidden="true" />{x('Explicação de raciocínio', 'Reasoning explanation', 'Explicación de razonamiento')} · {name(a.id)} <span className="rounded-full border border-[#C9922A]/60 bg-[#FBF0D6] px-2 py-0.5 text-[10px] font-bold text-[#7A5410]">{x('Ilustrativo', 'Illustrative', 'Ilustrativo')}</span></h4>
      <p className="mt-1 text-xs text-[#5B6B85]" data-testid={`ai-provenance-${a.id}`}>{x('Proveniência', 'Provenance', 'Procedencia')}: {L(REASONING_PROVENANCE)} {x('Execução de origem', 'Source run', 'Ejecución de origen')}: <span className="mono">{a.latest.id}</span>.</p>
      <button type="button" data-demo-action data-testid={`button-ai-generate-${a.id}`} onClick={onAction} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white"><Sparkles className="h-4 w-4" aria-hidden="true" />{x('Gerar análise por IA', 'Generate AI analysis', 'Generar análisis por IA')}</button>
      <div className="mt-3 grid gap-2 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 text-sm">
        <p className="font-semibold">{L(r.summary)}</p>
        <p><b>{x('Sugestão ilustrativa', 'Illustrative suggestion', 'Sugerencia ilustrativa')}:</b> {rec}. <span className="text-xs text-[#5B6B85]">{x('Não é ordem financeira. Execução permitida: não.', 'Not a financial order. Execution allowed: no.', 'No es una orden financiera. Ejecución permitida: no.')}</span></p>
        <List title={x('Observações', 'Observations', 'Observaciones')} items={r.obs} />
        <List title={x('Incertezas', 'Uncertainties', 'Incertidumbres')} items={r.unc} />
        <List title={x('Próximos passos sugeridos', 'Suggested next steps', 'Próximos pasos sugeridos')} items={r.next} />
      </div></section>;
  };

  const Forecast = ({ id }: { id: Asset }) => { const e = FORECASTS[id]; return <div className="mt-2 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3 text-xs" data-testid={`forecast-${id}`}>
    <p className="font-bold">{x('Previsão de preço, não probabilidade de evento', 'Price forecast, not an event probability', 'Previsión de precio, no probabilidad de evento')} <Help label={x('O que é esta previsão', 'What this forecast is', 'Qué es esta previsión')}>{x('Allora publica um preço futuro em USD. Ele não diz a chance de um evento do Polymarket. Valores desta tela são amostras ilustrativas.', 'Allora publishes a future USD price. It does not give the chance of a Polymarket event. Values on this screen are illustrative samples.', 'Allora publica un precio futuro en USD. No indica la probabilidad de un evento de Polymarket. Los valores de esta pantalla son muestras ilustrativas.')}</Help></p>
    <p className="mt-1">{Number(e.usd).toLocaleString(lc, { minimumFractionDigits: 2 })} USD · {x('bloco', 'block', 'bloque')} <span className="mono">{e.block}</span> ({x('amostra', 'sample', 'muestra')})</p></div>; };

  const docs = (a: Agent) => { const ag = AGENT[a.id]; return <div className="mt-3 grid gap-3 text-sm" data-testid={`docs-${a.id}`}>
    <p>{L(ag?.role)}</p>
    {ag && <div><h4 className="font-bold">{x('Passos', 'Steps', 'Pasos')}</h4><ol className="list-decimal pl-5">{ag.steps.map((s, i) => <li key={i}>{L(s)}</li>)}</ol></div>}
    <div className="grid gap-3 sm:grid-cols-2">
      <div><h4 className="font-bold">{x('Entradas', 'Inputs', 'Entradas')}</h4><ul className="list-disc pl-5">{known(INPUT, a.inputs).map(c => <li key={c}>{L(INPUT[c])}</li>)}</ul></div>
      <div><h4 className="font-bold">{x('Saídas', 'Outputs', 'Salidas')}</h4><ul className="list-disc pl-5">{known(OUTPUT, a.outputs).map(c => <li key={c}>{L(OUTPUT[c])}</li>)}</ul></div>
      <div><h4 className="font-bold">{x('Dependências', 'Dependencies', 'Dependencias')}</h4><ul className="list-disc pl-5">{a.deps.length ? a.deps.map(c => <li key={c}>{name(c)}</li>) : <li>{x('Nenhuma', 'None', 'Ninguna')}</li>}</ul></div>
      <div><h4 className="font-bold">{x('Permissões', 'Permissions', 'Permisos')}</h4><ul className="list-disc pl-5">{known(PERM, a.perms).map(c => <li key={c}>{L(PERM[c])}</li>)}</ul></div>
    </div>
    <div><h4 className="font-bold">{x('Regras', 'Rules', 'Reglas')}</h4><ul className="list-disc pl-5">{known(RULE, a.rules).map(c => <li key={c}>{L(RULE[c])}</li>)}</ul></div>
    <p><b>{x('Periodicidade', 'Cadence', 'Periodicidad')}:</b> {x('a cada', 'every', 'cada')} {a.cadenceSeconds} s. {x('Nesta demonstração nenhum ciclo é executado.', 'In this demo no cycle runs.', 'En esta demostración no se ejecuta ningún ciclo.')}</p>
    <p className="rounded-xl border border-[#C9922A]/50 bg-[#FBF0D6] p-2 text-xs"><b>{x('Não é autorização financeira', 'Not a financial authorization', 'No es autorización financiera')}.</b> {x('Esta análise não assina, não move saldo e não substitui política, orçamento ou aprovação. Execução permitida: não.', 'This analysis does not sign, move balances or replace policy, budget or approval. Execution allowed: no.', 'Este análisis no firma, no mueve saldos y no sustituye política, presupuesto o aprobación. Ejecución permitida: no.')}</p>
  </div>; };

  const title = isOrch ? x('BETTEX · inteligência central', 'BETTEX · central intelligence', 'BETTEX · inteligencia central') : isCtl ? x('Controles operacionais (não são agentes)', 'Operational controls (not agents)', 'Controles operativos (no son agentes)') : x('Agentes de previsão ativos', 'Active prediction agents', 'Agentes de predicción activos');
  const note = isOrch ? x('BETTEX é a inteligência central independente: recebe pedidos dos agentes de previsão, compara e decide. Este relatório é monitoramento, não uma ordem.', 'BETTEX is the independent central intelligence: it receives prediction-agent requests, compares and decides. This report is monitoring, not an order.', 'BETTEX es la inteligencia central independiente: recibe pedidos de los agentes de predicción, compara y decide. Este informe es monitoreo, no una orden.') : isCtl ? x('Serviços de controle gravam relatórios por regras. Não são agentes nem inteligência.', 'Control services store rule-based reports. They are not agents or intelligence.', 'Los servicios de control guardan informes por reglas. No son agentes ni inteligencia.') : x('Agente Cripto e especialistas BTC, ETH e SOL. Relatórios são monitoramento, não ordens.', 'Crypto agent and the BTC, ETH and SOL specialists. Reports are monitoring, not orders.', 'Agente Cripto y especialistas BTC, ETH y SOL. Los informes son monitoreo, no órdenes.');
  const hist = selected?.history ?? []; const shown = hist.slice(page * PAGE, page * PAGE + PAGE);

  return <section className="rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4" data-testid={scope === 'agents' ? 'agent-ops-full' : `agent-ops-${scope}`}>
    <div className="flex flex-wrap items-center gap-2"><h2 className="display text-lg font-extrabold">{title}</h2>
      <span className="text-xs text-[#5B6B85]">{x('Amostra de', 'Sample from', 'Muestra de')} {f.date(AGENTS[0].latest.completedAt)}</span><span className="ml-auto" />
      <button type="button" data-demo-action onClick={onAction} data-testid={`button-agents-refresh-${scope}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E4DCCB] px-3 text-sm font-bold"><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Atualizar', 'Refresh', 'Actualizar')}</button></div>
    <p className="mt-1 text-xs text-[#5B6B85]" data-testid={`scope-note-${scope}`}>{note}</p>
    <p className="mt-1 text-[11px] font-bold text-[#7A5410]">{L(SAMPLE_PROVENANCE)}</p>
    {!isOrch && <div className="mt-3 flex flex-wrap gap-2">
      <input type="search" value={q} onChange={e => { setQ(e.target.value); }} aria-label={x('Buscar agente', 'Search agent', 'Buscar agente')} placeholder={x('Buscar agente', 'Search agent', 'Buscar agente')} data-testid="input-agent-search" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm" />
      <select value={act} onChange={e => setAct(e.target.value)} aria-label={x('Frescor do serviço', 'Service freshness', 'Frescura del servicio')} data-testid="select-agent-activity" className="min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm"><option value="">{x('Todos os estados', 'All states', 'Todos los estados')}</option>{Object.keys(ACTIVITY).map(k => <option key={k} value={k}>{L(ACTIVITY[k])}</option>)}</select></div>}
    <div className={`mt-3 grid gap-4 ${isOrch ? '' : 'lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]'}`}>
      {!isOrch && <div>{list.length === 0 ? <p className="rounded-xl border border-dashed border-[#E4DCCB] p-6 text-center text-sm text-[#5B6B85]">{x('Nenhum agente para estes filtros.', 'No agents for these filters.', 'Ningún agente para estos filtros.')}</p> : <ul className="grid gap-1.5">{list.map(a => { const I = ICON[a.id] ?? Bot; const on = sel === a.id; return <li key={a.id}><button type="button" onClick={() => { setSel(a.id); setPage(0); }} aria-pressed={on} data-testid={`agent-${a.id}`} className={`min-h-11 w-full rounded-xl border p-3 text-left ${on ? 'border-[#0E7C6B] bg-[#E3F1EC]' : 'border-[#E4DCCB] bg-[#FFFCF6] hover:bg-[#F3EFE3]'}`}>
        <span className="flex flex-wrap items-center gap-1.5"><I className="h-4 w-4 shrink-0 text-[#0A6657]" aria-hidden="true" /><b className="text-sm">{name(a.id)}</b><Badge s={a.activity} t={ACTIVITY[a.activity]} /><Badge s={a.latest.status} t={STATUS[a.latest.status]} /><Badge s={dTone(a.latest)} t={DECISION[a.latest.decision]} /></span>
        <span className="mt-1 block text-xs text-[#5B6B85]">{x('Último ciclo', 'Last cycle', 'Último ciclo')}: {age(a.latest.completedAt)} {x('atrás', 'ago', 'atrás')} · {a.runCount} {x('execuções', 'runs', 'ejecuciones')} · {x('a cada', 'every', 'cada')} {a.cadenceSeconds} s</span></button></li>; })}</ul>}</div>}
      <div className="min-w-0">
        {selected && <div className="mb-4 rounded-xl border border-[#E4DCCB] p-3" data-testid="agent-detail">
          <div className="flex flex-wrap items-center gap-2"><h3 className="display text-base font-extrabold">{name(selected.id)}</h3><Badge s={selected.activity} t={ACTIVITY[selected.activity]} /><Badge s={selected.latest.status} t={STATUS[selected.latest.status]} />
            <Help label={x('Como ler', 'How to read', 'Cómo leer')}>{x('Estado do serviço indica se o ciclo roda no prazo. Decisão indica se o resultado libera avanço. São coisas diferentes.', 'Service state says whether the cycle runs on time. Decision says whether the result allows progress. They are different things.', 'El estado del servicio indica si el ciclo corre a tiempo. La decisión indica si el resultado permite avanzar. Son cosas distintas.')}</Help></div>
          {selected.parentId && !isCtl && <p className="mt-1 text-xs text-[#5B6B85]">{x('Subordinado a', 'Reports to', 'Subordinado a')}: <b>{name(selected.parentId)}</b></p>}
          <div className="mt-2 rounded-xl border border-[#0E7C6B]/30 bg-[#F1F7F3] p-3" data-testid="latest-report"><h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0A6657]">{x('Último relatório', 'Latest report', 'Último informe')} · {f.date(selected.latest.completedAt)}</h4>{RunBody(selected.latest)}</div>
          {(selected.id === 'btc' || selected.id === 'eth' || selected.id === 'sol') && <Forecast id={selected.id} />}
          {!isCtl && <Reasoning a={selected} />}
          <details className="mt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-[#0A6657]">{x('Documentação', 'Documentation', 'Documentación')}</summary>{docs(selected)}</details>
        </div>}
        <h3 className="font-bold">{x('Histórico de execuções', 'Run history', 'Historial de ejecuciones')} · {name(sel)}</h3>
        <ul className="mt-2 grid gap-2">{shown.map(r => <li key={r.id} className="rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] text-sm" data-testid={`run-${r.id}`}><details><summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-2 px-3 py-2"><b>{name(r.agentId)}</b><Badge s={r.status} t={STATUS[r.status]} /><Badge s={dTone(r)} t={DECISION[r.decision]} /><span className="text-xs text-[#5B6B85]">{f.date(r.completedAt)} · {r.durationMs} ms · {r.findings.length} {x('achados', 'findings', 'hallazgos')}</span></summary><div className="px-3 pb-3">{RunBody(r)}</div></details></li>)}</ul>
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)} data-testid="button-history-newer" className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40"><ChevronLeft className="h-4 w-4" aria-hidden="true" />{x('Mais recentes', 'Newer', 'Más recientes')}</button>
          <button type="button" disabled={(page + 1) * PAGE >= hist.length} onClick={() => setPage(p => p + 1)} data-testid="button-history-older" className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40">{x('Mais antigas', 'Older', 'Más antiguas')}<ChevronRight className="h-4 w-4" aria-hidden="true" /></button></div>
      </div></div></section>;
}
