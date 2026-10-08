/** @jsxImportSource react */
import { useState, type ReactNode } from 'react';
import { AlertTriangle, Bitcoin, Check, Coins, Copy, ExternalLink, FileText, Flame, Info, Landmark, ShieldCheck, Wallet } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDemoTreasuryWallets } from '@workspace/api-client-react';
import type { DemoDashboard, DemoTreasuryRound } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { Money, useMoney } from './fin';
import { burnOf, burnFl, nf } from './burn-format';
import { historyQuery } from '../history/history-selection';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import './TreasuryWallets.css';
import { WalletHelp } from './WalletHelp';

type Purpose = 'operational' | 'reserve' | 'buyback' | 'crypto_agent';
export const explorerUrl = (a: string) => `https://sepolia.arbiscan.io/address/${a}`;
const ACCOUNT = { operational: 'treasury', reserve: 'all', buyback: 'buyback', crypto_agent: 'treasury' } as const;
const act = 'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#D8CFBB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#F0E9DA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';

function Tip({ label, children }: { label: string; children: ReactNode }) {
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent className="text-xs">{label}</TooltipContent></Tooltip>;
}

function CopyButton({ address, purpose }: { address: string; purpose: Purpose }) {
  const { x } = useX();
  const [st, setSt] = useState<'idle' | 'ok' | 'fail'>('idle');
  const copy = async () => {
    try { await navigator.clipboard.writeText(address); setSt('ok'); } catch { setSt('fail'); }
    setTimeout(() => setSt('idle'), 4000);
  };
  const label = st === 'ok' ? x('Copiado', 'Copied', 'Copiado') : x('Copiar endereço', 'Copy address', 'Copiar dirección');
  return <>
    <Tip label={label}><button type="button" aria-label={label} data-testid={`button-copy-${purpose}`} onClick={() => void copy()} className={act}>
      {st === 'ok' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
    </button></Tip>
    {st === 'fail' && <p role="alert" data-testid={`text-copy-error-${purpose}`} className="basis-full rounded-xl bg-[#F6DADA] p-2 text-xs text-[#8C2B2B]">{x('Não foi possível copiar. Abra os detalhes e copie o endereço manualmente.', 'Could not copy. Open the details and copy the address manually.', 'No se pudo copiar. Abre los detalles y copia la dirección manualmente.')}</p>}
  </>;
}

function Helper({ id, label, children, wallet = false }: { id: string; label: string; children: ReactNode; wallet?: boolean }) {
  const Icon = wallet ? Wallet : Info;
  return <Popover><Tip label={label}><PopoverTrigger asChild><button type="button" aria-label={label} data-testid={`button-info-${id}`} className={act}><Icon className="h-4 w-4" aria-hidden="true" /></button></PopoverTrigger></Tip>
    <PopoverContent align="end" className="w-[min(92vw,22rem)] max-w-[92vw] border-[#E4DCCB] bg-[#FFFCF6] p-3 text-xs text-[#1B2A41]"><div className="grid gap-2">{children}</div></PopoverContent></Popover>;
}

function Mt({ label, tip, children, id, tone = 'border-[#D9E3DD]', wide = false }: { label: string; tip: string; children: ReactNode; id?: string; tone?: string; wide?: boolean }) {
  return <div data-testid={id} className={`min-w-0 rounded-xl border bg-white/60 p-2 ${tone} ${wide ? 'col-span-full' : ''}`}><div className="mb-0.5 text-[11px] font-bold text-[#5B6B85]"><WalletHelp id={id ?? `treasury-${label}`} label={label}><p>{tip}</p></WalletHelp></div>{children}</div>;
}

export function TreasuryWallets({ d, r, layout = 'vertical', wallet }: { d: DemoDashboard; r: DemoTreasuryRound; layout?: 'compact' | 'vertical'; wallet?: Purpose }) {
  const { x, loc } = useX(); const { num } = useMoney();
  const q = useGetDemoTreasuryWallets();
  const b = burnOf(d); const fl = burnFl(loc);
  const vert = layout === 'vertical';
  const NR = <span className="text-sm font-bold text-[#5B6B85]">{x('Não registrado', 'Not recorded', 'No registrado')}</span>;
  const ag = r.agentAllocations?.find(v => v.agent === 'crypto');
  const short = r.availableUsdc < 0;
  const addr = (p: Purpose) => q.data?.wallets.find(w => w.purpose === p)?.address;
  const hist = (p: Purpose, asset: 'USDC' | 'BETTEX' = 'USDC') => `${demoPath('wallet', loc)}${historyQuery('treasury', { treasuryAccount: ACCOUNT[p], treasuryAsset: asset, treasuryWallet: p })}#treasury-statement`;
  const histLabel = x('Histórico', 'History', 'Historial');

  const card = (p: Purpose, title: string, role: string, Icon: typeof Landmark, body: ReactNode, tone: string, notes: ReactNode, extra?: ReactNode) => {
    if (wallet && wallet !== p) return null;
    const a = addr(p);
    const net = x('Endereço de teste · Arbitrum Sepolia', 'Test address · Arbitrum Sepolia', 'Dirección de prueba · Arbitrum Sepolia');
    const expl = x('Explorer de teste', 'Test explorer', 'Explorer de prueba');
    return <article key={p} data-testid={`card-wallet-${p}`} className={`treasury-wallet-card grid w-full min-w-0 content-start gap-3 rounded-2xl border-2 p-3 sm:p-4 ${tone} ${vert ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:items-center lg:gap-5' : ''}`}>
      <div className="grid min-w-0 gap-2">
        <header className="flex items-start gap-2"><Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <h3 className="display min-w-0 text-base font-extrabold"><WalletHelp id={`treasury-wallet-${p}`} label={title}><p>{role}</p>{notes}<p>{x('Os botões permitem copiar o endereço público, abrir o explorer da rede de teste e consultar o histórico desta carteira. O ícone de carteira abre os detalhes e o endereço. As alocações do app não comprovam fundos on-chain; não envie ativos reais.', 'The buttons copy the public address, open the test-network explorer and view this wallet’s history. The wallet icon opens details and the address. App allocations do not prove on-chain funds; do not send real assets.', 'Los botones copian la dirección pública, abren el explorador de la red de pruebas y consultan el historial de esta cartera. El icono de cartera abre detalles y dirección. Las asignaciones de la app no prueban fondos on-chain; no envíes activos reales.')}</p></WalletHelp></h3></header>
        <div className="flex flex-wrap gap-2">
          {a && <><CopyButton address={a} purpose={p} />
            <Tip label={expl}><a href={explorerUrl(a)} target="_blank" rel="noopener noreferrer" aria-label={expl} data-testid={`link-explorer-${p}`} className={act}><ExternalLink className="h-4 w-4" aria-hidden="true" /></a></Tip></>}
          <Tip label={histLabel}><Link href={hist(p)} aria-label={histLabel} data-testid={`link-history-${p}`} className={act}><FileText className="h-4 w-4" aria-hidden="true" /></Link></Tip>
          {extra}
          <Helper wallet id={p} label={`${title}: ${x('detalhes e endereço', 'details and address', 'detalles y dirección')}`}>
            <p className="font-semibold">{role}</p>
            <div className="grid gap-1 rounded-lg bg-white/80 p-2"><p className="font-bold text-[#5B6B85]">{net}</p>
              {q.isLoading ? <div className="h-10 animate-pulse rounded-lg bg-[#EEE9DD]" aria-busy="true" />
                : a ? <p data-testid={`text-address-${p}`} className="mono select-all break-all font-semibold">{a}</p>
                : <p className="font-semibold text-[#8C2B2B]">{x('Endereço indisponível.', 'Address unavailable.', 'Dirección no disponible.')}</p>}</div>
            {notes}
          </Helper>
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-1 content-start gap-2 sm:grid-cols-2">{body}</div>
    </article>;
  };
  const note = (t: string) => <p className="leading-snug text-[#5B6B85]">{t}</p>;

  return <section data-testid="treasury-allocation" className="dcard grid min-w-0 gap-3 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3"><h2 className="display text-lg font-extrabold">{x('Carteiras da tesouraria', 'Treasury wallets', 'Carteras de la tesorería')}</h2>
      <Helper id="composition" label={x('Como o total é composto', 'How the total is composed', 'Cómo se compone el total')}>
        {note(x('Ativos = Reserva protegida + Comprometido + Disponível + Liquidez USDC da pool. O USDC da pool já está incluído no total, mas não pode financiar os agentes. A recompra fica isolada, fora deste total.', 'Assets = Protected reserve + Committed + Available + Pool USDC liquidity. Pool USDC is already included in the total but cannot fund agents. Buyback is isolated, outside this total.', 'Activos = Reserva protegida + Comprometido + Disponible + Liquidez USDC de la pool. El USDC de la pool ya está incluido en el total, pero no puede financiar agentes. La recompra queda aislada, fuera de este total.'))}
      </Helper></div>
    {q.isError && <div role="alert" data-testid="wallets-error" className="flex flex-wrap items-center gap-2 rounded-xl bg-[#F6DADA] p-3 text-sm text-[#8C2B2B]"><span>{x('Não foi possível carregar os endereços das carteiras.', 'Could not load the wallet addresses.', 'No se pudieron cargar las direcciones.')}</span><button type="button" data-testid="button-wallets-retry" className="min-h-11 rounded-xl border border-[#8C2B2B] px-3 font-bold" onClick={() => void q.refetch()}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></div>}
    <div data-testid="wallet-list" className="grid min-w-0 gap-3">
      {card('operational', x('Operacional', 'Operational', 'Operativa'), x('Capital de trabalho', 'Working capital', 'Capital de trabajo'), Landmark,
        <>
          <Mt wide={!vert} label={x('Saldo operacional', 'Operating balance', 'Saldo operativo')} tip={x('Parcela operacional do capital de trabalho. A alocação do agente Cripto é apresentada separadamente, sem contar o mesmo capital duas vezes. Não é o saldo da sua carteira pessoal.', 'Operational portion of working capital. Crypto-agent allocation is shown separately, without counting the same capital twice. This is not your personal wallet balance.', 'Parte operativa del capital de trabajo. La asignación del agente Cripto se muestra por separado, sin contar el mismo capital dos veces. No es el saldo de tu cartera personal.')}><div data-testid="treasury-operational-wallet">{r.operationalWalletUsdc == null ? NR : <Money v={r.operationalWalletUsdc} a="USDC" big />}</div></Mt>
          {vert && <Mt id="treasury-working" label={x('Capital de trabalho total', 'Total working capital', 'Capital de trabajo total')} tip={x('Capital operacional e alocação do agente Cripto, incluindo parcelas comprometidas e disponíveis. A reserva protegida e a liquidez USDC da pool não estão livres para financiar os agentes.', 'Operating capital and Crypto-agent allocation, including committed and available portions. Protected reserve and pool USDC liquidity are not free to fund agents.', 'Capital operativo y asignación del agente Cripto, incluidas las partes comprometidas y disponibles. La reserva protegida y la liquidez USDC del pool no están libres para financiar agentes.')}><Money v={r.workingUsdc} a="USDC" /></Mt>}
          <Mt id="treasury-committed" label={x('Comprometido fora do Crypto', 'Committed outside Crypto', 'Comprometido fuera de Crypto')} tip={x('Capital reservado em posições aprovadas fora do agente Cripto. Não está livre para novas operações; a parte do Cripto aparece no cartão próprio.', 'Capital reserved in approved positions outside the Crypto agent. It is not free for new operations; the Crypto portion appears in its own card.', 'Capital reservado en posiciones aprobadas fuera del agente Cripto. No está libre para nuevas operaciones; la parte de Cripto aparece en su propia tarjeta.')} tone="border-dashed border-[#C9DCD3]">{r.operationalWalletCommittedUsdc == null ? NR : <Money v={r.operationalWalletCommittedUsdc} a="USDC" />}</Mt>
          <Mt id="treasury-available" label={x('Disponível (compartilhado)', 'Available (shared)', 'Disponible (compartido)')} tip={x('Caixa operacional ainda livre, compartilhado entre agentes; não é um saldo adicional para cada agente. Exclui reserva, capital comprometido e liquidez da pool. Valor negativo indica insuficiência, não crédito disponível.', 'Operating cash still free, shared across agents; not an additional balance for each agent. Excludes reserve, committed capital and pool liquidity. A negative amount means a shortfall, not available credit.', 'Caja operativa aún libre, compartida entre agentes; no es un saldo adicional para cada agente. Excluye reserva, capital comprometido y liquidez del pool. Un valor negativo indica insuficiencia, no crédito disponible.')} tone={short ? 'border-[#B4421A]' : 'border-[#C9DCD3]'}><Money v={r.availableUsdc} a="USDC" /></Mt>
        </>,
        'border-[#C9DCD3] bg-[#F3F8F5]',
        <>{note(x('Capital de trabalho total = operacional + agente Crypto.', 'Total working capital = operational + Crypto agent.', 'Capital de trabajo total = operativo + agente Crypto.'))}
          {!vert && <div data-testid="treasury-working"><Money v={r.workingUsdc} a="USDC" /></div>}
          {note(`${x('Comprometido: preso em posições; não é USDC líquido on-chain. Total comprometido:', 'Committed: locked in positions; not liquid on-chain USDC. Total committed:', 'Comprometido: atado a posiciones; no es USDC líquido on-chain. Total comprometido:')} ${num(r.committedUsdc)}`)}
          {note(x('Disponível: caixa operacional livre, único para todos.', 'Available: free operating cash, shared by all.', 'Disponible: caja operativa libre, compartida.'))}</>)}
      {card('reserve', x('Reserva protegida', 'Protected reserve', 'Reserva protegida'), x('Guardada por segurança; não opera', 'Kept aside for safety; not traded', 'Guardada por seguridad; no opera'), ShieldCheck,
        <Mt wide id="treasury-reserve" label={x('Reserva', 'Reserve', 'Reserva')} tip={x('Parcela protegida dos ativos, guardada para cobrir perdas e fora das operações. Já faz parte dos ativos totais; não deve ser somada novamente. Não é garantia de rendimentos.', 'Protected portion of assets, kept to cover losses and excluded from trading. It is already part of total assets and must not be added again. It does not guarantee earnings.', 'Parte protegida de los activos, guardada para cubrir pérdidas y fuera de las operaciones. Ya forma parte de los activos totales y no se suma de nuevo. No garantiza ganancias.')}><Money v={r.reserveUsdc} a="USDC" big /></Mt>,
        'border-[#CFD8EC] bg-[#F4F6FC]',
        note(x('Fica fora das operações para cobrir perdas.', 'Stays out of operations to cover losses.', 'Queda fuera de operaciones para cubrir pérdidas.')))}
      {card('crypto_agent', x('Agente Cripto', 'Crypto agent', 'Agente Cripto'), x('Agente ativo; posições aprovadas', 'Active agent; approved positions', 'Agente activo; posiciones aprobadas'), Bitcoin,
        <div data-testid="wallet-crypto-agent" className="col-span-full grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <Mt wide={!vert} label={x('Alocado na rodada', 'Allocated this round', 'Asignado en la ronda')} tip={x('Capital reservado às operações aprovadas do agente Cripto nesta rodada. Não é um orçamento extra nem dinheiro líquido on-chain. Sem registro, fica desconhecido, não zero.', 'Capital reserved for approved Crypto-agent operations this round. Not an extra budget or liquid on-chain money. Without a record it remains unknown, not zero.', 'Capital reservado para operaciones aprobadas del agente Cripto en esta ronda. No es un presupuesto extra ni dinero líquido on-chain. Sin registro queda desconocido, no cero.')}><div data-testid="wallet-crypto-allocated">{ag ? <Money v={ag.allocatedUsdc} a="USDC" big /> : NR}</div></Mt>
          {ag && <><Mt label={x('Comprometido', 'Committed', 'Comprometido')} tip={x('Parcela do capital do Cripto vinculada a posições aprovadas ainda abertas. Deixa de estar reservada quando a posição encerra ou é cancelada; o resultado apurado pode ser positivo ou negativo.', 'Crypto capital tied to approved positions still open. It stops being reserved when a position closes or is cancelled; the assessed result may be positive or negative.', 'Capital de Cripto vinculado a posiciones aprobadas aún abiertas. Deja de estar reservado al cerrarse o cancelarse la posición; el resultado puede ser positivo o negativo.')} tone="border-dashed border-[#CFD8EC]"><Money v={ag.committedUsdc} a="USDC" /></Mt>
            <Mt label={x('Posições ativas', 'Active positions', 'Posiciones activas')} tip={x('Número de posições aprovadas do agente Cripto ainda em andamento. É uma contagem, não quantidade de tokens, lucro ou número de agentes.', 'Number of approved Crypto-agent positions still in progress. A count, not a token quantity, profit or number of agents.', 'Número de posiciones aprobadas del agente Cripto aún en curso. Es un conteo, no cantidad de tokens, ganancias ni número de agentes.')}><p data-testid="wallet-crypto-positions" className="display text-base font-extrabold tabular-nums">{ag.activePositions}</p></Mt></>}
          {vert && <Mt label={x('Rodada', 'Round', 'Ronda')} tip={x('Identificador persistido da rodada a que estes valores pertencem. Use o mesmo ID no Histórico para consultar a foto financeira e os registros correspondentes.', 'Persisted round identifier for these figures. Use the same ID in History to view the corresponding financial snapshot and records.', 'Identificador persistido de la ronda a la que pertenecen estos valores. Usa el mismo ID en Historial para consultar la foto financiera y los registros correspondientes.')}><p className="mono text-sm font-bold">{r.id}</p></Mt>}
        </div>,
        'border-[#CFD8EC] bg-[#F4F6FC]',
        <>{note(x('Só capital reservado em posições já aprovadas; sem saldo disponível próprio. Capital comprometido do app, não dinheiro líquido on-chain.', 'Only capital reserved in already-approved positions; no separate available balance. Committed app capital, not liquid on-chain money.', 'Solo capital reservado en posiciones ya aprobadas; sin saldo disponible propio. Capital comprometido de la app, no dinero líquido on-chain.'))}
          {!vert && <p>{x('Rodada', 'Round', 'Ronda')}: <span className="mono">{r.id}</span></p>}</>)}
      {card('buyback', x('Recompra', 'Buyback', 'Recompra'), x('Dedicada, isolada do total de ativos', 'Dedicated, isolated from total assets', 'Dedicada, aislada del total de activos'), Flame,
        b ? <div className={`col-span-full grid min-w-0 grid-cols-1 gap-2 ${vert ? 'sm:grid-cols-2' : ''}`} data-testid="treasury-burn-wallet">
            <Mt label={x('USDC aguardando recompra', 'USDC awaiting buyback', 'USDC esperando recompra')} tip={x('Saldo modelado reservado para comprar BETTEX, ainda não utilizado. É separado dos ativos operacionais e não é saldo pessoal ou total de tokens queimados.', 'Modeled balance reserved to buy BETTEX, not yet used. Separate from operating assets; not a personal balance or the total burned tokens.', 'Saldo modelado reservado para comprar BETTEX, aún sin utilizar. Está separado de los activos operativos; no es saldo personal ni el total de tokens quemados.')}><p className="display break-words text-xl font-extrabold tabular-nums">{nf(fl, b.walletUsdc)} USDC</p></Mt>
            <Mt label={x('BETTEX aguardando queima', 'BETTEX awaiting burn', 'BETTEX esperando quema')} tip={x('Tokens já comprados que ainda aguardam a queima no roteiro do demo. Comprar não é queimar: só após a queima saem deste saldo e entram no total acumulado queimado.', 'Tokens already bought, awaiting burn in the demo script. Buying is not burning: only after burn do they leave this balance and enter the cumulative burned total.', 'Tokens ya comprados que aún esperan la quema en el guion del demo. Comprar no es quemar: solo después salen de este saldo y entran en el total acumulado quemado.')}><p className="display break-words text-xl font-extrabold tabular-nums">{nf(fl, b.walletBettex, 0)} BETTEX</p></Mt></div>
          : <p className="col-span-full rounded-xl bg-[#F5F1E8] p-3 text-xs font-semibold text-[#5B6B85]">{x('Sem resumo de queima nesta sessão.', 'No burn summary in this session.', 'Sin resumen de quema en esta sesión.')}</p>,
        'border-[#E8C9A5] bg-[#FFF6EA]',
        note(x('Carteira dedicada, isolada do total de ativos. Histórico USDC e BETTEX disponíveis nas ações do cartão.', 'Dedicated wallet, isolated from total assets. USDC and BETTEX history are available from the card actions.', 'Cartera dedicada, aislada del total de activos. Historial USDC y BETTEX disponibles en las acciones de la tarjeta.')),
        <Tip label={x('Histórico BETTEX', 'BETTEX history', 'Historial BETTEX')}><Link href={hist('buyback', 'BETTEX')} aria-label={x('Histórico BETTEX', 'BETTEX history', 'Historial BETTEX')} data-testid="link-buyback-bettex-history" className={`${act} text-[#8F3A0E]`}><Coins className="h-4 w-4" aria-hidden="true" /></Link></Tip>)}
    </div>
    {short && <p role="alert" data-testid="treasury-shortfall" className="flex items-start gap-2 rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-sm font-semibold text-[#6B3A10]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{x(`Reserva violada: faltam ${num(-r.availableUsdc)} USDC para cobrir reserva e compromissos. Novas posições ficam bloqueadas e não há distribuição enquanto isso durar.`, `Reserve breach: ${num(-r.availableUsdc)} USDC short of covering reserve and commitments. New positions stay blocked and no distribution happens meanwhile.`, `Reserva vulnerada: faltan ${num(-r.availableUsdc)} USDC para cubrir reserva y compromisos. Las nuevas posiciones quedan bloqueadas y no hay distribución mientras tanto.`)}</p>}
  </section>;
}
