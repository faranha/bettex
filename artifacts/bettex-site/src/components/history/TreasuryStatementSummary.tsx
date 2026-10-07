/** @jsxImportSource react */
import type { TreasuryStatementBalance, TreasuryStatementPage } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';

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
    <ul className="grid min-w-0 gap-2 md:grid-cols-2">
      {data.balances.map(b => <li key={`${b.account}-${b.asset}`} data-testid={`statement-balance-${b.account}-${b.asset}`} className="min-w-0 rounded-2xl border border-[#E4DCCB] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold">{acct(b.account)} · <span className="mono">{b.asset}</span></p>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${b.reconciled ? 'bg-[#DDF0E4] text-[#0A6657]' : 'bg-[#FFF5D9] text-[#73531B]'}`}>{b.reconciled ? x('Conciliado', 'Reconciled', 'Conciliado') : x('Não conciliado', 'Not reconciled', 'No conciliado')}</span>
        </div>
        <dl className={`mt-2 grid min-w-0 gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
          <div className={cell}><dt className={lab}>{x('Saldo inicial', 'Opening', 'Saldo inicial')}</dt><dd className="break-words text-sm font-bold tabular-nums">{b.opening === null ? x('Não registrado', 'Not recorded', 'No registrado') : qty(b.opening, b.asset)}</dd></div>
          <div className={cell}><dt className={lab}>{x('Entradas', 'Inflows', 'Entradas')}</dt><dd className="break-words text-sm font-bold tabular-nums text-[#0A6657]">{qty(b.inflows, b.asset)}</dd></div>
          <div className={cell}><dt className={lab}>{x('Saídas', 'Outflows', 'Salidas')}</dt><dd className="break-words text-sm font-bold tabular-nums text-[#8C2B2B]">{qty(b.outflows, b.asset)}</dd></div>
          <div className={cell}><dt className={lab}>{x('Saldo final', 'Closing', 'Saldo final')}</dt><dd className="break-words text-sm font-bold tabular-nums">{b.closing === null ? x('Não registrado', 'Not recorded', 'No registrado') : qty(b.closing, b.asset)}</dd></div>
          <div className={cell}><dt className={lab}>{x('Resultado realizado', 'Realized result', 'Resultado realizado')}</dt><dd className="break-words text-sm font-bold tabular-nums">{qty(b.income, b.asset, true)}</dd></div>
          <div className={cell}><dt className={lab}>{x('Renda de outros investimentos', 'Income from other investments', 'Ingresos de otras inversiones')}</dt><dd className="break-words text-sm font-bold tabular-nums">{b.otherIncome === null ? <span className="font-semibold text-[#8A94A6]">{x('Não registrado', 'Not recorded', 'No registrado')}</span> : qty(b.otherIncome, b.asset, true)}</dd></div>
        </dl>
      </li>)}
    </ul>
  </div>;
}
