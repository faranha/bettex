/** @jsxImportSource react */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetNativeTestJourneyQueryKey, useGetNativeTestJourney, type NativeTestJourney, type NativeTestOperation, type NativeTestStage, type TestAccountSnapshot } from '@workspace/api-client-react';
import { formatUnits, keccak256, toUtf8Bytes } from 'ethers';
import QRCode from 'qrcode';
import { Copy, AlertTriangle } from 'lucide-react';
import { inp } from '@/components/demo/fin';
import { useX } from '@/components/demo/ui';
import { requestNativeFunding, requestNativeQuote, signNativeJourney, requestNativeDistribution } from '../native-journey-client';
import { findPurchaseInProgress, purchaseNeedsQuote } from '../native-journey-status';
import { NativeDistribution } from './NativeDistribution';
import { NativeWithdrawal } from './NativeWithdrawal';

const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
const btn2 = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0E7C6B] bg-white px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
const card = 'rounded-2xl border border-[#E4DCCB] bg-white p-4';
const BETTEX_DECIMALS = 18;
const UNCERTAIN = ['uncertain', 'sending', 'reconciliation_required'];
const DEAD = ['failed', 'rejected', 'expired', 'cancelled'];
const ERR_CODES = ['reserve_insufficient', 'reserve_unavailable', 'wrong_network', 'invalid_quantity', 'sale_paused', 'inventory_insufficient', 'usdc_insufficient', 'previous_purchase_pending', 'transaction_mismatch', 'wallet_unlock_failed', 'service_unavailable', 'gas_insufficient'] as const;

const usdc = (v: string | undefined | null) => { try { return formatUnits(BigInt(v ?? '0'), 6); } catch { return '—'; } };
const tok = (v: string | undefined | null) => { try { return formatUnits(BigInt(v ?? '0'), BETTEX_DECIMALS); } catch { return '—'; } };
const eth = (v: string | undefined | null) => { try { return formatUnits(BigInt(v ?? '0'), 18); } catch { return '—'; } };
const when = (t: number | string | null | undefined) => {
  if (t === null || t === undefined) return '—';
  const n = typeof t === 'number' ? (t < 1e12 ? t * 1000 : t) : Date.parse(t);
  return Number.isFinite(n) ? new Date(n).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' (BRT)' : '—';
};
const newId = () => keccak256(toUtf8Bytes(crypto.randomUUID()));

function errCode(e: unknown): string | null {
  const o = e as { code?: unknown; data?: { code?: unknown; error?: unknown }; message?: unknown } | null;
  const c = [o?.code, o?.data?.code, o?.data?.error, o?.message].find(v => typeof v === 'string' && (ERR_CODES as readonly string[]).includes(v));
  return (c as string) ?? null;
}
function useErrText() {
  const { x } = useX();
  const m: Record<string, string> = {
    reserve_insufficient: x('Reserva da tesouraria insuficiente para esta quantidade.', 'Treasury reserve is insufficient for this quantity.', 'La reserva de tesorería es insuficiente para esta cantidad.'),
    reserve_unavailable: x('Reserva indisponível no momento.', 'Reserve currently unavailable.', 'Reserva no disponible por ahora.'),
    wrong_network: x('Rede incorreta. Use somente a cadeia local 31337.', 'Wrong network. Use only local chain 31337.', 'Red incorrecta. Usa solo la cadena local 31337.'),
    invalid_quantity: x('Quantidade inválida. Informe um número inteiro.', 'Invalid quantity. Enter a whole number.', 'Cantidad inválida. Ingresa un número entero.'),
    sale_paused: x('A venda está pausada.', 'The sale is paused.', 'La venta está pausada.'),
    inventory_insufficient: x('Estoque de BETTEX insuficiente.', 'Insufficient BETTEX inventory.', 'Inventario de BETTEX insuficiente.'),
    usdc_insufficient: x('USDC TESTE insuficiente na carteira de depósitos.', 'Insufficient USDC TESTE in the deposits wallet.', 'USDC TESTE insuficiente en la cartera de depósitos.'),
    previous_purchase_pending: x('Há uma compra anterior pendente. Conclua ou aguarde a reconciliação.', 'A previous purchase is pending. Finish it or wait for reconciliation.', 'Hay una compra anterior pendiente. Termínala o espera la conciliación.'),
    transaction_mismatch: x('A transação não confere com a cotação. Nada foi enviado.', 'The transaction does not match the quote. Nothing was sent.', 'La transacción no coincide con la cotización. No se envió nada.'),
    wallet_unlock_failed: x('Não foi possível desbloquear a carteira. Confira a senha.', 'Could not unlock the wallet. Check your password.', 'No se pudo desbloquear la cartera. Revisa la contraseña.'),
    service_unavailable: x('Serviço indisponível. Verifique o estado da operação antes de repetir.', 'Service unavailable. Check the operation status before retrying.', 'Servicio no disponible. Revisa el estado de la operación antes de repetir.'),
    gas_insufficient: x('Gás insuficiente na carteira de origem.', 'Insufficient gas in the source wallet.', 'Gas insuficiente en la cartera de origen.'),
  };
  const generic = x('Rede indisponível. O resultado é desconhecido — confira o histórico e o estado antes de tentar de novo; nada foi confirmado.', 'Network unavailable. The result is unknown — check history and status before retrying; nothing was confirmed.', 'Red no disponible. El resultado es desconocido: revisa el historial y el estado antes de reintentar; nada fue confirmado.');
  return (e: unknown) => { const c = errCode(e); return c ? m[c] : generic; };
}

