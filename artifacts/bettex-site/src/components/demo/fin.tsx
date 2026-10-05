/** @jsxImportSource react */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as D from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateDemoMovement, useUpdateDemoProfile, getGetDemoDashboardQueryKey, type DemoDashboard, type DemoMovementInput } from '@workspace/api-client-react';
import { CircleHelp, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useX } from './ui';

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
   return <span className="inline-flex min-w-0 flex-col leading-tight"><span className={`display font-extrabold ${big ? 'text-xl sm:text-2xl' : 'text-sm'}`}>{signed && v > 0 ? '+' : ''}{num(v, precision ?? (a === 'USDC' ? 2 : 4))} <span className="mono text-[0.65em] font-bold text-[#5B6B85]">{a}</span></span><span className={`${big ? 'text-sm' : 'text-xs'} text-[#5B6B85]`}>≈ {signed && v > 0 ? '+' : ''}{brl(a, v)}</span></span>;
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
export type Kind = 'receive' | 'onramp' | 'swap' | 'withdraw' | 'send';

export function MovementSheet({ kind, initialAsset, d, onClose }: { kind: Kind | null; initialAsset?: Asset; d: DemoDashboard; onClose: () => void }) {
  const { x, tx, loc } = useX(); const { num, brl } = useMoney(); const em = useErrMsg(); const qc = useQueryClient();
  const m = useCreateDemoMovement(); const { r } = useContext(Rates);
  const [method, setMethod] = useState<'pix' | 'crypto'>('pix'); const [amt, setAmt] = useState(''); const [dest, setDest] = useState('');
  const [err, setErr] = useState(''); const [ok, setOk] = useState(false); const rid = useRef<string | null>(null);
  const retryInput = useRef<DemoMovementInput | null>(null);
  useEffect(() => { setMethod('pix'); setAmt(''); setDest(''); setErr(''); setOk(false); rid.current = null; retryInput.current = null; }, [kind, initialAsset]);
  const touch = () => { rid.current = null; retryInput.current = null; setErr(''); setOk(false); };
  const k0: Kind = kind ?? 'receive';
  const a: Asset = k0 === 'onramp' || k0 === 'withdraw' ? 'USDC' : k0 === 'send' ? 'BETTEX' : (initialAsset ?? 'USDC');
  const pix = k0 === 'onramp' && method === 'pix';
  const k: Kind = k0 === 'onramp' && method === 'crypto' ? 'receive' : k0;
  const bu = d.balances.bettexUsdc; const U = d.balances.usdc; const B = d.balances.bettex;
  const n = Number(amt.replace(',', '.')) || 0;
  const usdIn = pix ? Math.round((n / r) * 1e6) / 1e6 : n; // BRL -> USD snapshot
  const amount = pix ? usdIn : n;
  const rd = (v: number) => Math.round(v * 1e6) / 1e6;
  const needDest = k === 'send' || k === 'withdraw';
  const swapB = k === 'swap' && a === 'BETTEX';
  const feeUsd = rd(k === 'onramp' || pix ? amount * .002 : k === 'swap' ? (swapB ? amount * bu : amount) * .001 : k === 'withdraw' ? amount * .0005 : k === 'send' ? amount * bu * .0005 : 0);
  const max = Math.min(100000, k === 'swap' ? (swapB ? B : U / 1.001) : k === 'withdraw' ? U / 1.0005 : k === 'send' ? Math.min(B, U / (bu * .0005)) : 100000);
  const over = k !== 'receive' && !pix && n > max + 1e-9;
  const valid = amount >= 0.000001 && amount <= 100000 && (!needDest || dest.trim().length > 0);
  const outflow = k === 'send' || swapB;
  const Tt: Record<string, [string, string, string]> = {
    'onramp': ['Adicionar crédito', 'Add credit', 'Agregar crédito'],
    'receive-USDC': ['Adicionar crédito', 'Add credit', 'Agregar crédito'],
    'receive-BETTEX': ['Adicionar BETTEX', 'Add BETTEX', 'Agregar BETTEX'],
    'swap-USDC': ['Converter USDC em BETTEX', 'Convert USDC to BETTEX', 'Convertir USDC en BETTEX'],
    'swap-BETTEX': ['Converter BETTEX em USDC', 'Convert BETTEX to USDC', 'Convertir BETTEX en USDC'],
    'withdraw': ['Sacar dólares para carteira cripto', 'Withdraw dollars to crypto wallet', 'Retirar dólares a cartera cripto'],
    'send': ['Transferir BETTEX para carteira externa', 'Transfer BETTEX to external wallet', 'Transferir BETTEX a cartera externa'],
  };
  const key = k0 === 'swap' || k0 === 'receive' ? `${k0}-${a}` : k0;
  const title = tx(Tt[key]);
  const desc = k0 === 'onramp' ? x('Pague em reais via Pix ou deposite USDC de uma carteira cripto.', 'Pay in reais via Pix or deposit USDC from a crypto wallet.', 'Paga en reales vía Pix o deposita USDC desde una cartera cripto.')
    : k0 === 'receive' ? x('Receba BETTEX de uma carteira externa. Entra na participação só após a confirmação.', 'Receive BETTEX from an external wallet. It joins staking only after confirmation.', 'Recibe BETTEX de una cartera externa. Entra en participación solo tras la confirmación.')
    : k0 === 'swap' ? x('A taxa é travada ao enviar e a conversão conclui em cerca de 6 segundos.', 'The rate locks on submit and the conversion settles in about 6 seconds.', 'La tasa se fija al enviar y la conversión concluye en unos 6 segundos.')
    : k0 === 'withdraw' ? x('Sai do seu saldo total em USDC para uma carteira cripto externa.', 'Comes from your full USDC balance to an external crypto wallet.', 'Sale de tu saldo total en USDC a una cartera cripto externa.')
    : x('Envia tokens BETTEX para uma carteira externa. A taxa é cobrada em USDC.', 'Sends BETTEX tokens to an external wallet. The fee is charged in USDC.', 'Envía tokens BETTEX a una cartera externa. La tarifa se cobra en USDC.');
  const submit = async () => {
    if (m.isPending || (!retryInput.current && (!valid || over))) return;
    if (!rid.current) rid.current = crypto.randomUUID();
    const data: DemoMovementInput = retryInput.current ?? { requestId: rid.current, kind: k, asset: a, amount, ...(needDest ? { destination: dest.trim() } : {}) };
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
    if (pix) { from = `${n.toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'BRL' })} (≈ ${num(usdIn, 2)} USD)`; to = fmt(Math.max(0, usdIn - feeUsd), 'USDC'); }
    else if (k === 'receive') { from = fmt(n, a); to = fmt(n, a); }
    else if (k === 'swap') { from = fmt(n + (swapB ? 0 : feeUsd), a); to = swapB ? fmt(Math.max(0, n * bu - feeUsd), 'USDC') : fmt(n / bu, 'BETTEX'); }
    else if (k === 'withdraw') { from = fmt(n + feeUsd, 'USDC'); to = `${num(n, 2)} USDC → ${dest.trim() || '…'}`; }
    else { from = fmt(n, 'BETTEX'); to = `${num(n, 4)} BETTEX → ${dest.trim() || '…'}`; }
  }
  const amtLabel = pix ? x('Valor em reais (R$)', 'Amount in reais (R$)', 'Monto en reales (R$)') : `${k === 'swap' ? x('Quantidade a converter', 'Amount to convert', 'Cantidad a convertir') : x('Quantidade', 'Amount', 'Cantidad')} (${a})`;
  const seg = (on: boolean) => `min-h-11 flex-1 rounded-lg text-sm font-bold ${on ? 'bg-[#0E7C6B] text-white' : 'bg-[#F0E9DA] text-[#1B2A41]'}`;
  return <Sheet open={!!kind} onClose={onClose} title={title} desc={desc}>
    <form className="mt-4 grid gap-3" onSubmit={e => { e.preventDefault(); void submit(); }}>
      {k0 === 'onramp' && <div role="group" aria-label={x('Forma de depósito', 'Deposit method', 'Forma de depósito')} className="flex gap-2"><button type="button" disabled={m.isPending} data-testid="button-method-pix" aria-pressed={method === 'pix'} onClick={() => { touch(); setAmt(''); setMethod('pix'); }} className={seg(method === 'pix')}>{x('Pix', 'Pix', 'Pix')}</button><button type="button" disabled={m.isPending} data-testid="button-method-crypto" aria-pressed={method === 'crypto'} onClick={() => { touch(); setAmt(''); setMethod('crypto'); }} className={seg(method === 'crypto')}>{x('Depósito cripto', 'Crypto deposit', 'Depósito cripto')}</button></div>}
      <p className="rounded-xl bg-[#F5F1E8] px-3 py-2 text-xs font-bold text-[#1B2A41]" data-testid="text-fixed-asset">{x('Ativo', 'Asset', 'Activo')}: {a}</p>
      <label className="grid gap-1 text-sm font-semibold">{amtLabel}<input disabled={m.isPending} data-testid="input-amount" inputMode="decimal" className={inp} value={amt} onChange={e => { touch(); setAmt(e.target.value); }} placeholder="0,00" /></label>
      {k !== 'receive' && !pix && <p className="text-xs text-[#5B6B85]">{x('Máximo: ', 'Max: ', 'Máximo: ')}{fmt(Math.max(0, max), a)}</p>}
      {pix && <p className="text-xs text-[#5B6B85]">{x('Cotação do momento: ', 'Current rate: ', 'Cotización actual: ')}{`${num(r, 2)} BRL / USD`}</p>}
      {needDest && <label className="grid gap-1 text-sm font-semibold">{x('Carteira de destino', 'Destination wallet', 'Cartera de destino')}<input disabled={m.isPending} data-testid="input-destination" maxLength={120} className={inp} value={dest} onChange={e => { touch(); setDest(e.target.value); }} /></label>}
      {n > 0 && <div className="rounded-xl bg-[#EFF6F2] p-3 text-sm" data-testid="text-preview">
        <p><span className="text-xs font-bold text-[#5B6B85]">{x('Você envia', 'You send', 'Envías')}: </span>{from}</p>
        <p className="mt-1"><span className="text-xs font-bold text-[#5B6B85]">{x('Você recebe', 'You receive', 'Recibes')}: </span>{to}</p>
        {feeUsd > 0 && <p className="mt-2 text-xs text-[#5B6B85]">{x('Taxa', 'Fee', 'Tarifa')}: {feeLine}</p>}</div>}
      {k === 'receive' && a === 'BETTEX' && <p className="text-xs text-[#5B6B85]">{x('Os tokens recebidos só entram na participação na confirmação.', 'Received tokens join staking only on confirmation.', 'Los tokens recibidos entran en participación solo en la confirmación.')}</p>}
      {outflow && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900" data-testid="text-outflow-warning">{x('Qualquer saída de BETTEX, mesmo parcial, zera o peso anterior e a elegibilidade ainda não paga.', 'Any BETTEX outflow, even partial, resets prior weight and unpaid eligibility.', 'Cualquier salida de BETTEX, aunque sea parcial, reinicia el peso anterior y la elegibilidad aún no pagada.')}</p>}
      {over && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{em('insufficient_balance')}</p>}
      {err && <p role="alert" className="flex items-start gap-2 text-sm font-semibold text-[#B4421A]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{err}</p>}
      {ok && <p role="status" className="flex items-start gap-2 text-sm font-semibold text-[#0E7C6B]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{x('Recebido! A confirmação aparece em Saldo e histórico em alguns segundos.', 'Received! Confirmation shows under Balance and history in a few seconds.', '¡Recibido! La confirmación aparece en Saldo e historial en unos segundos.')}</p>}
      <button type="submit" data-testid="button-submit-movement" disabled={m.isPending || (!retryInput.current && (!valid || over))} className={primary}>{m.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{m.isPending ? x('Enviando…', 'Sending…', 'Enviando…') : err && rid.current ? x('Tentar de novo', 'Try again', 'Reintentar') : title}</button>
      <p className="text-xs text-[#5B6B85]">{x('Demonstração: depósitos, saques e conversões são emulados. Nenhuma carteira ou pagamento real é acionado.', 'Demo: deposits, withdrawals and conversions are emulated. No real wallet or payment is used.', 'Demostración: depósitos, retiros y conversiones son emulados. No se utiliza ninguna cartera ni pago real.')}</p>
    </form></Sheet>;
}

export function ProfileSheet({ open, d, onClose }: { open: boolean; d: DemoDashboard; onClose: () => void }) {
  const { x, loc } = useX(); const qc = useQueryClient(); const u = useUpdateDemoProfile();
  const [name, setName] = useState(d.profile.name); const [err, setErr] = useState(false);
  useEffect(() => { if (open) { setName(d.profile.name); setErr(false); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = name.trim().length >= 2 && name.trim().length <= 60;
  const save = async () => { if (!ok || u.isPending) return; try { const s = await u.mutateAsync({ data: { name: name.trim() } }); qc.setQueryData(getGetDemoDashboardQueryKey(), s); onClose(); } catch { setErr(true); } };
  const since = useMemo(() => new Date(d.profile.memberSince).toLocaleDateString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { dateStyle: 'long' }), [d.profile.memberSince, loc]);
  return <Sheet open={open} onClose={onClose} title={x('Minha conta', 'My account', 'Mi cuenta')} desc={x('Altere como você aparece no painel.', 'Change how you appear on the dashboard.', 'Cambia cómo apareces en el panel.')}>
    <form className="mt-4 grid gap-3" onSubmit={e => { e.preventDefault(); void save(); }}>
      <label className="grid gap-1 text-sm font-semibold">{x('Nome', 'Name', 'Nombre')}<input data-testid="input-name" className={inp} minLength={2} maxLength={60} value={name} onChange={e => { setName(e.target.value); setErr(false); }} /></label>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm"><dt className="text-[#5B6B85]">{x('E-mail', 'Email', 'Correo electrónico')}</dt><dd className="break-all">{d.profile.email}</dd><dt className="text-[#5B6B85]">{x('Membro desde', 'Member since', 'Miembro desde')}</dt><dd>{since}</dd><dt className="text-[#5B6B85]">{x('ID da conta', 'Account ID', 'ID de cuenta')}</dt><dd className="mono break-all">{d.profile.accountId}</dd></dl>
      {err && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{x('Não foi possível salvar. Tente de novo.', 'Could not save. Try again.', 'No se pudo guardar. Intenta de nuevo.')}</p>}
      <button type="submit" data-testid="button-save-name" disabled={!ok || u.isPending} className={primary}>{u.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{x('Salvar', 'Save', 'Guardar')}</button>
    </form></Sheet>;
}
