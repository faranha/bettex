/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import {
  useGetSimulation, useCommandSimulation, useGetTestAccountSession, getGetSimulationQueryKey,
  type GetSimulationParams, type SimulationSnapshot, type SimulationCommandInput, type TestAccountSnapshot,
  useGetDemoDashboard, useGetDemoSimulation, useCommandDemoSimulation, getGetDemoSimulationQueryKey,
} from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { codeLabel } from '@/components/alpha-trading/format';
import { simulationText, simulationMoney } from './labels';
import { demoPath } from '@/components/demo/demo-navigation';
import { isDemoSession } from '@/components/demo/demo-session';

type Rec = Record<string, unknown>;
interface RunView {
  id: string; environment: string; scenario: string; stage: number; revision: number; paused: boolean; clock: number;
  account?: { id: string; usdcUnits: string; bettexUnits: string; receivedUnits: string; wallets: { asset: string; id: string; network: string }[] };
  staking?: Rec; capital?: Rec; parameters?: Rec; transfers?: Rec[]; opportunities?: { opportunity: Rec; state: string; reason: string; decisions?: Rec[] }[];
  paper?: { ledger: Rec; decisions: Rec[]; orders: Rec[]; positions: Rec[] };
  rounds?: { id: string; resultUnits: string; retainedUnits: string; buybackUnits: string; paymentUnits: string; status: string; at: string }[];
  failure?: string; marketPriceUnits?: string; paymentsCancelled?: boolean; generation?: number;
}
interface EventView { id: string; environment: string; runId: string; scenario: string; at: string; kind: string; state: string; reason: string; correlationId: string; data: Rec }

const SCENARIOS = ['complete', 'insufficient_balance', 'expired_duplicate', 'no_opportunity', 'exposure', 'price_change', 'partial_fill', 'no_liquidity', 'integration_failure', 'payment_failure', 'restart'] as const;
const FAILURES = SCENARIOS.filter(s => s !== 'complete') as Exclude<typeof SCENARIOS[number], 'complete'>[];
const KINDS = ['', 'account', 'movement', 'opportunity', 'risk', 'decision', 'order', 'position', 'distribution', 'market', 'control', 'integration'];
const PAGE = 25;
const card = 'min-w-0 max-w-full rounded-2xl border border-[#E4DCCB] bg-white p-4';
const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white disabled:opacity-40';
const btn2 = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40';
const field = 'min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm';

const toUnits = (v: string) => {
  const m = v.trim().replace(',', '.').match(/^(\d{1,7})(?:\.(\d{0,6}))?$/);
  if (!m) return undefined; const n = (m[1] + (m[2] ?? '').padEnd(6, '0')).replace(/^0+/, '');
  return /^[1-9]\d{0,12}$/.test(n) ? n : undefined;
};
const sumUnits = (o: unknown) => Object.values((o ?? {}) as Rec).reduce<bigint>((n, v) => n + (typeof v === 'string' && /^\d+$/.test(v) ? BigInt(v) : 0n), 0n).toString();
const MACHINE = /^[a-z][a-z0-9_]*$/;
const isIdKey = (k: string) => /(^|[a-z])id$/i.test(k) || /^(id|runId|correlationId|opportunityId|decisionId|orderId|positionId|wallet|from|to)$/.test(k);
function useL() {
  const { x, loc } = useX();
  const lab = (k: string) => { const t = String(simulationText(x, k) ?? ''); return t && t !== k ? t : codeLabel(x, k); };
  const money = (v: unknown) => simulationMoney(v as string, loc) as string;
  const tz = { timeZone: 'America/Sao_Paulo' } as const;
  const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const date = (v: string | number) => new Date(v).toLocaleString(lc, { ...tz, dateStyle: 'short', timeStyle: 'medium' }) + ' (BRT)';
  const val = (k: string, v: unknown): string => {
    if (v === null || v === undefined) return '-';
    if (typeof v === 'boolean') return v ? x('Sim', 'Yes', 'Sí') : x('Não', 'No', 'No');
    if (typeof v === 'number') return /^(at|clock|producedAt|timestamp)$/.test(k) ? date(v) : v.toLocaleString(lc);
    if (typeof v !== 'string') return '-';
    if (/units$/i.test(k)) return money(v);
    if (/^\d{4}-\d\d-\d\dT/.test(v)) return date(v);
    if (isIdKey(k)) return v;
    if (/^\d{4}-\d\d-\d\d$/.test(v)) return new Date(v + 'T12:00:00Z').toLocaleDateString(lc, tz);
    if (/^\d+$/.test(v)) return BigInt(v).toLocaleString(lc);
    return MACHINE.test(v) ? lab(v) : v;
  };
  return { x, loc, lab, money, date, val };
}
function Tech({ o }: { o: unknown }) {
  const { x } = useL();
  return <details className="mt-1 min-w-0 max-w-full text-xs"><summary className="cursor-pointer font-bold">{x('Detalhes técnicos (original)', 'Technical details (original)', 'Detalles técnicos (original)')}</summary><pre className="mt-1 max-h-60 max-w-full overflow-auto whitespace-pre-wrap break-all rounded-lg bg-[#FBF8F0] p-2 font-mono text-[10px]">{JSON.stringify(o, null, 2)}</pre></details>;
}