function Row({ k, v, mono }: { k: string; v: ReactNode; mono?: boolean }) {
  return <div className="contents"><dt className="text-[#5B6B85]">{k}</dt><dd className={`min-w-0 break-all ${mono ? 'mono' : ''}`}>{v}</dd></div>;
}
function Unavailable() { const { x } = useX(); return <span className="font-semibold text-[#8A6A2F]">{x('indisponível', 'unavailable', 'no disponible')}</span>; }

export function NativeJourney({ snap }: { snap: TestAccountSnapshot }) {
  const { x } = useX();
  const key = [...getGetNativeTestJourneyQueryKey(), snap.account?.id] as const;
  const q = useGetNativeTestJourney({ query: { staleTime: 0, retry: false, refetchInterval: 8000, queryKey: key }, request: { credentials: 'same-origin' } });
  const qc = useQueryClient();
  const apply = useCallback((j: NativeTestJourney) => {
    qc.setQueryData([...getGetNativeTestJourneyQueryKey(), snap.account?.id], j);
    void qc.invalidateQueries({ queryKey: ['test-account-session'] });
  }, [qc, snap.account?.id]);
  const j = q.data as NativeTestJourney | undefined;
  let body: ReactNode;
  if (q.isLoading) body = <div aria-busy="true" className="grid gap-3">{[0, 1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F0E9DA]" />)}</div>;
  else if (q.isError || !j) body = <div role="alert" className={card}><p className="text-sm font-semibold text-[#B4421A]">{x('Não foi possível carregar a jornada on-chain local. Nenhum saldo é inferido.', 'Could not load the local on-chain journey. No balance is inferred.', 'No se pudo cargar el recorrido on-chain local. No se infiere ningún saldo.')}</p>
    <button type="button" className={`${btn} mt-3`} onClick={() => void q.refetch()}>{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>;
  else body = <>
    <Network j={j} />
    <Deposit j={j} snap={snap} onJourney={apply} />
    <Purchase j={j} snap={snap} onJourney={apply} />
    <Participation j={j} />
    <NativeDistribution j={j} snap={snap} onJourney={apply} />
    <NativeWithdrawal j={j} snap={snap} onJourney={apply} />
    <Treasury j={j} />
    <Events j={j} />
  </>;
  return <section className="grid gap-4" data-testid="native-journey">
    <div role="note" className="flex gap-3 rounded-2xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-xs leading-relaxed text-[#6B3A10]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="grid gap-1"><p className="font-bold">{x('Ambiente de testes — ativos sem valor financeiro.', 'Test environment — assets have no financial value.', 'Entorno de pruebas — activos sin valor financiero.')}</p>
        <p>{x('EVM LOCAL 31337, não é a Sepolia pública. Reiniciar o nó cria outra cadeia; registros anteriores ficam arquivados, mas não restauram saldos.', 'LOCAL EVM 31337, not public Sepolia. Restarting the node creates another chain; previous records are archived but do not restore balances.', 'EVM LOCAL 31337, no es la Sepolia pública. Reiniciar el nodo crea otra cadena; los registros anteriores se archivan, pero no restauran saldos.')}</p></div>
    </div>
    {body}
  </section>;
}

function Network({ j }: { j: NativeTestJourney }) {
  const { x } = useX();
  return <div className={card} data-testid="native-network">
    <h2 className="display text-lg font-extrabold">{x('Saldos on-chain reais (teste)', 'Real on-chain balances (test)', 'Saldos on-chain reales (prueba)')}</h2>
    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
      <Row k={x('Rede', 'Network', 'Red')} v={`EVM LOCAL (chainId ${j.chainId})`} />
      <Row k={x('Execução da cadeia', 'Chain instance', 'Instancia de cadena')} v={j.epoch} mono />
      <Row k={x('USDC de teste', 'Test USDC', 'USDC de prueba')} v={usdc(j.balances.usdc)} />
      <Row k="BETTEX" v={tok(j.balances.bettex)} />
      <Row k={x('Gás (depósitos)', 'Gas (deposits)', 'Gas (depósitos)')} v={eth(j.balances.depositGas)} />
      <Row k={x('Gás (BETTEX)', 'Gas (BETTEX)', 'Gas (BETTEX)')} v={eth(j.balances.bettexGas)} />
      <Row k={x('Bloco', 'Block', 'Bloque')} v={`${j.blockNumber} · ${j.blockHash}`} mono />
      <Row k={x('Atualizado', 'Updated', 'Actualizado')} v={when(j.updatedAt)} />
    </dl>
    <p className="mt-2 text-xs text-[#5B6B85]">{x('Sem explorador público para a cadeia local. Valores vêm do snapshot da cadeia.', 'No public explorer for the local chain. Values come from the chain snapshot.', 'Sin explorador público para la cadena local. Los valores vienen del snapshot de la cadena.')}</p>
  </div>;
}

function Deposit({ j, snap, onJourney }: { j: NativeTestJourney; snap: TestAccountSnapshot; onJourney: (j: NativeTestJourney) => void }) {
  const { x } = useX();
  const errText = useErrText();
  const [qr, setQr] = useState(''); const [copied, setCopied] = useState(false);
  const [ack, setAck] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const lock = useRef(false);
  useEffect(() => { let live = true; QRCode.toDataURL(j.depositWallet, { margin: 1, width: 176 }).then(u => { if (live) setQr(u); }).catch(() => { if (live) setQr(''); }); return () => { live = false; }; }, [j.depositWallet]);
  const fund = async () => {
    if (lock.current || !ack) return;
    lock.current = true; setBusy(true); setErr('');
    try { onJourney(await requestNativeFunding(snap)); setAck(false); } catch (e) { setErr(errText(e)); } finally { lock.current = false; setBusy(false); }
  };
  const pending = j.operations.some(o => o.kind === 'fund' && o.stages.some(s => !DEAD.includes(s.state) && s.state !== 'confirmed'));
  return <div className={`${card} grid gap-4`} data-testid="native-deposit">
    <h2 className="display text-lg font-extrabold">{x('Depositar USDC TESTE', 'Deposit USDC TESTE', 'Depositar USDC TESTE')}</h2>
    <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
      {qr ? <img src={qr} width={160} height={160} alt={x('QR do endereço de depósito', 'Deposit address QR code', 'QR de la dirección de depósito')} className="rounded-lg border border-[#E4DCCB]" /> : <div className="h-40 w-40 animate-pulse rounded-lg bg-[#F0E9DA]" />}
      <div className="grid min-w-0 gap-2">
        <p className="text-xs font-bold text-[#5B6B85]">{x('Endereço de depósito (cadeia local 31337)', 'Deposit address (local chain 31337)', 'Dirección de depósito (cadena local 31337)')}</p>
        <p className="mono break-all rounded-lg bg-[#F7F2E6] p-2 text-xs" data-testid="text-native-deposit">{j.depositWallet}</p>
        <button type="button" className={`${btn2} w-fit`} onClick={() => { void navigator.clipboard.writeText(j.depositWallet).then(() => setCopied(true)).catch(() => setCopied(false)); }}><Copy className="h-4 w-4" aria-hidden="true" />{copied ? x('Copiado', 'Copied', 'Copiado') : x('Copiar', 'Copy', 'Copiar')}</button>
        <p className="text-xs text-[#5B6B85]">{x('Contrato USDC TESTE aceito:', 'Accepted USDC TESTE contract:', 'Contrato USDC TESTE aceptado:')}</p>
        <p className="mono break-all text-xs" data-testid="text-native-usdc">{j.sale.usdc}</p>
      </div>
    </div>
    <div className="grid gap-2 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3">
      <p className="text-sm font-bold">{x('Receber saldo de teste', 'Receive test balance', 'Recibir saldo de prueba')}</p>
      <label className="flex items-start gap-3 text-xs leading-relaxed"><input data-testid="check-native-local" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0E7C6B]" checked={ack} onChange={e => setAck(e.target.checked)} />
        <span>{x('Entendo que esta é uma EVM LOCAL, não a Sepolia pública, e que reiniciar o nó reinicia a blockchain e apaga saldos e histórico.', 'I understand this is a LOCAL EVM, not public Sepolia, and that restarting the node resets the blockchain and erases balances and history.', 'Entiendo que es una EVM LOCAL, no la Sepolia pública, y que reiniciar el nodo reinicia la blockchain y borra saldos e historial.')}</span></label>
      {err && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{err}</p>}
      {pending && <p role="status" className="text-xs font-semibold text-[#8A6A2F]">{x('Financiamento em andamento. Aguarde a confirmação.', 'Funding in progress. Wait for confirmation.', 'Fondeo en curso. Espera la confirmación.')}</p>}
      <button type="button" data-testid="button-native-fund" className={`${btn} w-fit`} disabled={!ack || busy || pending} onClick={() => void fund()}>{busy ? x('Aguarde…', 'Please wait…', 'Espera…') : x('Receber saldo de teste', 'Receive test balance', 'Recibir saldo de prueba')}</button>
      <p className="text-xs text-[#5B6B85]">{x('O saldo só muda após confirmação on-chain, vista no snapshot.', 'The balance only changes after on-chain confirmation, shown in the snapshot.', 'El saldo solo cambia tras la confirmación on-chain, visible en el snapshot.')}</p>
    </div>
  </div>;
}

function activeOp(j: NativeTestJourney): NativeTestOperation | undefined {
  return findPurchaseInProgress(j.operations);
}

function Purchase({ j, snap, onJourney }: { j: NativeTestJourney; snap: TestAccountSnapshot; onJourney: (j: NativeTestJourney) => void }) {
  const { x } = useX();
  const errText = useErrText();
  const op = activeOp(j);
  const [qty, setQty] = useState('1');
  const [pw, setPw] = useState(''); const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const lock = useRef(false);
  const pendingId = useRef<string | null>(null);
  const refreshed = useRef<string | null>(null);
  const clear = useCallback(() => { setPw(''); }, []);
  useEffect(() => {
    const v = () => { if (document.visibilityState === 'hidden') clear(); };
    document.addEventListener('visibilitychange', v); window.addEventListener('bettex-wallet-lock', clear); window.addEventListener('pagehide', clear);
    return () => { document.removeEventListener('visibilitychange', v); window.removeEventListener('bettex-wallet-lock', clear); window.removeEventListener('pagehide', clear); };
  }, [clear]);

  const run = useCallback(async (f: () => Promise<NativeTestJourney>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setErr('');
    try { onJourney(await f()); } catch (e) { setErr(errText(e)); } finally { lock.current = false; setBusy(false); setPw(''); setAck(false); }
  }, [onJourney, errText]);

  const qtyOk = /^[1-9][0-9]{0,8}$/.test(qty);
  const quote = () => { if (!qtyOk || op) return; const id = pendingId.current ?? (pendingId.current = newId()); void run(async () => { const r = await requestNativeQuote(snap, id, qty); pendingId.current = null; return r; }); };

  const stages = op?.stages ?? [];
  const approve = stages.find(s => s.name === 'approve');
  const buy = stages.find(s => s.name === 'buy');
  const next: NativeTestStage | undefined = stages.find(s => s.state !== 'confirmed' && !DEAD.includes(s.state));
  const uncertain = stages.some(s => UNCERTAIN.includes(s.state));
  const needsRefresh = purchaseNeedsQuote(op) && !uncertain;
  const opId = op?.id; const opQty = op?.quantity;
  useEffect(() => {
    if (needsRefresh && opId && opQty && refreshed.current !== opId) { refreshed.current = opId; void run(() => requestNativeQuote(snap, opId, opQty)); }
  }, [needsRefresh, opId, opQty, snap, run]);

  const total = op ? (() => { try { return (BigInt(op.principal) + BigInt(op.fee)).toString(); } catch { return ''; } })() : '';
  const draft = next?.draft;
  const gas = draft ? (() => { try { return (BigInt(draft.gasLimit) * BigInt(draft.gasPrice)).toString(); } catch { return ''; } })() : '';
  const stageLabel = (n: string) => n === 'approve' ? x('Aprovação exata de USDC', 'Exact USDC approval', 'Aprobación exacta de USDC') : n === 'buy' ? x('Compra final de BETTEX', 'Final BETTEX purchase', 'Compra final de BETTEX') : n;
  const stateLabel = (s: string) => ({
    requested: x('solicitado', 'requested', 'solicitado'), sent: x('enviado', 'sent', 'enviado'),
    failed: x('falhou', 'failed', 'falló'),
    confirmed: x('confirmado', 'confirmed', 'confirmado'), sending: x('enviando', 'sending', 'enviando'),
    uncertain: x('incerto', 'uncertain', 'incierto'), reconciliation_required: x('reconciliação necessária', 'reconciliation required', 'conciliación necesaria'),
  } as Record<string, string>)[s] ?? s;
  const canSign = !!next && !!draft && !UNCERTAIN.includes(next.state) && next.state !== 'confirmed';
  const sign = (e: React.FormEvent) => { e.preventDefault(); if (!canSign || !next || !op || !pw || !ack || lock.current) return; const p = pw; setPw(''); void run(() => signNativeJourney(snap, p, op.id, next.name, next.state)); };

  return <div className={`${card} grid gap-3`} data-testid="native-purchase">
    <h2 className="display text-lg font-extrabold">{x('Comprar BETTEX', 'Buy BETTEX', 'Comprar BETTEX')}</h2>
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
      <Row k={x('Preço por BETTEX (USDC)', 'Price per BETTEX (USDC)', 'Precio por BETTEX (USDC)')} v={usdc(j.sale.price)} />
      <Row k={x('Taxa (USDC)', 'Fee (USDC)', 'Tarifa (USDC)')} v={usdc(j.sale.fee)} />
      <Row k={x('Disponível', 'Available', 'Disponible')} v={tok(j.sale.available)} />
      <Row k={x('Venda', 'Sale', 'Venta')} v={j.sale.paused ? x('pausada', 'paused', 'pausada') : x('ativa', 'active', 'activa')} />
    </dl>
    {!op && <div className="grid gap-2">
      <label className="grid gap-1 text-sm font-semibold">{x('Quantidade inteira de BETTEX', 'Whole BETTEX quantity', 'Cantidad entera de BETTEX')}
        <input data-testid="input-native-qty" className={inp} inputMode="numeric" maxLength={9} value={qty} onChange={e => setQty(e.target.value.replace(/\D/g, ''))} /></label>
      <button type="button" data-testid="button-native-quote" className={`${btn} w-fit`} disabled={!qtyOk || busy || j.sale.paused} onClick={quote}>{busy ? x('Aguarde…', 'Please wait…', 'Espera…') : x('Cotar compra', 'Get quote', 'Cotizar compra')}</button>
    </div>}
    {op && <div className="grid gap-3 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3" data-testid="native-active-op">
      <p className="text-xs"><span className="font-bold">{x('Operação em andamento', 'Operation in progress', 'Operación en curso')}</span> <span className="mono break-all">{op.id}</span></p>
      <ol className="grid gap-1 text-xs">{stages.map(s => <li key={s.name} className="flex flex-wrap justify-between gap-2"><span>{stageLabel(s.name)}</span><span className={`font-bold ${UNCERTAIN.includes(s.state) ? 'text-[#B4421A]' : ''}`}>{stateLabel(s.state)}</span></li>)}</ol>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
        <Row k={x('Quantidade', 'Quantity', 'Cantidad')} v={op.quantity} />
        <Row k={x('Principal (USDC)', 'Principal (USDC)', 'Principal (USDC)')} v={usdc(op.principal)} />
        <Row k={x('Taxa (USDC)', 'Fee (USDC)', 'Tarifa (USDC)')} v={usdc(op.fee)} />
        <Row k={x('Carteira pagadora USDC', 'Paying USDC wallet', 'Cartera pagadora USDC')} v={j.depositWallet} mono />
        <Row k={x('Carteira destinatária BETTEX', 'Recipient BETTEX wallet', 'Cartera destinataria BETTEX')} v={j.bettexWallet} mono />
        <Row k={x('Tesouraria recebe o principal', 'Treasury receives principal', 'Tesorería recibe el principal')} v={j.treasury.address} mono />
        <Row k={x('Total em USDC', 'USDC total', 'Total en USDC')} v={<strong>{usdc(total)}</strong>} />
        <Row k={x('Gás estimado (rascunho atual, separado do USDC)', 'Estimated gas (current draft, separate from USDC)', 'Gas estimado (borrador actual, separado del USDC)')} v={gas ? `${eth(gas)} (gasLimit ${draft?.gasLimit} × gasPrice ${draft?.gasPrice} wei)` : <Unavailable />} />
      </dl>
      {uncertain && <p role="alert" className="text-xs font-semibold text-[#B4421A]">{x('Estado incerto ou em envio: não é possível assinar novamente. Aguarde a reconciliação; o painel atualiza sozinho.', 'Uncertain or sending: signing again is not possible. Wait for reconciliation; this panel refreshes by itself.', 'Estado incierto o en envío: no se puede firmar de nuevo. Espera la conciliación; este panel se actualiza solo.')}</p>}
      {needsRefresh && <div className="grid gap-2"><p className="text-xs">{x('Aprovação confirmada. Atualizando a cotação da compra final na mesma operação.', 'Approval confirmed. Refreshing the final purchase quote on the same operation.', 'Aprobación confirmada. Actualizando la cotización de la compra final en la misma operación.')}</p>
        <button type="button" className={`${btn2} w-fit`} disabled={busy} onClick={() => void run(() => requestNativeQuote(snap, op.id, op.quantity))}>{x('Atualizar cotação', 'Refresh quote', 'Actualizar cotización')}</button></div>}
      {canSign && next && <form className="grid gap-2" onSubmit={sign} data-testid="form-native-sign">
        <p className="text-sm font-bold">{next.name === 'approve' ? x('Confirmar aprovação exata de', 'Confirm exact approval of', 'Confirmar aprobación exacta de') + ` ${usdc(total)} USDC` : x('Confirmar compra final de', 'Confirm final purchase of', 'Confirmar compra final de') + ` ${op.quantity} BETTEX`}</p>
        <p className="text-xs text-[#5B6B85]">{next.name === 'approve' ? x('A aprovação não compra BETTEX; a compra final exige outra confirmação.', 'The approval does not buy BETTEX; the final purchase needs a separate confirmation.', 'La aprobación no compra BETTEX; la compra final requiere otra confirmación.') : x('Esta confirmação envia a compra final.', 'This confirmation sends the final purchase.', 'Esta confirmación envía la compra final.')}</p>
        <label className="grid gap-1 text-sm font-semibold">{x('Senha', 'Password', 'Contraseña')}<input data-testid="input-native-password" className={inp} type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></label>
        <label className="flex items-start gap-3 text-xs"><input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0E7C6B]" checked={ack} onChange={e => setAck(e.target.checked)} /><span>{x('Revisei principal, taxa, destinatário, total em USDC e gás.', 'I reviewed principal, fee, recipient, USDC total and gas.', 'Revisé principal, tarifa, destinatario, total en USDC y gas.')}</span></label>
        <button type="submit" data-testid="button-native-sign" className={`${btn} w-fit`} disabled={!pw || !ack || busy}>{busy ? x('Aguarde…', 'Please wait…', 'Espera…') : next.name === 'approve' ? x('Assinar aprovação', 'Sign approval', 'Firmar aprobación') : x('Assinar compra final', 'Sign final purchase', 'Firmar compra final')}</button>
      </form>}
    </div>}
    {err && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{err}</p>}
  </div>;
}

