/** @jsxImportSource react */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { isDemoSession } from '@/components/demo/demo-session';
import { formatBrazilDateTime } from '@/components/demo/brazil-time';
import { useWalletHistory } from './use-wallet-history';
import { brlReference, decimalQuantity, filterWalletHistory, walletFilterFromSearch, type WalletHistoryRow } from './wallet-history-model';
import { downloadWalletHistory } from './wallet-history-export';
import { demoPath } from '../demo/demo-navigation';
import { historyQuery } from './history-selection';
import { WalletHelp } from '../demo/WalletHelp';

type T3 = [string, string, string];
const TYPES: Record<string, T3> = {
  yield: ['Rendimento', 'Yield', 'Rendimiento'], staking: ['Staking', 'Staking', 'Staking'],
  purchase: ['Compra', 'Purchase', 'Compra'], swap: ['Troca', 'Swap', 'Intercambio'],
  withdrawal: ['Saque', 'Withdrawal', 'Retiro'], send: ['Envio', 'Send', 'Envío'],
  deposit: ['Depósito', 'Deposit', 'Depósito'], fee: ['Taxa', 'Fee', 'Comisión'],
  onramp: ['Adicionar saldo', 'Add balance', 'Agregar saldo'], receive: ['Recebimento', 'Received', 'Recibido'],
  approval: ['Aprovação', 'Approval', 'Aprobación'], quote: ['Cotação', 'Quote', 'Cotización'],
  wallet_activity: ['Atividade da carteira', 'Wallet activity', 'Actividad de la billetera'],
  operation: ['Outra operação', 'Other operation', 'Otra operación'],
};
const STATES: Record<string, T3> = {
  pending: ['Pendente', 'Pending', 'Pendiente'], requested: ['Solicitado', 'Requested', 'Solicitado'],
  processing: ['Em processamento', 'Processing', 'En proceso'], submitted: ['Enviado à rede', 'Submitted', 'Enviado a la red'],
  confirmed: ['Confirmado', 'Confirmed', 'Confirmado'], completed: ['Concluído', 'Completed', 'Completado'],
  settled: ['Liquidado', 'Settled', 'Liquidado'], failed: ['Falhou', 'Failed', 'Fallido'],
  rejected: ['Recusado', 'Rejected', 'Rechazado'], cancelled: ['Cancelado', 'Cancelled', 'Cancelado'],
  reverted: ['Revertido', 'Reverted', 'Revertido'], reversed: ['Estornado', 'Reversed', 'Revertido (estorno)'],
  simulated: ['Simulado', 'Simulated', 'Simulado'], recorded: ['Registrado', 'Recorded', 'Registrado'],
  approved: ['Aprovado', 'Approved', 'Aprobado'], expired: ['Expirado', 'Expired', 'Expirado'],
  uncertain: ['Incerto', 'Uncertain', 'Incierto'], partial: ['Parcial', 'Partial', 'Parcial'],
};
const KINDS: Record<string, T3> = {
  onramp: ['Entrada via on-ramp', 'On-ramp funding', 'Fondeo vía on-ramp'],
  external_deposit: ['Depósito externo', 'External deposit', 'Depósito externo'],
  swap: ['Troca entre carteiras', 'Wallet swap', 'Intercambio entre billeteras'],
  distribution_paid: ['Rendimento creditado', 'Yield credited', 'Rendimiento acreditado'],
  withdraw: ['Saque solicitado', 'Withdrawal', 'Retiro'], send: ['Envio de BETTEX', 'BETTEX transfer', 'Envío de BETTEX'],
  participation_entered: ['Entrada em staking', 'Staking entry', 'Entrada en staking'],
  gas_fee: ['Gás da rede', 'Network gas', 'Gas de red'],
  financial_requested: ['Pedido financeiro', 'Financial request', 'Solicitud financiera'],
};
const SRC: Record<string, T3> = {
  demo_json_recovered_or_seeded: ['Arquivo da simulação', 'Simulation archive', 'Archivo de simulación'],
  illustrative_example: ['Exemplo ilustrativo', 'Illustrative example', 'Ejemplo ilustrativo'],
};
const ENVS: Record<string, T3> = {
  simulation: ['Simulação', 'Simulation', 'Simulación'], example: ['Exemplo', 'Example', 'Ejemplo'],
  local_evm: ['Blockchain local', 'Local blockchain', 'Blockchain local'],
  testnet: ['Testnet pública', 'Public testnet', 'Testnet pública'],
  production: ['Produção pública', 'Public production', 'Producción pública'],
  account_test: ['Conta de teste', 'Account test', 'Cuenta de prueba'],
};
const GOOD = new Set(['confirmed', 'completed', 'settled', 'approved', 'recorded']);
const BAD = new Set(['failed', 'rejected', 'cancelled', 'reverted', 'reversed', 'expired']);
const TYPE_TONE: Record<string, string> = {
  yield: 'bg-[#DDF0E4] text-[#0A6657]', staking: 'bg-[#E3E8F7] text-[#2F4A9A]', swap: 'bg-[#F6E8CC] text-[#7A5410]',
  purchase: 'bg-[#F6E8CC] text-[#7A5410]', fee: 'bg-[#EFE3E3] text-[#7A3A3A]',
};
const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0E7C6B] bg-white px-3 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
const btnP = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0E7C6B] px-3 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
const sel = 'min-h-11 min-w-0 w-full max-w-full rounded-xl border border-[#E4DCCB] bg-white px-2 text-sm';
const chip = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold';

