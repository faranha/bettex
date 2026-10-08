/** @jsxImportSource react */
import { Flame } from 'lucide-react';
import { Link } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { burnOf, burnFl, nf } from './burn-format';
import { formatBrazilDateTime } from './brazil-time';
import { useGetDemoTreasuryWallets } from '@workspace/api-client-react';
import { explorerUrl } from './TreasuryWallets';
import { TreasuryTerm as Term } from './TreasuryHelp';
import { burnAnalytics, type BurnTotals } from './burn-analytics';
import { BurnCharts } from './BurnCharts';
import { useMemo } from 'react';
import { lotteryRoundBalance } from './lottery-balance';

export function BurnWalletPanel({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const fl = burnFl(loc);
  const b = burnOf(d);
  const rid = d.treasury?.currentRound?.id;
  const a = useMemo(() => (b ? burnAnalytics(b, rid) : null), [b, rid]);
  const wq = useGetDemoTreasuryWallets();
  const addr = wq.data?.wallets.find(w => w.purpose === 'buyback')?.address;
  return <section className="dcard grid gap-3 p-4 sm:p-5" data-testid="treasury-burn">
    <h2 className="display flex items-center gap-2 text-lg font-extrabold"><Flame className="h-5 w-5 text-[#D9591B]" aria-hidden="true" /><Term tip={x('Carteira dedicada e separada dos ativos operacionais e das suas carteiras pessoais. Recebe a parcela de recompra quando há lucro positivo elegível e as condições de distribuição são atendidas. Comprar BETTEX e queimá-los são etapas diferentes; o diário mostra os registros de cada etapa.', 'Dedicated wallet separate from operating assets and your personal wallets. Receives the buyback allocation when eligible profit is positive and distribution conditions are met. Buying BETTEX and burning it are different steps; the journal shows each step’s records.', 'Cartera dedicada separada de los activos operativos y tus carteras personales. Recibe la parte de recompra cuando la ganancia elegible es positiva y se cumplen las condiciones de distribución. Comprar BETTEX y quemarlos son pasos distintos; el diario muestra sus registros.')}>{x('Carteira de recompra e queima', 'Buyback-and-burn wallet', 'Cartera de recompra y quema')}</Term></h2>
    <p className="text-sm text-[#5B6B85]">{x('Regra documentada: 25% do lucro positivo elegível de cada rodada vai para uma carteira dedicada de recompra e queima. Nunca vêm de tarifas do operador nem de carteiras pessoais.', 'Documented rule: 25% of each round\'s eligible positive profit goes to a dedicated buyback-and-burn wallet. It never comes from operator fees or personal wallets.', 'Regla documentada: 25% de la ganancia positiva elegible de cada ronda va a una cartera dedicada de recompra y quema. Nunca viene de tarifas del operador ni de carteras personales.')}</p>
    {!b ? <p className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]" data-testid="treasury-burn-unavailable">{d.profile.provider === 'native' ? x('Indisponível no protocolo nativo: nenhum dado modelado é exibido.', 'Unavailable in the native protocol: no modeled data is shown.', 'No disponible en el protocolo nativo: no se muestran datos modelados.') : x('Não registrado: esta sessão não tem resumo de queima.', 'Not recorded: this session has no burn summary.', 'No registrado: esta sesión no tiene resumen de quema.')}</p> : <>
      <div className="rounded-2xl border-2 border-[#E8A56B] bg-gradient-to-br from-[#FFF1E0] to-[#FFD9B0] p-4" data-testid="treasury-burn-total">
        <div className="text-xs font-bold text-[#8F3A0E]"><Term tip={x('Soma dos tokens efetivamente queimados no modelo ao longo das rodadas. É cumulativa, não um saldo que pode ser gasto. USDC reservado e BETTEX apenas comprados não entram neste total. No demo, a queima não comprova uma transação real na blockchain.', 'Sum of tokens actually burned in the model across rounds. Cumulative, not a spendable balance. Reserved USDC and BETTEX only bought are excluded. In the demo, a burn does not prove a real blockchain transaction.', 'Suma de tokens realmente quemados en el modelo a lo largo de las rondas. Es acumulada, no un saldo gastable. Se excluyen USDC reservados y BETTEX solo comprados. En el demo, la quema no prueba una transacción real en blockchain.')}>{x('Total acumulado queimado', 'Cumulative burned total', 'Total acumulado quemado')}</Term></div>
        <p className="display break-words text-3xl font-extrabold tabular-nums text-[#5B2208]">{nf(fl, b.totalBurnedBettex, 0)} BETTEX</p>
      </div>
      <p className="rounded-xl bg-[#F5F1E8] px-3 py-2 text-xs text-[#5B6B85]" data-testid="burn-wallet-address">{x('Carteira de teste atribuída (Arbitrum Sepolia):', 'Assigned test wallet (Arbitrum Sepolia):', 'Cartera de prueba asignada (Arbitrum Sepolia):')} {wq.isLoading ? '…' : addr ? <><span className="mono break-all font-semibold">{addr}</span> <a href={explorerUrl(addr)} target="_blank" rel="noopener noreferrer" data-testid="link-burn-explorer" className="font-bold underline">{x('Explorer de teste', 'Test explorer', 'Explorer de prueba')}</a></> : <>{x('indisponível.', 'unavailable.', 'no disponible.')} <button type="button" className="font-bold underline" onClick={() => void wq.refetch()}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></>}</p>
      <p className="rounded-xl bg-[#FFF6EA] px-3 py-2 text-xs font-semibold text-[#8F3A0E]">{x('Comprado não é queimado, e o total queimado não é o saldo da carteira: o saldo só mostra o que ainda aguarda recompra ou queima.', 'Purchased is not burned, and total burned is not the wallet balance: the balance only shows what still awaits buyback or burn.', 'Comprado no es quemado, y el total quemado no es el saldo de la cartera: el saldo solo muestra lo que aún espera recompra o quema.')}</p>
      {a && b && <Dash a={a} b={b} fl={fl} x={x} roundId={rid} prov={rid ? lotteryRoundBalance(d.treasury?.currentRound?.realizedNetUsdc) : null} />}
      {a && <BurnCharts a={a} fl={fl} x={x} />}
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div><dt className="font-bold text-[#5B6B85]"><Term tip={x('Referência modelada em USDC por BETTEX para a recompra. Não é cotação garantida de execução nem confirmação de compra.', 'Modeled USDC-per-BETTEX reference for buyback. Not a guaranteed execution quote or purchase confirmation.', 'Referencia modelada en USDC por BETTEX para recompra. No es una cotización garantizada de ejecución ni confirmación de compra.')}>{x('Preço de referência', 'Reference price', 'Precio de referencia')}</Term></dt><dd className="tabular-nums">{nf(fl, b.referencePriceUsdc, 2)} USDC</dd></div>
        <div><dt className="font-bold text-[#5B6B85]"><Term tip={x('Última atualização registrada do resumo de recompra e queima, no horário de São Paulo. É diferente do prazo de encerramento da rodada.', 'Last recorded update of the buyback-and-burn summary, in São Paulo time. Different from the round closing deadline.', 'Última actualización registrada del resumen de recompra y quema, en horario de São Paulo. Es diferente del cierre de la ronda.')}>{x('Atualizado em', 'Updated at', 'Actualizado en')}</Term></dt><dd>{formatBrazilDateTime(b.updatedAt, fl)} {x('(São Paulo)', '(São Paulo)', '(São Paulo)')}</dd></div>
      </dl>
      <p className="text-xs text-[#5B6B85]">{x('Modelo de demonstração, sem transações reais. Os prazos de compra e queima são um roteiro autoral, não política econômica.', 'Demonstration model, no real transactions. Buy and burn timings are an authored script, not economic policy.', 'Modelo de demostración, sin transacciones reales. Los plazos de compra y quema son un guion autoral, no política económica.')}</p>
      <Link href={`${demoPath('wallet', loc)}?roundTab=burn#rh-panel-burn`} data-testid="link-treasury-burn-journal" className="inline-flex min-h-11 items-center justify-center self-start rounded-xl bg-[#D9591B] px-4 text-sm font-bold text-white hover:bg-[#B84A15]">{x('Abrir diário de recompra e queima', 'Open buyback-and-burn journal', 'Abrir diario de recompra y quema')}</Link>
    </>}
  </section>;
}

