/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetDemoDashboardQueryKey, useBuyDemoLotteryEntries, type DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { burnFl, nf } from './burn-format';
import { formatBrazilDateTime } from './brazil-time';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Lot = NonNullable<DemoDashboard['lottery']>;
export const MAX_ORDER = 100;
export const MAX_PAID = 1000;

export function errorCode(e: unknown): string {
  const data = (e as { data?: unknown } | null)?.data;
  const s = typeof data === 'string' ? data : JSON.stringify(data ?? '') + String((e as Error | null)?.message ?? '');
  const m = /lottery_[a-z_]+|insufficient_balance|invalid_lottery_purchase|[a-z_]*liquidity[a-z_]*/.exec(s);
  return m ? m[0] : 'unknown';
}

export function LotteryEntries({ lot }: { lot: Lot }) {
  const { x, loc } = useX();
  const fl = burnFl(loc);
  const qc = useQueryClient();
  const m = useBuyDemoLotteryEntries({ mutation: { retry: false } });
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState('1');
  const [done, setDone] = useState<{ quantity: number; paid: number; burned: number; numbers: string[]; drawAt: string } | null>(null);
  const held = useRef<{ requestId: string; quantity: number; drawAt: string } | null>(null);
  const reviewDrawAt = useRef(lot.nextDrawAt);
  const [receiptError, setReceiptError] = useState(false);
  useEffect(() => {
    const h = held.current;
    const r = h && lot.entryReceipts.find(v => v.requestId === h.requestId);
    if (h && r && !m.isPending) {
      setDone({ quantity: r.quantity, paid: r.paidUsdc, burned: r.burnedBettex, numbers: r.numbers, drawAt: h.drawAt });
      setReceiptError(false); held.current = null;
    }
  }, [lot.entryReceipts, m.isPending]);
  const price = lot.entryPriceUsdc;
  const free = lot.entries.filter(e => e.type === 'free');
  const paid = lot.entries.filter(e => e.type === 'paid');
  const room = Math.max(0, MAX_PAID - paid.length);
  const maxNow = Math.min(MAX_ORDER, room);
  const n = Number(qty);
  const valid = Number.isInteger(n) && n >= 1 && n <= maxNow;
  const canBuy = lot.participating && lot.eligible && room > 0;
  const total = valid ? n * price : 0;
  const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm font-bold text-[#1B2A41] disabled:opacity-50';
  const nums = (list: string[], tid: string) => <div className="flex flex-wrap gap-1" data-testid={tid}>{list.map(v => <span key={v} className="mono rounded-md border border-white/20 px-1.5 py-0.5 text-[11px] text-[#F4F1E8]">{v}</span>)}</div>;
  const msg = (c: string) => ({
    insufficient_balance: x('Saldo em USDC insuficiente para esta compra.', 'Not enough USDC balance for this purchase.', 'Saldo de USDC insuficiente para esta compra.'),
    lottery_participation_required: x('Ative a participação na loteria e mantenha BETTEX em stake para comprar números.', 'Join the lottery and keep BETTEX staked to buy numbers.', 'Activa la participación en la lotería y mantén BETTEX en stake para comprar números.'),
    lottery_draw_closed: x('O sorteio mudou. Nada foi cobrado. Feche e reabra para revisar o próximo sorteio.', 'The draw changed. Nothing was charged. Close and reopen to review the next draw.', 'El sorteo cambió. No se cobró nada. Cierra y vuelve a abrir para revisar el próximo sorteo.'),
    lottery_entry_limit: x('Limite de números do sorteio atual atingido (100 por pedido, 1000 pagos).', 'Entry limit for the current draw reached (100 per order, 1000 paid).', 'Límite de números del sorteo actual alcanzado (100 por pedido, 1000 pagados).'),
    invalid_lottery_purchase: x('Pedido inválido. Revise a quantidade.', 'Invalid order. Check the quantity.', 'Pedido inválido. Revisa la cantidad.'),
  } as Record<string, string>)[c] ?? (c.includes('liquidity') ? x('Liquidez simulada insuficiente para queimar agora. Nada foi cobrado; tente novamente.', 'Not enough simulated liquidity to burn now. Nothing was charged; try again.', 'Liquidez simulada insuficiente para quemar ahora. No se cobró nada; inténtalo de nuevo.') : x('Não foi possível concluir a compra. Tente novamente.', 'Could not complete the purchase. Try again.', 'No se pudo completar la compra. Inténtalo de nuevo.'));
  const begin = () => {
    if (errorCode(m.error) === 'lottery_draw_closed') held.current = null;
    reviewDrawAt.current = held.current?.drawAt ?? lot.nextDrawAt;
    if (held.current) setQty(String(held.current.quantity));
    m.reset(); setReceiptError(false); setDone(null); setOpen(true);
  };
  const confirm = () => {
    if (m.isPending || !valid) return;
    if (!held.current || held.current.quantity !== n) held.current = { requestId: crypto.randomUUID(), quantity: n, drawAt: reviewDrawAt.current };
    const h = held.current;
    m.mutate({ data: { requestId: h.requestId, quantity: h.quantity, confirmed: true, drawAt: h.drawAt } }, {
      onSuccess: snap => {
        qc.setQueryData(getGetDemoDashboardQueryKey(), snap);
        void qc.invalidateQueries({ queryKey: getGetDemoDashboardQueryKey() });
        void qc.invalidateQueries({ predicate: q => typeof q.queryKey[0] === 'string' && (q.queryKey[0] as string).startsWith('/api/demo') });
        const r = snap.lottery?.purchaseResult ?? snap.lottery?.entryReceipts.find(v => v.requestId === h.requestId);
        if (!r || r.requestId !== h.requestId) { setReceiptError(true); return; }
        setDone({ quantity: r.quantity, paid: r.paidUsdc, burned: r.burnedBettex, numbers: r.numbers, drawAt: h.drawAt });
        held.current = null; setQty('1');
      },
    });
  };
  const err = receiptError ? x('Recibo indisponível. Tente novamente para recuperá-lo sem pagar duas vezes.', 'Receipt unavailable. Retry to retrieve it without paying twice.', 'Recibo no disponible. Reintenta para recuperarlo sin pagar dos veces.') : m.isError ? msg(errorCode(m.error)) : null;
  return <div className="grid min-w-0 gap-2 rounded-xl border border-white/15 p-3" data-testid="lottery-entries">
    <p className="text-sm font-bold text-[#F4F1E8]">{x('Seus números', 'Your numbers', 'Tus números')}</p>
    <p className="text-xs text-[#C5D2F1]">{x('Todos os números têm o mesmo peso. Uma carteira só pode vencer e vender uma vez por sorteio.', 'All numbers have equal weight. A wallet can win and sell only once per draw.', 'Todos los números tienen el mismo peso. Una cartera solo puede ganar y vender una vez por sorteo.')}</p>
    <div className="grid gap-1"><span className="text-xs text-[#C5D2F1]">{x('Número grátis', 'Free number', 'Número gratis')} ({free.length})</span>{free.length ? nums(free.map(e => e.number), 'lottery-free-numbers') : <span className="text-xs text-[#C5D2F1]" data-testid="lottery-free-numbers">{x('Atribuído automaticamente a cada carteira com BETTEX em stake.', 'Assigned automatically to every wallet with staked BETTEX.', 'Asignado automáticamente a cada cartera con BETTEX en stake.')}</span>}</div>
    {(!lot.participating || !lot.eligible) && <p className="text-xs text-[#C5D2F1]" data-testid="lottery-numbers-inactive">{x('Números ativos apenas com stake elegível e participação confirmada.', 'Numbers are active only with eligible staking and confirmed participation.', 'Los números están activos solo con stake elegible y participación confirmada.')}</p>}
    <div className="grid gap-1"><span className="text-xs text-[#C5D2F1]">{x('Números comprados', 'Purchased numbers', 'Números comprados')} ({paid.length}/{MAX_PAID})</span>{paid.length ? <div className="max-h-24 overflow-y-auto">{nums(paid.map(e => e.number), 'lottery-paid-numbers')}</div> : <span className="text-xs text-[#C5D2F1]">{x('Nenhum ainda.', 'None yet.', 'Ninguno todavía.')}</span>}</div>
    {done && <div role="status" className="rounded-lg bg-[#E6F4EA] p-2 text-xs text-[#14532D]" data-testid="lottery-purchase-receipt">
      <p className="font-bold">{x('Compra concluída', 'Purchase complete', 'Compra completada')}: {done.quantity} · {nf(fl, done.paid)} USDC</p>
      <p>{x('Sorteio', 'Draw', 'Sorteo')}: {formatBrazilDateTime(done.drawAt, fl)} · São Paulo</p>
      <p>{x('BETTEX queimado', 'BETTEX burned', 'BETTEX quemado')}: {nf(fl, done.burned, 6)}</p>
      {done.numbers.length > 0 && <p className="mono break-words">{done.numbers.join(', ')}</p>}
    </div>}
    {lot.entryReceipts.length > 0 && <details className="text-xs text-[#C5D2F1]"><summary className="cursor-pointer">{x('Recibos', 'Receipts', 'Recibos')} ({lot.entryReceipts.length})</summary><ul className="mt-1 grid gap-1">{lot.entryReceipts.map(r => <li key={r.requestId}>{r.quantity} · {nf(fl, r.paidUsdc)} USDC · {nf(fl, r.burnedBettex, 6)} BETTEX</li>)}</ul></details>}
    <button type="button" className={`${btn} !bg-[#FFFCF6] !text-[#1B2A41] !border-[#E4DCCB]`} disabled={!canBuy} onClick={begin} data-testid="lottery-buy-open">{x('Comprar números extras', 'Buy extra numbers', 'Comprar números extra')}</button>
    {!canBuy && <p className="text-xs text-[#C5D2F1]">{!lot.participating || !lot.eligible ? x('Disponível para carteiras em stake que aderiram à loteria.', 'Available to staked wallets that joined the lottery.', 'Disponible para carteras en stake adheridas a la lotería.') : x('Limite de 1000 números pagos atingido.', 'Limit of 1000 paid numbers reached.', 'Límite de 1000 números pagados alcanzado.')}</p>}
    <Dialog open={open} onOpenChange={v => { if (!m.isPending) setOpen(v); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-[#FFFCF6] p-4 text-[#1B2A41] shadow-xl" data-testid="lottery-buy-dialog">
        <DialogTitle className="display text-base font-extrabold">{x('Comprar números extras', 'Buy extra numbers', 'Comprar números extra')}</DialogTitle>
        <DialogDescription className="sr-only">{x('Confirme a compra de números da loteria.', 'Confirm the lottery number purchase.', 'Confirma la compra de números de la lotería.')}</DialogDescription>
        {done ? <div className="grid gap-2 text-sm" data-testid="lottery-buy-success">
          <p className="font-bold">{x('Compra concluída', 'Purchase complete', 'Compra completada')}</p>
           <p>{done.quantity} · {nf(fl, done.paid)} USDC · {nf(fl, done.burned, 6)} BETTEX {x('queimados', 'burned', 'quemados')}</p>
          <div className="max-h-28 overflow-y-auto"><p className="mono break-words text-xs">{done.numbers.join(', ')}</p></div>
          <div className="flex justify-end"><button type="button" className={btn} onClick={() => setOpen(false)} data-testid="lottery-buy-close">{x('Fechar', 'Close', 'Cerrar')}</button></div>
        </div> : <>
          <label className="mt-2 grid gap-1 text-sm font-bold">{x('Quantidade (1 a', 'Quantity (1 to', 'Cantidad (1 a')} {maxNow})
            <input type="number" inputMode="numeric" min={1} max={maxNow} step={1} value={qty} disabled={m.isPending} onChange={e => setQty(e.target.value)} data-testid="lottery-buy-quantity" className="min-h-11 rounded-lg border border-[#E4DCCB] bg-white px-3 text-base" />
          </label>
          <p className="mt-2 text-sm" data-testid="lottery-buy-total">{x('Total', 'Total', 'Total')}: <b>{nf(fl, total)} USDC</b> ({nf(fl, price)} USDC {x('cada', 'each', 'cada uno')})</p>
          <ul className="mt-2 grid list-disc gap-1 pl-5 text-xs">
            <li>{x('100% do USDC compra e queima BETTEX na hora. Sem taxa; não financia o prêmio.', '100% of the USDC buys and immediately burns BETTEX. No fee; it does not fund the prize pot.', '100% del USDC compra y quema BETTEX al instante. Sin comisión; no financia el premio.')}</li>
            <li>{x('Não gasta seus tokens em stake nem cancela a participação.', 'Does not spend your staked tokens or cancel participation.', 'No gasta tus tokens en stake ni cancela la participación.')}</li>
            <li>{x('Sair do stake ou da loteria inativa os números; compras não são reembolsáveis.', 'Leaving staking or the lottery makes numbers inactive; purchases are not refundable.', 'Salir del stake o de la lotería inactiva los números; las compras no son reembolsables.')}</li>
             <li>{x('Válidos apenas para o sorteio de', 'Valid only for the draw on', 'Válidos solo para el sorteo del')} {formatBrazilDateTime(reviewDrawAt.current, fl)} · São Paulo. {x('Simulação, sem dinheiro real.', 'Simulation, no real money.', 'Simulación, sin dinero real.')}</li>
          </ul>
          {err && <p role="alert" className="mt-2 text-xs font-semibold text-[#A12D2D]" data-testid="lottery-buy-error">{err}</p>}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button type="button" className={btn} disabled={m.isPending} onClick={() => setOpen(false)} data-testid="lottery-buy-cancel">{x('Cancelar', 'Cancel', 'Cancelar')}</button>
            <button type="button" className={`${btn} !border-[#1B2A41] !bg-[#1B2A41] !text-[#FFFCF6]`} disabled={m.isPending || !valid} onClick={confirm} data-testid="lottery-buy-confirm">{m.isPending ? x('Comprando...', 'Buying...', 'Comprando...') : m.isError ? x('Tentar novamente', 'Retry', 'Reintentar') : x(`Confirmar e pagar ${nf(fl, total)} USDC`, `Confirm and pay ${nf(fl, total)} USDC`, `Confirmar y pagar ${nf(fl, total)} USDC`)}</button>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  </div>;
}