function Participation({ j }: { j: NativeTestJourney }) {
  const { x } = useX();
  const p = j.participation;
  return <div className={card} data-testid="native-participation">
    <h2 className="display text-lg font-extrabold">{x('Participação', 'Participation', 'Participación')}</h2>
    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
      <Row k={x('Saldo real de BETTEX', 'Actual BETTEX balance', 'Saldo real de BETTEX')} v={tok(p.balance)} />
      <Row k={x('Participação automática (BETTEX)', 'Automatic participation (BETTEX)', 'Participación automática (BETTEX)')} v={tok(p.balance)} />
      <Row k={x('Quantidade elegível', 'Eligible quantity', 'Cantidad elegible')} v={tok(p.eligible)} />
      <Row k={x('Início', 'Started at', 'Inicio')} v={when(p.startedAt)} />
      <Row k={x('BETTEX × segundos (rodada atual)', 'BETTEX × seconds (current round)', 'BETTEX × segundos (ronda actual)')} v={tok(p.tokenSeconds)} />
      <Row k={x('Rodada', 'Round', 'Ronda')} v={`${when(p.roundStart)} → ${when(p.roundEnd)}`} />
      <Row k={x('USDC de teste apurado', 'Assessed test USDC', 'USDC de prueba calculado')} v={usdc(p.assessedUsdc)} />
      <Row k={x('Saldo USDC disponível', 'Available USDC balance', 'Saldo USDC disponible')} v={usdc(p.availableUsdc)} />
      <Row k={x('USDC de teste recebido', 'Test USDC received', 'USDC de prueba recibido')} v={usdc(p.paidUsdc)} />
    </dl>
    <p className="mt-2 text-xs text-[#5B6B85]">{x('Participação por saldo e tempo confirmado: BETTEX permanece na sua carteira.', 'Participation by balance and confirmed time: BETTEX remains in your wallet.', 'Participación por saldo y tiempo confirmado: BETTEX permanece en tu cartera.')}</p>
  </div>;
}

