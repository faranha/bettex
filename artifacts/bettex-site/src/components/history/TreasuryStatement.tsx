/** @jsxImportSource react */
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { useGetDemoTreasuryStatement, exportDemoTreasuryStatement, type DemoDashboard, type GetDemoTreasuryStatementParams, type TreasuryStatementEntry } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { formatBrazilDateTime, BRAZIL_TIME_ZONE } from '@/components/demo/brazil-time';
import { TreasuryStatementSummary, useStmtFmt } from './TreasuryStatementSummary';
import { demoPath } from '../demo/demo-navigation';
import { historyQuery, treasuryFiltersFromSearch, treasuryWalletFromSearch } from './history-selection';
import { TreasuryWalletHistoryContext } from './TreasuryWalletHistoryContext';

type T3 = [string, string, string];
export const brazilDate = (v: string | number | Date) => new Date(v).toLocaleDateString('en-CA', { timeZone: BRAZIL_TIME_ZONE });
const CATS: Record<string, T3> = {
  investment_result: ['Resultado realizado de investimento', 'Realized investment result', 'Resultado realizado de inversión'],
  execution_cost: ['Custo de execução', 'Execution cost', 'Costo de ejecución'],
  distribution: ['Distribuição', 'Distribution', 'Distribución'],
  buyback_funding: ['Financiamento da recompra', 'Buyback funding', 'Fondeo de recompra'],
  buyback_purchase: ['Compra da recompra', 'Buyback purchase', 'Compra de recompra'],
  token_purchase: ['Compra de tokens', 'Token purchase', 'Compra de tokens'],
  token_burn: ['Queima de tokens', 'Token burn', 'Quema de tokens'],
  lottery_purchase: ['Compra no sorteio', 'Lottery purchase', 'Compra en sorteo'],
  investment_income: ['Renda de investimento', 'Investment income', 'Ingreso de inversión'],
  capital_received: ['Capital recebido', 'Capital received', 'Capital recibido'],
  investment_funding: ['Aporte em investimento', 'Investment funding', 'Aporte a inversión'],
  principal_return: ['Retorno de principal', 'Principal return', 'Retorno de principal'],
  transfer: ['Transferência', 'Transfer', 'Transferencia'],
  withdrawal: ['Saque', 'Withdrawal', 'Retiro'],
};
const SRC: Record<string, T3> = {
  modeled_settlement: ['Liquidação modelada', 'Modeled settlement', 'Liquidación modelada'],
  modeled_demo: ['Demonstração modelada', 'Modeled demo', 'Demostración modelada'],
  recorded_simulation: ['Registro da simulação', 'Simulation record', 'Registro de la simulación'],
};
const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0E7C6B] bg-white px-3 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
const btnP = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0E7C6B] px-3 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
const sel = 'min-h-11 min-w-0 w-full max-w-full rounded-xl border border-[#E4DCCB] bg-white px-2 text-sm';
const chip = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold';
const lbl = 'grid min-w-0 gap-1 text-xs font-semibold text-[#5B6B85]';
const MISSING: Record<string, T3> = {
  other_investments: ['Outros investimentos', 'Other investments', 'Otras inversiones'],
  funding_timestamps: ['Horários originais de aportes e retornos de principal', 'Original funding and principal-return times', 'Horarios originales de aportes y retornos de principal'],
  native_transactions: ['Transações nativas e fontes externas', 'Native transactions and external sources', 'Transacciones nativas y fuentes externas'],
};
const PARTIES: Record<string, T3> = {
  treasury: ['Tesouraria', 'Treasury', 'Tesorería'], buyback: ['Recompra', 'Buyback', 'Recompra'],
  participation: ['Participação', 'Participation', 'Participación'], market: ['Mercado', 'Market', 'Mercado'],
  burn: ['Queima', 'Burn', 'Quema'], crypto: ['Cripto', 'Crypto', 'Cripto'],
  predictions: ['Previsões', 'Predictions', 'Predicciones'], sports: ['Esportes', 'Sports', 'Deportes'],
  bonus: ['Bônus', 'Bonus', 'Bonos'],
};

