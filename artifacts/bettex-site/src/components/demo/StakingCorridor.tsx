/** @jsxImportSource react */
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Flame, Clock, Database } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { useStakingCorridor } from './use-staking-corridor';
import { formatBrazilDateTime, formatBrazilTime } from './brazil-time';
import { useClock } from './fin';

const MUTED = '#5B6B85';
export function StakingCorridor({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const { data: v, points, loading } = useStakingCorridor(d);
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const clock = useClock(d);
  const now = clock();
  const num = (n: number, dg = 2) => n.toLocaleString(fl, { minimumFractionDigits: dg, maximumFractionDigits: dg });
  const usd = (n: number) => `${num(n)} USDC`;
  const pct = (n: number) => `${n.toLocaleString(fl, { maximumSignificantDigits: 3 })}%`;
  const native = v.source === 'native';
  const na = native ? x('Indisponível no protocolo nativo', 'Unavailable in the native protocol', 'No disponible en el protocolo nativo') : x('Indisponível', 'Unavailable', 'No disponible');
  const end = v.nextCycleAt ? Date.parse(v.nextCycleAt) : NaN;
  const ms = Number.isFinite(end) ? Math.max(0, end - now) : null;
  const p2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
  const cd = ms === null ? null : `${p2(ms / 3600000)}:${p2((ms % 3600000) / 60000)}:${p2((ms % 60000) / 1000)}`;
  const lit = v.sharePercent === null ? 0 : Math.max(v.sharePercent > 0 ? 1 : 0, Math.min(5, Math.ceil(v.sharePercent / 20)));
  const fire = (on: boolean, i: number) => <Flame key={i} className="h-5 w-5" style={{ color: on ? '#C98A12' : '#D9D0BC' }} fill={on ? '#F2B632' : 'none'} aria-hidden="true" />;
  const metric = (id: string, label: string, value: string | null, sub?: string, flames?: boolean) => <div className="min-w-0 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3" data-testid={id}>
    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6B85]">{flames && <Flame className="h-3.5 w-3.5 text-[#C98A12]" aria-hidden="true" />}{label}</p>
    {loading && value === null ? <span className="mt-1 block h-6 w-24 animate-pulse rounded bg-[#E4DCCB]" /> : value === null ? <p className="mt-1 text-sm font-semibold text-[#5B6B85]">{na}</p> : <p className="display mt-1 break-words text-base font-extrabold tabular-nums sm:text-lg xl:text-xl">{value}</p>}
    {sub && value !== null && <p className="text-[11px] text-[#5B6B85]">{sub}</p>}
  </div>;
  const tm = (t: number) => formatBrazilTime(t, fl);
  const brt = x('Horário do Brasil', 'Brazil time', 'Horario de Brasil');
  const share = v.sharePercent;
  const pie = share === null ? [] : [{ name: x('Minha parte', 'My share', 'Mi parte'), value: Math.min(100, Math.max(0, share)), c: '#0E7C6B' }, { name: x('Demais participantes', 'Other participants', 'Otros participantes'), value: Math.max(0, 100 - share), c: '#E4DCCB' }];
  return <section className="dcard grid gap-4 p-4 sm:p-5" data-testid="staking-corridor" aria-label={x('Staking', 'Staking', 'Staking')}>
    <header className="flex flex-wrap items-start justify-between gap-2">
      <div><h2 className="display flex items-center gap-2 text-lg font-extrabold"><span className="flex">{[0, 1, 2, 3, 4].map(i => fire(i < lit, i))}</span>{x('Staking', 'Staking', 'Staking')}</h2>
        <p className="text-xs text-[#5B6B85]">{x('Elegibilidade em autocustódia, não é um cofre bloqueado.', 'Self-custody eligibility, not a locked vault.', 'Elegibilidad en autocustodia, no es una bóveda bloqueada.')}</p></div>
      <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
        <span className="mono inline-flex items-center gap-1 rounded-full bg-[#F0E9DA] px-2.5 py-1 text-[#5B6B85]" data-testid="staking-source"><Database className="h-3 w-3" aria-hidden="true" />{native ? v.readingAt ? x('EVM local · 31337', 'Local EVM · 31337', 'EVM local · 31337') : x('Carteira nativa', 'Native wallet', 'Cartera nativa') : x('Simulação demo', 'Demo simulation', 'Simulación demo')}</span>
        {v.stale && <span className="rounded-full bg-[#F6E7C1] px-2.5 py-1 text-[#8A5F00]" data-testid="staking-stale">{x('Dados desatualizados', 'Stale data', 'Datos desactualizados')}</span>}
        <span className={`rounded-full px-2.5 py-1 ${v.active ? 'bg-[#DDEBE4] text-[#0A6657]' : 'bg-[#F0E9DA] text-[#5B6B85]'}`}>{v.myTokens === null ? x('Dados indisponíveis', 'Data unavailable', 'Datos no disponibles') : v.active ? x('Ativa', 'Active', 'Activa') : x('Inativa', 'Inactive', 'Inactiva')}</span>
      </div>
    </header>
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      {metric('staking-mine', x('Meus BETTEX em staking', 'My staked BETTEX', 'Mis BETTEX en staking'), v.myTokens === null ? null : num(v.myTokens, 4), undefined, true)}
      {metric('staking-share', x('% dos tokens elegíveis', '% of eligible tokens', '% de tokens elegibles'), share === null ? null : pct(share), v.payoutWeightPercent === null ? undefined : `${x('Peso de pagamento (por tempo)', 'Payout weight (time-weighted)', 'Peso de pago (por tiempo)')}: ${pct(v.payoutWeightPercent)}`, true)}
      {metric('staking-total', x('BETTEX elegíveis no pool', 'Eligible BETTEX in pool', 'BETTEX elegibles en el pool'), v.totalTokens === null ? null : num(v.totalTokens, 2))}
      {metric('staking-cycle-profit', x('Lucro líquido do ciclo atual', 'Current cycle net profit', 'Ganancia neta del ciclo actual'), v.cycleProfitUsdc === null ? null : `${v.cycleProfitUsdc > 0 ? '+' : ''}${usd(v.cycleProfitUsdc)}`)}
      {metric('staking-round-allocation', x('Alocação da rodada ao pool', 'Round allocation to pool', 'Asignación de la ronda al pool'), v.roundAllocationUsdc === null ? null : usd(v.roundAllocationUsdc), x('Provisória: 25% do lucro líquido positivo; não é pagamento garantido.', 'Provisional: 25% of positive net profit; not a guaranteed payout.', 'Provisional: 25% de la ganancia neta positiva; no es un pago garantizado.'), true)}
    </div>
    <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="min-w-0 rounded-xl border border-[#E4DCCB] p-3" data-testid="staking-chart-history">
        <h3 className="text-sm font-bold">{x('Lucro e alocação no ciclo atual', 'Profit and allocation in current cycle', 'Ganancia y asignación en el ciclo actual')}</h3>
        <div className="mt-2 h-56">
          {points.length === 0 ? <p className="grid h-full place-content-center px-4 text-center text-sm text-[#5B6B85]">{native ? na : x('Coletando amostras reais da API…', 'Collecting real API samples…', 'Recopilando muestras reales de la API…')}</p> :
            <ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#E4DCCB" strokeDasharray="3 3" />
              <XAxis dataKey="at" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={tm} tick={{ fontSize: 11, fill: MUTED }} minTickGap={40} />
              <YAxis width={56} domain={['auto', 'auto']} tickFormatter={(n: number) => n.toLocaleString(fl, { maximumFractionDigits: 2 })} tick={{ fontSize: 11, fill: MUTED }} />
              <Tooltip labelFormatter={(t: number) => `${tm(t)} · ${brt}`} formatter={(n: number, k: string) => [usd(n), k === 'profit' ? x('Lucro líquido', 'Net profit', 'Ganancia neta') : x('Alocação', 'Allocation', 'Asignación')]} />
              <Line type="linear" dataKey="profit" stroke="#0A2342" strokeWidth={2} isAnimationActive={false} dot={points.length < 4} />
              <Line type="linear" dataKey="allocated" stroke="#C98A12" strokeWidth={2} isAnimationActive={false} dot={points.length < 4} />
            </LineChart></ResponsiveContainer>}
        </div>
        <p className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-[#5B6B85]"><span><span className="mr-1 inline-block h-0.5 w-4 bg-[#0A2342] align-middle" />{x('Lucro líquido', 'Net profit', 'Ganancia neta')}</span><span><span className="mr-1 inline-block h-0.5 w-4 bg-[#C98A12] align-middle" />{x('Alocação', 'Allocation', 'Asignación')}</span><span>{x('Leituras coletadas enquanto esta seção está aberta.', 'Readings collected while this section is open.', 'Lecturas recogidas mientras esta sección está abierta.')}</span></p>
      </div>
      <div className="min-w-0 rounded-xl border border-[#E4DCCB] p-3" data-testid="staking-chart-share">
        <h3 className="text-sm font-bold">{x('Composição da minha parte', 'My share composition', 'Composición de mi parte')}</h3>
        <div className="relative mt-2 h-40">
          {share === null ? <p className="grid h-full place-content-center px-4 text-center text-sm text-[#5B6B85]">{na}</p> :
            <><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pie} dataKey="value" innerRadius="62%" outerRadius="90%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>{pie.map(s => <Cell key={s.name} fill={s.c} />)}</Pie>
              <Tooltip formatter={(n: number, name: string) => [pct(n), name]} /></PieChart></ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-content-center text-center"><p className="display text-lg font-extrabold tabular-nums">{pct(share)}</p></div></>}
        </div>
        <p className="mt-1 text-[11px] text-[#5B6B85]">{x('Parte do saldo de tokens elegíveis; difere do peso de pagamento por tempo.', 'Share of eligible token balance; differs from the time-weighted payout weight.', 'Parte del saldo de tokens elegibles; difiere del peso de pago por tiempo.')}</p>
        {v.estimatedOwnUsdc !== null && <p className="mt-1 text-xs font-semibold" data-testid="staking-estimated">{x('Projeção, não recebido', 'Projection, not received', 'Proyección, no recibido')}: {usd(v.estimatedOwnUsdc)}</p>}
      </div>
    </div>
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5B6B85]">
      <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{x('Rodada fecha em', 'Round closes in', 'La ronda cierra en')} <b className="tabular-nums text-[#0A2342]" data-testid="staking-countdown">{cd ?? '—'}</b></span>
      {v.nextCycleAt && <span className="mono">{formatBrazilDateTime(v.nextCycleAt, fl)} · {brt}</span>}
      {v.readingAt && <span className="mono">{x('Leitura', 'Reading', 'Lectura')}: {formatBrazilDateTime(v.readingAt, fl)}</span>}
    </footer>
  </section>;
}
