/** @jsxImportSource react */
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { burnAnalytics } from './burn-analytics';
import { formatBrazilDateTime } from './brazil-time';
import { nf } from './burn-format';
import './BurnCharts.css';

type A = ReturnType<typeof burnAnalytics>;
type X = (pt: string, en: string, es: string) => string;

export function BurnCharts({ a, fl, x }: { a: A; fl: string; x: X }) {
  const compact = (n: number) => n.toLocaleString(fl, { notation: 'compact', maximumFractionDigits: 1 });
  const day = (t: number) => formatBrazilDateTime(t, fl, { day: '2-digit', month: '2-digit' });
  const full = (t: number) => formatBrazilDateTime(t, fl, { dateStyle: 'short', timeStyle: 'short' }) + ' (São Paulo)';
  const rounds = a.rounds.map(r => ({ ...r, label: r.roundId.length > 8 ? '…' + r.roundId.slice(-6) : r.roundId }));
  const empty = (t: string) => <p className="bc-empty">{t}</p>;
  const lblA = x('Gráfico: total queimado acumulado ao longo do tempo, em BETTEX', 'Chart: cumulative burned total over time, in BETTEX', 'Gráfico: total quemado acumulado a lo largo del tiempo, en BETTEX');
  const lblB = x('Gráfico: BETTEX comprados e queimados por rodada', 'Chart: BETTEX purchased and burned by round', 'Gráfico: BETTEX comprados y quemados por ronda');
  return <div className="bc-grid" data-testid="burn-charts">
    <figure className="bc-fig" data-testid="chart-burn-timeline">
      <figcaption>{x('Queima acumulada (BETTEX)', 'Cumulative burn (BETTEX)', 'Quema acumulada (BETTEX)')}</figcaption>
      {a.timeline.length === 0 ? empty(x('Sem eventos registrados para traçar.', 'No recorded events to plot.', 'Sin eventos registrados para trazar.')) :
        <div className="bc-box" role="img" aria-label={lblA}><ResponsiveContainer width="100%" height="100%">
          <AreaChart data={a.timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#F0E3D2" vertical={false} />
            <XAxis dataKey="at" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={day} tick={{ fontSize: 10, fill: '#5B6B85' }} minTickGap={24} />
            <YAxis tickFormatter={compact} tick={{ fontSize: 10, fill: '#5B6B85' }} width={44} />
            <Tooltip labelFormatter={(t) => full(Number(t))} formatter={(v) => [`${nf(fl, Number(v), 0)} BETTEX`, x('Queimado', 'Burned', 'Quemado')]} />
            <Area type="stepAfter" dataKey="burnedBettex" stroke="#D9591B" strokeWidth={2} fill="#F59A55" fillOpacity={0.35} />
          </AreaChart></ResponsiveContainer></div>}
    </figure>
    <figure className="bc-fig" data-testid="chart-burn-rounds">
      <figcaption>{x('Compras e queima por rodada (BETTEX)', 'Purchases vs burn by round (BETTEX)', 'Compras y quema por ronda (BETTEX)')}</figcaption>
      {rounds.length === 0 ? empty(x('Sem rodadas registradas.', 'No recorded rounds.', 'Sin rondas registradas.')) :
        <div className="bc-box" role="img" aria-label={lblB}><ResponsiveContainer width="100%" height="100%">
          <BarChart data={rounds} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#F0E3D2" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5B6B85' }} />
            <YAxis tickFormatter={compact} tick={{ fontSize: 10, fill: '#5B6B85' }} width={44} />
            <Tooltip labelFormatter={(_, p) => `${x('Rodada', 'Round', 'Ronda')} ${p?.[0]?.payload?.roundId ?? ''}`} formatter={(v, n) => [`${nf(fl, Number(v), 0)} BETTEX`, n]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="purchasedBettex" name={x('Comprados', 'Purchased', 'Comprados')} fill="#F2B880" radius={[3, 3, 0, 0]} />
            <Bar dataKey="burnedBettex" name={x('Queimados', 'Burned', 'Quemados')} fill="#D9591B" radius={[3, 3, 0, 0]} />
          </BarChart></ResponsiveContainer></div>}
      <p className="mt-2 text-[11px] leading-relaxed text-[#5B6B85]">{x('As queimas também incluem BETTEX recebidos pela compra de números da loteria, sem recompra.', 'Burns also include BETTEX received from lottery-number purchases, without buyback.', 'Las quemas también incluyen BETTEX recibidos por compras de números de la lotería, sin recompra.')}</p>
    </figure>
    {a.openingBurned > 0 && <p className="bc-note">{x(`Cobertura incompleta: ${nf(fl, a.openingBurned, 0)} BETTEX queimados antes do diário registrado não aparecem por rodada; o gráfico parte desse saldo.`, `Incomplete coverage: ${nf(fl, a.openingBurned, 0)} BETTEX burned before the recorded journal are not shown by round; the chart starts from that amount.`, `Cobertura incompleta: ${nf(fl, a.openingBurned, 0)} BETTEX quemados antes del diario registrado no aparecen por ronda; el gráfico parte de ese monto.`)}</p>}
  </div>;
}
