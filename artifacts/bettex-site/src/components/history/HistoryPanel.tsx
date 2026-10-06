/** @jsxImportSource react */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getHistoryTransparency, getTestHistory, getDemoHistory, getTreasuryHistory, previewHistoryDistribution,
  type HistoryEntry, type HistoryPage, type GetTestHistoryParams,
} from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { ALLOWED, DEC, formatUnits, fmtTime } from './format';

type Mode = 'native' | 'demo';
type View = 'general' | 'swapping' | 'staking' | 'distributions' | 'activity' | 'treasury';
type Filters = { environment: string; category: string; asset: string; state: string; from: string; to: string; kind: string; chainId: string; wallet: string };
const EMPTY: Filters = { environment: '', category: '', asset: '', state: '', from: '', to: '', kind: '', chainId: '', wallet: '' };
const iso = (v: string) => { if (!v) return ''; const d = new Date(v); if (isNaN(d.getTime())) return ''; d.setTime(d.getTime() - d.getTimezoneOffset() * 60_000 + 3 * 3_600_000); return d.toISOString(); };
const toApi = (f: Filters): Record<string, unknown> => ({ ...f, from: iso(f.from), to: iso(f.to), chainId: /^\d+$/.test(f.chainId) ? Number(f.chainId) : '', wallet: f.wallet.trim() });
const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0E7C6B] bg-white px-3 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
const btnP = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0E7C6B] px-3 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
const sel = 'min-h-11 rounded-xl border border-[#E4DCCB] bg-white px-2 text-sm';

