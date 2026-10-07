/** @jsxImportSource react */
import { Link } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { burnOf, burnFl, nf } from './burn-format';
import { LotteryCard } from './LotteryCard';
import { Flame, History } from 'lucide-react';

export function BurnedTokensCard({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const fl = burnFl(loc);
  const b = burnOf(d);
  if (d.lottery && d.profile.provider !== 'native') {
    return <article className="min-w-0" data-testid="demo-wallet-burned"><LotteryCard d={d} /></article>;
  }
  const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm font-bold text-[#1B2A41]';
  return <article className="grid content-start gap-2 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="demo-wallet-burned">
    <h3 className="text-sm font-bold text-[#1B2A41]">{d.profile.provider === 'native' ? x('Tokens queimados', 'Burned tokens', 'Tokens quemados') : 'Burn Lottery'}</h3>
    {d.profile.provider === 'native' && (b ? <>
      <p className="display break-words text-2xl font-extrabold tabular-nums text-[#1B2A41]" data-testid="burned-tokens-value">{nf(fl, b.totalBurnedBettex, 0)} <span className="mono text-[0.55em]">BETTEX</span></p>
      <p className="flex items-center gap-1 text-[11px] font-semibold text-[#5B6B85]"><Flame className="h-3.5 w-3.5 text-[#D9591B]" aria-hidden="true" />{x('Total acumulado queimado', 'Cumulative burned total', 'Total acumulado quemado')}</p>
      <dl className="grid gap-1.5 text-xs" data-testid="burn-wallet-mini">
        <div className="min-w-0"><dt className="font-bold text-[#5B6B85]">{x('Carteira de queima: USDC aguardando recompra', 'Burn wallet: USDC awaiting buyback', 'Cartera de quema: USDC esperando recompra')}</dt><dd className="font-extrabold tabular-nums" data-testid="burn-wallet-usdc">{nf(fl, b.walletUsdc)} USDC</dd></div>
        <div className="min-w-0"><dt className="font-bold text-[#5B6B85]">{x('BETTEX comprados aguardando queima', 'Purchased BETTEX awaiting burn', 'BETTEX comprados esperando quema')}</dt><dd className="font-extrabold tabular-nums" data-testid="burn-wallet-bettex">{nf(fl, b.walletBettex, 0)} BETTEX</dd></div>
      </dl>
    </> : <>
      <p className="display text-xl font-extrabold text-[#5B6B85]" data-testid="burned-tokens-value">{x('Não registrado', 'Not recorded', 'No registrado')} <span className="mono text-[0.65em]">BETTEX</span></p>
      <p className="text-xs text-[#5B6B85]">{d.profile.provider === 'native' ? x('Indisponível no protocolo nativo: nenhum dado modelado é exibido.', 'Unavailable in the native protocol: no modeled data is shown.', 'No disponible en el protocolo nativo: no se muestran datos modelados.') : x('O total de tokens queimados ainda não foi registrado. Orçamentos de recompra não contam como queima.', 'The burned token total has not been recorded yet. Buyback budgets do not count as burns.', 'El total de tokens quemados aún no se registró. Los presupuestos de recompra no cuentan como quema.')}</p>
    </>)}
    {d.profile.provider !== 'native' && !d.lottery && <p className="border-t border-[#E4DCCB] pt-2 text-xs text-[#5B6B85]" data-testid="lottery-unavailable">{x('Loteria de queima indisponível.', 'Burn Lottery unavailable.', 'Lotería de quema no disponible.')}</p>}
    <div className="flex flex-wrap gap-2">
      <Link href={demoPath('treasury', loc)} data-testid="link-burned-treasury" className={btn}>{x('Ver Tesouraria', 'View Treasury', 'Ver Tesorería')}</Link>
      {b && <Link href={`${demoPath('wallet', loc)}#burn-history`} data-testid="link-burned-history" aria-label={x('Diário de queima', 'Burn journal', 'Diario de quema')} title={x('Diário de queima', 'Burn journal', 'Diario de quema')} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#F0E9DA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"><History className="h-5 w-5" aria-hidden="true" /></Link>}
    </div>
  </article>;
}
