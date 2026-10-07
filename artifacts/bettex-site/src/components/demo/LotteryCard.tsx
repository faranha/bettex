/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { getGetDemoDashboardQueryKey, useUpdateDemoLotteryParticipation, type DemoDashboard } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { burnFl, nf } from './burn-format';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function useCountdown(target: string, serverNow: string) {
  const [offset, setOffset] = useState(() => Date.parse(serverNow) - Date.now());
  useEffect(() => { const o = Date.parse(serverNow) - Date.now(); if (Number.isFinite(o)) setOffset(o); }, [serverNow]);
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick(v => v + 1), 1000); return () => clearInterval(i); }, []);
  const ms = Date.parse(target) - (Date.now() + (Number.isFinite(offset) ? offset : 0));
  if (!Number.isFinite(ms)) return null;
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function LotteryCard({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const fl = burnFl(loc);
  const qc = useQueryClient();
  const m = useUpdateDemoLotteryParticipation();
  const [open, setOpen] = useState(false);
  const lot = d.profile.provider === 'native' ? undefined : d.lottery;
  const left = useCountdown(lot?.nextDrawAt ?? '', d.serverNow);
  if (!lot) return null;
  const send = (participating: boolean, confirmed: boolean) => m.mutate({ data: { participating, confirmed } }, {
    onSuccess: snap => { qc.setQueryData(getGetDemoDashboardQueryKey(), snap); void qc.invalidateQueries({ queryKey: getGetDemoDashboardQueryKey() }); setOpen(false); },
  });
  const onToggle = () => { if (m.isPending) return; if (lot.participating) send(false, false); else { m.reset(); setOpen(true); } };
  const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm font-bold text-[#1B2A41] disabled:opacity-50';
  return <div className="grid gap-2 border-t border-[#E4DCCB] pt-3" data-testid="lottery-card">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h4 className="text-sm font-extrabold text-[#1B2A41]">{x('Sorteio diário', 'Daily draw', 'Sorteo diario')}</h4>
      <span className="text-[11px] font-semibold text-[#5B6B85]">{x('Simulado', 'Simulated', 'Simulado')}</span>
    </div>
    <p className="text-xs text-[#5B6B85]">{x('Próximo sorteio (04h de São Paulo)', 'Next draw (04:00 São Paulo)', 'Próximo sorteo (04h de São Paulo)')}</p>
    <p className="display text-2xl font-extrabold tabular-nums text-[#1B2A41]" data-testid="lottery-timer">{left ?? x('Indisponível', 'Unavailable', 'No disponible')}</p>
    <p className="text-xs text-[#5B6B85]">{x('Preço de compra', 'Purchase price', 'Precio de compra')}: {nf(fl, lot.purchasePriceUsdc, 4)} USDC · <strong>2×</strong> {x('o preço de mercado', 'market price', 'el precio de mercado')} · {x('Participantes', 'Participants', 'Participantes')}: {lot.participants}</p>
    <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#1B2A41]">
      <input type="checkbox" checked={lot.participating} disabled={m.isPending || (!lot.participating && !lot.eligible)} onChange={onToggle} data-testid="lottery-participation-checkbox" className="h-5 w-5" />
      {x('Participar da Loteria de queima', 'Join the Burn Lottery', 'Participar en la Lotería de quema')}
    </label>
    {!lot.eligible && !lot.participating && <p className="text-xs text-[#5B6B85]">{x('Sem BETTEX em stake elegível.', 'No eligible staked BETTEX.', 'Sin BETTEX en stake elegible.')}</p>}
    {m.isPending && !open && <p className="text-xs text-[#5B6B85]" data-testid="lottery-loading">{x('Salvando...', 'Saving...', 'Guardando...')}</p>}
    {m.isError && !open && <p role="alert" className="text-xs font-semibold text-[#A12D2D]" data-testid="lottery-error">{x('Não foi possível atualizar a participação.', 'Could not update participation.', 'No se pudo actualizar la participación.')}</p>}
    <p className="text-[11px] text-[#5B6B85]">{x('Preço de referência modelado, sem ordem real nem execução on-chain.', 'Modeled reference price, no real order or on-chain execution.', 'Precio de referencia modelado, sin orden real ni ejecución on-chain.')}</p>
    <Dialog open={open} onOpenChange={value => { if (!m.isPending) setOpen(value); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-[#FFFCF6] p-4 text-[#1B2A41] shadow-xl" data-testid="lottery-confirm-dialog">
        <DialogTitle className="display text-base font-extrabold text-[#1B2A41]">{x('Confirmar participação', 'Confirm participation', 'Confirmar participación')}</DialogTitle>
        <DialogDescription className="sr-only">{x('Condições de participação opcional na Burn Lottery simulada.', 'Terms of optional participation in the simulated Burn Lottery.', 'Condiciones de participación opcional en Burn Lottery simulada.')}</DialogDescription>
        <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm text-[#1B2A41]">
          <li>{x('Compras automáticas diárias a 2x o preço de mercado cotado.', 'Automatic daily purchases at twice the quoted market price.', 'Compras automáticas diarias a 2x el precio de mercado cotizado.')}</li>
          <li>{x('Ordem aleatória de carteiras, sem reposição; compra de várias carteiras em stake que aderiram, até esgotar o USDC disponível ou os saldos elegíveis.', 'Random wallet order without replacement; buys from multiple opted-in staked wallets until available USDC is exhausted or no eligible balances remain.', 'Orden aleatorio de carteras, sin reposición; compra de varias carteras en stake adheridas hasta agotar el USDC disponible o los saldos elegibles.')}</li>
          <li>{x('Cada venda reduz o BETTEX em stake e paga USDC simulado à carteira em dólar.', 'Each sale reduces staked BETTEX and pays simulated USDC to the dollar wallet.', 'Cada venta reduce el BETTEX en stake y paga USDC simulado a la cartera en dólares.')}</li>
          <li>{x('Cancela todo peso/direito não pago do ciclo atual, inclusive o restante.', 'Cancels all prior unpaid weight/rights of the current cycle, including the remainder.', 'Cancela todo peso/derecho no pagado del ciclo actual, incluido el remanente.')}</li>
          <li>{x('A participação continua até você desmarcar. Valores modelados, sem transações reais.', 'Participation continues until you uncheck. Modeled values, no real transactions.', 'La participación continúa hasta que desmarques. Valores modelados, sin transacciones reales.')}</li>
        </ul>
        {m.isError && <p role="alert" className="mt-2 text-xs font-semibold text-[#A12D2D]" data-testid="lottery-error">{x('Falha ao confirmar. Tente novamente.', 'Confirmation failed. Try again.', 'Falló la confirmación. Inténtalo de nuevo.')}</p>}
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button type="button" className={btn} disabled={m.isPending} onClick={() => setOpen(false)} data-testid="lottery-cancel-button">{x('Cancelar', 'Cancel', 'Cancelar')}</button>
          <button type="button" className={`${btn} !border-[#1B2A41] !bg-[#1B2A41] !text-[#FFFCF6]`} disabled={m.isPending} onClick={() => send(true, true)} data-testid="lottery-confirm-button">{m.isPending ? x('Confirmando...', 'Confirming...', 'Confirmando...') : m.isError ? x('Tentar novamente', 'Retry', 'Reintentar') : x('Confirmar', 'Confirm', 'Confirmar')}</button>
        </div>
      </DialogContent>
    </Dialog>
    <Link href={`${demoPath('wallet', loc)}#lottery-history`} data-testid="link-lottery-history" className="text-sm font-bold text-[#1B2A41] underline">{x('Histórico da loteria', 'Lottery history', 'Historial de la lotería')}</Link>
  </div>;
}
