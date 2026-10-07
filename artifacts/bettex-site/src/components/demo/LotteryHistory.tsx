/** @jsxImportSource react */
import { useState } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { burnFl, nf } from './burn-format';
import { formatBrazilDateTime } from './brazil-time';

const PAGE = 5;

export function LotteryHistory({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const fl = burnFl(loc);
  const [page, setPage] = useState(0);
  const lot = d.profile.provider === 'native' ? undefined : d.lottery;
  const rows = (lot?.draws ?? []).slice().sort((a, b) => Date.parse(b.scheduledAt) - Date.parse(a.scheduledAt));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const status = (s: string) => s === 'executed' ? x('Executado', 'Executed', 'Ejecutado') : s === 'no_budget' ? x('Sem orçamento', 'No budget', 'Sin presupuesto') : x('Sem participantes', 'No participants', 'Sin participantes');
  return <section id="lottery-history" className="dcard grid gap-3 p-4 sm:p-5" data-testid="lottery-history">
    <h3 className="display text-base font-extrabold">{x('Histórico da Loteria de queima', 'Burn Lottery history', 'Historial de la Lotería de quema')}</h3>
    <p className="text-xs text-[#5B6B85]">{x('Dados modelados, sem transações reais. Horários de São Paulo.', 'Modeled data, no real transactions. São Paulo time.', 'Datos modelados, sin transacciones reales. Hora de São Paulo.')}</p>
    {!lot ? <p className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]">{d.profile.provider === 'native' ? x('Indisponível no protocolo nativo.', 'Unavailable in the native protocol.', 'No disponible en el protocolo nativo.') : x('Indisponível.', 'Unavailable.', 'No disponible.')}</p>
      : rows.length === 0 ? <p className="rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]" data-testid="lottery-history-empty">{x('Nenhum sorteio executado ainda. O primeiro ocorre às 04h de São Paulo.', 'No draws yet. The first runs at 04:00 São Paulo.', 'Aún no hay sorteos. El primero ocurre a las 04h de São Paulo.')}</p>
      : <ul className="grid gap-2">{rows.slice(cur * PAGE, cur * PAGE + PAGE).map(r => <li key={r.id} data-testid={`lottery-draw-${r.id}`} className="min-w-0 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-3"><b>{status(r.status)}</b><span className="text-xs text-[#5B6B85]">{formatBrazilDateTime(r.executedAt, fl)}</span></div>
        <p className="mt-1 text-xs text-[#5B6B85]">{x('Orçamento', 'Budget', 'Presupuesto')} {nf(fl, r.budgetUsdc)} · {x('Gasto', 'Spent', 'Gastado')} {nf(fl, r.spentUsdc)} · {x('Restante', 'Remaining', 'Restante')} {nf(fl, r.remainingUsdc)} USDC · {x('Referência', 'Reference', 'Referencia')} {nf(fl, r.referencePriceUsdc, 4)} · {x('Compra', 'Purchase', 'Compra')} {nf(fl, r.purchasePriceUsdc, 4)}</p>
        {r.purchases.length > 0 && <ul className="mt-2 grid gap-1 text-xs">{r.purchases.map((p, i) => <li key={i} className="flex flex-wrap justify-between gap-2"><span className="font-semibold">{p.walletLabel}{p.isOwn && <span className="ml-1 rounded-full bg-[#1B2A41] px-2 py-0.5 text-[10px] font-bold text-[#FFFCF6]" data-testid="lottery-own-marker">{x('Sua carteira', 'Your wallet', 'Tu cartera')}</span>}</span><span className="tabular-nums">{nf(fl, p.tokensBettex, 0)} BETTEX · {nf(fl, p.paidUsdc)} USDC</span></li>)}</ul>}
      </li>)}</ul>}
    {pages > 1 && <div className="flex items-center justify-between gap-2 text-xs font-bold">
      <button type="button" disabled={cur === 0} onClick={() => setPage(cur - 1)} className="min-h-11 rounded-xl border border-[#E4DCCB] px-3 disabled:opacity-40">{x('Anterior', 'Previous', 'Anterior')}</button>
      <span>{cur + 1} / {pages}</span>
      <button type="button" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="min-h-11 rounded-xl border border-[#E4DCCB] px-3 disabled:opacity-40">{x('Próxima', 'Next', 'Siguiente')}</button>
    </div>}
  </section>;
}