function Treasury({ j }: { j: NativeTestJourney }) {
  const { x } = useX();
  const t = j.treasury;
  return <div className={card} data-testid="native-treasury">
    <h2 className="display text-lg font-extrabold">{x('Tesouraria', 'Treasury', 'Tesorería')}</h2>
    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
      <Row k={x('USDC on-chain atual', 'Actual on-chain USDC', 'USDC on-chain actual')} v={usdc(t.balanceUsdc)} />
      <Row k={x('Principal de vendas confirmadas (USDC)', 'Confirmed sale principal (USDC)', 'Principal de ventas confirmadas (USDC)')} v={usdc(t.principalUsdc)} />
      <Row k={x('BETTEX vendido', 'BETTEX sold', 'BETTEX vendido')} v={tok(t.soldBettex)} />
      <Row k={x('Resultado sintético da rodada (USDC teste)', 'Synthetic round result (test USDC)', 'Resultado sintético de la ronda (USDC prueba)')} v={usdc(j.settlement.resultUnits)} />
      <Row k={x('Retido na rodada', 'Retained in round', 'Retenido en la ronda')} v={usdc(j.settlement.retainedUnits)} />
      <Row k={x('Distribuição pendente', 'Pending distribution', 'Distribución pendiente')} v={usdc(j.settlement.pendingUnits)} />
      <Row k={x('Distribuição confirmada', 'Confirmed distribution', 'Distribución confirmada')} v={usdc(j.settlement.paidUnits)} />
      <Row k={x('Destinação para recompra', 'Buyback allocation', 'Asignación para recompra')} v={usdc(j.settlement.buybackUnits)} />
      <Row k={x('Carteira de recompra de teste', 'Test buyback wallet', 'Cartera de recompra de prueba')} v={j.settlement.buybackAddress} mono />
      <Row k={x('Endereço da tesouraria', 'Treasury address', 'Dirección de tesorería')} v={t.address} mono />
    </dl>
    <p className="mt-2 text-xs text-[#5B6B85]">{x('Taxas ficam fora do principal e do total vendido.', 'Fees are excluded from principal and sold totals.', 'Las tarifas quedan fuera del principal y de los totales vendidos.')}</p>
  </div>;
}

