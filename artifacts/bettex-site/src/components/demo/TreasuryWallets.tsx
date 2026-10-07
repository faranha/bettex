/** @jsxImportSource react */
import { useState } from 'react';
import { AlertTriangle, Bitcoin, Check, Copy, ExternalLink, FileText, Flame, Landmark, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDemoTreasuryWallets } from '@workspace/api-client-react';
import type { DemoDashboard, DemoTreasuryRound } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { Money, useMoney } from './fin';
import { burnOf, burnFl, nf } from './burn-format';
import { historyQuery } from '../history/history-selection';

type Purpose = 'operational' | 'reserve' | 'buyback' | 'crypto_agent';
export const explorerUrl = (a: string) => `https://sepolia.arbiscan.io/address/${a}`;
const ACCOUNT = { operational: 'treasury', reserve: 'all', buyback: 'buyback', crypto_agent: 'treasury' } as const;
const act = 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#D8CFBB] bg-[#FFFCF6] px-3 text-sm font-bold text-[#1B2A41] hover:bg-[#F0E9DA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';

function CopyButton({ address, purpose }: { address: string; purpose: Purpose }) {
  const { x } = useX();
  const [st, setSt] = useState<'idle' | 'ok' | 'fail'>('idle');
  const copy = async () => {
    try { await navigator.clipboard.writeText(address); setSt('ok'); } catch { setSt('fail'); }
    setTimeout(() => setSt('idle'), 4000);
  };
  return <>
    <button type="button" data-testid={`button-copy-${purpose}`} onClick={() => void copy()} className={act}>
      {st === 'ok' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {st === 'ok' ? x('Copiado', 'Copied', 'Copiado') : x('Copiar endereço', 'Copy address', 'Copiar dirección')}
    </button>
    {st === 'fail' && <p role="alert" data-testid={`text-copy-error-${purpose}`} className="basis-full rounded-xl bg-[#F6DADA] p-2 text-xs text-[#8C2B2B]">{x('Não foi possível copiar. Selecione o endereço acima e copie manualmente.', 'Could not copy. Select the address above and copy it manually.', 'No se pudo copiar. Selecciona la dirección y cópiala manualmente.')}</p>}
  </>;
}

export function TreasuryWallets({ d, r }: { d: DemoDashboard; r: DemoTreasuryRound }) {
  const { x, loc } = useX(); const { num } = useMoney();
  const q = useGetDemoTreasuryWallets();
  const b = burnOf(d); const fl = burnFl(loc);
  const NR = <span className="text-sm font-bold text-[#5B6B85]">{x('Não registrado', 'Not recorded', 'No registrado')}</span>;
  const ag = r.agentAllocations?.find(v => v.agent === 'crypto');
  const short = r.availableUsdc < 0;
  const addr = (p: Purpose) => q.data?.wallets.find(w => w.purpose === p)?.address;
  const hist = (p: Purpose, asset: 'USDC' | 'BETTEX' = 'USDC') => `${demoPath('wallet', loc)}${historyQuery('treasury', { treasuryAccount: ACCOUNT[p], treasuryAsset: asset, treasuryWallet: p })}#treasury-statement`;

  const card = (p: Purpose, title: string, role: string, Icon: typeof Landmark, body: React.ReactNode, tone: string) => {
    const a = addr(p);
    return <article key={p} data-testid={`card-wallet-${p}`} className={`grid min-w-0 content-start gap-3 rounded-2xl border-2 p-3 sm:p-4 ${tone}`}>
      <header className="flex items-start gap-2"><Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0"><h3 className="display text-base font-extrabold">{title}</h3><p className="text-xs text-[#5B6B85]">{role}</p></div>
        <span className="ml-auto shrink-0 rounded-full bg-[#FFF5D9] px-2 py-0.5 text-[11px] font-bold text-[#73531B]">{x('Simulado', 'Simulated', 'Simulado')}</span></header>
      {body}
      <div className="grid min-w-0 gap-1 rounded-xl bg-white/70 p-2">
        <p className="text-[11px] font-bold text-[#5B6B85]">{x('Endereço de teste · Arbitrum Sepolia', 'Test address · Arbitrum Sepolia', 'Dirección de prueba · Arbitrum Sepolia')}</p>
        {q.isLoading ? <div className="h-10 animate-pulse rounded-lg bg-[#EEE9DD]" aria-busy="true" />
          : a ? <p data-testid={`text-address-${p}`} className="mono break-all text-xs font-semibold">{a}</p>
          : <p className="text-xs font-semibold text-[#8C2B2B]">{x('Endereço indisponível.', 'Address unavailable.', 'Dirección no disponible.')}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {a && <><CopyButton address={a} purpose={p} />
          <a href={explorerUrl(a)} target="_blank" rel="noopener noreferrer" data-testid={`link-explorer-${p}`} className={act}><ExternalLink className="h-4 w-4" aria-hidden="true" />{x('Explorer de teste', 'Test explorer', 'Explorer de prueba')}</a></>}
        <Link href={hist(p)} data-testid={`link-history-${p}`} className={act}><FileText className="h-4 w-4" aria-hidden="true" />{x('Histórico', 'History', 'Historial')}</Link>
      </div>
    </article>;
  };

  return <section data-testid="treasury-allocation" className="dcard grid gap-3 p-4 sm:p-5">
    <div><h2 className="display text-lg font-extrabold">{x('Carteiras da tesouraria', 'Treasury wallets', 'Carteras de la tesorería')}</h2>
      <p className="mt-1 text-sm text-[#5B6B85]">{x('Ativos = Reserva protegida + Comprometido + Disponível + Liquidez USDC da pool. O USDC da pool já está incluído no total, mas não pode financiar os agentes. A recompra fica isolada, fora deste total.', 'Assets = Protected reserve + Committed + Available + Pool USDC liquidity. Pool USDC is already included in the total but cannot fund agents. Buyback is isolated, outside this total.', 'Activos = Reserva protegida + Comprometido + Disponible + Liquidez USDC de la pool. El USDC de la pool ya está incluido en el total, pero no puede financiar agentes. La recompra queda aislada, fuera de este total.')}</p></div>
    <p role="note" data-testid="text-wallet-disclaimer" className="flex items-start gap-2 rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-xs font-semibold text-[#6B3A10]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{x('Somente teste: não envie ativos reais. Os saldos exibidos são alocações simuladas do app, não saldos on-chain.', 'Test only: do not send real assets. Displayed balances are simulated app allocations, not on-chain balances.', 'Solo prueba: no envíes activos reales. Los saldos mostrados son asignaciones simuladas de la app, no saldos on-chain.')}</p>
    {q.isError && <div role="alert" data-testid="wallets-error" className="flex flex-wrap items-center gap-2 rounded-xl bg-[#F6DADA] p-3 text-sm text-[#8C2B2B]"><span>{x('Não foi possível carregar os endereços das carteiras.', 'Could not load the wallet addresses.', 'No se pudieron cargar las direcciones.')}</span><button type="button" data-testid="button-wallets-retry" className="min-h-11 rounded-xl border border-[#8C2B2B] px-3 font-bold" onClick={() => void q.refetch()}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></div>}
    <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
      {card('operational', x('Carteira operacional', 'Operational wallet', 'Cartera operativa'), x('Capital de trabalho modelado', 'Modeled working capital', 'Capital de trabajo modelado'), Landmark,
        <div className="grid gap-2"><div><p className="text-xs font-bold">{x('Carteira operacional residual (simulada)', 'Residual operational wallet (simulated)', 'Cartera operativa residual (simulada)')}</p><div data-testid="treasury-operational-wallet">{r.operationalWalletUsdc == null ? NR : <Money v={r.operationalWalletUsdc} a="USDC" big />}</div></div>
          <p data-testid="treasury-working" className="text-xs text-[#5B6B85]">{x('Capital de trabalho total (operacional + agente Crypto)', 'Total working capital (operational + Crypto agent)', 'Capital de trabajo total (operativo + agente Crypto)')}: <Money v={r.workingUsdc} a="USDC" /></p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div data-testid="treasury-committed" className="rounded-xl border border-dashed border-[#C9DCD3] p-2"><p className="font-bold">{x('Comprometido fora do Crypto', 'Committed outside Crypto', 'Comprometido fuera de Crypto')}</p>{r.operationalWalletCommittedUsdc == null ? NR : <Money v={r.operationalWalletCommittedUsdc} a="USDC" />}<p className="mt-1 text-[#5B6B85]">{x('Preso em posições; não é USDC líquido on-chain. Total comprometido:', 'Locked in positions; not liquid on-chain USDC. Total committed:', 'Atado a posiciones; no es USDC líquido on-chain. Total comprometido:')} {num(r.committedUsdc)}</p></div>
            <div data-testid="treasury-available" className={`rounded-xl border p-2 ${short ? 'border-[#B4421A]' : 'border-[#C9DCD3]'}`}><p className="font-bold">{x('Disponível (compartilhado)', 'Available (shared)', 'Disponible (compartido)')}</p><Money v={r.availableUsdc} a="USDC" /><p className="mt-1 text-[#5B6B85]">{x('Caixa operacional livre, único para todos.', 'Free operating cash, shared by all.', 'Caja operativa libre, compartida.')}</p></div></div></div>,
        'border-[#C9DCD3] bg-[#F3F8F5]')}
      {card('reserve', x('Reserva protegida', 'Protected reserve', 'Reserva protegida'), x('Guardada por segurança; não opera', 'Kept aside for safety; not traded', 'Guardada por seguridad; no opera'), ShieldCheck,
        <div data-testid="treasury-reserve"><p className="text-xs font-bold">{x('Reserva (simulada)', 'Reserve (simulated)', 'Reserva (simulada)')}</p><Money v={r.reserveUsdc} a="USDC" big /><p className="mt-1 text-xs text-[#5B6B85]">{x('Fica fora das operações para cobrir perdas.', 'Stays out of operations to cover losses.', 'Queda fuera de operaciones para cubrir pérdidas.')}</p></div>,
        'border-[#CFD8EC] bg-[#F4F6FC]')}
      {card('crypto_agent', x('Carteira do agente Crypto', 'Crypto agent wallet', 'Cartera del agente Crypto'), x('Agente ativo; capital de posições aprovadas', 'Active agent; approved-position capital', 'Agente activo; capital de posiciones aprobadas'), Bitcoin,
        <div data-testid="wallet-crypto-agent" className="grid gap-2"><div><p className="text-xs font-bold">{x('Alocado na rodada (modelado)', 'Allocated this round (modeled)', 'Asignado en la ronda (modelado)')}</p><div data-testid="wallet-crypto-allocated">{ag ? <Money v={ag.allocatedUsdc} a="USDC" big /> : NR}</div></div>
          {ag && <div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-dashed border-[#CFD8EC] p-2"><p className="font-bold">{x('Comprometido', 'Committed', 'Comprometido')}</p><Money v={ag.committedUsdc} a="USDC" /></div><div className="rounded-xl border border-[#CFD8EC] p-2"><p className="font-bold">{x('Posições ativas', 'Active positions', 'Posiciones activas')}</p><p data-testid="wallet-crypto-positions" className="display text-base font-extrabold tabular-nums">{ag.activePositions}</p></div></div>}
          <p className="mono text-[11px] text-[#5B6B85]">{x('Rodada', 'Round', 'Ronda')} {r.id}</p>
          <p className="text-xs text-[#5B6B85]">{x('Só capital reservado em posições já aprovadas; sem saldo disponível próprio. Capital modelado comprometido, não dinheiro líquido on-chain.', 'Only capital reserved in already-approved positions; no separate available balance. Modeled committed capital, not liquid on-chain money.', 'Solo capital reservado en posiciones ya aprobadas; sin saldo disponible propio. Capital modelado comprometido, no dinero líquido on-chain.')}</p></div>,
        'border-[#CFD8EC] bg-[#F4F6FC]')}
      {card('buyback', x('Carteira de recompra', 'Buyback wallet', 'Cartera de recompra'), x('Dedicada, isolada do total de ativos', 'Dedicated, isolated from total assets', 'Dedicada, aislada del total de activos'), Flame,
        b ? <div className="grid gap-2" data-testid="treasury-burn-wallet"><div><p className="text-xs font-bold text-[#8F3A0E]">{x('USDC aguardando recompra', 'USDC awaiting buyback', 'USDC esperando recompra')}</p><p className="display break-words text-xl font-extrabold tabular-nums">{nf(fl, b.walletUsdc)} USDC</p></div>
          <div><p className="text-xs font-bold text-[#8F3A0E]">{x('BETTEX aguardando queima', 'BETTEX awaiting burn', 'BETTEX esperando quema')}</p><p className="display break-words text-xl font-extrabold tabular-nums">{nf(fl, b.walletBettex, 0)} BETTEX</p></div>
          <Link href={hist('buyback', 'BETTEX')} data-testid="link-buyback-bettex-history" className="text-xs font-bold text-[#8F3A0E] underline">{x('Histórico BETTEX', 'BETTEX history', 'Historial BETTEX')}</Link></div>
          : <p className="rounded-xl bg-[#F5F1E8] p-3 text-xs font-semibold text-[#5B6B85]">{x('Sem resumo de queima nesta sessão.', 'No burn summary in this session.', 'Sin resumen de quema en esta sesión.')}</p>,
        'border-[#E8C9A5] bg-[#FFF6EA]')}
    </div>
    <p className="text-xs mono text-[#5B6B85]">{num(r.assetsUsdc)} = {num(r.reserveUsdc)} + {num(r.committedUsdc)} + {num(r.availableUsdc)}{r.poolUsdc ? ` + ${num(r.poolUsdc)} (pool)` : ''} </p>
    <p data-testid="text-wallet-composition" className="text-xs mono text-[#5B6B85]">{r.operationalWalletUsdc != null && ag ? `${num(r.assetsUsdc)} = ${num(r.reserveUsdc)} + ${num(r.operationalWalletUsdc)} + ${num(ag.allocatedUsdc)}${r.poolUsdc ? ` + ${num(r.poolUsdc)} (pool)` : ''}` : x('Composição por carteira não registrada nesta rodada.', 'Per-wallet composition not recorded for this round.', 'Composición por cartera no registrada en esta ronda.')}</p>
    {short && <p role="alert" data-testid="treasury-shortfall" className="flex items-start gap-2 rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-sm font-semibold text-[#6B3A10]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{x(`Reserva violada: faltam ${num(-r.availableUsdc)} USDC para cobrir reserva e compromissos. Novas posições ficam bloqueadas e não há distribuição enquanto isso durar.`, `Reserve breach: ${num(-r.availableUsdc)} USDC short of covering reserve and commitments. New positions stay blocked and no distribution happens meanwhile.`, `Reserva vulnerada: faltan ${num(-r.availableUsdc)} USDC para cubrir reserva y compromisos. Las nuevas posiciones quedan bloqueadas y no hay distribución mientras tanto.`)}</p>}
  </section>;
}
