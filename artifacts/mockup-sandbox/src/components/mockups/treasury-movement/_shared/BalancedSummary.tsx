/** @jsxImportSource react */
import type { TreasuryStatementBalance, TreasuryStatementPage } from './context';
import { useX } from './context';
import { TreasuryTerm as Help } from './context';

export function useStmtFmt() {
  const { loc } = useX();
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const qty = (s: string | null | undefined, asset?: string, signed = false) => {
    if (s === null || s === undefined) return '—';
    const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(s);
    if (!m) return s;
    const dec = (1.1).toLocaleString(fl).charAt(1);
    const frac = asset === 'USDC' ? (m[3] ?? '').padEnd(2, '0') : m[3];
    const sign = m[1] || (signed && /[1-9]/.test(s) ? '+' : '');
    return `${sign}${BigInt(m[2]).toLocaleString(fl)}${frac ? dec + frac : ''}`;
  };
  const day = (ymd: string) => { const [y, mo, d] = ymd.split('-').map(Number); return new Date(Date.UTC(y, mo - 1, d, 12)).toLocaleDateString(fl, { dateStyle: 'medium', timeZone: 'UTC' }); };
  return { fl, qty, day };
}

export function TreasuryStatementSummary({ data, compact }: { data: TreasuryStatementPage; compact?: boolean }) {
  const { x } = useX(); const { qty, day } = useStmtFmt();
  const acct = (a: TreasuryStatementBalance['account']) => a === 'treasury' ? x('Tesouraria', 'Treasury', 'Tesorería') : x('Recompra', 'Buyback', 'Recompra');
  const cell = 'min-w-0';
  const lab = 'text-[11px] font-bold uppercase tracking-wide text-[#5B6B85]';
  return <div className="grid min-w-0 gap-3" data-testid="treasury-statement-summary">
    <p className="text-xs text-[#5B6B85]">{x('Período', 'Period', 'Período')}: {day(data.from)} – {day(data.to)} · {x('Datas do calendário de Brasília', 'Brasília calendar dates', 'Fechas del calendario de Brasilia')}</p>
    <ul className={`grid min-w-0 gap-2 ${data.balances.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
      {data.balances.map(b => <li key={`${b.account}-${b.asset}`} data-testid={`statement-balance-${b.account}-${b.asset}`} className="@container min-w-0 rounded-2xl border border-[#E4DCCB] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold">{acct(b.account)} · <span className="mono">{b.asset}</span></p>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${b.reconciled ? 'bg-[#DDF0E4] text-[#0A6657]' : 'bg-[#FFF5D9] text-[#73531B]'}`}><Help tip={x('Indica se os saldos e movimentos registrados do período reconciliam. Não comprova fundos on-chain nem auditoria externa. Não conciliado pode indicar cobertura incompleta ou saldos não registrados; não trate os números como fluxo de caixa verificado.', 'Indicates whether recorded balances and movements reconcile for the period. Not proof of on-chain funds or an external audit. Not reconciled may mean incomplete coverage or unrecorded balances; do not treat the figures as verified cash flow.', 'Indica si los saldos y movimientos registrados concilian en el período. No prueba fondos on-chain ni una auditoría externa. No conciliado puede indicar cobertura incompleta o saldos no registrados; no trates las cifras como flujo de caja verificado.')}>{b.reconciled ? x('Conciliado', 'Reconciled', 'Conciliado') : x('Não conciliado', 'Not reconciled', 'No conciliado')}</Help></span>
        </div>
        <dl className={`mt-3 grid min-w-0 gap-x-5 gap-y-4 ${compact ? 'grid-cols-2 @[34rem]:grid-cols-3' : 'grid-cols-2 lg:grid-cols-3'}`}>
          <div className={cell}><dt className={lab}><Help tip={x('Saldo registrado no início do período para esta conta e ativo. Não registrado é desconhecido, não zero; não é substituído pelo saldo atual.', 'Recorded opening balance for this account and asset. Not recorded means unknown, not zero; it is not replaced by the current balance.', 'Saldo registrado al inicio del período para esta cuenta y activo. No registrado significa desconocido, no cero; no se sustituye por el saldo actual.')}>{x('Saldo inicial', 'Opening', 'Saldo inicial')}</Help></dt><dd className="break-words text-sm font-bold tabular-nums">{b.opening === null ? x('Não registrado', 'Not recorded', 'No registrado') : qty(b.opening, b.asset)}</dd></div>
          <div className={cell}><dt className={lab}><Help tip={x('Soma das entradas registradas no período. Pode incluir devolução de capital e transferências: nem toda entrada é lucro.', 'Sum of recorded inflows during the period. May include returned capital and transfers: not every inflow is profit.', 'Suma de entradas registradas en el período. Puede incluir devolución de capital y transferencias: no toda entrada es ganancia.')}>{x('Entradas', 'Inflows', 'Entradas')}</Help></dt><dd className="break-words text-sm font-bold tabular-nums text-[#0A6657]">{qty(b.inflows, b.asset)}</dd></div>
          <div className={cell}><dt className={lab}><Help tip={x('Soma das saídas registradas no período. Pode incluir alocações e distribuições: nem toda saída é prejuízo.', 'Sum of recorded outflows during the period. May include allocations and distributions: not every outflow is a loss.', 'Suma de salidas registradas en el período. Puede incluir asignaciones y distribuciones: no toda salida es pérdida.')}>{x('Saídas', 'Outflows', 'Salidas')}</Help></dt><dd className="break-words text-sm font-bold tabular-nums text-[#8C2B2B]">{qty(b.outflows, b.asset)}</dd></div>
          <div className={cell}><dt className={lab}><Help tip={x('Saldo registrado no fim do período consultado. Não é necessariamente o saldo atual nem um saldo bancário verificado.', 'Recorded balance at the end of the queried period. Not necessarily the current balance or a verified bank balance.', 'Saldo registrado al final del período consultado. No es necesariamente el saldo actual ni un saldo bancario verificado.')}>{x('Saldo final', 'Closing', 'Saldo final')}</Help></dt><dd className="break-words text-sm font-bold tabular-nums">{b.closing === null ? x('Não registrado', 'Not recorded', 'No registrado') : qty(b.closing, b.asset)}</dd></div>
          <div className={cell}><dt className={lab}><Help tip={x('Resultado registrado das liquidações no período, positivo ou negativo. É diferente do total de entradas e não é projeção de ganhos futuros.', 'Recorded settlement result for the period, positive or negative. Different from total inflows and not a forecast of future earnings.', 'Resultado registrado de liquidaciones en el período, positivo o negativo. Es diferente del total de entradas y no es una proyección de ganancias futuras.')}>{x('Resultado realizado', 'Realized result', 'Resultado realizado')}</Help></dt><dd className="break-words text-sm font-bold tabular-nums">{qty(b.income, b.asset, true)}</dd></div>
          <div className={cell}><dt className={lab}><Help tip={x('Renda registrada de outros investimentos da tesouraria, separada para identificação. Sem registro, o valor permanece desconhecido; não é uma renda garantida.', 'Recorded income from other treasury investments, identified separately. Without a record, it remains unknown; not guaranteed income.', 'Ingresos registrados de otras inversiones de tesorería, identificados por separado. Sin registro permanecen desconocidos; no son ingresos garantizados.')}>{x('Renda de outros investimentos', 'Income from other investments', 'Ingresos de otras inversiones')}</Help></dt><dd className="break-words text-sm font-bold tabular-nums">{b.otherIncome === null ? <span className="font-semibold text-[#8A94A6]">{x('Não registrado', 'Not recorded', 'No registrado')}</span> : qty(b.otherIncome, b.asset, true)}</dd></div>
        </dl>
      </li>)}
    </ul>
  </div>;
}
