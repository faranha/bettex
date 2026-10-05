/** @jsxImportSource react */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetTestContractQueryKey, type TestContractState } from '@workspace/api-client-react';
import { useX } from './ui';
import { inp } from './fin';
import { purchaseTestTokens } from './test-contract-purchase';

type Stage = 'checking' | 'approval' | 'purchase' | 'reconciliation';
const FEE = 2_500_000n;

function usdc(v: bigint, fl: string): string {
  const s = v.toString().padStart(7, '0');
  const int = BigInt(s.slice(0, -6)).toLocaleString(fl);
  const dec = (1.1).toLocaleString(fl).charAt(1);
  return `${int}${dec}${s.slice(-6).replace(/0+$/, '').padEnd(2, '0')}`;
}

export function TestContractPurchase({ state, userId, queryError }: { state: TestContractState; userId: string | null | undefined; queryError: boolean }) {
  const { x, loc } = useX();
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const qc = useQueryClient();
  const [recipient, setRecipient] = useState('');
  const [qty, setQty] = useState('');
  const [stage, setStage] = useState<Stage | null>(null);
  const [err, setErr] = useState('');
  const [hash, setHash] = useState<string | null>(null);

  const qtyOk = /^[1-9]\d*$/.test(qty);
  const addrOk = /^0x[a-fA-F0-9]{40}$/.test(recipient.trim());
  const priceOk = !!state.priceUsdc && /^\d+$/.test(state.priceUsdc);
  const total = qtyOk && priceOk ? BigInt(qty) * BigInt(state.priceUsdc!) + FEE : null;
  const available = !!userId && state.configured && state.paused === false && !queryError && priceOk;
  const pending = stage !== null;

  const stages: [Stage, string][] = [
    ['checking', x('Verificação', 'Checking', 'Verificación')],
    ['approval', x('Aprovação USDC', 'USDC approval', 'Aprobación USDC')],
    ['purchase', x('Compra do token', 'Token purchase', 'Compra del token')],
    ['reconciliation', x('Reconciliação', 'Reconciliation', 'Reconciliación')],
  ];

  const msg = (code: string): string => {
    switch (code) {
      case 'wallet_missing': return x('Nenhuma carteira de navegador encontrada. Instale ou ative o MetaMask.', 'No browser wallet found. Install or enable MetaMask.', 'No se encontró cartera de navegador. Instale o active MetaMask.');
      case 'wrong_network': return x('A carteira está em outra rede. Troque para Arbitrum Sepolia (421614) e confira os dados.', 'The wallet is on another network. Switch to Arbitrum Sepolia (421614) and review the form.', 'La cartera está en otra red. Cambie a Arbitrum Sepolia (421614) y revise el formulario.');
      case 'invalid_quantity': return x('Quantidade inválida. Use um número inteiro positivo dentro do limite.', 'Invalid quantity. Use a positive whole number within the limit.', 'Cantidad inválida. Use un entero positivo dentro del límite.');
      case 'unauthorized_buyer': return x('Esta carteira não está autorizada para este destinatário no contrato de teste.', 'This wallet is not authorized for this recipient on the test contract.', 'Esta cartera no está autorizada para este destinatario en el contrato de prueba.');
      case 'insufficient_inventory': return x('Estoque público de teste insuficiente para essa quantidade.', 'Not enough public test inventory for this quantity.', 'Inventario público de prueba insuficiente para esta cantidad.');
      case 'insufficient_usdc': return x('Saldo ou permissão de USDC de teste insuficiente. Use o faucet antes de tentar de novo.', 'Insufficient test USDC balance or allowance. Use the faucet before trying again.', 'Saldo o permiso de USDC de prueba insuficiente. Use el faucet antes de intentar de nuevo.');
      case 'sale_unavailable': return x('A venda de teste não está disponível agora (não configurada, pausada ou rede diferente).', 'The test sale is unavailable right now (unconfigured, paused or different network).', 'La venta de prueba no está disponible ahora (sin configurar, pausada o red distinta).');
      case 'quote_changed': return x('A cotação mudou na cadeia. Atualize o painel e confira o novo valor antes de continuar.', 'The on-chain quote changed. Refresh the panel and review the new amount before continuing.', 'La cotización cambió en la cadena. Actualice el panel y revise el nuevo valor antes de continuar.');
      case 'transaction_pending': return x('Transação ainda sem recibo. Aguarde e confira no explorer antes de qualquer nova ação; sua operação foi guardada neste navegador.', 'Transaction has no receipt yet. Wait and check the explorer before any new action; your operation is saved in this browser.', 'La transacción aún no tiene recibo. Espere y revise el explorador antes de otra acción; su operación quedó guardada en este navegador.');
      case 'transaction_reverted': return x('A transação foi revertida na cadeia. Nenhum token foi comprado por ela.', 'The transaction reverted on chain. No tokens were bought by it.', 'La transacción fue revertida en la cadena. No se compraron tokens con ella.');
      case 'previous_operation_pending': return x('Há uma operação anterior pendente neste navegador com outros dados. Reenvie os mesmos dados dela para concluir; não inicie outra.', 'A previous operation is pending in this browser with different data. Resubmit the same data to finish it; do not start another.', 'Hay una operación previa pendiente en este navegador con otros datos. Reenvíe los mismos datos para concluirla; no inicie otra.');
      case 'unknown_transaction': return x('Resultado incerto: não foi possível confirmar a transação. Verifique a carteira e o explorer antes de qualquer nova tentativa.', 'Uncertain result: the transaction could not be confirmed. Check your wallet and the explorer before any new attempt.', 'Resultado incierto: no se pudo confirmar la transacción. Revise su cartera y el explorador antes de otro intento.');
      case 'browser_lock_required': return x('Este navegador não oferece o bloqueio necessário para operar com segurança. Use um navegador atual.', 'This browser lacks the lock needed to operate safely. Use a current browser.', 'Este navegador no ofrece el bloqueo necesario para operar con seguridad. Use un navegador actual.');
      default: return x('Resultado incerto. Não sabemos se a compra ocorreu. Confira a carteira e o explorer antes de qualquer nova tentativa.', 'Uncertain result. We do not know whether the purchase happened. Check your wallet and the explorer before any new attempt.', 'Resultado incierto. No sabemos si la compra ocurrió. Revise su cartera y el explorador antes de otro intento.');
    }
  };

  const run = async () => {
    if (!available || !userId || !qtyOk || !addrOk || pending) return;
    setErr(''); setHash(null); setStage('checking');
    try {
      const h = await purchaseTestTokens(userId, recipient.trim(), qty, setStage);
      setHash(h);
      setQty('');
      await qc.invalidateQueries({ queryKey: [...getGetTestContractQueryKey(), userId] });
    } catch (e) {
      setErr(msg(e instanceof Error ? e.message : ''));
    } finally { setStage(null); }
  };

  return <div className="rounded-xl border border-[#D8CFBB] p-3 sm:p-4" data-testid="panel-test-purchase">
    <h4 className="text-sm font-extrabold">{x('Compra de teste com carteira do navegador', 'Test purchase with browser wallet', 'Compra de prueba con cartera del navegador')}</h4>
    <p className="mt-1 text-xs text-[#5B6B85]">{x('Somente teste em Arbitrum Sepolia, sem valor real. Os endereços e o financiamento públicos ainda não estão disponíveis: a compra só funciona para carteiras autorizadas.', 'Testing only on Arbitrum Sepolia, no real value. Public addresses and funding are not available yet: purchase only works for authorized wallets.', 'Solo pruebas en Arbitrum Sepolia, sin valor real. Las direcciones y el financiamiento públicos aún no están disponibles: la compra solo funciona con carteras autorizadas.')}</p>
    <ul className="mt-2 list-disc pl-5 text-xs text-[#5B6B85]">
      <li>{x('Requer MetaMask ou carteira de navegador, com sua permissão de conexão.', 'Requires MetaMask or a browser wallet, with your connection permission.', 'Requiere MetaMask o cartera de navegador, con su permiso de conexión.')}</li>
      <li>{x('Rede Arbitrum Sepolia, com ETH e USDC de faucet na sua carteira.', 'Arbitrum Sepolia network, with faucet ETH and USDC in your wallet.', 'Red Arbitrum Sepolia, con ETH y USDC de faucet en su cartera.')}</li>
      <li>{x('Duas janelas separadas da carteira: aprovação de USDC e compra do token.', 'Two separate wallet dialogs: USDC approval and token purchase.', 'Dos ventanas separadas de la cartera: aprobación de USDC y compra del token.')}</li>
      <li>{x('Nunca informe chaves privadas ou frases de recuperação aqui.', 'Never enter private keys or recovery phrases here.', 'Nunca ingrese claves privadas ni frases de recuperación aquí.')}</li>
    </ul>
    {!available && <p className="mt-3 text-xs font-semibold text-[#5B6B85]" data-testid="text-purchase-disabled">{state.paused ? x('Contrato pausado: compra indisponível.', 'Contract paused: purchase unavailable.', 'Contrato pausado: compra no disponible.') : x('Compra indisponível enquanto o estado não for confirmado.', 'Purchase unavailable until the state is confirmed.', 'Compra no disponible hasta confirmar el estado.')}</p>}
    <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_9rem]" onSubmit={e => { e.preventDefault(); void run(); }}>
      <div>
        <label className="text-[11px] font-semibold text-[#5B6B85]" htmlFor="tp-recipient">{x('Endereço destinatário', 'Recipient address', 'Dirección destinataria')}</label>
        <input id="tp-recipient" className={inp} value={recipient} onChange={e => setRecipient(e.target.value)} placeholder={x('Endereço 0x...', 'Address 0x...', 'Dirección 0x...')} autoComplete="off" spellCheck={false} disabled={pending} data-testid="input-purchase-recipient" />
      </div>
      <div>
        <label className="text-[11px] font-semibold text-[#5B6B85]" htmlFor="tp-qty">{x('Tokens inteiros', 'Whole tokens', 'Tokens enteros')}</label>
        <input id="tp-qty" className={inp} inputMode="numeric" value={qty} onChange={e => setQty(e.target.value.replace(/\D/g, ''))} placeholder="1" disabled={pending} data-testid="input-purchase-quantity" />
      </div>
      <div className="text-xs sm:col-span-2" data-testid="text-purchase-total" aria-live="polite">
        {total !== null && priceOk
          ? <>{x('Principal', 'Principal', 'Principal')}: {usdc(BigInt(qty) * BigInt(state.priceUsdc!), fl)} USDC + {x('taxa', 'fee', 'tarifa')} {usdc(FEE, fl)} USDC = <strong>{usdc(total, fl)} USDC</strong> ({x('condição de teste', 'test condition', 'condición de prueba')})</>
          : <span className="text-[#5B6B85]">{x('Informe uma quantidade inteira positiva para ver o total exato.', 'Enter a positive whole quantity to see the exact total.', 'Ingrese una cantidad entera positiva para ver el total exacto.')}</span>}
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={!available || !qtyOk || !addrOk || pending} className="min-h-11 rounded-full bg-[#0E7C6B] px-5 text-xs font-bold text-white disabled:opacity-40" data-testid="button-purchase-test">
          {pending ? x('Aguardando, não feche a página', 'Waiting, do not close the page', 'Esperando, no cierre la página') : x('Comprar com a carteira (teste)', 'Buy with wallet (test)', 'Comprar con la cartera (prueba)')}
        </button>
      </div>
    </form>
    {pending && <ol className="mt-3 grid gap-1 text-xs" data-testid="list-purchase-stages" aria-live="polite">
      {stages.map(([k, label], i) => {
        const cur = stages.findIndex(s => s[0] === stage);
        return <li key={k} className={i === cur ? 'font-bold text-[#0E7C6B]' : i < cur ? 'text-[#5B6B85]' : 'text-[#5B6B85]/60'} data-testid={`stage-${k}`}>{i + 1}. {label}{i === cur ? ' ...' : ''}</li>;
      })}
      <li className="text-[#5B6B85]">{x('Confirme cada janela da carteira uma única vez e aguarde.', 'Confirm each wallet dialog once and wait.', 'Confirme cada ventana de la cartera una sola vez y espere.')}</li>
    </ol>}
    {err && <p role="alert" className="mt-3 text-xs font-semibold text-[#B4421A]" data-testid="error-purchase">{err}</p>}
    {hash !== null && <p className="mt-3 text-xs font-semibold text-[#0E7C6B]" data-testid="text-purchase-success">
      {x('Compra de teste reconciliada na cadeia (provisória, não final na L1).', 'Test purchase reconciled on chain (provisional, not final on L1).', 'Compra de prueba reconciliada en la cadena (provisional, no final en L1).')}{' '}
      {hash ? <a className="mono break-all underline" href={`https://sepolia.arbiscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" data-testid="link-purchase-tx">{hash.slice(0, 10)}...{hash.slice(-6)}</a> : <span>{x('Já confirmada anteriormente; veja os eventos abaixo.', 'Already confirmed earlier; see the events below.', 'Ya confirmada antes; vea los eventos abajo.')}</span>}
    </p>}
  </div>;
}
