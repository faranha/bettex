/** @jsxImportSource react */
import { Flame, Wallet } from 'lucide-react';
import { Link } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { burnOf, burnFl, nf } from './burn-format';
import { formatBrazilDateTime } from './brazil-time';

export function BurnWalletPanel({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const fl = burnFl(loc);
  const b = burnOf(d);
  const cell = 'min-w-0 rounded-xl border border-[#E8C9A5] bg-[#FFFCF6] p-3';
  return <section className="dcard grid gap-3 p-4 sm:p-5" data-testid="treasury-burn">
    <h2 className="display flex items-center gap-2 text-lg font-extrabold"><Flame className="h-5 w-5 text-[#D9591B]" aria-hidden="true" />{x('Carteira de recompra e queima', 'Buyback-and-burn wallet', 'Cartera de recompra y quema')}</h2>
    <p className="text-sm text-[#5B6B85]">{x('Regra documentada: 25% do lucro positivo elegível de cada rodada vai para uma carteira dedicada de recompra e queima. Nunca vêm de tarifas do operador nem de carteiras pessoais.', 'Documented rule: 25% of each round\'s eligible positive profit goes to a dedicated buyback-and-burn wallet. It never comes from operator fees or personal wallets.', 'Regla documentada: 25% de la ganancia positiva elegible de cada ronda va a una cartera dedicada de recompra y quema. Nunca viene de tarifas del operador ni de carteras personales.')}</p>
    {!b ? <p className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]" data-testid="treasury-burn-unavailable">{d.profile.provider === 'native' ? x('Indisponível no protocolo nativo: nenhum dado modelado é exibido.', 'Unavailable in the native protocol: no modeled data is shown.', 'No disponible en el protocolo nativo: no se muestran datos modelados.') : x('Não registrado: esta sessão não tem resumo de queima.', 'Not recorded: this session has no burn summary.', 'No registrado: esta sesión no tiene resumen de quema.')}</p> : <>
      <div className="rounded-2xl border-2 border-[#E8A56B] bg-gradient-to-br from-[#FFF1E0] to-[#FFD9B0] p-4" data-testid="treasury-burn-total">
        <p className="text-xs font-bold text-[#8F3A0E]">{x('Total acumulado queimado (permanente, simulado)', 'Cumulative burned total (permanent, simulated)', 'Total acumulado quemado (permanente, simulado)')}</p>
        <p className="display break-words text-3xl font-extrabold tabular-nums text-[#5B2208]">{nf(fl, b.totalBurnedBettex, 0)} BETTEX</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2" data-testid="treasury-burn-wallet">
        <div className={cell}><p className="flex items-center gap-1.5 text-xs font-bold text-[#8F3A0E]"><Wallet className="h-3.5 w-3.5" aria-hidden="true" />{x('USDC aguardando recompra', 'USDC awaiting buyback', 'USDC esperando recompra')}</p><p className="display text-xl font-extrabold tabular-nums">{nf(fl, b.walletUsdc)} USDC</p></div>
        <div className={cell}><p className="text-xs font-bold text-[#8F3A0E]">{x('BETTEX comprados aguardando queima', 'Purchased BETTEX awaiting burn', 'BETTEX comprados esperando quema')}</p><p className="display text-xl font-extrabold tabular-nums">{nf(fl, b.walletBettex, 0)} BETTEX</p></div>
      </div>
      <p className="rounded-xl bg-[#FFF6EA] px-3 py-2 text-xs font-semibold text-[#8F3A0E]">{x('Comprado não é queimado, e o total queimado não é o saldo da carteira: o saldo só mostra o que ainda aguarda recompra ou queima.', 'Purchased is not burned, and total burned is not the wallet balance: the balance only shows what still awaits buyback or burn.', 'Comprado no es quemado, y el total quemado no es el saldo de la cartera: el saldo solo muestra lo que aún espera recompra o quema.')}</p>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div className="min-w-0"><dt className="font-bold text-[#5B6B85]">{x('Identidade modelada', 'Modeled identity', 'Identidad modelada')}</dt><dd className="mono break-all" data-testid="burn-wallet-id">{b.walletId}</dd></div>
        <div className="min-w-0"><dt className="font-bold text-[#5B6B85]">{x('Endereço blockchain', 'Blockchain address', 'Dirección blockchain')}</dt><dd className="break-words" data-testid="burn-wallet-address">{b.address ?? x('Nenhum: carteira simulada, sem endereço real.', 'None: simulated wallet, no real address.', 'Ninguna: cartera simulada, sin dirección real.')}</dd></div>
        <div><dt className="font-bold text-[#5B6B85]">{x('Preço de referência', 'Reference price', 'Precio de referencia')}</dt><dd className="tabular-nums">{nf(fl, b.referencePriceUsdc, 2)} USDC</dd></div>
        <div><dt className="font-bold text-[#5B6B85]">{x('Atualizado em', 'Updated at', 'Actualizado en')}</dt><dd>{formatBrazilDateTime(b.updatedAt, fl)} {x('(São Paulo)', '(São Paulo)', '(São Paulo)')}</dd></div>
      </dl>
      <p className="text-xs text-[#5B6B85]">{x('Modelo de demonstração, sem transações reais. Os prazos de compra e queima são um roteiro autoral, não política econômica.', 'Demonstration model, no real transactions. Buy and burn timings are an authored script, not economic policy.', 'Modelo de demostración, sin transacciones reales. Los plazos de compra y quema son un guion autoral, no política económica.')}</p>
      <Link href={`${demoPath('wallet', loc)}?roundTab=burn#rh-panel-burn`} data-testid="link-treasury-burn-journal" className="inline-flex min-h-11 items-center justify-center self-start rounded-xl bg-[#D9591B] px-4 text-sm font-bold text-white hover:bg-[#B84A15]">{x('Abrir diário de recompra e queima', 'Open buyback-and-burn journal', 'Abrir diario de recompra y quema')}</Link>
    </>}
  </section>;
}
