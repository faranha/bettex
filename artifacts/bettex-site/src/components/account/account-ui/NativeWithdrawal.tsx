/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { formatUnits, isAddress, keccak256, parseUnits, toUtf8Bytes } from 'ethers';
import type { NativeTestJourney, TestAccountSnapshot } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { inp } from '@/components/demo/fin';
import { requestNativeWithdrawal, signNativeJourney } from '../native-journey-client';

const terminal = ['failed', 'cancelled', 'expired', 'rejected'];
const button = 'min-h-11 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white disabled:opacity-50';
export function NativeWithdrawal({ j, snap, onJourney }: {
  j: NativeTestJourney; snap: TestAccountSnapshot; onJourney: (j: NativeTestJourney) => void;
}) {
  const { x } = useX();
  const [asset, setAsset] = useState<'USDC' | 'BETTEX'>('USDC');
  const [amount, setAmount] = useState('1');
  const [destination, setDestination] = useState('');
  const [password, setPassword] = useState('');
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const newId = useRef<string | null>(null);
  const op = j.operations.find(o => o.kind === 'withdrawal'
    && !o.stages.some(s => s.name === 'withdraw' && s.state === 'confirmed')
    && !o.stages.some(s => terminal.includes(s.state)));
  const next = op?.stages.find(s => s.state === 'requested');
  const pending = op?.stages.some(s => ['sending', 'sent', 'uncertain', 'reconciliation_required'].includes(s.state));
  let units = '';
  try { if (/^\d+(?:\.\d+)?$/.test(amount)) units = String(parseUnits(amount, asset === 'USDC' ? 6 : 18)); } catch { /* Invalid input is disabled. */ }
  const valid = isAddress(destination) && destination.toLowerCase() !== '0x' + '0'.repeat(40)
    && !!units && BigInt(units) > 0n;
  useEffect(() => {
    const clear = () => { setPassword(''); setAck(false); };
    const hidden = () => { if (document.visibilityState === 'hidden') clear(); };
    document.addEventListener('visibilitychange', hidden); window.addEventListener('pagehide', clear);
    window.addEventListener('bettex-wallet-lock', clear);
    return () => { document.removeEventListener('visibilitychange', hidden); window.removeEventListener('pagehide', clear); window.removeEventListener('bettex-wallet-lock', clear); };
  }, []);
  const run = async (work: () => Promise<NativeTestJourney>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { onJourney(await work()); }
    catch (e) {
      const code = (e as { data?: { code?: string }; message?: string }).data?.code ?? (e as Error).message;
      const messages: Record<string, string> = {
        invalid_destination: x('Destino inválido ou pertencente ao protocolo.', 'Invalid or protocol-owned destination.', 'Destino inválido o del protocolo.'),
        usdc_insufficient: x('USDC insuficiente para valor e taxa.', 'Insufficient USDC for amount and fee.', 'USDC insuficiente para importe y tarifa.'),
        bettex_insufficient: x('BETTEX insuficiente.', 'Insufficient BETTEX.', 'BETTEX insuficiente.'),
        wallet_unlock_failed: x('Não foi possível desbloquear a carteira.', 'Could not unlock the wallet.', 'No se pudo desbloquear la cartera.'),
      };
      setError(messages[code] ?? x('Não foi possível concluir. Consulte o estado antes de tentar novamente.', 'Could not complete. Check the status before retrying.', 'No se pudo completar. Consulta el estado antes de reintentar.'));
    } finally { lock.current = false; setBusy(false); setPassword(''); setAck(false); }
  };
  const quote = () => {
    const id = newId.current ??= keccak256(toUtf8Bytes(crypto.randomUUID()));
    void run(() => requestNativeWithdrawal(snap, id, asset, destination, units));
  };
  const resume = () => { if (op?.intent) void run(() =>
    requestNativeWithdrawal(snap, op.id, op.intent!.asset, op.intent!.destination, op.intent!.units)); };
  const intent = op?.intent;
  useEffect(() => {
    if (j.operations.some(o => o.id === newId.current && o.stages.some(s => terminal.includes(s.state)
      || s.name === 'withdraw' && s.state === 'confirmed'))) newId.current = null;
  }, [j.operations]);
  return <div className="grid gap-3 rounded-2xl border border-[#E4DCCB] bg-white p-4" data-testid="native-withdrawal">
    <h2 className="display text-lg font-extrabold">{x('Sacar USDC ou enviar BETTEX', 'Withdraw USDC or send BETTEX', 'Retirar USDC o enviar BETTEX')}</h2>
    <p className="text-xs text-[#5B6B85]">{x('Rede: EVM local · 31337. USDC e BETTEX são tokens ERC-20; ETH é usado apenas para gás. Use um endereço EVM 0x com 40 caracteres hexadecimais e acesso à mesma cadeia local. Esta operação não envia para Arbitrum One nem Ethereum mainnet.', 'Network: local EVM · 31337. USDC and BETTEX are ERC-20 tokens; ETH is only used for gas. Use an EVM 0x address with 40 hexadecimal characters and access to the same local chain. This operation does not send to Arbitrum One or Ethereum mainnet.', 'Red: EVM local · 31337. USDC y BETTEX son tokens ERC-20; ETH solo se usa para gas. Usa una dirección EVM 0x con 40 caracteres hexadecimales y acceso a la misma cadena local. Esta operación no envía a Arbitrum One ni Ethereum mainnet.')}</p>
    <p role="note" className="rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-xs font-semibold text-[#6B3A10]">{x('Endereço, ativo ou rede incompatível pode causar perda permanente dos fundos. Confirme que você controla o destino e que ele aceita o ativo nesta cadeia.', 'An incompatible address, asset or network can permanently lose your funds. Confirm that you control the destination and it supports the asset on this chain.', 'Una dirección, activo o red incompatible puede causar la pérdida permanente de fondos. Confirma que controlas el destino y que admite el activo en esta cadena.')}</p>
    <p className="text-xs text-[#5B6B85]">{x('Entrega e taxa de 2,50 USDC são liquidadas juntas. Gás de cada aprovação e envio é separado. Sem conversão BETTEX → USDC.', 'Delivery and the 2.50 USDC fee settle together. Gas for each approval and submission is separate. No BETTEX → USDC conversion.', 'Entrega y tarifa de 2,50 USDC se liquidan juntas. El gas de cada aprobación y envío es separado. Sin conversión BETTEX → USDC.')}</p>
    {!op ? <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-xs font-bold">{x('Ativo', 'Asset', 'Activo')}<select data-testid="withdraw-asset" className={inp} value={asset} onChange={e => { setAsset(e.target.value as 'USDC' | 'BETTEX'); newId.current = null; }}><option>USDC</option><option>BETTEX</option></select></label>
      <label className="grid gap-1 text-xs font-bold">{x('Quantidade líquida enviada', 'Net amount delivered', 'Importe neto enviado')}<input data-testid="withdraw-amount" className={inp} value={amount} inputMode="decimal" onChange={e => { setAmount(e.target.value); newId.current = null; }} /></label>
      <label className="grid gap-1 text-xs font-bold sm:col-span-2">{x('Destino na cadeia local 31337', 'Destination on local chain 31337', 'Destino en cadena local 31337')}<input data-testid="withdraw-destination" className={inp} value={destination} placeholder="0x…" onChange={e => { setDestination(e.target.value); newId.current = null; }} /></label>
      <button data-testid="withdraw-quote" type="button" className={button} disabled={!valid || busy} onClick={quote}>{x('Preparar envio', 'Prepare transfer', 'Preparar envío')}</button>
    </div> : <>
      <p className="break-all text-sm">{intent && `${formatUnits(intent.units, intent.asset === 'USDC' ? 6 : 18)} ${intent.asset} → ${intent.destination}`}</p>
      <p className="text-xs">{x('Taxa de serviço', 'Service fee', 'Tarifa de servicio')}: {formatUnits(op.fee, 6)} USDC</p>
      {intent?.asset === 'USDC' && <p className="text-xs">{x('Débito total em USDC', 'Total USDC debit', 'Débito total en USDC')}: {formatUnits(BigInt(intent.units) + BigInt(op.fee), 6)}</p>}
      {intent?.asset === 'BETTEX' && <p className="text-xs">{x('Qualquer saída cancela direitos ainda não pagos e zera o peso anterior.', 'Any outflow cancels unpaid rights and resets previous weight.', 'Cualquier salida cancela derechos no pagados y reinicia el peso anterior.')}</p>}
      <ul className="grid gap-1 text-xs">{op.stages.map(s => <li key={s.name} className="break-all">
        {s.name === 'withdraw' ? x('Entrega e taxa', 'Delivery and fee', 'Entrega y tarifa') : s.name.includes('bettex') ? x('Aprovação exata de BETTEX', 'Exact BETTEX approval', 'Aprobación exacta de BETTEX') : x('Aprovação exata de USDC', 'Exact USDC approval', 'Aprobación exacta de USDC')}
        {' · '}{s.state === 'confirmed' ? x('confirmado', 'confirmed', 'confirmado') : s.state === 'requested' ? x('aguardando assinatura', 'awaiting signature', 'esperando firma') : x('aguardando conciliação', 'awaiting reconciliation', 'esperando conciliación')}
        {s.transactionHash && <span className="mono block">{s.transactionHash}</span>}
      </li>)}</ul>
      {next ? <>
        <label className="grid gap-1 text-xs font-bold">{x('Senha para assinatura local', 'Password for local signing', 'Contraseña para firma local')}<input data-testid="withdraw-password" className={inp} type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label className="flex gap-2 text-xs"><input data-testid="withdraw-confirm" type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} />{x('Conferi ativo, quantidade, destino e taxa.', 'I checked the asset, amount, destination and fee.', 'Verifiqué activo, importe, destino y tarifa.')}</label>
        {next.draft && <p className="text-xs">{x('Limite estimado de gás desta etapa (ETH)', 'Estimated gas limit cost for this step (ETH)', 'Coste límite estimado de gas de esta etapa (ETH)')}: {formatUnits(BigInt(next.draft.gasLimit) * BigInt(next.draft.gasPrice), 18)}</p>}
        <button data-testid="withdraw-sign" className={button} type="button" disabled={!ack || !password || busy || pending} onClick={() => void run(() => signNativeJourney(snap, password, op.id, next.name, next.state))}>{x('Assinar esta etapa', 'Sign this step', 'Firmar esta etapa')}</button>
      </> : <button data-testid="withdraw-resume" className={button} type="button" disabled={busy || pending} onClick={resume}>{pending ? x('Aguardando conciliação', 'Awaiting reconciliation', 'Esperando conciliación') : x('Preparar próxima etapa', 'Prepare next step', 'Preparar siguiente etapa')}</button>}
    </>}
    {error && <p role="alert" className="text-sm text-[#B4421A]">{error}</p>}
    {j.operations.filter(o => o.kind === 'withdrawal' && o.stages.some(s => s.name === 'withdraw' && s.state === 'confirmed')).map(o => <p key={o.id} data-testid="withdraw-confirmed" className="break-all text-xs text-[#0E7C6B]">{x('Envio confirmado', 'Transfer confirmed', 'Envío confirmado')}: {o.intent && `${formatUnits(o.intent.units, o.intent.asset === 'USDC' ? 6 : 18)} ${o.intent.asset} → ${o.intent.destination}`} · {o.stages.find(s => s.name === 'withdraw')?.transactionHash}</p>)}
  </div>;
}
