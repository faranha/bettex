/** @jsxImportSource react */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import * as D from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateDemoMovement, getGetDemoDashboardQueryKey, type DemoDashboard, type DemoMovementInput } from '@workspace/api-client-react';
import { CircleHelp, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useX } from './ui';
import { DepositAddress } from './DepositAddress';

export const Rates = createContext({ r: 5, bu: 1 });
export type Asset = 'USDC' | 'BETTEX';
export function useMoney() {
  const { r, bu } = useContext(Rates); const { loc } = useX();
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const num = (v: number, d = 2) => v.toLocaleString(fl, { minimumFractionDigits: d, maximumFractionDigits: d });
  const brl = (a: Asset, v: number) => (a === 'USDC' ? v * r : v * bu * r).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return { num, brl, fl };
}
export function Money({ v, a, big, signed, precision }: { v: number; a: Asset; big?: boolean; signed?: boolean; precision?: number }) {
  const { num, brl } = useMoney();
   return <span data-amount={v} data-asset={a} className="inline-flex min-w-0 flex-col leading-tight"><span className={`display font-extrabold ${big ? 'text-xl sm:text-2xl' : 'text-sm'}`}>{signed && v > 0 ? '+' : ''}{num(v, precision ?? (a === 'USDC' ? 2 : 4))} <span className="mono text-[0.65em] font-bold text-[#5B6B85]">{a}</span></span><span className={`${big ? 'text-sm' : 'text-xs'} text-[#5B6B85]`}>≈ {signed && v > 0 ? '+' : ''}{brl(a, v)}</span></span>;
}
export function Term({ children, tip }: { children: ReactNode; tip: string }) {
  const [open, setOpen] = useState(false);
  return <Tooltip open={open} onOpenChange={setOpen}><TooltipTrigger asChild><button type="button" aria-expanded={open} onClick={event => { event.preventDefault(); setOpen(value => !value); }} className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]">{children}<CircleHelp className="h-3.5 w-3.5 text-[#0E7C6B]" aria-hidden="true" /></button></TooltipTrigger><TooltipContent className="max-w-[260px] text-xs">{tip}</TooltipContent></Tooltip>;
}
export function useClock(d: DemoDashboard | undefined) {
  const off = useRef(0); const [, set] = useState(0);
  useEffect(() => { if (d) off.current = Date.parse(d.serverNow) - Date.now(); }, [d?.serverNow]);
  useEffect(() => { const i = window.setInterval(() => set(k => k + 1), 1000); return () => window.clearInterval(i); }, []);
  return () => Date.now() + off.current;
}
export function errCode(e: unknown): string {
  const o = e as { data?: { error?: string } } | null;
  return o?.data?.error ?? 'network';
}
export function useErrMsg() {
  const { x } = useX();
  return (c: string) => c === 'insufficient_balance' ? x('Saldo insuficiente para esta operação.', 'Insufficient balance for this operation.', 'Saldo insuficiente para esta operación.')
    : c === 'invalid_movement' ? x('Movimentação inválida. Confira valor e destino.', 'Invalid movement. Check amount and destination.', 'Movimiento inválido. Revise monto y destino.')
    : c === 'yield_exceeded' ? x('O valor excede o rendimento recebido disponível.', 'Amount exceeds the received yield available.', 'El monto excede el rendimiento recibido disponible.')
    : c === 'engine_unavailable' ? x('O motor está indisponível agora. Tente de novo em instantes.', 'The engine is unavailable right now. Try again shortly.', 'El motor no está disponible ahora. Intente de nuevo en instantes.')
    : x('Não foi possível confirmar o envio. Tente novamente: não duplicaremos a operação.', 'Could not confirm submission. Retry: it will not be duplicated.', 'No se pudo confirmar el envío. Reintente: no se duplicará.');
}
export function Sheet({ open, onClose, title, desc, children }: { open: boolean; onClose: () => void; title: string; desc: string; children: ReactNode }) {
  const { x } = useX();
  return <D.Root open={open} onOpenChange={o => { if (!o) onClose(); }}><D.Portal><D.Overlay className="fixed inset-0 z-[60] bg-[#1B2A41]/40 backdrop-blur-[2px]" />
    <D.Content className="demo-root fixed inset-x-3 bottom-3 z-[61] mx-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-3xl border border-[#E4DCCB] bg-[#FFFCF6] p-5 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
      <div className="flex items-start justify-between gap-3"><D.Title className="display text-xl font-extrabold">{title}</D.Title><D.Close aria-label={x('Fechar', 'Close', 'Cerrar')} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#F0E9DA]"><X className="h-4 w-4" aria-hidden="true" /></D.Close></div>
      <D.Description className="mt-1 text-sm text-[#5B6B85]">{desc}</D.Description>{children}
    </D.Content></D.Portal></D.Root>;
}
export const inp = 'min-h-11 w-full rounded-xl border border-[#D8CFBB] bg-white px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
const primary = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50';
export type Kind = 'receive' | 'onramp' | 'swap' | 'withdraw' | 'send' | 'earnings-transfer';