const STATUS: Record<string, [string, string, string]> = {
  pending: ['Pendente', 'Pending', 'Pendiente'], requested: ['Solicitado', 'Requested', 'Solicitado'],
  processing: ['Em processamento', 'Processing', 'En proceso'], submitted: ['Enviado à rede', 'Submitted to network', 'Enviado a la red'],
  approved: ['Aprovado', 'Approved', 'Aprobado'], open: ['Aberto', 'Open', 'Abierto'], closed: ['Encerrado', 'Closed', 'Cerrado'], reserved: ['Reservado', 'Reserved', 'Reservado'],
  sending: ['Enviando', 'Sending', 'Enviando'], calculated: ['Calculado', 'Calculated', 'Calculado'], authorized: ['Autorizado', 'Authorized', 'Autorizado'],
  initiated: ['Iniciado', 'Initiated', 'Iniciado'], reversed: ['Estornado', 'Reversed', 'Revertido (estorno)'],
  confirmed: ['Confirmado', 'Confirmed', 'Confirmado'], completed: ['Concluído', 'Completed', 'Completado'],
  settled: ['Liquidado', 'Settled', 'Liquidado'], failed: ['Falhou', 'Failed', 'Fallido'],
  rejected: ['Recusado', 'Rejected', 'Rechazado'], cancelled: ['Cancelado', 'Cancelled', 'Cancelado'],
  reverted: ['Revertido', 'Reverted', 'Revertido'], simulated: ['Simulado', 'Simulated', 'Simulado'],
  recorded: ['Registrado', 'Recorded', 'Registrado'], uncertain: ['Incerto', 'Uncertain', 'Incierto'],
  expired: ['Expirado', 'Expired', 'Expirado'], partial: ['Parcial', 'Partial', 'Parcial'],
};
const ENV: Record<string, [string, string, string]> = {
  local_evm: ['Blockchain local (EVM 31337)', 'Local blockchain (EVM 31337)', 'Blockchain local (EVM 31337)'],
  account_test: ['Atividade da conta', 'Account activity', 'Actividad de la cuenta'],
  simulation: ['Simulação', 'Simulation', 'Simulación'],
  testnet: ['Testnet pública', 'Public testnet', 'Testnet pública'],
  production: ['Produção pública', 'Public production', 'Producción pública'],
};
const CAT: Record<string, [string, string, string]> = {
  financial: ['Financeiro', 'Financial', 'Financiero'], activity: ['Atividade', 'Activity', 'Actividad'], automatic: ['Automático', 'Automatic', 'Automático'],
};
const KIND: Record<string, [string, string, string]> = {
  deposit: ['Depósito', 'Deposit', 'Depósito'], purchase: ['Compra de BETTEX', 'BETTEX purchase', 'Compra de BETTEX'],
  swap: ['Conversão', 'Swap', 'Conversión'], stake: ['Aplicação', 'Stake', 'Aplicación'], unstake: ['Resgate', 'Unstake', 'Rescate'],
  distribution: ['Distribuição', 'Distribution', 'Distribución'], transfer: ['Transferência', 'Transfer', 'Transferencia'],
  login: ['Entrada', 'Sign-in', 'Inicio de sesión'], logout: ['Saída', 'Sign-out', 'Cierre de sesión'], consent: ['Aceite', 'Consent', 'Aceptación'],
  free_test_funding: ['Recarga gratuita de teste', 'Free test funding', 'Recarga gratuita de prueba'],
  external_deposit: ['Depósito externo', 'External deposit', 'Depósito externo'],
  outgoing_transfer: ['Transferência enviada', 'Outgoing transfer', 'Transferencia enviada'],
  internal_transfer: ['Transferência interna', 'Internal transfer', 'Transferencia interna'],
  execution_requested: ['Execução solicitada', 'Execution requested', 'Ejecución solicitada'],
  execution_transition: ['Mudança de etapa da execução', 'Execution step change', 'Cambio de etapa de la ejecución'],
  financial_requested: ['Operação financeira solicitada', 'Financial operation requested', 'Operación financiera solicitada'],
  account_created: ['Conta criada', 'Account created', 'Cuenta creada'],
  consent_accepted: ['Aceite registrado', 'Consent accepted', 'Aceptación registrada'],
  wallets_created: ['Carteiras criadas', 'Wallets created', 'Carteras creadas'],
  profile_changed: ['Perfil alterado', 'Profile changed', 'Perfil cambiado'],
  password_changed: ['Senha alterada', 'Password changed', 'Contraseña cambiada'],
  private_authorization: ['Autorização de ação privada', 'Private action authorization', 'Autorización de acción privada'],
  private_export_authorized: ['Exportação privada autorizada', 'Private export authorized', 'Exportación privada autorizada'],
  private_export_result: ['Resultado da exportação privada', 'Private export result', 'Resultado de la exportación privada'],
  account_attempt: ['Tentativa na conta', 'Account attempt', 'Intento en la cuenta'],
  agent_processing: ['Processamento por agente', 'Agent processing', 'Procesamiento por agente'],
  distribution_calculated: ['Distribuição calculada (simulação ou apuração)', 'Distribution calculated (simulation or calculation)', 'Distribución calculada (simulación o cálculo)'],
  treasury_principal: ['Principal da tesouraria', 'Treasury principal', 'Principal de la tesorería'],
  reversal: ['Estorno', 'Reversal', 'Reversión'],
  wallets_associated: ['Carteiras associadas', 'Wallets associated', 'Carteras asociadas'],
  admin_permission_changed: ['Permissão administrativa alterada', 'Administrative permission changed', 'Permiso administrativo cambiado'],
  treasury_reservation: ['Reserva da tesouraria', 'Treasury reservation', 'Reserva de la tesorería'],
  treasury_allocation: ['Alocação da tesouraria', 'Treasury allocation', 'Asignación de la tesorería'],
  treasury_return: ['Retorno à tesouraria', 'Treasury return', 'Retorno a la tesorería'],
  treasury_cost: ['Custo da tesouraria', 'Treasury cost', 'Costo de la tesorería'],
  treasury_retention: ['Retenção da tesouraria', 'Treasury retention', 'Retención de la tesorería'],
  treasury_distribution_pool: ['Pool de distribuição da tesouraria', 'Treasury distribution pool', 'Pool de distribución de la tesorería'],
  buyback_reserve: ['Reserva de recompra', 'Buyback reserve', 'Reserva de recompra'],
  execution_correction: ['Correção de execução', 'Execution correction', 'Corrección de ejecución'],
  withdraw: ['Saque', 'Withdrawal', 'Retiro'], backup: ['Backup de carteira', 'Wallet backup', 'Copia de cartera'],
};
const SRC_EXTRA: Record<string, [string, string, string]> = {
  permission_admin: ['Administração de permissões', 'Permission administration', 'Administración de permisos'],
};
const PRIV: Record<string, [string, string, string]> = {
  backup: ['Backup criptografado', 'Encrypted backup', 'Copia cifrada'], 'encrypted-backup': ['Backup criptografado', 'Encrypted backup', 'Copia cifrada'],
  reveal: ['Revelar chave', 'Reveal key', 'Revelar clave'], copy: ['Copiar chave', 'Copy key', 'Copiar clave'],
  'private-download': ['Download de chave', 'Key download', 'Descarga de clave'],
};
const ACTOR: Record<string, [string, string, string]> = {
  system: ['Sistema', 'System', 'Sistema'], contract: ['Contrato', 'Contract', 'Contrato'], user: ['Você', 'You', 'Tú'], agent: ['Agente', 'Agent', 'Agente'],
};
const SOURCE: Record<string, [string, string, string]> = {
  blockchain_receipt: ['Recibo da blockchain', 'Blockchain receipt', 'Recibo de la blockchain'],
  accounts: ['Registro da conta', 'Account record', 'Registro de la cuenta'],
  execution: ['Execução', 'Execution', 'Ejecución'],
  demo_engine: ['Motor da demonstração', 'Demo engine', 'Motor de la demostración'],
  demo_model_preview: ['Prévia do modelo da demonstração', 'Demo model preview', 'Vista previa del modelo de la demostración'],
  demo_json_recovered_or_seeded: ['Demonstração recuperada ou semeada', 'Demo recovered or seeded', 'Demostración recuperada o sembrada'],
  reconciliation: ['Reconciliação', 'Reconciliation', 'Reconciliación'],
};
SOURCE.blockchain_gas_receipt = SOURCE.blockchain_receipt!;
SOURCE.wallets = SOURCE.accounts!;
const LIMIT: Record<string, [string, string, string]> = {
  prior_login_consent_unknown: ['Entradas e aceites anteriores a esta data são desconhecidos.', 'Sign-ins and consents before this date are unknown.', 'Los inicios de sesión y aceptaciones anteriores a esta fecha son desconocidos.'],
  reconstructed_entries: ['Alguns itens foram reconstruídos a partir de registros existentes.', 'Some items were reconstructed from existing records.', 'Algunos elementos se reconstruyeron a partir de registros existentes.'],
  distributions_unavailable: ['Distribuições não estão disponíveis para contas nativas.', 'Distributions are not available for native accounts.', 'Las distribuciones no están disponibles para cuentas nativas.'],
  demo_simulated: ['Dados da demonstração são simulados.', 'Demo data is simulated.', 'Los datos de la demostración son simulados.'],
  local_chain_only: ['Registros da cadeia local não são da rede pública.', 'Local chain records are not from the public network.', 'Los registros de la cadena local no son de la red pública.'],
  sync_unavailable: ['A sincronização está indisponível; os dados mostrados foram capturados e podem não estar atuais.', 'Sync is unavailable; the data shown was captured and may not be current.', 'La sincronización no está disponible; los datos mostrados fueron capturados y pueden no estar actualizados.'],
  treasury_restricted: ['Visão restrita: nem todos os dados financeiros são exibidos.', 'Restricted view: not all financial data is shown.', 'Vista restringida: no se muestran todos los datos financieros.'],
};
const STAGE: Record<string, [string, string, string]> = {
  requested: ['Pedido', 'Request', 'Solicitud'], authorized: ['Autorização', 'Authorization', 'Autorización'], sending: ['Envio', 'Sending', 'Envío'],
  confirmed: ['Confirmação', 'Confirmation', 'Confirmación'], calculated: ['Cálculo', 'Calculation', 'Cálculo'], initiated: ['Início', 'Start', 'Inicio'],
  purchase: ['Compra', 'Purchase', 'Compra'], swap: ['Conversão', 'Swap', 'Conversión'], fee: ['Taxa', 'Fee', 'Comisión'], settlement: ['Liquidação', 'Settlement', 'Liquidación'],
  failed: ['Falha', 'Failure', 'Fallo'], reversed: ['Estorno', 'Reversal', 'Reversión'],
};
const DKEY: Record<string, [string, string, string]> = {
  ruleVersion: ['Versão da regra', 'Rule version', 'Versión de la regla'], periodId: ['Período', 'Period', 'Período'], reason: ['Motivo', 'Reason', 'Motivo'],
  targetWallet: ['Carteira de destino', 'Target wallet', 'Cartera de destino'], from: ['Origem', 'From', 'Origen'], to: ['Destino', 'To', 'Destino'],
  trigger: ['Gatilho', 'Trigger', 'Disparador'], previousState: ['Situação anterior', 'Previous status', 'Estado anterior'],
};
const VIEWS: View[] = ['general', 'swapping', 'staking', 'distributions', 'activity', 'treasury'];
const VIEW_L: Record<View, [string, string, string]> = {
  general: ['Geral', 'General', 'General'], swapping: ['Conversões', 'Swapping', 'Conversiones'], staking: ['Aplicações', 'Staking', 'Aplicaciones'],
  distributions: ['Distribuições', 'Distributions', 'Distribuciones'], activity: ['Atividade', 'Activity', 'Actividad'], treasury: ['Tesouraria', 'Treasury', 'Tesorería'],
};

