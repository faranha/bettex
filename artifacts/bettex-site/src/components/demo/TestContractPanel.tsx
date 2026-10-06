/** @jsxImportSource react */
import { useState } from 'react';
import { useAuth, SignInButton } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetTestContract, useObserveTestContract, getGetTestContractQueryKey } from '@workspace/api-client-react';
import { useX } from './ui';
import { inp } from './fin';
import { TestContractPurchase } from './TestContractPurchase';

const EXPLORER = 'https://sepolia.arbiscan.io';
const ADDR = /^0x[a-fA-F0-9]{40}$/;
const short = (s: string) => (s.length > 14 ? `${s.slice(0, 8)}...${s.slice(-6)}` : s);
function units(v: string | undefined, dec: number, fl: string): string {
  if (v === undefined || !/^\d+$/.test(v)) return '-';
  const s = v.padStart(dec + 1, '0');
  const int = s.slice(0, -dec), frac = s.slice(-dec).replace(/0+$/, '').slice(0, 6);
  return BigInt(int).toLocaleString(fl) + (frac ? `${fl === 'en-US' ? '.' : ','}${frac}` : '');
}

export function TestContractPanel() {
  const { x, loc } = useX();
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const { isLoaded, isSignedIn, userId } = useAuth();
  const qc = useQueryClient();
  const enabled = !!isLoaded && !!isSignedIn;
  const q = useGetTestContract({ query: {
    enabled,
    queryKey: [...getGetTestContractQueryKey(), userId] as const,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    retry: 1,
  } });
  const [addr, setAddr] = useState('');
  const [err, setErr] = useState('');
  const m = useObserveTestContract();
  const s = q.data;
  const time = (t: string | number) => new Date(t).toLocaleString(fl, { timeZone: 'America/Sao_Paulo' });
  const dt = (n: number) => n ? new Date(n * 1000).toLocaleString(fl, { timeZone: 'America/Sao_Paulo' }) : '-';
  const submit = () => {
    const a = addr.trim();
    if (!ADDR.test(a)) { setErr(x('Endereço inválido: use 0x seguido de 40 caracteres hexadecimais.', 'Invalid address: use 0x followed by 40 hex characters.', 'Dirección inválida: use 0x seguido de 40 caracteres hexadecimales.')); return; }
    setErr('');
    m.mutate({ data: { address: a } }, {
      onSuccess: () => { setAddr(''); void qc.invalidateQueries({ queryKey: [...getGetTestContractQueryKey(), userId] }); },
      onError: () => setErr(x('Não foi possível registrar. Verifique o endereço, a rede Arbitrum Sepolia e tente novamente.', 'Could not register. Check the address, the Arbitrum Sepolia network and try again.', 'No se pudo registrar. Verifique la dirección, la red Arbitrum Sepolia e intente de nuevo.')),
    });
  };
  const row = (k: string, v: string, id: string) => <div className="min-w-0 rounded-xl border border-[#D8CFBB] p-3"><p className="text-[11px] font-semibold text-[#5B6B85]">{k}</p><p className="mt-1 break-words text-sm font-bold" data-testid={id}>{v}</p></div>;
  const kindLabel = (k: string) => k === 'public' ? x('Público', 'Public', 'Público') : k === 'founder' ? x('Fundadores', 'Founders', 'Fundadores') : x('Investidores', 'Investors', 'Inversores');
  return <section className="dcard p-4 sm:p-5" data-testid="panel-test-contract">
    <h3 className="display text-base font-extrabold">{x('Contrato na Arbitrum Sepolia', 'Contract on Arbitrum Sepolia', 'Contrato en Arbitrum Sepolia')}</h3>
    <ul className="mt-2 list-disc pl-5 text-xs text-[#5B6B85]">
      <li>{x('Pré-requisito: contrato de teste já implantado por quem o administra.', 'Prerequisite: test contract already deployed by its administrator.', 'Requisito: contrato de prueba ya desplegado por su administrador.')}</li>
      <li>{x('Pré-requisito: ETH e USDC de faucet na Arbitrum Sepolia para suas próprias transações.', 'Prerequisite: faucet ETH and USDC on Arbitrum Sepolia for your own transactions.', 'Requisito: ETH y USDC de faucet en Arbitrum Sepolia para sus propias transacciones.')}</li>
      <li>{x('Pré-requisito: autorização do administrador para endereços de teste.', 'Prerequisite: administrator authorization for test addresses.', 'Requisito: autorización del administrador para direcciones de prueba.')}</li>
    </ul>
    {!isLoaded && <div className="mt-4 h-24 animate-pulse rounded-xl bg-[#D8CFBB]/50" data-testid="loading-test-contract" />}
    {isLoaded && !isSignedIn && <div className="mt-4 flex flex-wrap items-center gap-3" data-testid="signin-test-contract">
      <span className="text-sm">{x('Entre com sua conta para observar o contrato.', 'Sign in to observe the contract.', 'Inicie sesión para observar el contrato.')}</span>
      <SignInButton mode="modal"><button type="button" className="min-h-10 rounded-full bg-[#0E7C6B] px-4 text-xs font-bold text-white" data-testid="button-signin-contract">{x('Entrar', 'Sign in', 'Entrar')}</button></SignInButton>
    </div>}
    {enabled && <>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={e => { e.preventDefault(); submit(); }}>
        <label className="sr-only" htmlFor="tc-address">{x('Endereço do token de teste', 'Test token address', 'Dirección del token de prueba')}</label>
        <input id="tc-address" className={inp} value={addr} onChange={e => setAddr(e.target.value)} placeholder={x('Endereço 0x...', 'Address 0x...', 'Dirección 0x...')} autoComplete="off" spellCheck={false} data-testid="input-contract-address" />
        <button type="submit" disabled={m.isPending || !addr.trim()} className="min-h-11 shrink-0 rounded-full bg-[#0E7C6B] px-5 text-xs font-bold text-white disabled:opacity-40" data-testid="button-register-contract">{m.isPending ? x('Verificando na cadeia...', 'Verifying on chain...', 'Verificando en la cadena...') : x('Registrar endereço', 'Register address', 'Registrar dirección')}</button>
      </form>
      {err && <p role="alert" className="mt-2 text-xs font-semibold text-[#B4421A]" data-testid="error-register-contract">{err}</p>}
      {q.isLoading && <div className="mt-4 grid gap-2 sm:grid-cols-3" data-testid="loading-test-contract">{[0, 1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-[#D8CFBB]/50" />)}</div>}
      {q.isError && <div role="alert" className="mt-4 text-sm text-[#B4421A]" data-testid="error-test-contract">{x('Falha ao ler o estado do contrato.', 'Failed to read contract state.', 'Error al leer el estado del contrato.')} <button type="button" className="font-bold underline" onClick={() => void q.refetch()} data-testid="button-retry-contract">{x('Tentar novamente', 'Try again', 'Intentar de nuevo')}</button></div>}
      {s && !s.configured && <p className="mt-4 rounded-xl border border-dashed border-[#D8CFBB] p-4 text-sm text-[#5B6B85]" data-testid="text-contract-unconfigured">{x('Nenhum contrato de teste configurado ainda. Registre um endereço público existente depois de cumprir os pré-requisitos acima.', 'No test contract configured yet. Register an existing public address after meeting the prerequisites above.', 'Aún no hay contrato de prueba configurado. Registre una dirección pública existente tras cumplir los requisitos anteriores.')}</p>}
      {s && s.configured && !q.isError && <div className="mt-4 grid gap-3" data-testid="state-test-contract">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {s.address && <div className="min-w-0 rounded-xl border border-[#D8CFBB] p-3"><p className="text-[11px] font-semibold text-[#5B6B85]">{x('Contrato', 'Contract', 'Contrato')}</p><a className="mono break-all text-sm font-bold text-[#0E7C6B] underline" href={`${EXPLORER}/address/${s.address}`} target="_blank" rel="noopener noreferrer" data-testid="link-contract-explorer">{short(s.address)}</a></div>}
          {row(x('Rede', 'Network', 'Red'), `Arbitrum Sepolia (${s.chainId})`, 'text-chain')}
          {row(x('Versão', 'Version', 'Versión'), s.version, 'text-version')}
          {s.symbol && row(x('Símbolo', 'Symbol', 'Símbolo'), s.symbol, 'text-symbol')}
          {s.blockNumber !== undefined && row(x('Bloco verificado', 'Verified block', 'Bloque verificado'), s.blockNumber.toLocaleString(fl), 'text-block')}
          {s.paused !== undefined && row(x('Estado', 'Status', 'Estado'), s.paused ? x('Pausado', 'Paused', 'Pausado') : x('Ativo', 'Active', 'Activo'), 'text-paused')}
          {s.totalSupply !== undefined && row(x('Oferta total', 'Total supply', 'Oferta total'), units(s.totalSupply, 18, fl), 'text-supply')}
          {s.sold !== undefined && row(x('Vendido (teste)', 'Sold (test)', 'Vendido (prueba)'), units(s.sold, 18, fl), 'text-sold')}
          {s.sold !== undefined && s.priceUsdc !== undefined && row(
            x('Principal encaminhado à tesouraria', 'Principal forwarded to treasury', 'Principal enviado a la tesorería'),
            `${units((BigInt(s.sold) / 10n ** 18n * BigInt(s.priceUsdc)).toString(), 6, fl)} USDC`,
            'text-treasury-principal')}
          {s.priceUsdc !== undefined && row(x('Preço de teste (USDC)', 'Test price (USDC)', 'Precio de prueba (USDC)'), units(s.priceUsdc, 6, fl), 'text-price')}
          {s.feeUsdc !== undefined && row(x('Taxa de teste (USDC)', 'Test fee (USDC)', 'Tarifa de prueba (USDC)'), units(s.feeUsdc, 6, fl), 'text-fee')}
          {s.nextRelease !== undefined && row(x('Próxima liberação', 'Next release', 'Próxima liberación'), dt(s.nextRelease), 'text-next-release')}
          {s.currentMonth !== undefined && row(x('Mês atual', 'Current month', 'Mes actual'), String(s.currentMonth), 'text-month')}
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs" data-testid="table-allocations">
          <thead className="text-[#5B6B85]"><tr><th className="py-2 pr-3">{x('Alocação', 'Allocation', 'Asignación')}</th><th className="pr-3">{x('Bloqueado', 'Blocked', 'Bloqueado')}</th><th className="pr-3">{x('Liberado', 'Released', 'Liberado')}</th><th className="pr-3">{x('Disponível', 'Available', 'Disponible')}</th><th>{x('Total', 'Total', 'Total')}</th></tr></thead>
          <tbody>{s.allocations.map(a => <tr key={a.kind + a.address} className="border-t border-[#D8CFBB]" data-testid={`row-allocation-${a.kind}`}>
            <td className="py-2 pr-3 font-bold">{kindLabel(a.kind)}<br /><a className="mono font-normal text-[#0E7C6B] underline" href={`${EXPLORER}/address/${a.address}`} target="_blank" rel="noopener noreferrer">{short(a.address)}</a></td>
            <td className="pr-3">{units(a.locked, 18, fl)}</td><td className="pr-3">{units(a.released, 18, fl)}</td><td className="pr-3">{units(a.available, 18, fl)}</td><td>{units(a.total, 18, fl)}</td></tr>)}</tbody>
        </table></div>
        <TestContractPurchase state={s} userId={userId} queryError={q.isError} />
        <div>
          <h4 className="text-sm font-extrabold">{x('Eventos provisórios', 'Provisional events', 'Eventos provisionales')}</h4>
          <p className="mt-1 text-xs text-[#5B6B85]" data-testid="text-history-note">{x('Eventos provisórios, sem finalidade na L1 do Ethereum. Até 50 eventos recentes.', 'Provisional events, not final on Ethereum L1. Up to 50 recent events.', 'Eventos provisionales, sin finalidad en la L1 de Ethereum. Hasta 50 eventos recientes.')} {(s.historyPartial || s.historyFromBlock !== undefined) && x(`Histórico incompleto: apenas os últimos 2.000 blocos${s.historyFromBlock !== undefined ? `, a partir do bloco ${s.historyFromBlock.toLocaleString(fl)}` : ''}.`, `Incomplete history: only the last 2,000 blocks${s.historyFromBlock !== undefined ? `, from block ${s.historyFromBlock.toLocaleString(fl)}` : ''}.`, `Historial incompleto: solo los últimos 2.000 bloques${s.historyFromBlock !== undefined ? `, desde el bloque ${s.historyFromBlock.toLocaleString(fl)}` : ''}.`)}</p>
          {s.events.length === 0 ? <p className="mt-2 text-xs text-[#5B6B85]" data-testid="text-no-events">{x('Nenhum evento na janela observada.', 'No events in the observed window.', 'Sin eventos en la ventana observada.')}</p> :
            <ul className="mt-2 grid gap-2">{s.events.map(e => <li key={`${e.transactionHash}-${e.logIndex}`} className="min-w-0 rounded-xl border border-[#D8CFBB] p-3 text-xs" data-testid={`event-${e.logIndex}`}>
              <p className="font-bold">{e.name} <span className="font-normal text-[#5B6B85]">· {x('bloco', 'block', 'bloque')} {e.blockNumber.toLocaleString(fl)} · #{e.logIndex}</span></p>
              <a className="mono break-all text-[#0E7C6B] underline" href={`${EXPLORER}/tx/${e.transactionHash}`} target="_blank" rel="noopener noreferrer">{short(e.transactionHash)}</a>
              <p className="mono mt-1 break-all text-[#5B6B85]">{e.values}</p></li>)}</ul>}
        </div>
        <p className="text-[11px] text-[#5B6B85]" data-testid="text-updated">{x('Atualizado (horário de São Paulo)', 'Updated (São Paulo time)', 'Actualizado (hora de São Paulo)')}: {time(q.dataUpdatedAt)}</p>
      </div>}
    </>}
  </section>;
}