export function MovementSheet({ kind, initialAsset, d, onClose }: { kind: Kind | null; initialAsset?: Asset; d: DemoDashboard; onClose: () => void }) {
  const { x, tx } = useX(); const { num, brl } = useMoney(); const em = useErrMsg(); const qc = useQueryClient();
  const m = useCreateDemoMovement();
  const [amt, setAmt] = useState(''); const [dest, setDest] = useState('');
  const [err, setErr] = useState(''); const [ok, setOk] = useState(false); const rid = useRef<string | null>(null);
  const retryInput = useRef<DemoMovementInput | null>(null);
  useEffect(() => { setAmt(''); setDest(''); setErr(''); setOk(false); rid.current = null; retryInput.current = null; }, [kind, initialAsset]);
  const touch = () => { rid.current = null; retryInput.current = null; setErr(''); setOk(false); };
  const k0: Kind = kind ?? 'receive';
  const earnings = k0 === 'earnings-transfer';
  const a: Asset = earnings || k0 === 'onramp' || k0 === 'withdraw' ? 'USDC' : k0 === 'send' ? 'BETTEX' : (initialAsset ?? 'USDC');
  const k: DemoMovementInput['kind'] = k0 === 'onramp' ? 'receive' : k0 === 'earnings-transfer' ? 'transfer' : k0;
  const bu = d.balances.bettexUsdc; const U = d.balances.usdc; const B = d.balances.bettex;
  const n = Number(amt.replace(',', '.')) || 0;
  const amount = n;
  const rd = (v: number) => Math.round(v * 1e6) / 1e6;
  const needDest = k === 'send' || k === 'withdraw';
  const validDest = /^0x[0-9a-fA-F]{40}$/.test(dest.trim()) && !/^0x0{40}$/i.test(dest.trim());
  const swapB = k === 'swap' && a === 'BETTEX';
  const feeUsd = k === 'receive' ? 0 : 2.5;
  const spendable = earnings ? d.balances.receivedYield : U;
  const max = Math.min(100000, k === 'swap' ? (swapB ? B : Math.max(0, U - feeUsd)) : k === 'withdraw' || k === 'transfer' ? Math.max(0, spendable - feeUsd) : k === 'send' ? (U >= feeUsd ? B : 0) : 100000);
  const over = n > 0 && k !== 'receive' && (n > max + 1e-9 || (swapB && n * bu <= feeUsd));
  const valid = amount >= 0.000001 && amount <= 100000 && rd(amount) === amount && (!needDest || validDest);
  const outflow = k === 'send' || swapB;
  const Tt: Record<string, [string, string, string]> = {
    'onramp': ['Adicionar crédito', 'Add credit', 'Agregar crédito'],
    'receive-USDC': ['Adicionar crédito', 'Add credit', 'Agregar crédito'],
    'receive-BETTEX': ['Adicionar BETTEX', 'Add BETTEX', 'Agregar BETTEX'],
    'swap-USDC': ['Converter USDC em BETTEX', 'Convert USDC to BETTEX', 'Convertir USDC en BETTEX'],
    'swap-BETTEX': ['Converter BETTEX em USDC', 'Convert BETTEX to USDC', 'Convertir BETTEX en USDC'],
    'withdraw': ['Sacar dólares para carteira cripto', 'Withdraw dollars to crypto wallet', 'Retirar dólares a cartera cripto'],
    'send': ['Transferir BETTEX para carteira externa', 'Transfer BETTEX to external wallet', 'Transferir BETTEX a cartera externa'],
    'earnings-transfer': ['Mover rendimentos para dólares', 'Move earnings to dollar wallet', 'Mover ganancias a dólares'],
  };
  const key = k0 === 'swap' || k0 === 'receive' ? `${k0}-${a}` : k0;
  const title = k0 === 'withdraw' ? x('Sacar USDC', 'Withdraw USDC', 'Retirar USDC') : tx(Tt[key]);
  const desc = earnings ? x('Mova USDC dos rendimentos para sua carteira em dólares. Valor e taxa saem dos rendimentos.', 'Move USDC from earnings to your dollar wallet. The amount and fee are debited from earnings.', 'Mueve USDC de ganancias a tu cartera en dólares. El importe y la tarifa salen de las ganancias.')
    : k0 === 'onramp' || (k0 === 'receive' && a === 'USDC') ? x('Adicione USDC à sua carteira em dólares.', 'Add USDC to your dollar wallet.', 'Agrega USDC a tu cartera en dólares.')
    : k0 === 'receive' ? x('Receba BETTEX de uma carteira externa. Entra na participação só após a confirmação.', 'Receive BETTEX from an external wallet. It joins staking only after confirmation.', 'Recibe BETTEX de una cartera externa. Entra en participación solo tras la confirmación.')
    : k0 === 'swap' ? x('A taxa é travada ao enviar e a conversão conclui em cerca de 6 segundos.', 'The rate locks on submit and the conversion settles in about 6 seconds.', 'La tasa se fija al enviar y la conversión concluye en unos 6 segundos.')
    : k0 === 'withdraw' ? x('Você retira USDC, um token ERC-20, não ETH. Use uma carteira que aceite USDC na rede Arbitrum One.', 'You withdraw USDC, an ERC-20 token, not ETH. Use a wallet that accepts USDC on the Arbitrum One network.', 'Retiras USDC, un token ERC-20, no ETH. Usa una cartera que acepte USDC en la red Arbitrum One.')
    : x('Envia tokens BETTEX para uma carteira externa. A taxa é cobrada em USDC.', 'Sends BETTEX tokens to an external wallet. The fee is charged in USDC.', 'Envía tokens BETTEX a una cartera externa. La tarifa se cobra en USDC.');
  const submit = async () => {
    if (m.isPending || (!retryInput.current && (!valid || over))) return;
    if (!rid.current) rid.current = crypto.randomUUID();
    const data: DemoMovementInput = retryInput.current ?? { requestId: rid.current, kind: k, asset: a, amount, ...(earnings ? { sourceWallet: 'earnings' as const } : {}), ...(needDest ? { destination: dest.trim() } : {}) };
    retryInput.current = data;
    try {
      const snap = await m.mutateAsync({ data }); qc.setQueryData(getGetDemoDashboardQueryKey(), snap); void qc.invalidateQueries({ queryKey: getGetDemoDashboardQueryKey() });
      setOk(true); setErr(''); rid.current = null; retryInput.current = null; setAmt('');
    } catch (e) { const c = errCode(e); setErr(em(c)); if (c !== 'network') { rid.current = null; retryInput.current = null; } }
  };
  const dec = (as: Asset) => (as === 'USDC' ? 2 : 4);
  const fmt = (v: number, as: Asset) => `${num(v, dec(as))} ${as} ≈ ${brl(as, v)}`;
  const feeLine = `${num(feeUsd, feeUsd > 0 && feeUsd < .01 ? 6 : 4)} USDC ≈ ${brl('USDC', feeUsd)}`;
  let from = ''; let to = '';
  if (n > 0) {
    if (k === 'receive') { from = fmt(n, a); to = fmt(n, a); }
    else if (k === 'swap') { from = fmt(n + (swapB ? 0 : feeUsd), a); to = swapB ? fmt(Math.max(0, n * bu - feeUsd), 'USDC') : fmt(n / bu, 'BETTEX'); }
    else if (k === 'withdraw') { from = fmt(n + feeUsd, 'USDC'); to = `${num(n, 2)} USDC → ${dest.trim() || '…'}`; }
    else if (k === 'transfer') { from = fmt(n + feeUsd, 'USDC'); to = `${fmt(n, 'USDC')} → ${x('Carteira em dólares', 'Dollar wallet', 'Cartera en dólares')}`; }
    else { from = fmt(n, 'BETTEX'); to = `${num(n, 4)} BETTEX → ${dest.trim() || '…'}`; }
  }
  const amtLabel = `${k === 'swap' ? x('Quantidade a converter', 'Amount to convert', 'Cantidad a convertir') : x('Quantidade', 'Amount', 'Cantidad')} (${a})`;
  return <Sheet open={!!kind} onClose={onClose} title={title} desc={desc}>
    <form className="mt-4 grid gap-3" onSubmit={e => { e.preventDefault(); void submit(); }}>
      <p className="rounded-xl bg-[#F5F1E8] px-3 py-2 text-xs font-bold text-[#1B2A41]" data-testid="text-fixed-asset">{x('Ativo', 'Asset', 'Activo')}: {a}</p>
      <div className="rounded-xl border border-[#E4DCCB] p-3 text-xs" data-testid="transaction-fee">
        <p className="font-bold">{x('Taxa de serviço', 'Service fee', 'Tarifa de servicio')}: {num(feeUsd, 2)} USDC ≈ {brl('USDC', feeUsd)}</p>
        <p className="mt-1 text-[#5B6B85]">{k === 'receive' ? x('Depósitos de USDC e BETTEX não têm taxa de serviço. Eventual gás da rede é separado.', 'USDC and BETTEX deposits have no service fee. Any network gas is separate.', 'Los depósitos de USDC y BETTEX no tienen tarifa de servicio. El gas de red es separado.') : x('Taxa fixa por transação, não percentual. Eventual gás da rede é separado.', 'Fixed fee per transaction, not a percentage. Any network gas is separate.', 'Tarifa fija por transacción, no porcentual. El gas de red es separado.')}</p>
      </div>
      {k === 'receive' && kind && <DepositAddress key={`${d.profile.accountId}-${a}`} d={d} asset={a} />}
      {needDest && <div className="rounded-xl border border-[#E4DCCB] p-3 text-xs" data-testid="withdrawal-network">
        <p className="font-bold">{x('Rede de referência: Arbitrum One · 42161', 'Reference network: Arbitrum One · 42161', 'Red de referencia: Arbitrum One · 42161')}</p>
        <p className="mt-1 text-[#5B6B85]">{x('Rede de segunda camada do Ethereum. Use MetaMask, Rabby ou outra carteira EVM com Arbitrum One. Em uma corretora, confirme que o depósito aceita o ativo acima nessa rede. Não selecione Ethereum mainnet, BNB Chain ou Solana.', 'Ethereum layer-2 network. Use MetaMask, Rabby or another EVM wallet with Arbitrum One. For an exchange, confirm that deposits support the asset above on this network. Do not select Ethereum mainnet, BNB Chain or Solana.', 'Red de segunda capa de Ethereum. Usa MetaMask, Rabby u otra cartera EVM con Arbitrum One. En un exchange, confirma que el depósito admite el activo anterior en esta red. No selecciones Ethereum mainnet, BNB Chain ni Solana.')}</p>
      </div>}
      <label className="grid gap-1 text-sm font-semibold">{amtLabel}<input disabled={m.isPending} data-testid="input-amount" inputMode="decimal" className={inp} value={amt} onChange={e => { touch(); setAmt(e.target.value); }} placeholder="0,00" /></label>
      {k !== 'receive' && <p className="text-xs text-[#5B6B85]">{x('Máximo: ', 'Max: ', 'Máximo: ')}{num(Math.floor(Math.max(0, max) * 1e6) / 1e6, 6)} {a} ≈ {brl(a, Math.max(0, max))}</p>}
      {needDest && <div className="grid gap-2">
        <label className="grid gap-1 text-sm font-semibold">{x('Endereço da carteira na Arbitrum One', 'Wallet address on Arbitrum One', 'Dirección de cartera en Arbitrum One')}<input disabled={m.isPending} data-testid="input-destination" placeholder={x('0x…', '0x…', '0x…')} maxLength={42} autoComplete="off" spellCheck={false} aria-describedby="destination-help destination-risk" aria-invalid={dest.trim().length > 0 && !validDest} className={inp} value={dest} onChange={e => { touch(); setDest(e.target.value); }} /></label>
        <p id="destination-help" className="text-xs text-[#5B6B85]">{x('O endereço começa com 0x e tem mais 40 caracteres hexadecimais. O formato é igual ao do Ethereum, mas isso não confirma a rede: confira com a carteira ou corretora de destino.', 'The address starts with 0x followed by 40 hexadecimal characters. It uses the same format as Ethereum, but that does not confirm the network: check with the receiving wallet or exchange.', 'La dirección empieza con 0x seguido de 40 caracteres hexadecimales. Tiene el mismo formato que Ethereum, pero eso no confirma la red: verifica con la cartera o exchange de destino.')}</p>
        {dest.trim().length > 0 && !validDest && <p role="alert" className="text-xs font-semibold text-[#B4421A]">{x('Informe um endereço EVM válido. Não use chave Pix, e-mail, endereço Bitcoin ou Solana.', 'Enter a valid EVM address. Do not use a Pix key, email, Bitcoin or Solana address.', 'Introduce una dirección EVM válida. No uses una clave Pix, email ni dirección de Bitcoin o Solana.')}</p>}
        <p id="destination-risk" role="note" data-testid="warning-destination-network" className="rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-xs font-semibold leading-relaxed text-[#6B3A10]">{x('Atenção: enviar para endereço errado, rede diferente ou carteira que não aceite este ativo pode causar perda permanente dos fundos. Confira ativo, rede e endereço antes de confirmar.', 'Warning: sending to a wrong address, a different network or a wallet that does not support this asset can permanently lose your funds. Check the asset, network and address before confirming.', 'Atención: enviar a una dirección incorrecta, otra red o una cartera que no admita este activo puede causar la pérdida permanente de los fondos. Verifica activo, red y dirección antes de confirmar.')}</p>
      </div>}
      {n > 0 && <div className="rounded-xl bg-[#EFF6F2] p-3 text-sm" data-testid="text-preview">
        <p><span className="text-xs font-bold text-[#5B6B85]">{x('Você envia', 'You send', 'Envías')}: </span>{from}</p>
        <p className="mt-1"><span className="text-xs font-bold text-[#5B6B85]">{x('Você recebe', 'You receive', 'Recibes')}: </span>{to}</p>
        {feeUsd > 0 && <p className="mt-2 text-xs text-[#5B6B85]">{x('Taxa', 'Fee', 'Tarifa')}: {feeLine}{k === 'send' && <> · {x('Débito em dólares', 'Dollar wallet debit', 'Débito en dólares')}: {fmt(feeUsd, 'USDC')}</>}</p>}</div>}
      {k === 'receive' && a === 'BETTEX' && <p className="text-xs text-[#5B6B85]">{x('Os tokens recebidos só entram na participação na confirmação.', 'Received tokens join staking only on confirmation.', 'Los tokens recibidos entran en participación solo en la confirmación.')}</p>}
      {outflow && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900" data-testid="text-outflow-warning">{x('Qualquer saída de BETTEX, mesmo parcial, zera o peso anterior e a elegibilidade ainda não paga.', 'Any BETTEX outflow, even partial, resets prior weight and unpaid eligibility.', 'Cualquier salida de BETTEX, aunque sea parcial, reinicia el peso anterior y la elegibilidad aún no pagada.')}</p>}
      {over && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{em('insufficient_balance')}</p>}
      {err && <p role="alert" className="flex items-start gap-2 text-sm font-semibold text-[#B4421A]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{err}</p>}
      {ok && <p role="status" className="flex items-start gap-2 text-sm font-semibold text-[#0E7C6B]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{x('Recebido! A confirmação aparece em Saldo e histórico em alguns segundos.', 'Received! Confirmation shows under Balance and history in a few seconds.', '¡Recibido! La confirmación aparece en Saldo e historial en unos segundos.')}</p>}
      <button type="submit" data-testid="button-submit-movement" disabled={m.isPending || (!retryInput.current && (!valid || over))} className={primary}>{m.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{m.isPending ? x('Enviando…', 'Sending…', 'Enviando…') : err && rid.current ? x('Tentar de novo', 'Try again', 'Reintentar') : title}</button>
    </form></Sheet>;
}