function Fields({ o, skip = [] }: { o: Rec; skip?: string[] }) {
  const { lab, val } = useL();
  const rows = Object.entries(o).filter(([k, v]) => !skip.includes(k) && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null));
  return <dl className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">{rows.map(([k, v]) => <div key={k} className="flex min-w-0 justify-between gap-2 border-b border-[#F0E9DA] py-0.5"><dt className="min-w-0 text-[#5B6B85]">{lab(k)}</dt><dd className={`min-w-0 break-all text-right ${isIdKey(k) ? 'font-mono' : ''}`}>{val(k, v)}</dd></div>)}</dl>;
}
function Tag({ children, warn }: { children: string; warn?: boolean }) {
  const { lab } = useL();
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${warn ? 'border-[#B4421A]/40 text-[#B4421A]' : 'border-[#0E7C6B]/40 text-[#0A6657]'}`}>{MACHINE.test(children) ? lab(children) : children}</span>;
}
function Num({ k, v, id }: { k: string; v: string; id: string }) {
  return <div className="min-w-0 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3"><p className="text-[11px] text-[#5B6B85]">{k}</p><p className="break-words text-lg font-extrabold" data-testid={id}>{v}</p></div>;
}

export function SimulationPanel() {
  const { x, loc, lab, money, date, val } = useL();
  const qc = useQueryClient();
  const dashboard = useGetDemoDashboard({ query: { retry: false } });
  const demo = !!dashboard.data && isDemoSession(dashboard.data.profile);
  const session = useGetTestAccountSession({ query: { enabled: !!dashboard.data && !demo, retry: false, queryKey: ['test-account-session'] } });
  const snap = session.data as TestAccountSnapshot | undefined;
  const accountId = demo ? `demo:${dashboard.data!.profile.accountId}` : (snap?.account as { id?: string } | null | undefined)?.id ?? null;
  const storeKey = accountId ? `bettex:simulation:run:${accountId}` : null;
  const [runId, setRunId] = useState<string | undefined>();
  const [ready, setReady] = useState(false);
  const [kind, setKind] = useState(''); const [offset, setOffset] = useState(0);
  const [scenario, setScenario] = useState<typeof SCENARIOS[number]>('complete');
  const [failure, setFailure] = useState<typeof FAILURES[number]>('payment_failure');
  const [amount, setAmount] = useState('100'); const [bamount, setBamount] = useState('1'); const [seconds, setSeconds] = useState('30');
  const [confirm, setConfirm] = useState(false); const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => { // restore per-owner selection; drop caches of any previous owner
    setReady(false); setKind(''); setOffset(0); setErr(null); setConfirm(false);
    setRunId(storeKey ? localStorage.getItem(storeKey) ?? undefined : undefined);
    qc.removeQueries({ queryKey: ['/api/simulation'] });
    qc.removeQueries({ queryKey: ['/api/demo/simulation'] });
    if (!session.isLoading) setReady(true);
  }, [storeKey, session.isLoading, qc]);
  const select = (id: string | undefined) => { setRunId(id); setOffset(0); setConfirm(false); if (storeKey) { if (id) localStorage.setItem(storeKey, id); else localStorage.removeItem(storeKey); } };

  const enabled = ready && !!accountId;
  const live = (params: GetSimulationParams) => ({ query: { queryKey: [...getGetSimulationQueryKey(params), accountId ?? 'none'] as const, enabled: enabled && !demo, refetchInterval: 2000, refetchIntervalInBackground: false, retry: false } });
  const demoLive = (params: GetSimulationParams) => ({ query: { queryKey: [...getGetDemoSimulationQueryKey(params), accountId ?? 'none'] as const, enabled: enabled && demo, refetchInterval: 2000, refetchIntervalInBackground: false, retry: false } });
  const liveParams: GetSimulationParams = runId ? { runId } : {};
  const histParams: GetSimulationParams = { ...(runId ? { runId } : {}), ...(kind ? { kind } : {}), offset };
  const nativeQ = useGetSimulation(liveParams, live(liveParams));
  const nativeH = useGetSimulation(histParams, live(histParams));
  const demoQ = useGetDemoSimulation(liveParams, demoLive(liveParams));
  const demoH = useGetDemoSimulation(histParams, demoLive(histParams));
  const nativeCmd = useCommandSimulation();
  const demoCmd = useCommandDemoSimulation();
  const q = demo ? demoQ : nativeQ;
  const h = demo ? demoH : nativeH;
  const cmd = demo ? demoCmd : nativeCmd;
  const csrf = demo ? q.data?.csrf ?? '' : snap?.csrf ?? '';
  const d = q.data as SimulationSnapshot | undefined;
  const run = (d?.run ?? null) as RunView | null;
  const hd = h.data as SimulationSnapshot | undefined;
  const events = (hd?.events ?? []) as unknown as EventView[];

  useEffect(() => { if (d && runId && !d.run && d.runs.length && !q.isFetching) select(undefined); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [d, runId]);
  useEffect(() => { if (!runId && d?.run && storeKey) select(d.run.id); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [d?.run?.id]);

  const msg = (e: unknown) => {
    const code = String((e as { data?: { code?: string } })?.data?.code ?? (e as Error)?.message ?? '');
    const M: [string, string][] = [['session_required', x('Sessão de teste necessária. Entre em Minha conta.', 'Test session required. Sign in under My account.', 'Sesión de prueba necesaria. Entra en Mi cuenta.')],
      ['simulation_revision_changed', x('A execução mudou em outra ação. Dados atualizados; tente de novo.', 'The run changed elsewhere. Data refreshed; try again.', 'La ejecución cambió en otro lugar. Datos actualizados; intenta de nuevo.')],
      ['simulation_paused', x('Execução pausada. Retome para continuar.', 'Run is paused. Resume to continue.', 'Ejecución en pausa. Reanuda para continuar.')],
      ['invalid_amount', x('Valor inválido.', 'Invalid amount.', 'Monto inválido.')],
      ['simulation_not_found', x('Execução não encontrada para esta conta.', 'Run not found for this account.', 'Ejecución no encontrada para esta cuenta.')],
      ['idempotency_conflict', x('Este comando já foi usado com outros dados. Tente de novo.', 'This command id was already used with different data. Try again.', 'Este comando ya se usó con otros datos. Intenta de nuevo.')],
      ['unavailable', x('Serviço indisponível no momento. Tente de novo.', 'Service unavailable right now. Try again.', 'Servicio no disponible ahora. Intenta de nuevo.')],
      ['unknown_simulation_action', x('Ação desconhecida.', 'Unknown action.', 'Acción desconocida.')],
      ['paper_ledger_divergence', x('Divergência de livro detectada; nada foi gravado.', 'Ledger divergence detected; nothing was saved.', 'Divergencia de libro detectada; nada se guardó.')]];
    if (code.includes('simulation_revision_changed')) void qc.invalidateQueries({ queryKey: ['/api/simulation'] });
    const hit = M.find(([k]) => code.includes(k)) ?? (code.includes('401') ? M[0] : undefined);
    return hit ? hit[1] : x('Falha ao executar o comando.', 'Command failed.', 'Falló el comando.');
  };
  const send = async (extra: Partial<SimulationCommandInput> & { action: SimulationCommandInput['action'] }) => {
    setErr(null);
    try {
      const res = await cmd.mutateAsync({ data: { csrf, requestId: crypto.randomUUID(), ...(run && extra.action !== 'start' ? { runId: run.id, expectedRevision: run.revision } : {}), ...extra } });
      if ((extra.action === 'start' || extra.action === 'reset') && res.run) select(res.run.id);
      setConfirm(false);
    } catch (e) { setErr(msg(e)); }
    finally { await qc.invalidateQueries({ queryKey: [demo ? '/api/demo/simulation' : '/api/simulation'] }); }
  };
  const busy = cmd.isPending;
  const sampleUnits = toUnits(amount);
  const secs = Number(seconds); const secOk = Number.isInteger(secs) && secs >= 1 && secs <= 86400;

  const stages = [x('Conta', 'Account', 'Cuenta'), x('Depósito', 'Deposit', 'Depósito'), x('Compra', 'Purchase', 'Compra'), x('Seleção', 'Selection', 'Selección'), x('Ordens', 'Orders', 'Órdenes'), x('Posição aberta', 'Open position', 'Posición abierta'), x('Encerramento', 'Close', 'Cierre'), x('Rodada', 'Round', 'Ronda')];
  const scenLabel = (s: string) => lab(s);

  const header = <div>
    <h1 className="display text-2xl font-extrabold">{x('Execução da simulação', 'Simulation execution', 'Ejecución de la simulación')}</h1>
    <div className="mt-2 grid gap-2 sm:grid-cols-3" data-testid="panel-environments">
      <div className="rounded-xl border-2 border-[#0E7C6B] bg-[#E9EEE5] p-3 text-xs"><b>{x('Simulação (este painel)', 'Simulation (this panel)', 'Simulación (este panel)')}</b><br />{x('Dados e execução simulados, sem chaves nem ordens reais.', 'Simulated data and execution, no real keys or orders.', 'Datos y ejecución simulados, sin claves ni órdenes reales.')}</div>
      <div className="rounded-xl border border-[#E4DCCB] p-3 text-xs text-[#5B6B85]"><b>{x('Rede de testes', 'Testnet', 'Red de pruebas')}</b><br />{x('Outro ambiente, não usado aqui.', 'Another environment, not used here.', 'Otro entorno, no usado aquí.')}</div>
      <div className="rounded-xl border border-[#E4DCCB] p-3 text-xs text-[#5B6B85]"><b>{x('Dados reais', 'Real data', 'Datos reales')}</b><br />{x('Não misturados com esta execução simulada.', 'Not mixed with this simulated run.', 'No mezclados con esta ejecución simulada.')}</div>
    </div>
    <p className="mt-2 text-xs text-[#5B6B85]" data-testid="text-provisional">{x('Todos os parâmetros são fixtures provisórios, não evidência econômica. Valores em unidades de 1e6.', 'All parameters are provisional fixtures, not economic evidence. Values use 1e6 units.', 'Todos los parámetros son fixtures provisionales, no evidencia económica. Valores en unidades de 1e6.')}</p>
  </div>;

  if (dashboard.isLoading || (!demo && session.isLoading)) return <div className="mx-auto max-w-5xl grid gap-3 p-4" aria-busy="true">{[0, 1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F0E9DA]" />)}</div>;
  if (dashboard.isError || (!demo && (session.isError || !snap?.enabled)) || !accountId) return <div className="mx-auto grid max-w-5xl gap-4 px-3 pt-5 sm:px-5">{header}
    <div role="alert" className={card} data-testid="status-session-required"><p className="font-bold">{session.isError ? x('Não foi possível carregar a sessão.', 'Could not load the session.', 'No se pudo cargar la sesión.') : x('Sessão de teste necessária', 'Test session required', 'Sesión de prueba necesaria')}</p>
      <p className="mt-1 text-sm text-[#5B6B85]">{x('A simulação pertence à sua conta de teste.', 'The simulation belongs to your test account.', 'La simulación pertenece a tu cuenta de prueba.')}</p>
      <div className="mt-3 flex gap-2"><Link href={demoPath('account', loc)} data-testid="link-account" className={btn}>{x('Minha conta', 'My account', 'Mi cuenta')}</Link>{session.isError && <button type="button" className={btn2} onClick={() => void session.refetch()}>{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button>}</div></div></div>;

  const l = (run?.paper?.ledger ?? {}) as Rec;
  const big = (v: unknown) => (typeof v === 'string' && /^-?\d+$/.test(v) ? BigInt(v) : 0n);
  const posAll = run?.paper?.positions ?? [];
  const cap = (run?.capital ?? {}) as Rec;
  const cash = typeof cap.cashUnits === 'string' ? cap.cashUnits : String(big(l.cashUnits));
  const reserved = typeof cap.reservedUnits === 'string' ? cap.reservedUnits : sumUnits(l.reservations);
  const committed = typeof cap.committedUnits === 'string' ? cap.committedUnits : posAll.filter(p => p.state === 'open' || p.state === 'reducing').reduce((n, p) => n + big(p.committedUnits), 0n).toString();
  const obligations = typeof cap.obligationsUnits === 'string' ? cap.obligationsUnits : String(big(l.obligationsUnits));
  const rawAvail = big(cash) - big(l.defensiveUnits) - big(obligations) - big(reserved);
  const avail = typeof cap.availableUnits === 'string' ? cap.availableUnits : (big(l.fundingUnits) === 0n || rawAvail < 0n ? 0n : rawAvail).toString();
  const stk = (run?.staking ?? {}) as Rec;
  const opps = run?.opportunities ?? [];
  const positions = run?.paper?.positions ?? [];
  const orders = run?.paper?.orders ?? [];
  const decisions = run?.paper?.decisions ?? [];
  const riskEvents = events.filter(e => e.kind === 'risk');
  const hasFailedRound = !!run?.rounds?.some(r => r.status === 'failed');

  return <div className="mx-auto grid w-full min-w-0 max-w-5xl grid-cols-1 gap-4 px-3 pt-5 sm:px-5" data-testid="page-simulation">
    {header}
    {err && <div role="alert" data-testid="status-error" className="rounded-xl border border-[#B4421A]/40 bg-[#FFF3EC] p-3 text-sm font-semibold text-[#B4421A]">{err}</div>}
    {q.isError && <div role="alert" className={card}><p className="font-bold">{x('Não conseguimos carregar a simulação.', 'We could not load the simulation.', 'No pudimos cargar la simulación.')}</p><button type="button" data-testid="button-retry" className={`${btn} mt-2`} onClick={() => void q.refetch()}><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>}
    {!d && !q.isError && <div className="grid gap-3" aria-busy="true">{[0, 1].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F0E9DA]" />)}</div>}

    {d && <>
      <section className={card}>
        <h2 className="font-bold">{x('Iniciar ou escolher execução', 'Start or pick a run', 'Iniciar o elegir ejecución')}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <select aria-label={x('Cenário', 'Scenario', 'Escenario')} data-testid="select-scenario" className={field} value={scenario} onChange={e => setScenario(e.target.value as typeof scenario)}>{SCENARIOS.map(s => <option key={s} value={s}>{scenLabel(s)}</option>)}</select>
          <button type="button" data-testid="button-start" className={btn} disabled={busy || !csrf} onClick={() => void send({ action: 'start', scenario })}>{x('Iniciar execução', 'Start run', 'Iniciar ejecución')}</button>
          <select aria-label={x('Execuções existentes', 'Existing runs', 'Ejecuciones existentes')} data-testid="select-run" className={field} value={run?.id ?? ''} onChange={e => select(e.target.value || undefined)} disabled={!d.runs.length}>
            <option value="">{d.runs.length ? x('Selecionar execução', 'Select run', 'Seleccionar ejecución') : x('Nenhuma execução', 'No runs', 'Sin ejecuciones')}</option>
            {d.runs.map(r => <option key={r.id} value={r.id}>{r.id} · {scenLabel(r.scenario)} · {x('etapa', 'stage', 'etapa')} {r.stage}</option>)}</select>
        </div>
      </section>

      {!run && <div className="rounded-2xl border border-dashed border-[#E4DCCB] p-8 text-center text-sm text-[#5B6B85]" data-testid="empty-run">{x('Nenhuma execução selecionada. Escolha um cenário e inicie.', 'No run selected. Pick a scenario and start.', 'Ninguna ejecución seleccionada. Elige un escenario e inicia.')}</div>}

      {run && <>
        <section className={`${card} border-2 border-[#0E7C6B]`} data-testid="panel-run-identity">
          <div className="flex flex-wrap items-center gap-2"><Tag>{`${x('modo', 'mode', 'modo')} ${lab(d.mode)}`}</Tag><Tag>{run.environment}</Tag><Tag warn={run.paused}>{run.paused ? x('pausada', 'paused', 'en pausa') : x('ativa', 'running', 'activa')}</Tag>{run.failure && <Tag warn>{`${x('falha', 'failure', 'falla')}: ${lab(run.failure)}`}</Tag>}</div>
          <p className="mt-2 break-all font-mono text-xs" data-testid="text-run-id">{x('Execução', 'Run', 'Ejecución')} {run.id} · {scenLabel(run.scenario)} · {x('revisão', 'revision', 'revisión')} {run.revision}</p>
          <p className="text-xs text-[#5B6B85]" data-testid="text-clock">{x('Relógio controlado', 'Controlled clock', 'Reloj controlado')}: {date(run.clock)}</p>
          <ol className="mt-3 grid grid-cols-4 gap-1 sm:grid-cols-8">{stages.map((s, i) => <li key={s} className={`rounded-lg border p-1.5 text-center text-[10px] font-bold ${i === run.stage ? 'border-[#0E7C6B] bg-[#0E7C6B] text-white' : i < run.stage ? 'border-[#0E7C6B]/40 bg-[#E9EEE5]' : 'border-[#E4DCCB] text-[#5B6B85]'}`}>{i} {s}</li>)}</ol>
          {run.stage >= 5 && run.stage < 6 && <p className="mt-2 text-xs text-[#5B6B85]">{x('Posições ficam abertas entre as etapas 5 e 6 de propósito.', 'Positions deliberately stay open between stages 5 and 6.', 'Las posiciones quedan abiertas a propósito entre las etapas 5 y 6.')}</p>}
          {run.stage >= 7 && <p className="mt-2 text-xs font-bold text-[#0A6657]" data-testid="status-complete">{x('Cenário concluído; novas ações continuam disponíveis.', 'Scenario complete; new actions remain available.', 'Escenario completo; las nuevas acciones siguen disponibles.')}</p>}
        </section>

        <section className={card}>
          <h2 className="font-bold">{x('Controles', 'Controls', 'Controles')}</h2>
          {hasFailedRound && <p className="mt-1 text-xs text-[#B4421A]" data-testid="text-retry-hint">{x('Pagamento de rodada falhou: limpe a falha com Atualizar mercado e avance para repetir a MESMA rodada.', 'Round payment failed: clear the failure with Market update, then advance to retry the SAME round.', 'Pago de ronda falló: limpia la falla con Actualizar mercado y avanza para reintentar la MISMA ronda.')}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" data-testid="button-advance" className={btn} disabled={busy || run.paused} onClick={() => void send({ action: 'advance' })}>{x('Avançar', 'Advance', 'Avanzar')}</button>
            <button type="button" data-testid="button-pause-resume" className={btn2} disabled={busy} onClick={() => void send({ action: run.paused ? 'resume' : 'pause' })}>{run.paused ? x('Retomar', 'Resume', 'Reanudar') : x('Pausar', 'Pause', 'Pausar')}</button>
            <button type="button" data-testid="button-generate" className={btn2} disabled={busy || run.paused} onClick={() => void send({ action: 'generate' })}>{x('Gerar oportunidades', 'Generate', 'Generar')}</button>
            <button type="button" data-testid="button-market" className={btn2} disabled={busy || run.paused} onClick={() => void send({ action: 'market' })}>{x('Atualizar mercado (restaura liquidez, limpa falha)', 'Market update (restores liquidity, clears failure)', 'Actualizar mercado (restaura liquidez, limpia falla)')}</button>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs">{x('Injetar falha', 'Inject failure', 'Inyectar falla')}<select data-testid="select-failure" className={field} value={failure} onChange={e => setFailure(e.target.value as typeof failure)}>{FAILURES.map(f => <option key={f} value={f}>{scenLabel(f)}</option>)}</select></label>
            <button type="button" data-testid="button-failure" className={btn2} disabled={busy} onClick={() => void send({ action: 'failure', failure })}>{x('Aplicar falha', 'Apply failure', 'Aplicar falla')}</button>
            <label className="grid gap-1 text-xs">{x('Relógio (segundos)', 'Clock (seconds)', 'Reloj (segundos)')}<input data-testid="input-seconds" inputMode="numeric" className={`${field} w-28`} value={seconds} onChange={e => setSeconds(e.target.value)} /></label>
            <button type="button" data-testid="button-clock" className={btn2} disabled={busy || run.paused || !secOk} onClick={() => void send({ action: 'clock', seconds: secs })}>{x('Avançar relógio', 'Advance clock', 'Avanzar reloj')}</button>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs">{x('Valor em USDC (depósito e compra)', 'Amount in USDC (deposit and purchase)', 'Monto en USDC (depósito y compra)')}<input data-testid="input-amount" inputMode="decimal" className={`${field} w-32`} value={amount} onChange={e => setAmount(e.target.value)} /></label>
            <button type="button" data-testid="button-deposit" className={btn2} disabled={busy || run.paused || !sampleUnits} onClick={() => sampleUnits && void send({ action: 'deposit', amountUnits: sampleUnits })}>{x('Depositar USDC', 'Deposit USDC', 'Depositar USDC')}</button>
            <button type="button" data-testid="button-purchase" className={btn2} disabled={busy || run.paused || !sampleUnits} onClick={() => sampleUnits && void send({ action: 'purchase', amountUnits: sampleUnits })}>{x('Comprar BETTEX com USDC', 'Buy BETTEX with USDC', 'Comprar BETTEX con USDC')}</button>
            {!sampleUnits && <span className="text-xs text-[#B4421A]">{x('Valor inválido', 'Invalid amount', 'Monto inválido')}</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs">{x('Quantidade de BETTEX a retirar', 'BETTEX amount to withdraw', 'Cantidad de BETTEX a retirar')}<input data-testid="input-bettex-amount" inputMode="decimal" className={`${field} w-32`} value={bamount} onChange={e => setBamount(e.target.value)} /></label>
            <button type="button" data-testid="button-withdraw" className={btn2} disabled={busy || run.paused || !toUnits(bamount)} onClick={() => { const u = toUnits(bamount); if (u) void send({ action: 'withdraw', amountUnits: u }); }}>{x('Retirar BETTEX', 'Withdraw BETTEX', 'Retirar BETTEX')}</button>
            {!toUnits(bamount) && <span className="text-xs text-[#B4421A]">{x('Quantidade inválida', 'Invalid amount', 'Cantidad inválida')}</span>}
          </div>
          <p className="mt-1 text-[11px] text-[#5B6B85]">{x('Retirar BETTEX zera o peso de staking e cancela direitos não pagos.', 'Withdrawing BETTEX resets staking weight and cancels unpaid rights.', 'Retirar BETTEX reinicia el peso de staking y cancela derechos no pagados.')}</p>
          <div className="mt-3 border-t border-[#F0E9DA] pt-3">
            {!confirm ? <button type="button" data-testid="button-reset" className="min-h-11 rounded-xl border border-[#B4421A]/50 px-4 text-sm font-bold text-[#B4421A]" onClick={() => setConfirm(true)}>{x('Reiniciar execução', 'Reset run', 'Reiniciar ejecución')}</button> :
              <div role="alertdialog" className="rounded-xl border border-[#B4421A]/40 bg-[#FFF3EC] p-3 text-sm" data-testid="dialog-reset"><p>{x(`Apagar somente a execução ${run.id} e criar uma nova com outro ID? Não pode ser desfeito.`, `Delete only run ${run.id} and create a new one with a new ID? This cannot be undone.`, `¿Borrar solo la ejecución ${run.id} y crear otra con nuevo ID? No se puede deshacer.`)}</p>
                <div className="mt-2 flex gap-2"><button type="button" data-testid="button-reset-confirm" disabled={busy} className="min-h-11 rounded-xl bg-[#B4421A] px-4 text-sm font-bold text-white disabled:opacity-40" onClick={() => void send({ action: 'reset' })}>{x('Confirmar reinício', 'Confirm reset', 'Confirmar reinicio')}</button><button type="button" data-testid="button-reset-cancel" className={btn2} onClick={() => setConfirm(false)}>{x('Cancelar', 'Cancel', 'Cancelar')}</button></div></div>}
          </div>
          {busy && <p className="mt-2 text-xs text-[#5B6B85]" aria-busy="true">{x('Executando…', 'Running…', 'Ejecutando…')}</p>}
        </section>

        <section className={card} data-testid="panel-account">
          <h2 className="font-bold">{x('Conta simulada e carteiras inertes', 'Simulated account and inert wallets', 'Cuenta simulada y carteras inertes')}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Num id="text-usdc" k="USDC" v={money(run.account?.usdcUnits)} />
            <Num id="text-bettex" k="BETTEX" v={money(run.account?.bettexUnits)} />
            <Num id="text-staking-amount" k={x('BETTEX em staking (quantidade)', 'BETTEX staked (amount)', 'BETTEX en staking (cantidad)')} v={money(run.account?.bettexUnits)} />
            <Num id="text-staking-weight" k={x('Peso de staking (token x tempo)', 'Staking weight (token x time)', 'Peso de staking (token x tiempo)')} v={stk.tokenSeconds != null ? val('tokenSeconds', String(stk.tokenSeconds)) : '-'} />
            <Num id="text-received" k={x('Recebido em rodadas', 'Received from rounds', 'Recibido en rondas')} v={money(run.account?.receivedUnits)} />
          </div>
          {stk.eligible != null && <p className="mt-2 text-xs" data-testid="text-staking-eligible">{x('Elegível a rodadas', 'Round eligibility', 'Elegibilidad a rondas')}: {val('eligible', stk.eligible)}</p>}
          <ul className="mt-2 text-xs">{run.account?.wallets.map(w => <li key={w.id} className="break-all font-mono">{w.asset} · {lab(w.network)} · {w.id} <Tag>{x('inerte', 'inert', 'inerte')}</Tag></li>)}</ul>
        </section>

        <section className={card} data-testid="panel-capital">
          <h2 className="font-bold">{x('Principal encaminhado à tesouraria e capital', 'Principal forwarded to treasury and capital', 'Principal enviado a la tesorería y capital')}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Num id="text-funding" k={x('Principal encaminhado', 'Forwarded principal', 'Principal enviado')} v={money(l.fundingUnits ?? '0')} />
            <Num id="text-cash" k={x('Caixa', 'Cash', 'Caja')} v={money(cash)} />
            <Num id="text-committed" k={x('Comprometido', 'Committed', 'Comprometido')} v={money(committed)} />
            <Num id="text-obligations" k={x('Obrigações', 'Obligations', 'Obligaciones')} v={money(obligations)} />
            <Num id="text-reserved" k={x('Reservado', 'Reserved', 'Reservado')} v={money(reserved)} />
            <Num id="text-available" k={x('Disponível', 'Available', 'Disponible')} v={money(avail)} />
          </div>
          <details className="mt-2 text-xs"><summary className="cursor-pointer font-bold">{x('Demais campos do capital', 'Other capital fields', 'Demás campos del capital')}</summary><div className="mt-2"><Fields o={{ ...l, ...cap }} skip={['entries', 'reservations']} /></div></details>
        </section>

        <section className={card} data-testid="panel-opportunities">
          <h2 className="font-bold">{x('Oportunidades BTC / ETH / SOL', 'BTC / ETH / SOL opportunities', 'Oportunidades BTC / ETH / SOL')}</h2>
          {opps.length === 0 ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Sem oportunidades ainda. Gere ou avance.', 'No opportunities yet. Generate or advance.', 'Sin oportunidades aún. Genera o avanza.')}</p> :
            <ul className="mt-2 grid gap-2">{opps.map(o => <li key={String(o.opportunity.id)} className="rounded-xl border border-[#E4DCCB] p-3 text-sm" data-testid={`row-opportunity-${String(o.opportunity.id)}`}>
              <div className="flex flex-wrap items-center gap-2"><b>{String(o.opportunity.specialist ?? o.opportunity.asset ?? '').toUpperCase()}</b><Tag warn={o.state === 'rejected'}>{o.state}</Tag><span className="break-all font-mono text-[11px] text-[#5B6B85]">{String(o.opportunity.id)}</span></div>
              <p className="text-xs text-[#5B6B85]">{x('Motivo', 'Reason', 'Motivo')}: {lab(o.reason)}</p>
              <details className="mt-1 text-xs"><summary className="cursor-pointer font-bold">{x('Origem e qualificação', 'Origin and qualification', 'Origen y calificación')}</summary><Fields o={o.opportunity} /><Tech o={o} /></details></li>)}</ul>}
          <h3 className="mt-3 text-sm font-bold">{x('Decisões e razões de risco', 'Decisions and risk reasons', 'Decisiones y razones de riesgo')}</h3>
          <ul className="mt-1 grid gap-1 text-xs">{decisions.map(dc => <li key={String(dc.id)} className="rounded-lg bg-[#FBF8F0] p-2"><Tag warn={dc.state === 'rejected'}>{String(dc.state)}</Tag> {lab(String(dc.reason ?? ''))} <span className="break-all font-mono text-[#5B6B85]">{String(dc.id)}</span></li>)}{riskEvents.map(e => <li key={e.id} className="rounded-lg bg-[#FBF8F0] p-2"><Tag warn={e.state === 'rejected'}>{e.state}</Tag> {lab(e.reason)}</li>)}{!decisions.length && !riskEvents.length && <li className="text-[#5B6B85]">{x('Sem decisões.', 'No decisions.', 'Sin decisiones.')}</li>}</ul>
        </section>

        <section className={card} data-testid="panel-orders">
          <h2 className="font-bold">{x('Ordens pendentes e parciais', 'Pending and partial orders', 'Órdenes pendientes y parciales')}</h2>
          {orders.length === 0 ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Nenhuma ordem.', 'No orders.', 'Ninguna orden.')}</p> : <ul className="mt-2 grid gap-2">{orders.map(o => <li key={String(o.id)} className="rounded-xl border border-[#E4DCCB] p-3" data-testid={`row-order-${String(o.id)}`}><Tag warn={o.state === 'partial'}>{String(o.state)}</Tag><div className="mt-1"><Fields o={o} /></div><Tech o={o} /></li>)}</ul>}
        </section>

        <section className={card} data-testid="panel-positions">
          <h2 className="font-bold">{x('Posições', 'Positions', 'Posiciones')}</h2>
          {positions.length === 0 ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Nenhuma posição.', 'No positions.', 'Ninguna posición.')}</p> : <ul className="mt-2 grid gap-2">{positions.map(p => <li key={String(p.id)} className="rounded-xl border border-[#E4DCCB] p-3" data-testid={`row-position-${String(p.id)}`}>
            <PositionView p={p} />
          </li>)}</ul>}
        </section>

        <section className={card} data-testid="panel-rounds">
          <h2 className="font-bold">{x('Rodadas e pagamentos', 'Rounds and payments', 'Rondas y pagos')}</h2>
          {!run.rounds?.length ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Nenhuma rodada.', 'No rounds.', 'Ninguna ronda.')}</p> : <ul className="mt-2 grid gap-2">{run.rounds.map(r => <li key={r.id} className="rounded-xl border border-[#E4DCCB] p-3 text-sm" data-testid={`row-round-${r.id}`}><div className="flex items-center gap-2"><b>{r.id}</b><Tag warn={r.status === 'failed'}>{r.status}</Tag></div><Fields o={{ resultUnits: r.resultUnits, retainedUnits: r.retainedUnits, buybackUnits: r.buybackUnits, paymentUnits: r.paymentUnits, at: r.at }} /></li>)}</ul>}
        </section>

        <section className={card} data-testid="panel-other-agents">
          <h2 className="font-bold">{x('Outros agentes de trading', 'Other trading agents', 'Otros agentes de trading')}</h2>
          <ul className="mt-2 flex flex-wrap gap-2">{[x('Surebet', 'Surebet', 'Surebet'), x('Bônus', 'Bonus', 'Bonos'), x('Cripto à vista', 'Spot crypto', 'Cripto spot')].map(a => <li key={a} className="rounded-xl border border-dashed border-[#E4DCCB] px-3 py-2 text-sm">{a} <Tag>{x('Em desenvolvimento', 'In development', 'En desarrollo')}</Tag></li>)}</ul>
        </section>

        <section className={card} data-testid="panel-history">
          <h2 className="font-bold">{x('Histórico', 'History', 'Historial')}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select aria-label={x('Filtrar tipo', 'Filter kind', 'Filtrar tipo')} data-testid="select-kind" className={field} value={kind} onChange={e => { setKind(e.target.value); setOffset(0); }}>{KINDS.map(k => <option key={k} value={k}>{k ? lab(k) : x('Todos os tipos', 'All kinds', 'Todos los tipos')}</option>)}</select>
            <span className="text-xs text-[#5B6B85]" data-testid="text-history-count">{hd ? `${hd.offset + (events.length ? 1 : 0)}-${hd.offset + events.length} / ${hd.total}` : ''}</span>
          </div>
          {h.isError ? <button type="button" className={`${btn} mt-2`} onClick={() => void h.refetch()}>{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button> : !hd ? <div className="mt-2 h-20 animate-pulse rounded-xl bg-[#F0E9DA]" /> : events.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-[#E4DCCB] p-6 text-center text-sm text-[#5B6B85]">{x('Nenhum evento para este filtro.', 'No events for this filter.', 'Ningún evento para este filtro.')}</p> :
            <ul className="mt-2 grid gap-2">{events.map(e => <HistoryRow key={e.id} e={e} open={open === e.id} toggle={() => setOpen(open === e.id ? null : e.id)} />)}</ul>}
          <div className="mt-3 flex gap-2">
            <button type="button" data-testid="button-prev" className={btn2} disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>{x('Anterior', 'Previous', 'Anterior')}</button>
            <button type="button" data-testid="button-next" className={btn2} disabled={!hd?.hasMore} onClick={() => setOffset(offset + PAGE)}>{x('Próxima', 'Next', 'Siguiente')}</button>
          </div>
        </section>
      </>}
    </>}
  </div>;
}

function PositionView({ p }: { p: Rec }) {
  const { x, lab, val } = useL();
  const vs = (Array.isArray(p.valuations) ? p.valuations : []) as Rec[];
  const last = vs[vs.length - 1];
  const cell = (k: string, v: string, warn?: boolean) => <div className="rounded-lg border border-[#E4DCCB] bg-[#FBF8F0] p-2"><p className="text-[10px] text-[#5B6B85]">{k}</p><p className={`break-words text-sm font-bold ${warn ? 'text-[#B4421A]' : ''}`}>{v}</p></div>;
  const plan = typeof p.exitPlan === 'string' ? lab(p.exitPlan) : p.exitPlan && typeof p.exitPlan === 'object' ? null : '-';
  return <div>
    <div className="flex flex-wrap gap-2"><Tag>{String(p.state)}</Tag>{p.exitState != null && <span className="text-xs">{x('Saída', 'Exit', 'Salida')}: <Tag>{String(p.exitState)}</Tag></span>}</div>
    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cell(x('Resultado esperado original', 'Original expected result', 'Resultado esperado original'), val('originalExpectedUnits', p.originalExpectedUnits))}
      {cell(x('Esperado atualizado (último)', 'Updated expected (latest)', 'Esperado actualizado (último)'), last ? val('updatedExpectedUnits', last.updatedExpectedUnits) : '-')}
      {cell(x('Não realizado (último)', 'Unrealized (latest)', 'No realizado (último)'), last ? val('unrealizedUnits', last.unrealizedUnits) : '-')}
      {cell(x('Realizado', 'Realized', 'Realizado'), val('realizedUnits', p.realizedUnits))}
    </div>
    <div className="mt-2"><Fields o={p} skip={['originalExpectedUnits', 'realizedUnits', 'exitPlan', 'exitState', 'state']} /></div>
    <p className="mt-1 text-xs"><b>{x('Plano de saída', 'Exit plan', 'Plan de salida')}:</b> {plan ?? ''}</p>
    {p.exitPlan != null && typeof p.exitPlan === 'object' && <Fields o={p.exitPlan as Rec} />}
    {vs.length > 0 && <details className="mt-1 text-xs"><summary className="cursor-pointer font-bold">{x('Avaliações', 'Valuations', 'Valoraciones')} ({vs.length})</summary>{vs.map((v, i) => <div key={i} className="mt-1 rounded-lg border border-[#F0E9DA] p-2"><Fields o={v} /></div>)}</details>}
    <Tech o={p} />
  </div>;
}
function HistoryRow({ e, open, toggle }: { e: EventView; open: boolean; toggle: () => void }) {
  const { x, lab, date } = useL();
  const ids = [e.correlationId, ...Object.entries(e.data ?? {}).filter(([k]) => /id$/i.test(k)).map(([, v]) => String(v))];
  return <li className="rounded-xl border border-[#E4DCCB] p-3 text-sm" data-testid={`row-event-${e.id}`}>
    <button type="button" aria-expanded={open} onClick={toggle} data-testid={`button-event-${e.id}`} className="flex w-full min-w-0 flex-wrap items-center gap-2 text-left"><Tag>{e.kind}</Tag><Tag warn={/reject|fail|block/.test(e.state)}>{e.state}</Tag><span className="min-w-0 flex-1 truncate text-xs">{lab(e.reason)}</span><span className="text-[10px] text-[#5B6B85]">{date(e.at)}</span></button>
    {open && <div className="mt-2 grid gap-2 text-xs"><p className="break-all font-mono">{lab(e.environment)} · {x('execução', 'run', 'ejecución')} {e.runId} · {lab(e.scenario)}</p>
      <div><b>{x('Correlação (oportunidade, decisão, ordem, posição, movimento, distribuição)', 'Correlation (opportunity, decision, order, position, movement, distribution)', 'Correlación (oportunidad, decisión, orden, posición, movimiento, distribución)')}</b>{[...new Set(ids)].map(i => <p key={i} className="break-all font-mono">{i}</p>)}</div>
      <Fields o={e.data ?? {}} /><Tech o={e} /></div>}
  </li>;
}
export default SimulationPanel;