export function WalletStatement({ d, visualDemo = false }: { d: DemoDashboard; visualDemo?: boolean }) {
  const { x, tx, loc } = useX();
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const nativeOk = !isDemoSession(d.profile) && d.profile.provider === 'native';
  const [mode, setMode] = useState<'native' | 'demo'>(nativeOk ? 'native' : 'demo');
  const routeSearch = useSearch();
  const [, navigate] = useLocation();
  const [wallet, setWallet] = useState(() => walletFilterFromSearch(routeSearch));
  const [type, setType] = useState('');
  const [state, setState] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    setWallet(walletFilterFromSearch(routeSearch)); setType(''); setState(''); setSearch('');
  }, [routeSearch]);
  const selectWallet = (next: string) => {
    navigate(`${demoPath('wallet', loc)}${historyQuery('wallets', next ? { wallet: next } : {})}#wallet-statement`);
  };
  const q = useWalletHistory(mode, d.profile.accountId);
  const actual = useMemo(() => q.data?.rows ?? [], [q.data]);
  const base = useMemo(() => visualDemo ? actual.filter(r => r.type !== 'fee' && r.kind !== 'gas_fee') : actual, [actual, visualDemo]);
  const filters = { wallet, type, state, search };
  const rows = useMemo(() => filterWalletHistory(base, filters), [base, wallet, type, state, search]);
  const states = useMemo(() => [...new Set(base.map(r => r.state))].sort(), [base]);
  const addresses = useMemo(() => [...new Set(base.map(r => r.walletAddress).filter((a): a is string => !!a))].sort(), [base]);
  const types = useMemo(() => [...new Set([...Object.keys(TYPES), ...base.map(r => r.type)])].filter(t => !visualDemo || t !== 'fee'), [base, visualDemo]);
  const reset = () => { setWallet(''); setType(''); setState(''); setSearch(''); selectWallet(''); };
  const filtered = !!(wallet || type || state || search.trim());

  const tl = (m: Record<string, T3>, k: string, fb: T3) => { const v = m[k]; return v ? v[loc === 'pt' ? 0 : loc === 'en' ? 1 : 2] : tx(fb); };
  const typeLabel = (t: string) => tl(TYPES, t, TYPES.operation);
  const stateLabel = (s: string) => tl(STATES, s, ['Estado não classificado', 'Unclassified state', 'Estado sin clasificar']);
  const qty = (s: string | null, asset?: string | null) => {
    if (s === null) return '—';
    const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(s);
    if (!m) return s;
    const dec = (1.1).toLocaleString(fl).charAt(1);
    const fraction = asset === 'USDC' ? (m[3] ?? '').padEnd(2, '0') : m[3];
    return `${m[1]}${BigInt(m[2]).toLocaleString(fl)}${fraction ? dec + fraction : ''}`;
  };
  const brl = (v: number | null) => v === null ? null : v.toLocaleString(fl, { style: 'currency', currency: 'BRL' });
  const dt = (v: string) => formatBrazilDateTime(v, fl);
  const short = (s: string) => s.length > 18 ? `${s.slice(0, 8)}…${s.slice(-6)}` : s;

  const est = x('estimativa, cotação ilustrativa atual', 'estimate, current illustrative exchange rate', 'estimación, cotización ilustrativa actual');
  const brlLine = (r: WalletHistoryRow, fee: boolean) => {
    const v = brl(brlReference(r, d, fee));
    return v ? <span className="mt-1 block text-sm font-semibold text-[#3D4A63]" data-testid={fee ? `statement-brl-fee-${r.id}` : `statement-brl-${r.id}`}>≈ {v} <span className="block text-[10px] font-normal text-[#5B6B85]">{est}</span></span>
      : <span className="block text-xs text-[#8A94A6]" data-testid={fee ? undefined : `statement-brl-${r.id}`}>{x('Referência em BRL indisponível', 'BRL reference unavailable', 'Referencia en BRL no disponible')}</span>;
  };

  const row = (r: WalletHistoryRow) => {
    const kindLabel = KINDS[r.kind] ? tl(KINDS, r.kind, TYPES.operation) : typeLabel(r.type);
    const swapLike = r.type === 'swap' || r.type === 'purchase';
    const requestRecord = r.kind === 'financial_requested';
    const pending = !requestRecord && !GOOD.has(r.state) && !BAD.has(r.state) && r.state !== 'simulated';
    const sCls = GOOD.has(r.state) ? 'bg-[#DDF0E4] text-[#0A6657]' : BAD.has(r.state) ? 'bg-[#F6DADA] text-[#8C2B2B]' : 'bg-[#F0E9DA] text-[#5B6B85]';
    const noCredit = BAD.has(r.state);
    const hasFee = r.feeUsdc !== null && Number(r.feeUsdc) !== 0;
    return <li key={r.id} data-testid={`statement-row-${r.id}`} className="grid min-w-0 gap-3 rounded-2xl border border-[#E4DCCB] bg-white p-3 sm:p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-1.5">
          <span className={`${chip} ${TYPE_TONE[r.type] ?? 'bg-[#EEE9DD] text-[#3D4A63]'}`}>{typeLabel(r.type)}</span>
          <span className={`${chip} ${sCls}`}>{requestRecord && !BAD.has(r.state) ? x('Solicitação registrada', 'Request logged', 'Solicitud registrada') : stateLabel(r.state)}</span>
          {r.example && <span className={`${chip} bg-[#F6E8CC] text-[#7A5410]`}>{x('Exemplo, não é saldo', 'Example, not a balance', 'Ejemplo, no es saldo')}</span>}
          {r.reconstructed && <span className={`${chip} bg-[#E3E8F7] text-[#2F4A9A]`}>{x('Reconstruído', 'Reconstructed', 'Reconstruido')}</span>}
          {r.wallets.map(w => <span key={w} className={`${chip} border border-[#E4DCCB] text-[#3D4A63]`}>{x('Carteira', 'Wallet', 'Billetera')} {w}</span>)}
          {r.details.sourceWallet === 'earnings' && <span className={`${chip} border border-[#D9BD7D] bg-[#FFF5D9]`}>{x('Carteira de rendimentos', 'Earnings wallet', 'Cartera de ganancias')}</span>}
          {r.kind === 'transfer' && r.details.targetWallet === 'dollar' && <span className={`${chip} border border-[#E4DCCB]`}>{x('Destino: carteira em dólares', 'Destination: dollar wallet', 'Destino: cartera en dólares')}</span>}
        </div>
        <p className="mt-2 break-words text-sm font-bold">{kindLabel}</p>
        <p className="text-xs text-[#5B6B85]">{dt(r.at)} · {x('Horário de Brasília', 'Brasília time', 'Hora de Brasilia')}</p>
        {!KINDS[r.kind] && !TYPES[r.type]?.length && null}
        {!KINDS[r.kind] && r.kind && <p className="break-all text-[11px] text-[#8A94A6]">{x('Identificador técnico', 'Technical identifier', 'Identificador técnico')}: {r.kind}</p>}
      </div>
      <div className="min-w-0 rounded-xl bg-[#F5F1E8] p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#5B6B85]">{x('Valor principal', 'Main amount', 'Importe principal')}</p>
        {swapLike && r.paidAmount ? <p className="mt-1 break-words text-sm font-extrabold tabular-nums">
          <span className="block">{x('Origem', 'From', 'Origen')}: {qty(r.paidAmount, r.paidAsset)} {r.paidAsset}</span>
          <span className="block">{x('Destino', 'To', 'Destino')}: {qty(r.amount, r.asset)} {r.asset}</span></p>
          : <p className="mt-1 break-words text-base font-extrabold tabular-nums">{qty(r.amount, r.asset)} {r.asset ?? ''}</p>}
        {swapLike && !r.paidAmount && r.asset && <p className="text-xs text-[#5B6B85]">{x('Afeta USDC e BETTEX', 'Affects USDC and BETTEX', 'Afecta USDC y BETTEX')}</p>}
        {brlLine(r, false)}
        {requestRecord && <p className="mt-1 text-xs text-[#5B6B85]">{x('Registro da solicitação. A liquidação aparece no comprovante separado; não é uma segunda cobrança.', 'Request audit record. Settlement appears in its separate receipt; this is not a second charge.', 'Registro de la solicitud. La liquidación aparece en su comprobante separado; no es un segundo cobro.')}</p>}
        {pending && <p className="mt-1 text-xs font-semibold text-[#7A5410]">{x('Ainda não é um crédito concluído', 'Not a completed credit yet', 'Aún no es un crédito completado')}</p>}
        {noCredit && <p className="mt-1 text-xs font-semibold text-[#8C2B2B]">{x('Solicitação sem crédito concluído', 'Request without completed credit', 'Solicitud sin crédito completado')}</p>}
      </div>
      <div className="grid min-w-0 content-start gap-2">
        {!visualDemo && <div className="min-w-0 rounded-xl border border-dashed border-[#D9CFB8] p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#5B6B85]">{requestRecord ? x('Taxa cotada', 'Quoted fee', 'Comisión cotizada') : x('Taxa', 'Fee', 'Comisión')}</p>
          {hasFee ? <><p className="break-words text-sm font-bold tabular-nums">{qty(r.feeUsdc, 'USDC')} USDC</p>{brlLine(r, true)}</> : <p className="text-sm text-[#8A94A6]">{r.feeUsdc === null ? x('Taxa em USDC não registrada', 'USDC fee not recorded', 'Comisión en USDC no registrada') : x('Sem taxa em USDC', 'No USDC fee', 'Sin comisión en USDC')}</p>}
          {r.details.gasWei && <p className="mt-1 break-all text-xs tabular-nums">{x('Gás da rede', 'Network gas', 'Gas de la red')}: {qty(decimalQuantity(r.details.gasWei, 18))} ETH</p>}
        </div>}
        <div className="min-w-0 text-[11px] text-[#5B6B85]">
          <p className="break-words">{x('Origem', 'Source', 'Origen')}: {SRC[r.source] ? tl(SRC, r.source, SRC.illustrative_example) : r.source} · {tl(ENVS, r.environment, ['Ambiente', 'Environment', 'Entorno'])}</p>
          <p className="break-all">ID: {short(r.id)}</p>
          {r.transactionHash && <p className="break-all">Hash: {short(r.transactionHash)}</p>}
          {r.walletAddress && <p className="break-all">{x('Endereço', 'Address', 'Dirección')}: {short(r.walletAddress)}</p>}
          {r.details.periodId && <p className="break-all">{x('Rodada', 'Round', 'Ronda')}: {r.details.periodId}</p>}
        </div>
      </div>
    </li>;
  };

  const dl = (rs: WalletHistoryRow[], k: 'csv' | 'json') => {
    if (q.isLoading || q.isError) return;
    downloadWalletHistory(rs, d, k, 'actual', visualDemo);
  };
  const lbl = 'grid min-w-0 gap-1 text-xs font-semibold text-[#5B6B85]';
  return <section id="wallet-statement" className="dcard grid min-w-0 w-full gap-4 p-4 sm:p-5" data-testid="wallet-statement">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="display text-lg font-extrabold"><WalletHelp id="statement" label={x('Extrato da carteira', 'Wallet statement', 'Extracto de la billetera')}>
          <p>{x('Histórico de movimentos e rendimentos da sua conta. A fonte indicada distingue registros da simulação e registros nativos; não são somados como se fossem o mesmo saldo. Os atalhos de histórico de cada carteira já selecionam o filtro correspondente.', 'History of your account’s movements and earnings. The displayed source distinguishes simulation and native records; they are not added together as one balance. Each wallet’s history shortcut preselects its corresponding filter.', 'Historial de movimientos y ganancias de tu cuenta. La fuente indicada distingue registros de simulación y nativos; no se suman como si fueran un mismo saldo. El acceso al historial de cada cartera preselecciona su filtro correspondiente.')}</p>
          <p>{x('Cada lançamento mostra sua quantidade, ativo e status. A equivalência em reais é aproximada pela referência atual, não pelo preço histórico de execução. Não confunda um pedido pendente com uma operação confirmada.', 'Each entry shows its quantity, asset and status. The BRL equivalent is approximate at the current reference rate, not the historical execution price. Do not confuse a pending request with a confirmed operation.', 'Cada movimiento muestra su cantidad, activo y estado. La equivalencia en reales es aproximada con la referencia actual, no con el precio histórico de ejecución. No confundas una solicitud pendiente con una operación confirmada.')}</p>
        </WalletHelp></h3>
        <p className="mt-1 max-w-2xl text-xs text-[#5B6B85]">{x('Valores em BRL são estimativas à cotação ilustrativa atual, não o preço histórico de execução. Cotação BETTEX nativa em BRL e ETH não estão disponíveis.', 'BRL values are estimates at the current illustrative exchange rate, not the historical execution price. Native BETTEX BRL quote and ETH are unavailable.', 'Los valores en BRL son estimaciones a la cotización ilustrativa actual, no al precio histórico de ejecución. La cotización nativa de BETTEX en BRL y ETH no están disponibles.')}</p>
      </div>
      <span className={`${chip} ${mode === 'native' ? 'bg-[#DDF0E4] text-[#0A6657]' : 'bg-[#F0E9DA] text-[#5B6B85]'}`} data-testid="statement-source">
        {mode === 'native' ? x('Registros nativos da conta', 'Native account records', 'Registros nativos de la cuenta') : x('Registros da simulação', 'Simulation records', 'Registros de la simulación')}
      </span>
    </div>

    {nativeOk && <div className="flex flex-wrap gap-2">
        <button type="button" data-testid="statement-source-native" aria-pressed={mode === 'native'} className={mode === 'native' ? btnP : btn} onClick={() => { setMode('native'); reset(); }}>{x('Fonte nativa', 'Native source', 'Fuente nativa')}</button>
        <button type="button" data-testid="statement-source-demo" aria-pressed={mode === 'demo'} className={mode === 'demo' ? btnP : btn} onClick={() => { setMode('demo'); reset(); }}>{x('Fonte simulada', 'Simulated source', 'Fuente simulada')}</button>
    </div>}

    <div className="grid gap-2 rounded-2xl border border-[#E4DCCB] bg-[#F5F1E8] p-3 sm:p-4" data-testid="statement-downloads">
      <div className="text-sm font-extrabold"><WalletHelp id="statement-downloads" label={x('Baixar extrato', 'Download statement', 'Descargar extracto')}>
        <p>{x('Todos os registros exporta os registros carregados da fonte selecionada, ignorando os filtros. Filtrados exporta somente os resultados dos filtros atuais, incluindo os que ficam abaixo da tela.', 'All records exports loaded records from the selected source, ignoring filters. Filtered exports only matches for the current filters, including entries below the viewport.', 'Todos los registros exporta los registros cargados de la fuente seleccionada, ignorando los filtros. Filtrados exporta solo los resultados de los filtros actuales, incluidos los que están debajo de la pantalla.')}</p>
        <p>{x('CSV é adequado para planilhas; JSON preserva dados estruturados para análise. Baixar não movimenta saldo. O arquivo pode conter endereços e seu histórico financeiro: compartilhe com cuidado. Registros da simulação não comprovam transações com dinheiro real.', 'CSV is suitable for spreadsheets; JSON preserves structured data for analysis. Downloading does not move funds. Files may contain addresses and your financial history: share carefully. Simulation records do not prove real-money transactions.', 'CSV es adecuado para hojas de cálculo; JSON conserva datos estructurados para análisis. Descargar no mueve saldo. El archivo puede contener direcciones y tu historial financiero: compártelo con cuidado. Los registros de simulación no prueban transacciones con dinero real.')}</p>
      </WalletHelp></div>
      <p className="text-xs text-[#5B6B85]">{x(`Todos os ${base.length} registros carregados da fonte selecionada (inclui rendimento e todas as operações de carteira).`, `All ${base.length} loaded records from the selected source (includes yield and every wallet operation).`, `Los ${base.length} registros cargados de la fuente seleccionada (incluye rendimiento y todas las operaciones).`)}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
        <button type="button" id="statement-download-all-csv" data-testid="statement-download-all-csv" className={btnP} disabled={q.isLoading || q.isError || !base.length} onClick={() => dl(base, 'csv')}>{x('Todos os registros (CSV)', 'All records (CSV)', 'Todos los registros (CSV)')}</button>
        <button type="button" id="statement-download-all-json" data-testid="statement-download-all-json" className={btn} disabled={q.isLoading || q.isError || !base.length} onClick={() => dl(base, 'json')}>{x('Todos os registros (JSON)', 'All records (JSON)', 'Todos los registros (JSON)')}</button>
          <button type="button" id="statement-download-filtered-csv" data-testid="statement-download-filtered-csv" className={btn} disabled={q.isLoading || q.isError || !rows.length} onClick={() => dl(rows, 'csv')}>{x(`Filtrados (CSV, ${rows.length})`, `Filtered (CSV, ${rows.length})`, `Filtrados (CSV, ${rows.length})`)}</button>
          <button type="button" data-testid="statement-download-filtered-json" className={btn} disabled={q.isLoading || q.isError || !rows.length} onClick={() => dl(rows, 'json')}>{x(`Filtrados (JSON, ${rows.length})`, `Filtered (JSON, ${rows.length})`, `Filtrados (JSON, ${rows.length})`)}</button>
      </div>
    </div>

    <div className="grid min-w-0 gap-3 rounded-2xl border border-[#E4DCCB] bg-[#FBF8F0] p-3 sm:p-4" data-testid="statement-filters">
      <h4 className="text-sm font-extrabold"><WalletHelp id="statement-filters" label={x('Filtrar registros', 'Filter records', 'Filtrar registros')}>
        <p>{x('Carteira limita o extrato a USDC, BETTEX, rendimentos ou um endereço. Tipo de transação seleciona a natureza do movimento, como depósito, envio ou conversão. Status seleciona a etapa registrada: pendente, confirmado, concluído ou falha, por exemplo.', 'Wallet limits the statement to USDC, BETTEX, earnings or an address. Transaction type selects the movement category, such as deposit, send or conversion. Status selects the recorded stage, such as pending, confirmed, completed or failed.', 'Cartera limita el extracto a USDC, BETTEX, ganancias o una dirección. Tipo de transacción selecciona la categoría del movimiento, como depósito, envío o conversión. Estado selecciona la etapa registrada, como pendiente, confirmado, completado o fallido.')}</p>
        <p>{x('A busca encontra ID, hash ou endereço. Os filtros se combinam e não alteram operações ou saldos. Nenhum resultado pode significar apenas que os filtros não correspondem a registros. Para ampliar a consulta, selecione Todas as carteiras, Todos os tipos e Todos os status e limpe a busca.', 'Search finds an ID, hash or address. Filters combine and do not change operations or balances. No matches may simply mean the filters do not match records. Broaden the query with All wallets, All types and All statuses and clear the search.', 'La búsqueda encuentra ID, hash o dirección. Los filtros se combinan y no alteran operaciones ni saldos. Ningún resultado puede significar solo que los filtros no coinciden con registros. Amplía la consulta seleccionando Todas las carteras, Todos los tipos y Todos los estados y vacía la búsqueda.')}</p>
      </WalletHelp></h4>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <label className={lbl}>{x('Carteira', 'Wallet', 'Billetera')}
        <select id="filter-statement-wallet" data-testid="filter-statement-wallet" className={sel} value={wallet} onChange={e => selectWallet(e.target.value)}>
          <option value="">{x('Todas as carteiras', 'All wallets', 'Todas las billeteras')}</option>
          <option value="earnings">{x('Rendimentos', 'Earnings', 'Ganancias')}</option><option value="USDC">USDC</option><option value="BETTEX">BETTEX</option>
          {addresses.map(address => <option key={address} value={address}>{x('Endereço', 'Address', 'Dirección')} · {address}</option>)}
        </select></label>
      <label className={lbl}>{x('Tipo de transação', 'Transaction type', 'Tipo de transacción')}
        <select id="filter-statement-type" data-testid="filter-statement-type" className={sel} value={type} onChange={e => setType(e.target.value)}>
          <option value="">{x('Todos os tipos', 'All types', 'Todos los tipos')}</option>
          {types.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select></label>
      <label className={lbl}>{x('Status', 'Status', 'Estado')}
        <select data-testid="filter-statement-state" className={sel} value={state} onChange={e => setState(e.target.value)}>
          <option value="">{x('Todos os status', 'All statuses', 'Todos los estados')}</option>
          {states.map(s => <option key={s} value={s}>{stateLabel(s)}</option>)}
        </select></label>
      <label className={lbl}>{x('Buscar ID, hash ou endereço', 'Search ID, hash or address', 'Buscar ID, hash o dirección')}
        <input data-testid="filter-statement-search" className={sel} value={search} onChange={e => setSearch(e.target.value)} />
      </label>
      </div>
    </div>

    {q.isLoading ? <div className="grid gap-2" data-testid="statement-loading" aria-busy="true">{[0, 1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#EEE9DD]" />)}</div>
      : q.isError ? <div role="alert" className="grid justify-items-start gap-2 rounded-2xl bg-[#F6DADA] p-4 text-sm text-[#8C2B2B]" data-testid="statement-error">
        <p>{x('Não foi possível carregar o extrato.', 'Could not load the statement.', 'No se pudo cargar el extracto.')}</p>
        <button type="button" className={btn} onClick={() => q.refetch()}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></div> : null}

    {!q.isError && q.data?.syncUnavailable && <div role="status" className="grid justify-items-start gap-2 rounded-2xl border border-[#E5CC87] bg-[#FFF5D9] p-4 text-sm text-[#73531B]" data-testid="statement-sync-warning">
      <p>{x('A sincronização ao vivo está indisponível. Exibindo registros salvos; atividades recentes da blockchain podem não aparecer.', 'Live sync is unavailable. Showing saved records; recent blockchain activity may be missing.', 'La sincronización en vivo no está disponible. Se muestran registros guardados; puede faltar actividad reciente de la blockchain.')}</p>
      <button type="button" className={btn} disabled={q.isFetching} onClick={() => void q.refetch()}>{x('Tentar sincronizar', 'Retry sync', 'Reintentar sincronización')}</button>
    </div>}

    {!q.isLoading && !q.isError && <>
      <p className="text-xs text-[#5B6B85]" aria-live="polite" data-testid="statement-count">
        {x(`${rows.length} de ${base.length} registros`, `${rows.length} of ${base.length} records`, `${rows.length} de ${base.length} registros`)}{q.isFetching ? ` · ${x('Atualizando', 'Refreshing', 'Actualizando')}` : ''}
      </p>
      {rows.length === 0 ? <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-[#D9CFB8] p-8 text-center" data-testid="statement-empty">
        <p className="text-sm font-bold">{filtered ? x('Nenhum registro com esses filtros.', 'No records match these filters.', 'Ningún registro coincide con estos filtros.') : q.data?.syncUnavailable ? x('Nenhuma transação salva ainda.', 'No saved transactions yet.', 'Aún no hay transacciones guardadas.') : x('Nenhuma transação ainda.', 'No transactions yet.', 'Aún no hay transacciones.')}</p>
        {filtered && <button type="button" className={btn} data-testid="statement-reset" onClick={reset}>{x('Limpar filtros', 'Reset filters', 'Limpiar filtros')}</button>}
      </div> : <ul className="grid min-w-0 gap-3">{rows.map(row)}</ul>}
    </>}
  </section>;
}
