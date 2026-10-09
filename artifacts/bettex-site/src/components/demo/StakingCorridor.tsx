/** @jsxImportSource react */
import { Coins, Database, Activity } from 'lucide-react';
import { Link } from 'wouter';
import { demoPath } from './demo-navigation';
import { AgentShowcase } from './AgentShowcase';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { useStakingCorridor } from './use-staking-corridor';
import { Term } from './fin';
import { StakingRoundClock } from './StakingRoundClock';
import { RoundIdentity } from './RoundIdentity';
import { StakingMinuteChart } from './StakingMinuteChart';

export function StakingCorridor({ d, showAgents = false }: { d: DemoDashboard; showAgents?: boolean }) {
  const { x, loc } = useX();
  const { data: v, points, loading, timeline } = useStakingCorridor(d);
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const end = v.nextCycleAt ? Date.parse(v.nextCycleAt) : NaN;
  const num = (n: number, dg = 2) => n.toLocaleString(fl, { minimumFractionDigits: dg, maximumFractionDigits: dg });
  const usd = (n: number) => `${num(n)} USDC`;
  const pct = (n: number) => `${n.toLocaleString(fl, { maximumSignificantDigits: 3 })}%`;
  const native = v.source === 'native';
  const na = native ? x('Indisponível no protocolo nativo', 'Unavailable in the native protocol', 'No disponible en el protocolo nativo') : x('Indisponível', 'Unavailable', 'No disponible');
  const lit = v.sharePercent === null ? 0 : Math.max(v.sharePercent > 0 ? 1 : 0, Math.min(5, Math.ceil(v.sharePercent / 20)));
  const coin = (on: boolean, i: number) => <Coins key={i} className="h-5 w-5" style={{ color: on ? '#C98A12' : '#D9D0BC' }} aria-hidden="true" />;
  const metric = (id: string, label: string, tip: string, value: string | null, showCoins?: boolean, singleLine = false) => <div className="min-w-0 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3" data-testid={id}>
    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6B85]">{showCoins && <Coins className="h-3.5 w-3.5 text-[#C98A12]" aria-hidden="true" />}<Term tip={tip}><span className={singleLine ? 'whitespace-nowrap' : undefined}>{label}</span></Term></p>
    {loading && value === null ? <span className="mt-1 block h-6 w-24 animate-pulse rounded bg-[#E4DCCB]" /> : value === null ? <p className="mt-1 text-sm font-semibold text-[#5B6B85]">{na}</p> : <p className="display mt-1 break-words text-base font-extrabold tabular-nums sm:text-lg xl:text-xl">{value}</p>}
  </div>;
  const start = v.cycleStartedAt ? Date.parse(v.cycleStartedAt) : NaN;
  const hasDomain = Number.isFinite(start) && Number.isFinite(end) && end > start;
  const t0 = hasDomain ? start : points[0]?.at ?? 0;
  const cur = v.estimatedOwnUsdc;
  const proj = timeline ? timeline.projectedOwnUsdc : null;
  const signed = (n: number) => `${n > 0 ? '+' : ''}${usd(n)}`;
  return <section className="dcard grid gap-4 p-4 sm:p-5" data-testid="staking-corridor" aria-label={x('Staking', 'Staking', 'Staking')}>
    <header className="flex flex-wrap items-start justify-between gap-2">
      <h2 className="display flex items-center gap-2 text-lg font-extrabold"><span className="flex">{[0, 1, 2, 3, 4].map(i => coin(i < lit, i))}</span>
        <Term tip={x('Elegibilidade em autocustódia, não é um cofre bloqueado. Seus BETTEX continuam na sua carteira.', 'Self-custody eligibility, not a locked vault. Your BETTEX stay in your wallet.', 'Elegibilidad en autocustodia, no es una bóveda bloqueada. Tus BETTEX siguen en tu cartera.')}>{x('Staking', 'Staking', 'Participación')}</Term></h2>
      <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
        {!native && d.treasury.currentRound && <RoundIdentity id={d.treasury.currentRound.id} testId="staking-round-id" />}
        <span className="mono inline-flex items-center gap-1 rounded-full bg-[#F0E9DA] px-2.5 py-1 text-[#5B6B85]" data-testid="staking-source"><Database className="h-3 w-3" aria-hidden="true" />{native ? v.readingAt ? x('EVM local · 31337', 'Local EVM · 31337', 'EVM local · 31337') : x('Carteira nativa', 'Native wallet', 'Cartera nativa') : x('Dados mock', 'Mock data', 'Datos mock')}</span>
        {v.stale && <span className="rounded-full bg-[#F6E7C1] px-2.5 py-1 text-[#8A5F00]" data-testid="staking-stale">{x('Dados desatualizados', 'Stale data', 'Datos desactualizados')}</span>}
        <span className={`rounded-full px-2.5 py-1 ${v.active ? 'bg-[#DDEBE4] text-[#0A6657]' : 'bg-[#F0E9DA] text-[#5B6B85]'}`}>{v.myTokens === null ? x('Dados indisponíveis', 'Data unavailable', 'Datos no disponibles') : v.active ? x('Ativa', 'Active', 'Activa') : x('Inativa', 'Inactive', 'Inactiva')}</span>
      </div>
    </header>
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      {metric('staking-mine', x('Meus BETTEX em staking', 'My staked BETTEX', 'Mis BETTEX en staking'), x('Quantidade de BETTEX seus que estão elegíveis neste momento.', 'Amount of your BETTEX that is eligible right now.', 'Cantidad de tus BETTEX elegibles en este momento.'), v.myTokens === null ? null : num(Math.floor(v.myTokens), 0), true)}
      {metric('staking-share', x('% dos tokens elegíveis', '% of eligible tokens', '% de tokens elegibles'), x('Sua parte do saldo de tokens elegíveis. O peso de pagamento é ponderado por tempo e pode diferir.', 'Your share of the eligible token balance. The payout weight is time-weighted and may differ.', 'Tu parte del saldo de tokens elegibles. El peso de pago se pondera por tiempo y puede diferir.') + (v.payoutWeightPercent === null ? '' : ` ${pct(v.payoutWeightPercent)}`), v.sharePercent === null ? null : pct(v.sharePercent), true)}
      {metric('staking-total', x('BETTEX elegíveis no pool', 'Eligible BETTEX in pool', 'BETTEX elegibles en el pool'), x('Total de BETTEX elegíveis de todos os participantes.', 'Total eligible BETTEX across all participants.', 'Total de BETTEX elegibles de todos los participantes.'), v.totalTokens === null ? null : num(Math.floor(v.totalTokens), 0))}
      {metric('staking-cycle-profit', x('Lucro líquido', 'Net profit', 'Ganancia neta'), x('Resultado líquido acumulado do ciclo até agora. Pode ser negativo.', 'Net result accumulated in the cycle so far. It can be negative.', 'Resultado neto acumulado del ciclo hasta ahora. Puede ser negativo.'), v.cycleProfitUsdc === null ? null : signed(v.cycleProfitUsdc), false, true)}
      {metric('staking-round-allocation', x('Alocação pool', 'Pool allocation', 'Asignación pool'), x('Provisória: 25% do lucro líquido positivo; não é pagamento garantido.', 'Provisional: 25% of positive net profit; not a guaranteed payout.', 'Provisional: 25% de la ganancia neta positiva; no es un pago garantizado.'), v.roundAllocationUsdc === null ? null : usd(v.roundAllocationUsdc), true, true)}
    </div>
    <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col rounded-xl border border-[#E4DCCB] p-3" data-testid="staking-chart-history">
        <h3 className="text-sm font-bold"><Term tip={x('Cada registro mostra a diferença entre o resultado líquido no início e no fim daquela hora, não o total da rodada. O demo segue o roteiro da tesouraria, de 16h às 16h de São Paulo. Horas incompletas são identificadas; projeções não são tratadas como registros. Nenhum dinheiro real é movimentado.', 'Each record shows the difference between net results at the beginning and end of that hour, not the round total. The demo follows the treasury storyline, from 16:00 to 16:00 São Paulo time. Incomplete hours are identified; projections are not treated as records. No real money moves.', 'Cada registro muestra la diferencia entre el resultado neto al inicio y al final de esa hora, no el total de la ronda. El demo sigue el guion de la tesorería, de 16:00 a 16:00 de São Paulo. Las horas incompletas se identifican; las proyecciones no se tratan como registros. No se mueve dinero real.')}>{x('Resultado do staking por hora', 'Hourly staking result', 'Resultado del staking por hora')}</Term></h3>
        <StakingMinuteChart points={points} t0={t0} timeline={timeline} empty={native ? na : x('Carregando ciclo…', 'Loading cycle…', 'Cargando ciclo…')} fl={fl} usd={usd} />
        <Link href={demoPath('central', loc)} data-testid="staking-live-trading" className="group mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#0A6657]">
          <Activity className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{x('Trades ao vivo', 'Live trades', 'Trades en vivo')}</span>
        </Link>
      </div>
      <StakingRoundClock serverNow={d.serverNow} nextCycleAt={v.nextCycleAt} native={native} timeline={timeline} current={cur} projected={proj} loading={!!loading} na={na} fl={fl} />
    </div>
    {showAgents && <AgentShowcase showOtherAgents={false} />}
  </section>;
}