function pick(m: Record<string, [string, string, string]>, k: string, loc: string, fb?: string) {
  const t = m[k]; if (!t) return fb ?? (loc === 'pt' ? 'Registrado' : loc === 'en' ? 'Recorded' : 'Registrado');
  return t[loc === 'pt' ? 0 : loc === 'en' ? 1 : 2];
}

function fetchPage(mode: Mode, view: View, p: Record<string, unknown>, signal?: AbortSignal): Promise<HistoryPage> {
  const o = { signal, credentials: 'same-origin' as const };
  const q = p as GetTestHistoryParams;
  if (mode === 'demo' && view === 'treasury') return getTreasuryHistory(q as never, o);
  if (mode === 'demo') return getDemoHistory(q as never, o);
  return view === 'treasury' ? getTreasuryHistory(q as never, o) : getTestHistory(q, o);
}
const clean = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v != null));
const status = (e: unknown) => (e as { status?: number } | null)?.status;

function usePage(mode: Mode, accountKey: string, view: View, filters: Record<string, unknown>, cursor: string | null, enabled = true) {
  const params = useMemo(() => clean({ view, ...filters, cursor, limit: 20 }), [view, filters, cursor]);
  return useQuery({
    queryKey: ['history', mode, accountKey, view, filters, cursor],
    queryFn: ({ signal }) => fetchPage(mode, view, params, signal),
    enabled, retry: false, staleTime: 15000,
  });
}