type X = (pt: string, en: string, es: string) => string;
function Block({ title, t, fl, x, id }: { title: string; t: BurnTotals; fl: string; x: X; id: string }) {
  const rows: [string, string][] = [
    [x('USDC financiado', 'USDC funded', 'USDC financiado'), `${nf(fl, t.fundedUsdc)} USDC`],
    [x('USDC gasto', 'USDC spent', 'USDC gastado'), `${nf(fl, t.spentUsdc)} USDC`],
    [x('BETTEX comprados', 'BETTEX purchased', 'BETTEX comprados'), nf(fl, t.purchasedBettex, 0)],
    [x('BETTEX recebidos', 'BETTEX received', 'BETTEX recibidos'), nf(fl, t.receivedBettex, 0)],
    [x('BETTEX queimados', 'BETTEX burned', 'BETTEX quemados'), nf(fl, t.burnedBettex, 0)],
    [x('Eventos / queimas', 'Events / burns', 'Eventos / quemas'), `${t.eventCount} / ${t.burnCount}`],
  ];
  return <div className="rounded-xl border border-[#F0D2B0] bg-white p-3" data-testid={id}>
    <h3 className="mb-2 text-xs font-extrabold text-[#8F3A0E]">{title}</h3>
    <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs">{rows.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-[#5B6B85]">{k}</dt><dd className="break-words font-bold tabular-nums">{v}</dd></div>)}</dl>
  </div>;
}
function Dash({ a, b, fl, x, roundId, prov }: { a: NonNullable<ReturnType<typeof burnAnalytics>>; b: NonNullable<ReturnType<typeof burnOf>>; fl: string; x: X; roundId?: string; prov: number | null }) {
  const hasRound = !!roundId;
  return <div className="grid gap-3">
    <div className="grid gap-2 sm:grid-cols-2" data-testid="burn-wallet-balances">
      <div className="rounded-xl bg-[#FFF6EA] p-3 text-xs"><div className="font-bold text-[#8F3A0E]">{x('Na carteira: USDC aguardando compra', 'In wallet: USDC awaiting purchase', 'En cartera: USDC esperando compra')}</div><div className="display text-lg font-extrabold tabular-nums">{nf(fl, b.walletUsdc)} USDC</div></div>
      <div className="rounded-xl bg-[#FFF6EA] p-3 text-xs"><div className="font-bold text-[#8F3A0E]">{x('Na carteira: BETTEX aguardando queima', 'In wallet: BETTEX awaiting burn', 'En cartera: BETTEX esperando quema')}</div><div className="display text-lg font-extrabold tabular-nums">{nf(fl, b.walletBettex, 0)} BETTEX</div></div>
    </div>
    {hasRound && <p className="rounded-xl border border-dashed border-[#E8A56B] px-3 py-2 text-xs text-[#8F3A0E]" data-testid="burn-round-provisional">{prov === null ? x('Alocação provisória da rodada: indisponível.', 'Provisional round allocation: unavailable.', 'Asignación provisional de la ronda: no disponible.') : x(`Alocação provisória da rodada (25% do lucro líquido realizado positivo): ${nf(fl, prov)} USDC. Não é dinheiro financiado nem saldo da carteira.`, `Provisional round allocation (25% of positive realized net profit): ${nf(fl, prov)} USDC. Not funded money nor wallet balance.`, `Asignación provisional de la ronda (25% de la ganancia neta realizada positiva): ${nf(fl, prov)} USDC. No es dinero financiado ni saldo de cartera.`)}</p>}
    <p className="text-xs text-[#5B6B85]" data-testid="burn-last">{a.latestBurn ? x('Última queima: ', 'Last burn: ', 'Última quema: ') + `${nf(fl, a.latestBurn.tokensBettex, 0)} BETTEX · ${formatBrazilDateTime(a.latestBurn.at, fl)} (São Paulo)` : x('Última queima: nenhuma registrada.', 'Last burn: none recorded.', 'Última quema: ninguna registrada.')}</p>
    <div className="grid gap-3 md:grid-cols-2">
      {a.current ? <Block id="burn-round-totals" title={`${x('Rodada atual (registrado)', 'Current round (recorded)', 'Ronda actual (registrado)')} · ${roundId}`} t={a.current} fl={fl} x={x} /> : <p className="rounded-xl bg-[#F5F1E8] p-3 text-xs font-semibold text-[#5B6B85]" data-testid="burn-round-unknown">{x('Rodada atual desconhecida: os totais da rodada não são exibidos (não é zero).', 'Current round unknown: round totals are not shown (not zero).', 'Ronda actual desconocida: no se muestran totales de la ronda (no es cero).')}</p>}
      <Block id="burn-lifetime-totals" title={x('Total histórico registrado', 'Lifetime recorded totals', 'Total histórico registrado')} t={a.all} fl={fl} x={x} />
    </div>
    {hasRound && a.current && a.current.eventCount === 0 && <p className="text-xs text-[#5B6B85]" data-testid="burn-round-empty">{b.totalBurnedBettex > 0 ? x('Nenhum evento registrado nesta rodada ainda; o total queimado vem de rodadas anteriores.', 'No events recorded in this round yet; the burned total comes from earlier rounds.', 'Ningún evento registrado en esta ronda aún; el total quemado viene de rondas anteriores.') : x('Nenhum evento registrado nesta rodada ainda.', 'No events recorded in this round yet.', 'Ningún evento registrado en esta ronda aún.')}</p>}
  </div>;
}
