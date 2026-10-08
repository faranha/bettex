/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Tickets } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetDemoDashboardQueryKey, useBuyDemoLotteryEntries, type DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { burnFl, nf } from './burn-format';
import { formatBrazilDateTime } from './brazil-time';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

type Lot = NonNullable<DemoDashboard['lottery']>;
type Receipt = Lot['entryReceipts'][number];

function NumberRange({ first, count }: { first: string; count: number }) {
  const { x, loc } = useX();
  const [page, setPage] = useState(0);
  const pages = Math.ceil(count / 100);
  const start = Number(first);
  return <details className="text-xs">
    <summary className="cursor-pointer break-words mono">{first}–{String(start + count - 1).padStart(6, '0')} ({nf(burnFl(loc), count, 0)})</summary>
    <p className="mono mt-1 break-words">{Array.from({ length: Math.min(100, count - page * 100) }, (_, i) => String(start + page * 100 + i).padStart(6, '0')).join(', ')}</p>
    {pages > 1 && <div className="mt-1 flex items-center justify-between gap-2">
      <button type="button" disabled={page === 0} onClick={() => setPage(v => v - 1)} className="min-h-11 !bg-transparent px-2 !text-inherit disabled:opacity-40">{x('Anterior', 'Previous', 'Anterior')}</button>
      <span>{page + 1}/{pages}</span>
      <button type="button" disabled={page + 1 >= pages} onClick={() => setPage(v => v + 1)} className="min-h-11 !bg-transparent px-2 !text-inherit disabled:opacity-40">{x('Próxima', 'Next', 'Siguiente')}</button>
    </div>}
  </details>;
}
function ReceiptNumbers({ receipt }: { receipt: Receipt }) {
  return receipt.firstNumber ? <NumberRange first={receipt.firstNumber} count={receipt.quantity} /> : <p className="mono break-words">{receipt.numbers.join(', ')}</p>;
}

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
  const [numbersOpen, setNumbersOpen] = useState(false);
  const [qty, setQty] = useState('1');
  const [done, setDone] = useState<(Receipt & { drawAt: string }) | null>(null);
  const held = useRef<{ requestId: string; quantity: number; drawAt: string } | null>(null);
  const reviewDrawAt = useRef(lot.nextDrawAt);
  const [receiptError, setReceiptError] = useState(false);
  const [unresolved, setUnresolved] = useState(false);
  useEffect(() => {
    const h = held.current;
    const r = h && lot.entryReceipts.find(v => v.requestId === h.requestId);
    if (h && r && !m.isPending) {
      setDone({ ...r, drawAt: h.drawAt });
      setReceiptError(false); setUnresolved(false); held.current = null;
    }
  }, [lot.entryReceipts, m.isPending]);
  const price = lot.entryPriceBettex;
  const free = lot.entries.filter(e => e.type === 'free');
  const paid = lot.entries.filter(e => e.type === 'paid');
  const paidCount = paid.reduce((count, e) => count + (e.quantity ?? 1), 0);
  const n = Number(qty);
  const valid = Number.isSafeInteger(n) && n >= 1;
  const canBuy = lot.participating && lot.eligible;
  const total = valid ? n * price : 0;
  const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm font-bold text-[#1B2A41] disabled:opacity-50';
  const nums = (list: string[], tid: string) => <div className="flex flex-wrap gap-1" data-testid={tid}>{list.map(v => <span key={v} className="mono rounded-md border border-white/20 px-1.5 py-0.5 text-[11px] text-[#F4F1E8]">{v}</span>)}</div>;
  const msg = (c: string) => ({
    insufficient_balance: x('Saldo em BETTEX insuficiente para esta compra.', 'Not enough BETTEX balance for this purchase.', 'Saldo de BETTEX insuficiente para esta compra.'),
    lottery_participation_required: x('Ative a participação na loteria e mantenha BETTEX em stake para comprar números.', 'Join the lottery and keep BETTEX staked to buy numbers.', 'Activa la participación en la lotería y mantén BETTEX en stake para comprar números.'),
    lottery_draw_closed: x('O sorteio mudou. Nada foi cobrado. Feche e reabra para revisar o próximo sorteio.', 'The draw changed. Nothing was charged. Close and reopen to review the next draw.', 'El sorteo cambió. No se cobró nada. Cierra y vuelve a abrir para revisar el próximo sorteo.'),
    lottery_number_space_unavailable: x('Não foi possível reservar esta quantidade de números. Nada foi cobrado.', 'Unable to reserve this quantity of numbers. Nothing was charged.', 'No se pudo reservar esta cantidad de números. No se cobró nada.'),
    invalid_lottery_purchase: x('Pedido inválido. Revise a quantidade.', 'Invalid order. Check the quantity.', 'Pedido inválido. Revisa la cantidad.'),
  } as Record<string, string>)[c] ?? (c.includes('liquidity') ? x('Liquidez simulada insuficiente para queimar agora. Nada foi cobrado; tente novamente.', 'Not enough simulated liquidity to burn now. Nothing was charged; try again.', 'Liquidez simulada insuficiente para quemar ahora. No se cobró nada; inténtalo de nuevo.') : x('Não foi possível concluir a compra. Tente novamente.', 'Could not complete the purchase. Try again.', 'No se pudo completar la compra. Inténtalo de nuevo.'));
  const begin = () => {
    if (errorCode(m.error) === 'lottery_draw_closed') held.current = null;
    reviewDrawAt.current = held.current?.drawAt ?? lot.nextDrawAt;
    if (held.current) setQty(String(held.current.quantity));
    m.reset(); setReceiptError(false); setDone(null); setOpen(true);
  };
  const confirm = () => {
    if (m.isPending || !valid || unresolved && held.current?.quantity !== n) return;
    if (!held.current || held.current.quantity !== n) held.current = { requestId: crypto.randomUUID(), quantity: n, drawAt: reviewDrawAt.current };
    const h = held.current;
    m.mutate({ data: { requestId: h.requestId, quantity: h.quantity, paymentAsset: 'BETTEX', confirmed: true, drawAt: h.drawAt } }, {
      onSuccess: snap => {
        qc.setQueryData(getGetDemoDashboardQueryKey(), snap);
        void qc.invalidateQueries({ queryKey: getGetDemoDashboardQueryKey() });
        void qc.invalidateQueries({ predicate: q => typeof q.queryKey[0] === 'string' && (q.queryKey[0] as string).startsWith('/api/demo') });
        const r = snap.lottery?.purchaseResult ?? snap.lottery?.entryReceipts.find(v => v.requestId === h.requestId);
        if (!r || r.requestId !== h.requestId) { setReceiptError(true); setUnresolved(true); return; }
        setDone({ ...r, drawAt: h.drawAt });
        held.current = null; setUnresolved(false); setQty('1');
      },
      onError: error => setUnresolved(['unknown', 'lottery_receipt_unavailable'].includes(errorCode(error))),
    });
  };
  const err = unresolved || receiptError ? x('Compra ainda não confirmada. Repita o mesmo pedido para recuperar o recibo sem pagar duas vezes.', 'Purchase status not confirmed. Retry the same order to recover the receipt without paying twice.', 'Compra aún no confirmada. Reintenta el mismo pedido para recuperar el recibo sin pagar dos veces.') : m.isError ? msg(errorCode(m.error)) : null;
  const numbersContent = <div className="grid min-w-0 gap-3">
    <DialogTitle className="display pr-6 text-lg font-extrabold text-[#F4F1E8]">{x('Seus números', 'Your numbers', 'Tus números')}</DialogTitle>
    <DialogDescription className="text-xs text-[#C5D2F1]">{x('Todos os números têm o mesmo peso. Uma carteira só pode vencer e vender uma vez por sorteio.', 'All numbers have equal weight. A wallet can win and sell only once per draw.', 'Todos los números tienen el mismo peso. Una cartera solo puede ganar y vender una vez por sorteo.')}</DialogDescription>
    <div className="grid gap-1"><span className="text-xs text-[#C5D2F1]">{x('Número grátis', 'Free number', 'Número gratis')} ({free.length})</span>{free.length ? nums(free.map(e => e.number), 'lottery-free-numbers') : <span className="text-xs text-[#C5D2F1]" data-testid="lottery-free-numbers">{x('Atribuído automaticamente a cada carteira com BETTEX em stake.', 'Assigned automatically to every wallet with staked BETTEX.', 'Asignado automáticamente a cada cartera con BETTEX en stake.')}</span>}</div>
    {(!lot.participating || !lot.eligible) && <p className="text-xs text-[#C5D2F1]" data-testid="lottery-numbers-inactive">{x('Números ativos apenas com stake elegível e participação confirmada.', 'Numbers are active only with eligible staking and confirmed participation.', 'Los números están activos solo con stake elegible y participación confirmada.')}</p>}
    <div className="grid gap-1"><span className="text-xs text-[#C5D2F1]">{x('Números comprados', 'Purchased numbers', 'Números comprados')} ({nf(fl, paidCount, 0)})</span>{paid.length ? <div className="max-h-40 overflow-y-auto text-[#F4F1E8]" data-testid="lottery-paid-numbers">{paid.map(e => <NumberRange key={e.number} first={e.number} count={e.quantity ?? 1} />)}</div> : <span className="text-xs text-[#C5D2F1]">{x('Nenhum ainda.', 'None yet.', 'Ninguno todavía.')}</span>}</div>
    {done && <div role="status" className="rounded-lg bg-[#E6F4EA] p-2 text-xs text-[#14532D]" data-testid="lottery-purchase-receipt">
      <p className="font-bold">{x('Compra concluída', 'Purchase complete', 'Compra completada')}: {done.quantity} · {nf(fl, done.paidAmount)} {done.paidAsset}</p>
      <p>{x('Sorteio', 'Draw', 'Sorteo')}: {formatBrazilDateTime(done.drawAt, fl)} · São Paulo</p>
      <p>{x('BETTEX queimado', 'BETTEX burned', 'BETTEX quemado')}: {nf(fl, done.burnedBettex, 6)}</p>
      <ReceiptNumbers receipt={done} />
    </div>}
    {lot.entryReceipts.length > 0 && <details className="text-xs text-[#C5D2F1]"><summary className="cursor-pointer">{x('Recibos', 'Receipts', 'Recibos')} ({lot.entryReceipts.length})</summary><ul className="mt-1 grid gap-1">{lot.entryReceipts.map(r => <li key={r.requestId}>{r.quantity} · {nf(fl, r.paidAmount)} {r.paidAsset} · {nf(fl, r.burnedBettex, 6)} BETTEX<ReceiptNumbers receipt={r} /></li>)}</ul></details>}
    <button type="button" className={`${btn} !bg-[#FFFCF6] !text-[#1B2A41] !border-[#E4DCCB]`} disabled={!canBuy} onClick={begin} data-testid="lottery-buy-open">{x('Comprar números extras', 'Buy extra numbers', 'Comprar números extra')}</button>
    {!canBuy && <p className="text-xs text-[#C5D2F1]">{x('Disponível para carteiras em stake que aderiram à loteria.', 'Available to staked wallets that joined the lottery.', 'Disponible para carteras en stake adheridas a la lotería.')}</p>}
  </div>;
  return <div className="min-w-0" data-testid="lottery-entries">
    <Dialog open={numbersOpen || open} onOpenChange={v => { if (!m.isPending && !v) { setOpen(false); setNumbersOpen(false); } }}>
    <DialogTrigger asChild>
    <button type="button" onClick={() => setNumbersOpen(true)} data-testid="lottery-numbers-open"
      className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-white/15 !bg-transparent px-3 py-2 text-left text-sm font-bold !text-[#F4F1E8] transition-colors hover:!bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F2B632]">
      <Tickets className="h-4 w-4 shrink-0 text-[#F2B632]" aria-hidden="true" />
      <span>{x('Seus números', 'Your numbers', 'Tus números')}</span>
      <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-xs tabular-nums">{nf(fl, free.length + paidCount, 0)}</span>
      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </button>
    </DialogTrigger>
      <DialogContent className={`max-h-[85dvh] w-[calc(100vw_-_2rem)] max-w-md overflow-y-auto rounded-2xl p-4 shadow-xl ${open ? 'bg-[#FFFCF6] text-[#1B2A41]' : 'border-white/20 bg-[#080E23] text-[#F4F1E8]'}`}
        data-testid={open ? 'lottery-buy-dialog' : 'lottery-numbers-dialog'}>
        {open ? <>
        <DialogTitle className="display text-base font-extrabold">{x('Comprar números extras', 'Buy extra numbers', 'Comprar números extra')}</DialogTitle>
        <DialogDescription className="sr-only">{x('Confirme a compra de números da loteria.', 'Confirm the lottery number purchase.', 'Confirma la compra de números de la lotería.')}</DialogDescription>
        {done ? <div className="grid gap-2 text-sm" data-testid="lottery-buy-success">
          <p className="font-bold">{x('Compra concluída', 'Purchase complete', 'Compra completada')}</p>
           <p>{done.quantity} · {nf(fl, done.paidAmount)} {done.paidAsset} · {nf(fl, done.burnedBettex, 6)} BETTEX {x('queimados', 'burned', 'quemados')}</p>
          <div className="max-h-40 overflow-y-auto"><ReceiptNumbers receipt={done} /></div>
          <div className="flex justify-end"><button type="button" className={btn} onClick={() => setOpen(false)} data-testid="lottery-buy-close">{x('Fechar', 'Close', 'Cerrar')}</button></div>
        </div> : <>
          <label className="mt-2 grid gap-1 text-sm font-bold">{x('Quantidade (1 ou mais)', 'Quantity (1 or more)', 'Cantidad (1 o más)')}
            <input type="number" inputMode="numeric" min={1} step={1} value={qty} disabled={m.isPending || unresolved} onChange={e => setQty(e.target.value)} data-testid="lottery-buy-quantity" className="min-h-11 rounded-lg border border-[#E4DCCB] bg-white px-3 text-base" />
          </label>
          <p className="mt-2 text-sm" data-testid="lottery-buy-total">{x('Total', 'Total', 'Total')}: <b>{nf(fl, total)} BETTEX</b> ({nf(fl, price)} BETTEX {x('cada', 'each', 'cada uno')})</p>
          <p className="text-xs">{x('Saldo disponível', 'Available balance', 'Saldo disponible')}: {nf(fl, lot.entryBalanceBettex, 6)} BETTEX · {x('Sem limite por pedido ou sorteio; sujeito ao saldo.', 'No per-order or per-draw cap; subject to balance.', 'Sin límite por pedido o sorteo; sujeto al saldo.')}</p>
          <ul className="mt-2 grid list-disc gap-1 pl-5 text-xs">
            <li>{x('Pagamento em BETTEX: 100% dos tokens são queimados na hora. Sem taxa, conversão AMM ou uso de USDC; não financia o prêmio.', 'Pay in BETTEX: 100% of the tokens are burned immediately. No fee, AMM swap or USDC debit; it does not fund the prize pot.', 'Pago en BETTEX: el 100% se quema al instante. Sin comisión, conversión AMM ni débito USDC; no financia el premio.')}</li>
            <li>{x('Reduz seu saldo BETTEX e cancela todos os rendimentos não pagos da rodada atual, conforme a regra de saída. USDC já recebido permanece seu.', 'Reduces your BETTEX balance and cancels all unpaid earnings for the current round under the exit rule. Already received USDC remains yours.', 'Reduce tu saldo BETTEX y cancela todos los rendimientos pendientes de la ronda actual según la regla de salida. El USDC ya recibido sigue siendo tuyo.')}</li>
            <li>{x('É necessário manter BETTEX em stake para ativar os números. Se gastar todo o saldo, ficam inativos até voltar a ter stake elegível.', 'Numbers require staked BETTEX to be active. Spending the entire balance makes them inactive until eligible staking resumes.', 'Los números requieren BETTEX en stake. Si gastas todo el saldo, quedan inactivos hasta recuperar stake elegible.')}</li>
            <li>{x('Sair do stake ou da loteria inativa os números; compras não são reembolsáveis.', 'Leaving staking or the lottery makes numbers inactive; purchases are not refundable.', 'Salir del stake o de la lotería inactiva los números; las compras no son reembolsables.')}</li>
             <li>{x('Válidos apenas para o sorteio de', 'Valid only for the draw on', 'Válidos solo para el sorteo del')} {formatBrazilDateTime(reviewDrawAt.current, fl)} · São Paulo. {x('Simulação, sem dinheiro real.', 'Simulation, no real money.', 'Simulación, sin dinero real.')}</li>
          </ul>
          {err && <p role="alert" className="mt-2 text-xs font-semibold text-[#A12D2D]" data-testid="lottery-buy-error">{err}</p>}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button type="button" className={btn} disabled={m.isPending} onClick={() => setOpen(false)} data-testid="lottery-buy-cancel">{x('Cancelar', 'Cancel', 'Cancelar')}</button>
            <button type="button" className={`${btn} !border-[#1B2A41] !bg-[#1B2A41] !text-[#FFFCF6]`} disabled={m.isPending || !valid} onClick={confirm} data-testid="lottery-buy-confirm">{m.isPending ? x('Comprando...', 'Buying...', 'Comprando...') : m.isError ? x('Tentar novamente', 'Retry', 'Reintentar') : x(`Confirmar e pagar ${nf(fl, total)} BETTEX`, `Confirm and pay ${nf(fl, total)} BETTEX`, `Confirmar y pagar ${nf(fl, total)} BETTEX`)}</button>
          </div>
        </>}
        </> : numbersContent}
      </DialogContent>
    </Dialog>
  </div>;
}