const num = (v: unknown): number | undefined => typeof v === 'number' && Number.isInteger(v) ? v : typeof v === 'string' && /^\d{1,2}$/.test(v) ? Number(v) : undefined;

function Data({ e }: { e: HistoryEntry }) {
  const { x, loc } = useX();
  const d = e.data as Record<string, unknown>;
  const dec = num(d.decimals);
  const rows: [string, string][] = [];
  const amt = (label: string, units: unknown, asset: unknown, dd?: number) => {
    if (units == null) return;
    const a = typeof asset === 'string' ? asset : e.asset ?? '';
    const v = formatUnits(units, dd ?? dec ?? DEC[a] ?? 18);
    rows.push([label, `${v} ${a}`.trim()]);
  };
  if (typeof d.stage === 'string') rows.push([x('Etapa', 'Stage', 'Etapa'), pick(STAGE, d.stage, loc, pick(KIND, d.stage, loc))]);
  amt(x('Pago', 'Paid', 'Pagado'), d.paidUnits, d.paidAsset);
  amt(x('Recebido', 'Received', 'Recibido'), d.receivedUnits, d.receivedAsset);
  amt(x('Principal', 'Principal', 'Principal'), d.principalUnits, d.paidAsset ?? 'USDC', DEC[String(d.paidAsset ?? 'USDC')] ?? 6);
  amt(x('Taxa', 'Fee', 'Comisión'), d.feeUnits, 'USDC', 6);
  amt(x('Quantidade', 'Quantity', 'Cantidad'), d.quantityUnits, e.asset);
  amt(x('Elegível', 'Eligible', 'Elegible'), d.eligibleUnits, e.asset);
  amt(x('Pool', 'Pool', 'Pool'), d.poolUnits, e.asset);
  amt(x('Peso', 'Weight', 'Peso'), d.weightUnits, 'BETTEX', num(d.weightDecimals) ?? 18);
  amt(x('Valor', 'Amount', 'Monto'), d.amountUnits, e.asset);
  amt(x('Custo', 'Cost', 'Costo'), d.costUnits, e.asset ?? 'USDC', num(d.costDecimals) ?? 6);
  amt(x('Resultado', 'Result', 'Resultado'), d.resultUnits, e.asset ?? 'USDC', num(d.resultDecimals) ?? undefined);
  amt(x('Capital', 'Capital', 'Capital'), d.capitalUnits, 'USDC', 6);
  for (const k of ['action', 'privateAction'] as const) { const v = d[k]; if (typeof v === 'string' && PRIV[v]) rows.push([x('Ação privada', 'Private action', 'Acción privada'), pick(PRIV, v, loc)]); }
  for (const k of ['permission', 'change'] as const) { const v = d[k]; if (typeof v === 'string' && v.length <= 80 && !/key|secret|pass/i.test(v)) rows.push([k === 'permission' ? x('Permissão', 'Permission', 'Permiso') : x('Alteração', 'Change', 'Cambio'), v]); }
  if (d.gasWei != null) rows.push([x('Gás', 'Gas', 'Gas'), `${formatUnits(d.gasWei, 18)} ETH`]);
  if (d.priceUnits != null && /^\d{1,2}$/.test(String(d.priceDecimals))) rows.push([x('Preço', 'Price', 'Precio'), `${formatUnits(d.priceUnits, Number(d.priceDecimals))} ${typeof d.priceUnit === 'string' ? d.priceUnit : 'USDC/BETTEX'}`]);
  for (const k of ['ruleVersion', 'periodId', 'reason', 'targetWallet', 'from', 'to', 'trigger', 'previousState'] as const) {
    const v = d[k]; if (typeof v === 'string' || typeof v === 'number') rows.push([pick(DKEY, k, loc), k === 'previousState' ? pick(STATUS, String(v), loc) : String(v)]);
  }
  void ALLOWED;
  if (!rows.length) return null;
  return <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">{rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-[#5B6B85]">{k}</dt><dd className="mono break-all">{v}</dd></div>)}</dl>;
}

