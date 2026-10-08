/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { useX, type X } from '@/components/demo/ui';
import { formatBrazilDateTime } from '@/components/demo/brazil-time';
import type { AlphaDatum } from '@workspace/api-client-react';

export function useFmt() {
  const { x, loc } = useX();
  const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  return {
    x, loc,
    date: (v?: string | null) => (v ? formatBrazilDateTime(v, lc) : x('não informado', 'not provided', 'no informado')),
    units: (v: string | null | undefined) => (v === null || v === undefined ? x('indisponível', 'unavailable', 'no disponible') : `${dec6(v, lc)} USDC`),
    shares: (v: string | null | undefined) => (v === null || v === undefined ? x('indisponível', 'unavailable', 'no disponible') : `${dec6(v, lc)} ${x('cotas', 'shares', 'cuotas')}`),
    reason: (c: string | null | undefined) => reasonText(x, c),
    code: (c: string | null | undefined) => codeLabel(x, c),
    datum: (d: AlphaDatum) => datumText(x, d),
    moneyDatum: (d: AlphaDatum) => datumText(x, d, lc),
  };
}

export function dec6(v: string, lc: string) {
  if (!/^-?\d+$/.test(v)) return v;
  const neg = v.startsWith('-'); const a = BigInt(neg ? v.slice(1) : v);
  const whole = (a / 1000000n).toLocaleString(lc); const frac = (a % 1000000n).toString().padStart(6, '0');
  const dsep = (1.1).toLocaleString(lc).charAt(1);
  return `${neg ? '-' : ''}${whole}${dsep}${frac}`;
}
export function reasonText(x: X, c: string | null | undefined) {
  if (!c) return x('não informado', 'not provided', 'no informado');
  if (D[c]) return codeLabel(x, c);
  return /^[a-z0-9_]+$/.test(c) ? codeLabel(x, c) : c;
}
const D: Record<string, [string, string, string]> = {
  scheduled_story: ['Roteiro pré-definido', 'Scheduled storyline', 'Guion predefinido'],
  spot: ['À vista', 'Spot', 'Al contado'],
  close_at_scheduled_settlement: ['Encerrar na liquidação programada', 'Close at scheduled settlement', 'Cerrar en la liquidación programada'],
  defined_scenario_not_statistical_forecast: ['Cenário definido, sem intervalo estatístico', 'Defined scenario, no statistical interval', 'Escenario definido, sin intervalo estadístico'],
  price_variation: ['Variação de preço', 'Price variation', 'Variación de precio'],
  correlated_crypto_exposure: ['Exposição correlacionada em cripto', 'Correlated crypto exposure', 'Exposición correlacionada en cripto'],
  price_limit_exceeded: ['Limite de preço excedido', 'Price limit exceeded', 'Límite de precio excedido'],
  liquidity_insufficient: ['Liquidez insuficiente', 'Insufficient liquidity', 'Liquidez insuficiente'],
  btc: ['Bitcoin', 'Bitcoin', 'Bitcoin'], eth: ['Ethereum', 'Ethereum', 'Ethereum'], sol: ['Solana', 'Solana', 'Solana'],
  observed: ['Observado', 'Observed', 'Observado'], estimated: ['Estimado', 'Estimated', 'Estimado'], missing: ['Ausente', 'Missing', 'Ausente'],
  not_collected: ['Não coletado', 'Not collected', 'No recolectado'], partial: ['Parcial', 'Partial', 'Parcial'], unavailable: ['Indisponível', 'Unavailable', 'No disponible'],
  no_btc_markets: ['Sem mercados BTC', 'No BTC markets', 'Sin mercados BTC'], no_eligible_markets: ['Sem mercados elegíveis', 'No eligible markets', 'Sin mercados elegibles'],
  blocked: ['Bloqueada', 'Blocked', 'Bloqueada'], enabled: ['Habilitada', 'Enabled', 'Habilitada'],
  unfunded: ['Sem aporte', 'Unfunded', 'Sin aporte'], reconciled: ['Reconciliado', 'Reconciled', 'Conciliado'], divergence: ['Divergência', 'Divergence', 'Divergencia'],
  needs_update: ['Precisa atualizar', 'Needs update', 'Requiere actualización'], qualified: ['Qualificada', 'Qualified', 'Calificada'], rejected: ['Rejeitada', 'Rejected', 'Rechazada'],
  selected: ['Selecionada', 'Selected', 'Seleccionada'], awaiting_authorization: ['Aguardando autorização', 'Awaiting authorization', 'Esperando autorización'],
  allocation_authorized: ['Alocação autorizada', 'Allocation authorized', 'Asignación autorizada'], allocation_uncertain: ['Alocação incerta', 'Allocation uncertain', 'Asignación incierta'],
  allocation_confirmed: ['Alocação confirmada', 'Allocation confirmed', 'Asignación confirmada'], expired: ['Expirada', 'Expired', 'Expirada'], hold: ['Manter', 'Hold', 'Mantener'],
  pending: ['Pendente', 'Pending', 'Pendiente'], filled: ['Executada', 'Filled', 'Ejecutada'], cancelled: ['Cancelada', 'Cancelled', 'Cancelada'], failed: ['Falhou', 'Failed', 'Falló'],
  buy: ['Compra', 'Buy', 'Compra'], sell: ['Venda', 'Sell', 'Venta'],
  open: ['Aberta', 'Open', 'Abierta'], reducing: ['Reduzindo', 'Reducing', 'Reduciendo'], closed: ['Encerrada', 'Closed', 'Cerrada'], settled: ['Liquidada', 'Settled', 'Liquidada'],
  planned: ['Planejada', 'Planned', 'Planificada'], triggered: ['Acionada', 'Triggered', 'Activada'], requested: ['Solicitada', 'Requested', 'Solicitada'], confirmed: ['Confirmada', 'Confirmed', 'Confirmada'],
  blocked_liquidity: ['Bloqueada por falta de liquidez', 'Blocked by lack of liquidity', 'Bloqueada por falta de liquidez'],
  unresolved: ['Não resolvido', 'Unresolved', 'No resuelto'], resolved: ['Resolvido', 'Resolved', 'Resuelto'], settlement_pending: ['Liquidação pendente', 'Settlement pending', 'Liquidación pendiente'],
  executable: ['Executável', 'Executable', 'Ejecutable'], conservative: ['Conservador', 'Conservative', 'Conservador'], indicative: ['Indicativo', 'Indicative', 'Indicativo'],
  pause: ['Pausar', 'Pause', 'Pausar'], reduce: ['Reduzir', 'Reduce', 'Reducir'], exit: ['Sair', 'Exit', 'Salir'],
  specialist: ['Especialista', 'Specialist', 'Especialista'], market: ['Mercado', 'Market', 'Mercado'], risk: ['Risco', 'Risk', 'Riesgo'], execution: ['Execução', 'Execution', 'Ejecución'],
  received: ['Recebida', 'Received', 'Recibida'], validated: ['Validada', 'Validated', 'Validada'], awaiting_decision: ['Aguardando decisão', 'Awaiting decision', 'Esperando decisión'],
  forwarded_to_execution: ['Enviada à execução', 'Forwarded to execution', 'Enviada a ejecución'], simulation_only: ['Somente simulação', 'Simulation only', 'Solo simulación'],
  paper_budget_not_authorized: ['Orçamento simulado não autorizado', 'Paper budget not authorized', 'Presupuesto simulado no autorizado'],
  strategy_or_model_not_validated: ['Estratégia ou modelo ainda não validado', 'Strategy or model not yet validated', 'Estrategia o modelo aún no validado'],
  valid_active_policy_required: ['Política válida e ativa obrigatória', 'A valid active policy is required', 'Se requiere una política válida y activa'],
  policy_or_strategy_changed: ['Política alterada: nova análise obrigatória', 'Policy changed: a new analysis is required', 'Política cambiada: se requiere un nuevo análisis'],
  policy_emergency_pause: ['Acompanhamento suspenso pelo controle emergencial', 'Monitoring paused by emergency control', 'Seguimiento suspendido por el control de emergencia'],
  instrument_or_provider_not_allowed: ['Ativo, mercado ou fonte não permitido', 'Asset, market or source not allowed', 'Activo, mercado o fuente no permitido'],
  quote_invalid_or_stale: ['Cotação inválida ou defasada', 'Quote invalid or stale', 'Cotización inválida o desactualizada'],
  calibrated_event_probability_not_validated: ['Probabilidade calibrada do evento não validada', 'Calibrated event probability not validated', 'Probabilidad calibrada del evento no validada'],
  order_size_fee_model_and_depth_quote_not_validated: ['Tamanho da ordem, taxas e profundidade da cotação não validados', 'Order size, fee model and quote depth not validated', 'Tamaño de orden, tarifas y profundidad de cotización no validados'],
  paper_ledger_divergence: ['Divergência no livro simulado', 'Paper ledger divergence', 'Divergencia en el libro simulado'],
  paper_policy_reserve_mismatch: ['Reserva da política diferente do livro simulado', 'Policy reserve differs from the paper ledger', 'La reserva de la política difiere del libro simulado'],
  paper_operational_records_divergence: ['Posições e livro simulado divergem', 'Paper positions and ledger diverge', 'Las posiciones y el libro simulado divergen'],
  eligible_simulation_proposal: ['Proposta elegível apenas para simulação', 'Eligible for simulation only', 'Propuesta elegible solo para simulación'],
  stale: ['Defasada', 'Stale', 'Desactualizada'],
  paper_journal_reconciled_no_real_money: ['Diário reconciliado', 'Journal reconciled', 'Diario conciliado'],
  paper_partial_fill_confirmed: ['Execução parcial simulada confirmada', 'Paper partial fill confirmed', 'Ejecución parcial simulada confirmada'],
  paper_fill_confirmed: ['Execução simulada confirmada', 'Paper fill confirmed', 'Ejecución simulada confirmada'],
  hold_until_resolution: ['Manter até a resolução', 'Hold until resolution', 'Mantener hasta la resolución'],
  real_market_data: ['Dado real de mercado', 'Real market data', 'Dato real de mercado'], internal_fixture: ['Fixture interno', 'Internal fixture', 'Fixture interno'],
};
export function codeLabel(x: X, c: string | null | undefined) {
  if (!c) return x('não informado', 'not provided', 'no informado');
  const t = D[c];
  if (t) return x(`${t[0]}`, `${t[1]}`, `${t[2]}`);
  return `${x('Limitação informada pela fonte', 'Limitation reported by source', 'Limitación informada por la fuente')} (${c})`;
}
export function datumText(x: X, d: AlphaDatum, moneyLocale?: string) {
  if (d.kind === 'missing') return `${x('Ausente', 'Missing', 'Ausente')}${d.reason ? `: ${codeLabel(x, d.reason)}` : ''}`;
  const raw = d.value === undefined || d.value === null ? x('sem valor', 'no value', 'sin valor') : typeof d.value === 'object' ? JSON.stringify(d.value) : String(d.value);
  const v = moneyLocale && /^-?\d+$/.test(raw) ? `${dec6(raw, moneyLocale)} USDC` : raw;
  return `${D[v] ? codeLabel(x, v) : v} (${codeLabel(x, d.kind)}${d.method ? `, ${D[d.method] ? codeLabel(x, d.method) : d.method}` : ''})`;
}
export const card = 'dcard p-4 sm:p-5';
export const mono = 'font-mono text-[11px] uppercase tracking-wider text-[#5B6B85]';
export function Tag({ children, warn }: { children: ReactNode; warn?: boolean }) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${warn ? 'border-[#B5651D] text-[#8A4B10]' : 'border-[#0E7C6B] text-[#0A6657]'}`}>{children}</span>;
}
export function KV({ k, v }: { k: string; v: ReactNode }) {
  return <div className="min-w-0"><dt className={mono}>{k}</dt><dd className="mt-0.5 break-words text-sm font-semibold text-[#1B2A41]">{v}</dd></div>;
}