function Events({ j }: { j: NativeTestJourney }) {
  const { x } = useX();
  const kind = (k: string) => k === 'free_test_funding' ? x('Financiamento de teste gratuito', 'Free test funding', 'Fondeo de prueba gratuito') : k === 'external_deposit' ? x('Depósito externo', 'External deposit', 'Depósito externo') : x('Compra de BETTEX', 'BETTEX purchase', 'Compra de BETTEX');
  return <div className={card} data-testid="native-history">
    <h2 className="display text-lg font-extrabold">{x('Operações e histórico', 'Operations and history', 'Operaciones e historial')}</h2>
    {j.events.length === 0 ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Nenhum evento on-chain nesta época ainda.', 'No on-chain events in this epoch yet.', 'Aún no hay eventos on-chain en esta época.')}</p>
      : <ul className="mt-2 grid gap-3">{[...j.events].sort((a, b) => b.timestamp - a.timestamp).map(e => <li key={e.id} className="rounded-xl bg-[#FBF8F0] p-3">
        <p className="text-sm font-bold">{kind(e.kind)}</p>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
          <Row k={x('Data', 'Date', 'Fecha')} v={when(e.timestamp)} />
          {e.kind !== 'purchase' && <Row k="USDC" v={usdc(e.value)} />}
          {e.kind === 'purchase' && <>
            <Row k="BETTEX" v={tok(e.bettex)} />
            <Row k={x('Principal (USDC)', 'Principal (USDC)', 'Principal (USDC)')} v={usdc(e.principal)} />
            <Row k={x('Taxa (USDC)', 'Fee (USDC)', 'Tarifa (USDC)')} v={usdc(e.fee)} />
            <Row k={x('Recebido pela tesouraria (USDC)', 'Treasury received (USDC)', 'Recibido por tesorería (USDC)')} v={usdc(e.treasuryReceived)} />
            <Row k={x('Gás real (ETH)', 'Actual gas (ETH)', 'Gas real (ETH)')} v={e.gasWei ? `${eth(e.gasWei)} (${e.gasWei} wei)` : <Unavailable />} />
          </>}
          <Row k="Hash" v={e.hash} mono />
          <Row k={x('Bloco', 'Block', 'Bloque')} v={`${e.blockNumber} · ${e.blockHash}`} mono />
          <Row k="Log index" v={e.logIndex} />
        </dl></li>)}</ul>}
    {j.archivedCount > 0 && <p className="mt-2 text-xs text-[#5B6B85]">{x('Registros arquivados de épocas anteriores:', 'Archived records from earlier epochs:', 'Registros archivados de épocas anteriores:')} {j.archivedCount}</p>}
  </div>;
}