function Chain({ e }: { e: HistoryEntry }) {
  const { x } = useX();
  if (!e.transactionHash) return null;
  const h = e.transactionHash;
  return <p className="mt-2 break-all text-xs">
    <span className="text-[#5B6B85]">{x('Transação', 'Transaction', 'Transacción')}: </span><span className="mono">{h}</span>{' '}
    {e.chainId === 421614 ? <a className="font-bold text-[#0A6657] underline" target="_blank" rel="noopener noreferrer" href={`https://sepolia.arbiscan.io/tx/${encodeURIComponent(h)}`}>{x('Ver no Arbiscan Sepolia', 'View on Sepolia Arbiscan', 'Ver en Arbiscan Sepolia')}</a>
      : e.chainId === 31337 ? <span className="rounded-full bg-[#F0E9DA] px-2 py-0.5 font-bold">LOCAL</span> : null}
  </p>;
}

function Row({ e, mode, accountKey, view }: { e: HistoryEntry; mode: Mode; accountKey: string; view: View }) {
  const { x, loc } = useX();
  const [open, setOpen] = useState(false);
  return <li className="rounded-xl border border-[#E4DCCB] bg-white p-3" data-testid={`row-history-${e.id}`}>
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-bold">{pick(KIND, e.kind, loc)}</span>
      <span className="rounded-full bg-[#E9EEE5] px-2 py-0.5 text-xs font-bold text-[#0A6657]">{pick(STATUS, e.state, loc)}</span>
      <span className="rounded-full bg-[#F0E9DA] px-2 py-0.5 text-xs">{pick(CAT, e.category, loc)}</span>
      <span className="rounded-full bg-[#FFF3E3] px-2 py-0.5 text-xs text-[#6B3A10]">{pick(ENV, e.environment, loc)}</span>
      {e.reconstructed && <span className="rounded-full border border-[#E7B98A] px-2 py-0.5 text-xs font-bold text-[#6B3A10]">{x('Reconstruído', 'Reconstructed', 'Reconstruido')}</span>}
    </div>
    <p className="mt-1 text-xs text-[#5B6B85]">{fmtTime(e.occurredAt, loc)} · {x('Horário de Brasília', 'Brasília time', 'Hora de Brasilia')}{e.asset ? ` · ${e.asset}` : ''} · {pick(ACTOR, e.actor, loc)} · {pick({ ...SOURCE, ...SRC_EXTRA }, e.source, loc)}</p>
    <Data e={e} />
    <button type="button" className={`${btn} mt-2`} aria-expanded={open} data-testid={`button-history-detail-${e.id}`} onClick={() => setOpen(o => !o)}>
      {open ? x('Ocultar detalhe', 'Hide detail', 'Ocultar detalle') : x('Ver detalhe', 'View detail', 'Ver detalle')}</button>
    {open && <Detail e={e} mode={mode} accountKey={accountKey} view={view} />}
  </li>;
}

