/** @jsxImportSource react */
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Flame, Database } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { useStakingCorridor } from './use-staking-corridor';
import { Term } from './fin';
import { StakingRoundClock } from './StakingRoundClock';

const MUTED = '#5B6B85';
export function StakingCorridor({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const { data: v, points, loading, timeline } = useStakingCorridor(d);
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const p2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
  const end = v.nextCycleAt ? Date.parse(v.nextCycleAt) : NaN;
  const num = (n: number, dg = 2) => n.toLocaleString(fl, { minimumFractionDigits: dg, maximumFractionDigits: dg });
  const usd = (n: number) => `${num(n)} USDC`;
  const pct = (n: number) => `${n.toLocaleString(fl, { maximumSignificantDigits: 3 })}%`;
  const native = v.source === 'native';
  const na = native ? x('Indisponível no protocolo nativo', 'Unavailable in the native protocol', 'No disponible en el protocolo nativo') : x('Indisponível', 'Unavailable', 'No disponible');
  const lit = v.sharePercent === null ? 0 : Math.max(v.sharePercent > 0 ? 1 : 0, Math.min(5, Math.ceil(v.sharePercent / 20)));
  const fire = (on: boolean, i: number) => <Flame key={i} className="h-5 w-5" style={{ color: on ? '#C98A12' : '#D9D0BC' }} fill={on ? '#F2B632' : 'none'} aria-hidden="true" />;
  const metric = (id: string, label: string, tip: string, value: string | null, flames?: boolean, singleLine = false) => <div className="min-w-0 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3" data-testid={id}>
    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6B85]">{flames && <Flame className="h-3.5 w-3.5 text-[#C98A12]" aria-hidden="true" />}<Term tip={tip}><span className={singleLine ? 'whitespace-nowrap' : undefined}>{label}</span></Term></p>
    {loading && value === null ? <span className="mt-1 block h-6 w-24 animate-pulse rounded bg-[#E4DCCB]" /> : value === null ? <p className="mt-1 text-sm font-semibold text-[#5B6B85]">{na}</p> : <p className="display mt-1 break-words text-base font-extrabold tabular-nums sm:text-lg xl:text-xl">{value}</p>}
  </div>;
  const start = v.cycleStartedAt ? Date.parse(v.cycleStartedAt) : NaN;
  const hasDomain = Number.isFinite(start) && Number.isFinite(end) && end > start;
  const t0 = hasDomain ? start : points[0]?.at ?? 0;
  const t1 = hasDomain ? end : points[points.length - 1]?.at ?? 1;
  const hl = (t: number) => `${Math.round((t - t0) / 3600000)}h`;
  const elapsedLabel = (t: number) => {
    const minutes = Math.max(0, Math.round((t - t0) / 60000));
    return `${Math.floor(minutes / 60)}h ${p2(minutes % 60)}m`;
  };
  const ticks = Array.from({ length: 7 }, (_, i) => t0 + (t1 - t0) * i / 6);
  const cursor = timeline ? t0 + timeline.elapsedMinutes * 60000 : null;
  const cur = v.estimatedOwnUsdc;
  const proj = timeline ? timeline.projectedOwnUsdc : null;
  const signed = (n: number) => `${n > 0 ? '+' : ''}${usd(n)}`;
  return <section className="dcard grid gap-4 p-4 sm:p-5" data-testid="staking-corridor" aria-label={x('Staking', 'Staking', 'Staking')}>
    <header className="flex flex-wrap items-start justify-between gap-2">
      <h2 className="display flex items-center gap-2 text-lg font-extrabold"><span className="flex">{[0, 1, 2, 3, 4].map(i => fire(i < lit, i))}</span>
        <Term tip={x('Elegibilidade em autocustódia, não é um cofre bloqueado. Seus BETTEX continuam na sua carteira.', 'Self-custody eligibility, not a locked vault. Your BETTEX stay in your wallet.', 'Elegibilidad en autocustodia, no es una bóveda bloqueada. Tus BETTEX siguen en tu cartera.')}>{x('Staking', 'Staking', 'Staking')}</Term></h2>
      <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
        <span className="mono inline-flex items-center gap-1 rounded-full bg-[#F0E9DA] px-2.5 py-1 text-[#5B6B85]" data-testid="staking-source"><Database className="h-3 w-3" aria-hidden="true" />{native ? v.readingAt ? x('EVM local · 31337', 'Local EVM · 31337', 'EVM local · 31337') : x('Carteira nativa', 'Native wallet', 'Cartera nativa') : x('Ambiente de teste', 'Test environment', 'Entorno de prueba')}</span>
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
      <div className="min-w-0 rounded-xl border border-[#E4DCCB] p-3" data-testid="staking-chart-history">
        <h3 className="text-sm font-bold"><Term tip={x('No demo, o gráfico usa o mesmo roteiro e resultado da tesouraria, de 16h às 16h de São Paulo. Linhas sólidas: eventos já programados e registrados; tracejada: restante do roteiro, não previsão de mercado. Nenhum dinheiro real é movimentado.', 'In the demo, this chart uses the same storyline and result as the treasury, from 16:00 to 16:00 São Paulo time. Solid lines: scheduled events already recorded; dashed: the remaining storyline, not a market forecast. No real money moves.', 'En el demo, el gráfico usa el mismo guion y resultado que la tesorería, de 16:00 a 16:00 de São Paulo. Líneas sólidas: eventos programados ya registrados; discontinua: resto del guion, no previsión de mercado. No se mueve dinero real.')}>{x('Lucro e alocação no ciclo de 24h', 'Profit and allocation over the 24h cycle', 'Ganancia y asignación en el ciclo de 24h')}</Term></h3>
        <div className="mt-2 h-60">
          {points.length === 0 ? <p className="grid h-full place-content-center px-4 text-center text-sm text-[#5B6B85]">{native ? na : x('Carregando ciclo…', 'Loading cycle…', 'Cargando ciclo…')}</p> :
            <ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#E4DCCB" strokeDasharray="3 3" />
              <XAxis dataKey="at" type="number" scale="linear" domain={[t0, t1]} ticks={ticks} tickFormatter={hl} tick={{ fontSize: 11, fill: MUTED }} />
              <YAxis width={56} domain={['auto', 'auto']} tickFormatter={(n: number) => n.toLocaleString(fl, { maximumFractionDigits: 0 })} tick={{ fontSize: 11, fill: MUTED }} />
              <Tooltip labelFormatter={(t: number) => elapsedLabel(t)} wrapperStyle={{ maxWidth: 'min(260px, 80vw)' }} formatter={(n: number, k: string) => [usd(n), k === 'profit' ? x('Lucro líquido', 'Net profit', 'Ganancia neta') : k === 'allocated' ? x('Alocação', 'Allocation', 'Asignación') : x('Projeção', 'Projection', 'Proyección')]} />
              <ReferenceLine y={0} stroke="#1B2A41" strokeWidth={1.5} />
              <ReferenceLine x={t1} stroke="#5B6B85" strokeDasharray="3 3" />
              {cursor !== null && <ReferenceLine x={cursor} stroke="#0E7C6B" strokeWidth={2} label={{ value: elapsedLabel(cursor), position: 'insideTopLeft', fontSize: 11, fill: '#0E7C6B' }} />}
              <Line type="linear" dataKey="profit" stroke="#0A2342" strokeWidth={2} isAnimationActive={false} dot={false} connectNulls={false} />
              <Line type="linear" dataKey="allocated" stroke="#C98A12" strokeWidth={2} isAnimationActive={false} dot={false} connectNulls={false} />
              <Line type="linear" dataKey="forecast" stroke="#0E7C6B" strokeWidth={2} strokeDasharray="5 4" isAnimationActive={false} dot={false} connectNulls={false} />
            </LineChart></ResponsiveContainer>}
        </div>
        <p className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-[#5B6B85]"><span><span className="mr-1 inline-block h-0.5 w-4 bg-[#0A2342] align-middle" />{x('Lucro líquido', 'Net profit', 'Ganancia neta')}</span><span><span className="mr-1 inline-block h-0.5 w-4 bg-[#C98A12] align-middle" />{x('Alocação', 'Allocation', 'Asignación')}</span><span><span className="mr-1 inline-block h-0 w-4 border-t-2 border-dashed border-[#0E7C6B] align-middle" />{x('Projeção', 'Projection', 'Proyección')}</span></p>
      </div>
      <StakingRoundClock serverNow={d.serverNow} nextCycleAt={v.nextCycleAt} native={native} timeline={timeline} current={cur} projected={proj} loading={!!loading} na={na} fl={fl} />
    </div>
  </section>;
}
