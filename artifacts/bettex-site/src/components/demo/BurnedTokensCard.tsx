/** @jsxImportSource react */
import { Flame } from 'lucide-react';
import { Link } from 'wouter';
import { demoPath } from './demo-navigation';
import { useX } from './ui';

export function BurnedTokensCard() {
  const { x, loc } = useX();
  return <article className="relative grid content-start gap-2 overflow-hidden rounded-xl border border-[#E8A56B] bg-gradient-to-br from-[#FFF1E0] to-[#FFD9B0] p-3" data-testid="demo-wallet-burned">
    <h3 className="flex items-center gap-2 text-sm font-bold text-[#8F3A0E]"><Flame className="h-5 w-5 text-[#D9591B]" aria-hidden="true" />{x('Tokens queimados', 'Burned tokens', 'Tokens quemados')}</h3>
    <p className="display text-xl font-extrabold text-[#5B6B85]" data-testid="burned-tokens-value">{x('Não registrado', 'Not recorded', 'No registrado')} <span className="mono text-[0.65em]">BETTEX</span></p>
    <p className="text-xs text-[#5B6B85]">{x('O total de tokens BETTEX queimados ainda não é informado nesta simulação. Orçamentos de recompra não contam como queima.', 'The total of BETTEX tokens burned is not yet reported in this simulation. Buyback budgets do not count as burns.', 'El total de tokens BETTEX quemados aún no se informa en esta simulación. Los presupuestos de recompra no cuentan como quema.')}</p>
    <Link href={demoPath('treasury', loc)} data-testid="link-burned-treasury" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D9591B]/50 bg-[#FFFCF6] px-3 text-sm font-bold text-[#8F3A0E] hover:bg-[#FFE8CC]">{x('Ver Tesouraria', 'View Treasury', 'Ver Tesorería')}</Link>
  </article>;
}