function Detail({ e, mode, accountKey, view: listView }: { e: HistoryEntry; mode: Mode; accountKey: string; view: View }) {
  const { x, loc } = useX();
  const view: View = listView === 'treasury' ? 'treasury' : 'general';
  const [pg, setPg] = useState<{ k: string; s: (string | null)[] }>({ k: e.correlationId, s: [null] });
  const stack = pg.k === e.correlationId ? pg.s : [null];
  const setStack = (fn: (s: (string | null)[]) => (string | null)[]) => setPg({ k: e.correlationId, s: fn(stack) });
  const cursor = stack[stack.length - 1];
  const f = useMemo(() => ({ correlationId: e.correlationId }), [e.correlationId]);
  const q = usePage(mode, accountKey, view, f, cursor);
  return <div className="mt-3 grid gap-2 rounded-xl bg-[#F7F2E6] p-3 text-xs" data-testid={`detail-history-${e.id}`}>
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
      <dt className="text-[#5B6B85]">{x('Pedido', 'Request', 'Solicitud')}</dt><dd>{fmtTime(e.requestedAt, loc)}</dd>
      <dt className="text-[#5B6B85]">{x('Processamento', 'Processing', 'Procesamiento')}</dt><dd>{fmtTime(e.processedAt, loc)}</dd>
      <dt className="text-[#5B6B85]">{x('On-chain', 'On-chain', 'On-chain')}</dt><dd>{e.transactionHash ? fmtTime(e.occurredAt, loc) : x('Automático interno, sem registro on-chain', 'Automatic internal, no on-chain record', 'Automático interno, sin registro on-chain')}</dd>
      <dt className="text-[#5B6B85]">{x('Correlação', 'Correlation', 'Correlación')}</dt><dd className="mono break-all">{e.correlationId}</dd>
    </dl>
    <Chain e={e} />
    {q.isLoading && <div aria-busy="true" className="h-10 animate-pulse rounded-lg bg-[#F0E9DA]" />}
    {q.isError && <p role="alert" className="font-semibold text-[#B4421A]">{x('Não foi possível carregar a linha do tempo.', 'Could not load the timeline.', 'No se pudo cargar la línea de tiempo.')} <button type="button" className="underline" onClick={() => void q.refetch()}>{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></p>}
    {q.data && <ol className="grid gap-1" data-testid={`timeline-${e.id}`}>{q.data.items.map(t => <li key={t.id} className="flex flex-wrap gap-x-2"><span className="font-bold">{pick(STATUS, t.state, loc)}</span><span>{pick(KIND, t.kind, loc)}{typeof t.data?.stage === 'string' ? ` · ${pick(STAGE, t.data.stage, loc, pick(KIND, t.data.stage, loc))}` : ''}</span><span className="text-[#5B6B85]">{fmtTime(t.occurredAt, loc)}</span></li>)}</ol>}
    <div className="flex gap-2">
      <button type="button" className={btn} disabled={stack.length < 2} onClick={() => setStack(s => s.slice(0, -1))}>{x('Anterior', 'Previous', 'Anterior')}</button>
      <button type="button" className={btn} disabled={!q.data?.nextCursor} onClick={() => q.data?.nextCursor && setStack(s => [...s, q.data!.nextCursor])}>{x('Próxima', 'Next', 'Siguiente')}</button>
    </div>
  </div>;
}

function Transparency() {
  const { x, loc } = useX();
  const q = useQuery({ queryKey: ['history-transparency'], queryFn: ({ signal }) => getHistoryTransparency({ signal, credentials: 'same-origin' }), retry: false, staleTime: 30000 });
  if (q.isLoading) return <div aria-busy="true" className="h-16 animate-pulse rounded-xl bg-[#F0E9DA]" />;
  if (q.isError || !q.data) return null;
  return <div className="rounded-xl border border-[#E4DCCB] bg-white p-3 text-xs" data-testid="panel-history-transparency">
    <p className="text-sm font-bold">{x('Capital confirmado na tesouraria', 'Confirmed capital in the treasury', 'Capital confirmado en la tesorería')}</p>
    <p className="mt-1 text-[#5B6B85]">{x('Agregado público por ambiente. Capital da cadeia local não é capital real e não é somado a outros ambientes.', 'Public aggregate per environment. Local chain capital is not real capital and is not added to other environments.', 'Agregado público por entorno. El capital de la cadena local no es capital real y no se suma a otros entornos.')}</p>
    {q.data.length === 0 ? <p className="mt-2">{x('Nenhum capital confirmado ainda.', 'No confirmed capital yet.', 'Aún no hay capital confirmado.')}</p>
      : <ul className="mt-2 grid gap-1">{q.data.map(a => <li key={`${a.environment}-${a.chainId}`} className="flex flex-wrap gap-x-2">
        <span className="font-bold">{pick(ENV, a.environment, loc)}{a.chainId === 31337 ? ' · LOCAL' : ''}</span>
        <span className="mono">{formatUnits(a.capitalUnits, a.decimals)} USDC</span>
        <span className="text-[#5B6B85]">{a.operationCount} {x('operações', 'operations', 'operaciones')}</span></li>)}</ul>}
  </div>;
}

export function HistoryPanel({ mode, accountKey, initialView, treasuryAccess = false }: { mode: Mode; accountKey: string; csrf?: string; initialView?: View; treasuryAccess?: boolean }) {
  const { x, loc } = useX();
  const views = mode === 'demo' && !treasuryAccess ? VIEWS.filter(v => v !== 'treasury') : VIEWS;
  const [view, setView] = useState<View>(initialView && (mode !== 'demo' || treasuryAccess || initialView !== 'treasury') ? initialView : 'general');
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sim, setSim] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle');
  const apiFilters = useMemo(() => toApi(filters), [filters]);
  const scope = JSON.stringify([mode, accountKey, view, apiFilters]);
  const [pg, setPg] = useState<{ k: string; s: (string | null)[] }>({ k: scope, s: [null] });
  const stack = pg.k === scope ? pg.s : [null];
  const setStack = (fn: (s: (string | null)[]) => (string | null)[]) => setPg({ k: scope, s: fn(stack) });
  const cursor = stack[stack.length - 1];
  const q = usePage(mode, accountKey, view, apiFilters, cursor);
  const restricted = view === 'treasury' && status(q.error) === 403;
  const items = q.data?.items ?? [];
  const groups = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    for (const i of items) (m[i.category] ??= new Set()).add(i.correlationId);
    return Object.entries(m);
  }, [items]);
  const setF = (k: keyof Filters) => (ev: { target: { value: string } }) => setFilters(f => ({ ...f, [k]: ev.target.value }));
  const runSim = async () => {
    setSim('busy');
    try { await previewHistoryDistribution({ requestId: crypto.randomUUID() }); setSim('ok'); void q.refetch(); } catch { setSim('err'); }
  };
  return <section className="grid gap-3" data-testid={`panel-history-${mode}`}>
    <h2 className="display text-lg font-extrabold">{x('Histórico', 'History', 'Historial')}</h2>
    {(view === 'general' || view === 'treasury') && <Transparency />}
    <div role="tablist" className="flex gap-1 overflow-x-auto">
      {views.map(v => <button key={v} type="button" role="tab" aria-selected={view === v} data-testid={`tab-history-${v}`} onClick={() => setView(v)}
        className={`min-h-11 shrink-0 rounded-xl px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${view === v ? 'bg-[#0E7C6B] text-white' : 'bg-[#F0E9DA]'}`}>{pick(VIEW_L as never, v, loc)}</button>)}
    </div>
    <div className="flex flex-wrap gap-2">
      <select aria-label={x('Ambiente', 'Environment', 'Entorno')} className={sel} value={filters.environment} onChange={setF('environment')}>
        <option value="">{x('Todos os ambientes', 'All environments', 'Todos los entornos')}</option>
        {Object.keys(ENV).map(k => <option key={k} value={k}>{pick(ENV, k, loc)}</option>)}</select>
      <select aria-label={x('Categoria', 'Category', 'Categoría')} className={sel} value={filters.category} onChange={setF('category')}>
        <option value="">{x('Todas as categorias', 'All categories', 'Todas las categorías')}</option>
        {Object.keys(CAT).map(k => <option key={k} value={k}>{pick(CAT, k, loc)}</option>)}</select>
      <select aria-label={x('Ativo', 'Asset', 'Activo')} className={sel} value={filters.asset} onChange={setF('asset')}>
        <option value="">{x('Todos os ativos', 'All assets', 'Todos los activos')}</option>
        {['USDC', 'BETTEX', 'ETH'].map(k => <option key={k} value={k}>{k}</option>)}</select>
      <select aria-label={x('Situação', 'Status', 'Estado')} className={sel} value={filters.state} onChange={setF('state')}>
        <option value="">{x('Todas as situações', 'All statuses', 'Todos los estados')}</option>
        {Object.keys(STATUS).map(k => <option key={k} value={k}>{pick(STATUS, k, loc)}</option>)}</select>
      <input type="datetime-local" aria-label={x('De (data e hora, Horário de Brasília UTC-3)', 'From (date and time, Brasília time UTC-3)', 'Desde (fecha y hora, hora de Brasilia UTC-3)')} data-testid="input-history-from" className={sel} value={filters.from} onChange={setF('from')} />
      <input type="datetime-local" aria-label={x('Até (data e hora, Horário de Brasília UTC-3)', 'To (date and time, Brasília time UTC-3)', 'Hasta (fecha y hora, hora de Brasilia UTC-3)')} data-testid="input-history-to" className={sel} value={filters.to} onChange={setF('to')} />
      <select aria-label={x('Tipo', 'Type', 'Tipo')} data-testid="select-history-kind" className={sel} value={filters.kind} onChange={setF('kind')}>
        <option value="">{x('Todos os tipos', 'All types', 'Todos los tipos')}</option>
        {Object.keys(KIND).map(k => <option key={k} value={k}>{pick(KIND, k, loc)}</option>)}</select>
      <input inputMode="numeric" maxLength={12} placeholder={x('Rede (chainId)', 'Network (chainId)', 'Red (chainId)')} aria-label="chainId" data-testid="input-history-chain" className={`${sel} w-36`} value={filters.chainId} onChange={setF('chainId')} />
      <input maxLength={100} placeholder={x('Carteira', 'Wallet', 'Cartera')} aria-label={x('Carteira', 'Wallet', 'Cartera')} data-testid="input-history-wallet" className={`${sel} w-44`} value={filters.wallet} onChange={setF('wallet')} />
      <button type="button" className={btn} data-testid="button-history-clear" onClick={() => setFilters(EMPTY)}>{x('Limpar filtros', 'Clear filters', 'Limpiar filtros')}</button>
    </div>
    {mode === 'demo' && view === 'distributions' && <div className="grid gap-2 rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-xs text-[#6B3A10]">
      <p>{x('Simulação de cálculo apenas: não é pagamento nem direito financeiro.', 'Calculation simulation only: not a payout or a financial claim.', 'Solo simulación de cálculo: no es un pago ni un derecho financiero.')}</p>
      <button type="button" data-testid="button-simulate-distribution" className={`${btnP} w-fit`} disabled={sim === 'busy'} onClick={() => void runSim()}>{x('Simular apuração', 'Simulate calculation', 'Simular cálculo')}</button>
      {sim === 'ok' && <p role="status" className="font-semibold">{x('Simulação registrada.', 'Simulation recorded.', 'Simulación registrada.')}</p>}
      {sim === 'err' && <p role="alert" className="font-semibold text-[#B4421A]">{x('Não foi possível simular.', 'Could not simulate.', 'No se pudo simular.')}</p>}
    </div>}
    {q.isLoading && <div aria-busy="true" className="grid gap-2">{[0, 1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F0E9DA]" />)}</div>}
    {restricted && <p role="status" data-testid="status-history-restricted" className="rounded-xl bg-[#FFF3E3] p-3 text-sm text-[#6B3A10]">{x('Acesso restrito: esta visão não mostra todos os dados financeiros.', 'Restricted access: this view does not show all financial data.', 'Acceso restringido: esta vista no muestra todos los datos financieros.')}</p>}
    {q.isError && !restricted && <div role="alert" className="rounded-xl border border-[#E4DCCB] bg-white p-3"><p className="text-sm font-semibold text-[#B4421A]">{x('Não foi possível carregar o histórico.', 'Could not load the history.', 'No se pudo cargar el historial.')}</p><button type="button" className={`${btnP} mt-2`} onClick={() => void q.refetch()}>{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>}
    {q.data && <>
      {(q.data as { syncState?: string }).syncState === 'unavailable' && <p role="alert" data-testid="warning-history-sync" className="rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-xs font-semibold text-[#6B3A10]">{(q.data as { warning?: string }).warning && LIMIT[(q.data as { warning?: string }).warning!] ? pick(LIMIT, (q.data as { warning?: string }).warning!, loc) : pick(LIMIT, 'sync_unavailable', loc)}</p>}
      <div className="rounded-xl bg-[#F7F2E6] p-3 text-xs text-[#5B6B85]" data-testid="text-history-coverage">
        <p><span className="font-bold">{x('Cobertura desde', 'Coverage from', 'Cobertura desde')}:</span> {fmtTime(q.data.completeFrom, loc)} · {x('Horário de Brasília', 'Brasília time', 'Hora de Brasilia')}</p>
        <p className="mt-1">{x('Registros anteriores (entradas e aceites antes dessa data) são desconhecidos; itens reconstruídos têm selo próprio.', 'Earlier records (sign-ins and consents before that date) are unknown; reconstructed items carry their own badge.', 'Los registros anteriores (inicios de sesión y aceptaciones previos) son desconocidos; los elementos reconstruidos tienen su propia insignia.')}</p>
        {q.data.limitations.length > 0 && <ul className="mt-1 list-disc pl-4">{q.data.limitations.map(l => <li key={l}>{LIMIT[l] ? pick(LIMIT, l, loc) : x('Há uma limitação de cobertura não detalhada.', 'There is an unspecified coverage limitation.', 'Hay una limitación de cobertura sin detallar.')}</li>)}</ul>}
        {groups.length > 0 && <p className="mt-1">{groups.map(([c, s]) => `${pick(CAT, c, loc)}: ${s.size}`).join(' · ')}</p>}
      </div>
      {items.length === 0 && <div role="status" className="rounded-xl border border-dashed border-[#E4DCCB] p-4 text-sm text-[#5B6B85]" data-testid="status-history-empty">
        {view === 'distributions' ? (mode === 'native'
          ? x('Nenhuma distribuição registrada neste filtro. Rodadas de teste usam resultado sintético e EVM local, sem lucro de trading real.', 'No distribution recorded for this filter. Test rounds use synthetic results and the local EVM, with no real trading profit.', 'No hay distribución registrada en este filtro. Las rondas de prueba usan resultados sintéticos y la EVM local, sin beneficio de trading real.')
          : x('Nenhuma simulação registrada ainda.', 'No simulation recorded yet.', 'Aún no hay simulaciones registradas.'))
          : x('Nenhum registro neste filtro.', 'No records for this filter.', 'Ningún registro con este filtro.')}</div>}
      <ul className="grid gap-2">{items.map(e => <Row key={e.id} e={e} mode={mode} accountKey={accountKey} view={view} />)}</ul>
      <div className="flex gap-2">
        <button type="button" data-testid="button-history-prev" className={btn} disabled={stack.length < 2} onClick={() => setStack(s => s.slice(0, -1))}>{x('Anterior', 'Previous', 'Anterior')}</button>
        <button type="button" data-testid="button-history-next" className={btn} disabled={!q.data.nextCursor} onClick={() => q.data?.nextCursor && setStack(s => [...s, q.data!.nextCursor])}>{x('Próxima', 'Next', 'Siguiente')}</button>
      </div>
    </>}
  </section>;
}
export default HistoryPanel;