export function TreasuryStatement({ dashboard, serverNow, roundStartedAt }: { dashboard: DemoDashboard; serverNow: string; roundStartedAt?: string }) {
  const { x, tx, loc } = useX(); const { fl, qty } = useStmtFmt();
  const queryClient = useQueryClient();
  const routeSearch = useSearch(); const [, navigate] = useLocation();
  const walletScope = treasuryWalletFromSearch(routeSearch);
  const reserveOnly = walletScope === 'reserve';
  const allocationOnly = walletScope === 'crypto_agent';
  const noTransferLedger = reserveOnly || allocationOnly;
  const today = brazilDate(serverNow);
  const [from, setFrom] = useState(() => roundStartedAt ? brazilDate(roundStartedAt) : today);
  const [to, setTo] = useState(today);
  const [asset, setAsset] = useState(() => treasuryFiltersFromSearch(routeSearch).asset);
  const [account, setAccount] = useState(() => treasuryFiltersFromSearch(routeSearch).account);
  const [category, setCategory] = useState('');
  const [direction, setDirection] = useState<'all' | 'in' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [snap, setSnap] = useState<{ snapshot: string; asOf: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState(false);
  useEffect(() => {
    const filters = treasuryFiltersFromSearch(routeSearch);
    setAccount(filters.account); setAsset(filters.asset);
    setCategory(''); setDirection('all'); setSearch(''); setPage(1); setSnap(null);
  }, [routeSearch]);
  const selectAccount = (nextAccount: typeof account, nextAsset: typeof asset) => {
    const sameWallet = walletScope === 'buyback' && nextAccount === 'buyback' || (walletScope === 'operational' || walletScope === 'crypto_agent') && nextAccount === 'treasury';
    navigate(`${demoPath('wallet', loc)}${historyQuery('treasury', { treasuryAccount: nextAccount, treasuryAsset: nextAsset, ...(sameWallet && walletScope ? { treasuryWallet: walletScope } : {}) })}#treasury-statement`);
  };
  const selectWalletScope = (scope: typeof walletScope) => {
    navigate(`${demoPath('wallet', loc)}${historyQuery('treasury', {
      treasuryAccount: scope === 'operational' || scope === 'crypto_agent' ? 'treasury' : scope === 'buyback' ? 'buyback' : 'all',
      treasuryAsset: scope ? 'USDC' : 'all', ...(scope ? { treasuryWallet: scope } : {}),
    })}#treasury-statement`);
  };

  const days = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 864e5);
  const validRange = /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to) && days >= 0 && days <= 30;
  const filterParams = { from, to, asset, account, direction, ...(category ? { category } : {}), ...(search.trim() ? { search: search.trim().slice(0, 100) } : {}) };
  const params: GetDemoTreasuryStatementParams = { ...filterParams, page, ...(snap ? snap : {}) };
  const q = useGetDemoTreasuryStatement(params, { query: { enabled: validRange && !noTransferLedger, queryKey: ['/api/demo/treasury/statement', params], staleTime: 10_000, refetchInterval: snap || noTransferLedger ? false : 20_000 } });
  const data = noTransferLedger ? undefined : q.data;

  const change = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); setSnap(null); };
  const goPage = (p: number) => { if (data) setSnap({ snapshot: data.snapshot, asOf: data.asOf }); setPage(p); };
  const refresh = () => { setSnap(null); setPage(1); void queryClient.invalidateQueries({ queryKey: ['/api/demo/treasury/statement'] }); };
  const reset = () => { setCategory(''); setDirection('all'); setSearch(''); setAsset('all'); setAccount('all'); setPage(1); setSnap(null); selectAccount('all', 'all'); };

  const tl = (m: Record<string, T3>, k: string) => (m[k] ? tx(m[k]) : k);
  const filtered = category || direction !== 'all' || search.trim() || asset !== 'all' || account !== 'all';
  const acct = (a: string) => a === 'treasury' ? x('Tesouraria', 'Treasury', 'Tesorería') : x('Recompra', 'Buyback', 'Recompra');

  const download = async () => {
    if (!data || busy || !validRange) return;
    setBusy(true); setExportError(false);
    try {
      const csv = await exportDemoTreasuryStatement({ ...filterParams, snapshot: data.snapshot, asOf: data.asOf, locale: loc }, { responseType: 'text', credentials: 'include' });
      // Response.text() consumes the server's UTF-8 BOM during decoding.
      // Restore exactly one marker when encoding the browser download.
      const url = URL.createObjectURL(new Blob(['\uFEFF', String(csv).replace(/^\uFEFF/, '')], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${x('extrato-tesouraria', 'treasury-statement', 'extracto-tesoreria')}-${from}_${to}.csv`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setExportError(true); } finally { setBusy(false); }
  };

  const row = (e: TreasuryStatementEntry) => {
    const neg = e.amount.startsWith('-');
    const gross = e.category === 'investment_result';
    return <li key={e.id} data-testid={`treasury-statement-row-${e.id}`} className="grid min-w-0 gap-3 rounded-2xl border border-[#E4DCCB] bg-white p-3 sm:p-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-1.5">
          <span className={`${chip} bg-[#EEE9DD] text-[#3D4A63]`}>{tl(CATS, e.category)}</span>
          <span className={`${chip} bg-[#DDF0E4] text-[#0A6657]`}>{x('Registrado', 'Recorded', 'Registrado')}</span>
          {e.internal && <span className={`${chip} border border-[#E4DCCB] text-[#3D4A63]`}>{x('Movimento interno', 'Internal movement', 'Movimiento interno')}</span>}
          {e.income && <span className={`${chip} bg-[#E3E8F7] text-[#2F4A9A]`}>{x('Renda', 'Income', 'Ingreso')}</span>}
        </div>
        <p className="mt-2 break-words text-sm font-bold">{e.counterparty.split(' · ').map(part => tl(PARTIES, part)).join(' · ')}</p>
        <p className="text-xs text-[#5B6B85]">{formatBrazilDateTime(e.at, fl)} · {x('Horário de Brasília', 'Brasília time', 'Hora de Brasilia')}</p>
        <p className="mt-1 break-all text-[11px] text-[#5B6B85]">{x('Referência', 'Reference', 'Referencia')}: {e.reference}</p>
      </div>
      <div className="min-w-0 rounded-xl bg-[#F5F1E8] p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#5B6B85]">{x('Valor do lançamento', 'Entry amount', 'Importe del asiento')}</p>
        <p className={`mt-1 break-words text-base font-extrabold tabular-nums ${neg ? 'text-[#8C2B2B]' : 'text-[#0A6657]'}`}>{qty(e.amount, e.asset, true)} {e.asset}</p>
        {gross && <p className="mt-1 text-xs text-[#5B6B85]">{x('Lucro ou perda realizado bruto, não o total recebido na operação.', 'Gross realized profit or loss, not total trade proceeds.', 'Ganancia o pérdida realizada bruta, no el total recibido en la operación.')}</p>}
      </div>
      <div className="min-w-0 text-[11px] text-[#5B6B85]">
        <p>{x('Conta', 'Account', 'Cuenta')}: {acct(e.account)}</p>
        <p className="break-words">{x('Fonte', 'Source', 'Fuente')}: {tl(SRC, e.source)}</p>
        <p className="break-words">{x('Principal (referência informativa)', 'Principal (informational reference)', 'Principal (referencia informativa)')}: {e.principal === null ? x('Não registrado', 'Not recorded', 'No registrado') : `${qty(e.principal, e.asset)} ${e.asset}`}</p>
        {e.principal !== null && <p>{x('O momento do aporte não é registrado.', 'Funding time is not recorded.', 'El momento del aporte no se registra.')}</p>}
      </div>
    </li>;
  };

  const items = useMemo(() => data?.items ?? [], [data]);
  return <section id="treasury-statement" className="dcard grid min-w-0 w-full scroll-mt-36 gap-4 p-4 sm:p-5" data-testid="treasury-statement">
    <div className="min-w-0">
      <h3 className="display text-lg font-extrabold">{allocationOnly ? x('Histórico da carteira do agente Cripto', 'Crypto agent wallet history', 'Historial de la cartera del agente Cripto')
        : walletScope === 'reserve' ? x('Histórico da carteira de reserva', 'Reserve wallet history', 'Historial de la cartera de reserva')
        : walletScope === 'operational' ? x('Histórico da carteira operacional', 'Operational wallet history', 'Historial de la cartera operativa')
        : walletScope === 'buyback' ? x('Histórico da carteira de recompra', 'Buyback wallet history', 'Historial de la cartera de recompra')
        : x('Extrato da tesouraria comunitária', 'Community treasury statement', 'Extracto de la tesorería comunitaria')}</h3>
      <p className="mt-1 max-w-3xl text-xs text-[#5B6B85]">{x('Simulação. Mostra apenas a tesouraria e a conta de recompra; a receita da operadora e as carteiras pessoais ficam fora. Não é um fluxo de caixa completo verificado: há liquidações modeladas e fontes ausentes.', 'Simulation. Shows only the treasury and the buyback account; operator revenue and personal wallets are excluded. This is not a verified complete cash flow: it includes modeled settlements and missing sources.', 'Simulación. Muestra solo la tesorería y la cuenta de recompra; los ingresos de la operadora y las billeteras personales quedan fuera. No es un flujo de caja completo verificado: incluye liquidaciones modeladas y fuentes ausentes.')}</p>
    </div>

    <label className={lbl}>{x('Carteira da tesouraria', 'Treasury wallet', 'Cartera de la tesorería')}
      <select data-testid="treasury-filter-wallet" className={sel} value={walletScope ?? ''} onChange={e => selectWalletScope((e.target.value || null) as typeof walletScope)}>
        <option value="">{x('Extrato consolidado', 'Consolidated statement', 'Extracto consolidado')}</option>
        <option value="operational">{x('Carteira operacional', 'Operational wallet', 'Cartera operativa')}</option>
        <option value="reserve">{x('Carteira de reserva', 'Reserve wallet', 'Cartera de reserva')}</option>
        <option value="buyback">{x('Carteira de recompra', 'Buyback wallet', 'Cartera de recompra')}</option>
        <option value="crypto_agent">{x('Carteira do agente Cripto', 'Crypto agent wallet', 'Cartera del agente Cripto')}</option>
      </select>
    </label>
    {walletScope && <TreasuryWalletHistoryContext d={dashboard} purpose={walletScope} />}
    {allocationOnly && <div role="status" data-testid="treasury-crypto-history-allocation" className="grid gap-2 rounded-2xl border border-[#E5CC87] bg-[#FFF5D9] p-4 text-sm text-[#73531B]">
      <p>{x('A alocação acompanha o capital reservado nas operações aprovadas do Cripto. Ao encerrar ou cancelar uma posição, esse capital deixa de estar reservado ao agente. Não é um orçamento fixo nem o limite de exposição. Não há transferências on-chain ou um extrato de caixa segregado para essa carteira.', 'Allocation follows capital reserved in approved Crypto operations. Once a position closes or is cancelled, its capital is no longer reserved for the agent. It is not a fixed budget or the exposure limit. There are no on-chain transfers or a separate cash statement for this wallet.', 'La asignación sigue el capital reservado en operaciones aprobadas de Cripto. Al cerrar o cancelar una posición, el capital deja de estar reservado para el agente. No es un presupuesto fijo ni el límite de exposición. No hay transferencias on-chain ni un extracto de caja separado para esta cartera.')}</p>
      <a className="min-h-11 self-start py-2 font-bold underline" href={`${demoPath('wallet', loc)}${historyQuery('rounds')}`}>{x('Consultar alocações e atividades das rodadas', 'View round allocations and activities', 'Consultar asignaciones y actividades de las rondas')}</a>
    </div>}
    {reserveOnly && <div role="status" data-testid="treasury-reserve-history-unrecorded" className="rounded-2xl border border-[#E5CC87] bg-[#FFF5D9] p-4 text-sm text-[#73531B]">
      {x('A reserva está separada na alocação atual, mas ainda não há registros de transferências exclusivos dessa carteira. Não foram criados aportes ou saques históricos fictícios. O extrato completo da tesouraria pode ser consultado na opção Tesouraria e recompra.', 'The reserve is separated in the current allocation, but there are no separate transfer records for this wallet yet. No fictitious historical deposits or withdrawals were created. The full treasury statement is available under Treasury and buyback.', 'La reserva está separada en la asignación actual, pero aún no hay registros de transferencias exclusivos de esta cartera. No se crearon depósitos o retiros históricos ficticios. El extracto completo está disponible en Tesorería y recompra.')}
    </div>}
    {walletScope === 'operational' && <p className="rounded-xl bg-[#FFF5D9] p-3 text-xs text-[#73531B]">{x('Os lançamentos abaixo são movimentos registrados do modelo operacional, inclusive anteriores à atribuição desse endereço. Não são transações executadas por essa carteira na blockchain. O resumo consolidado, que inclui a reserva, fica no extrato geral da tesouraria.', 'The entries below are recorded movements from the operational model, including entries before this address was assigned. They are not blockchain transactions executed by this wallet. The consolidated summary, including the reserve, remains in the general treasury statement.', 'Los asientos siguientes son movimientos registrados del modelo operativo, incluso anteriores a la asignación de esta dirección. No son transacciones blockchain ejecutadas por esta cartera. El resumen consolidado, incluida la reserva, permanece en el extracto general.')}</p>}
    {!noTransferLedger && <div className="grid min-w-0 gap-3 rounded-2xl border border-[#E4DCCB] bg-[#FBF8F0] p-3 sm:p-4" data-testid="treasury-statement-filters">
      <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className={lbl}>{x('De', 'From', 'Desde')}<input type="date" data-testid="treasury-filter-from" className={sel} value={from} max={to} onChange={e => change(setFrom)(e.target.value)} /></label>
        <label className={lbl}>{x('Até', 'To', 'Hasta')}<input type="date" data-testid="treasury-filter-to" className={sel} value={to} min={from} onChange={e => change(setTo)(e.target.value)} /></label>
        <label className={lbl}>{x('Conta', 'Account', 'Cuenta')}<select data-testid="treasury-filter-account" className={sel} value={account} onChange={e => selectAccount(e.target.value as typeof account, asset)}>
          <option value="all">{x('Todas as contas', 'All accounts', 'Todas las cuentas')}</option><option value="treasury">{x('Tesouraria', 'Treasury', 'Tesorería')}</option><option value="buyback">{x('Recompra', 'Buyback', 'Recompra')}</option></select></label>
        <label className={lbl}>{x('Ativo', 'Asset', 'Activo')}<select data-testid="treasury-filter-asset" className={sel} value={asset} onChange={e => selectAccount(account, e.target.value as typeof asset)}>
          <option value="all">{x('Todos os ativos', 'All assets', 'Todos los activos')}</option><option value="USDC">USDC</option><option value="BETTEX">BETTEX</option></select></label>
        <label className={lbl}>{x('Categoria', 'Category', 'Categoría')}<select data-testid="treasury-filter-category" className={sel} value={category} onChange={e => change(setCategory)(e.target.value)}>
          <option value="">{x('Todas as categorias', 'All categories', 'Todas las categorías')}</option>
          {Object.keys(CATS).map(c => <option key={c} value={c}>{tl(CATS, c)}</option>)}</select></label>
        <label className={lbl}>{x('Direção', 'Direction', 'Dirección')}<select data-testid="treasury-filter-direction" className={sel} value={direction} onChange={e => change(setDirection)(e.target.value as typeof direction)}>
          <option value="all">{x('Entradas e saídas', 'Inflows and outflows', 'Entradas y salidas')}</option><option value="in">{x('Só entradas', 'Inflows only', 'Solo entradas')}</option><option value="out">{x('Só saídas', 'Outflows only', 'Solo salidas')}</option></select></label>
        <label className={`${lbl} sm:col-span-2`}>{x('Buscar referência ou contraparte', 'Search reference or counterparty', 'Buscar referencia o contraparte')}<input data-testid="treasury-filter-search" maxLength={100} className={sel} value={search} onChange={e => change(setSearch)(e.target.value)} /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} data-testid="treasury-statement-refresh" disabled={q.isFetching || !validRange} onClick={refresh}>{x('Atualizar', 'Refresh', 'Actualizar')}</button>
        {filtered && <button type="button" className={btn} data-testid="treasury-statement-reset" onClick={reset}>{x('Limpar filtros', 'Reset filters', 'Limpiar filtros')}</button>}
        <button type="button" className={btnP} data-testid="treasury-statement-export" disabled={!data || busy || !validRange} aria-busy={busy} onClick={() => void download()}>{busy ? x('Gerando CSV…', 'Preparing CSV…', 'Generando CSV…') : x('Baixar CSV de todos os lançamentos', 'Download CSV of all entries', 'Descargar CSV de todos los asientos')}</button>
      </div>
      <p className="text-xs text-[#5B6B85]">{x('Período máximo de 31 dias. O CSV inclui todos os lançamentos do filtro, não só a página visível.', 'Maximum period 31 days. The CSV includes every entry matching the filters, not just the visible page.', 'Período máximo de 31 días. El CSV incluye todos los asientos del filtro, no solo la página visible.')}</p>
      {!validRange && <p role="alert" data-testid="treasury-range-error" className="rounded-xl bg-[#FFF5D9] p-3 text-sm font-semibold text-[#73531B]">{x('Escolha um período válido de até 31 dias.', 'Choose a valid period of up to 31 days.', 'Elige un período válido de hasta 31 días.')}</p>}
      {exportError && <p role="alert" data-testid="treasury-export-error" className="rounded-xl bg-[#F6DADA] p-3 text-sm text-[#8C2B2B]">{x('Não foi possível gerar o CSV. Tente novamente.', 'Could not generate the CSV. Try again.', 'No se pudo generar el CSV. Inténtalo de nuevo.')}</p>}
    </div>}

    {!noTransferLedger && validRange && q.isLoading && <div className="grid gap-2" aria-busy="true" data-testid="treasury-statement-loading"><span className="sr-only" role="status">{x('Carregando extrato', 'Loading statement', 'Cargando extracto')}</span>{[0, 1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#EEE9DD]" />)}</div>}
    {!noTransferLedger && validRange && q.isError && <div role="alert" data-testid="treasury-statement-error" className="grid justify-items-start gap-2 rounded-2xl bg-[#F6DADA] p-4 text-sm text-[#8C2B2B]">
      <p>{x('Não foi possível carregar o extrato da tesouraria.', 'Could not load the treasury statement.', 'No se pudo cargar el extracto de la tesorería.')}</p>
      <button type="button" className={btn} onClick={refresh}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></div>}

    {validRange && data && !q.isError && <>
      <div role="status" data-testid="treasury-statement-coverage" className="grid gap-1 rounded-2xl border border-[#E5CC87] bg-[#FFF5D9] p-3 text-xs text-[#73531B]">
        <p className="font-bold">{x('Cobertura parcial', 'Partial coverage', 'Cobertura parcial')}</p>
        <p>{x('Inclui liquidações modeladas e registros da simulação. Momentos de aporte de capital não são registrados.', 'Includes modeled settlements and simulation records. Capital funding times are not recorded.', 'Incluye liquidaciones modeladas y registros de la simulación. Los momentos de aporte de capital no se registran.')}</p>
        {data.missingSources.length > 0 && <p>{x('Fontes ausentes', 'Missing sources', 'Fuentes ausentes')}: {data.missingSources.map(s => tl(MISSING, s)).join(', ')}</p>}
        <p>{x('Posição em', 'As of', 'Posición a')} {formatBrazilDateTime(data.asOf, fl)}</p>
      </div>
      {walletScope !== 'operational' && <TreasuryStatementSummary data={data} />}
      <p className="text-xs text-[#5B6B85]" aria-live="polite" data-testid="treasury-statement-count">
        {x(`${data.total} lançamentos · página ${data.page} de ${Math.max(1, data.totalPages)}`, `${data.total} entries · page ${data.page} of ${Math.max(1, data.totalPages)}`, `${data.total} asientos · página ${data.page} de ${Math.max(1, data.totalPages)}`)}{q.isFetching ? ` · ${x('Atualizando', 'Refreshing', 'Actualizando')}` : ''}
      </p>
      <p className="text-xs text-[#5B6B85]">{x('O resumo cobre o período inteiro, independentemente da categoria ou da busca.', 'The summary covers the full period regardless of category or search.', 'El resumen cubre todo el período, sin importar la categoría o la búsqueda.')}</p>
      {items.length === 0 ? <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-[#D9CFB8] p-8 text-center" data-testid="treasury-statement-empty">
        <p className="text-sm font-bold">{x('Nenhum lançamento neste filtro e período.', 'No entries for this filter and period.', 'Ningún asiento para este filtro y período.')}</p>
        {filtered && <button type="button" className={btn} onClick={reset}>{x('Limpar filtros', 'Reset filters', 'Limpiar filtros')}</button>}
      </div> : <ul className="grid min-w-0 gap-3">{items.map(row)}</ul>}
      {data.totalPages > 1 && <nav aria-label={x('Paginação do extrato', 'Statement pagination', 'Paginación del extracto')} className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn} data-testid="treasury-statement-prev" disabled={data.page <= 1 || q.isFetching} onClick={() => goPage(data.page - 1)}>{x('Anterior', 'Previous', 'Anterior')}</button>
        <button type="button" className={btn} data-testid="treasury-statement-next" disabled={data.page >= data.totalPages || q.isFetching} onClick={() => goPage(data.page + 1)}>{x('Próxima', 'Next', 'Siguiente')}</button>
      </nav>}
    </>}
  </section>;
}
