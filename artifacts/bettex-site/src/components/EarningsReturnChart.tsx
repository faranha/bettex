/** @jsxImportSource react */
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { getFormatLocale, t, useLocale } from '@/lib/i18n';

export const DAILY_RETURNS = [1, 0.5, 0.2, 0, 1] as const;

export function EarningsReturnChart() {
  useLocale();
  const fmt = (v: number) => `${new Intl.NumberFormat(getFormatLocale(), { maximumFractionDigits: 1 }).format(v)}%`;
  const data = DAILY_RETURNS.map((v, i) => ({ day: `${t('Dia')} ${i + 1}`, v }));
  return (
    <div className="ew-chart" data-testid="chart-earnings-returns" role="img"
      aria-label={`${t('Visão BETTEX')}: ${DAILY_RETURNS.map((v, i) => `${t('Dia')} ${i + 1} ${fmt(v)}`).join(', ')}. ${t('Limite distribuível de 1% ao dia')}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 34, right: 8, bottom: 4, left: 8 }}>
          <defs><linearGradient id="ew-bar-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2B632" /><stop offset="0.35" stopColor="#5F86FF" /><stop offset="1" stopColor="#2B59FF" /></linearGradient></defs>
          <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: 'rgba(174,187,227,.45)' }} tick={{ fill: '#dfe6ff', fontSize: 13, fontWeight: 700 }} interval={0} />
          <YAxis hide domain={[0, 1.15]} />
          <Bar dataKey="v" radius={[10, 10, 0, 0]} background={{ fill: 'rgba(95,134,255,.12)', radius: 10 } as never} maxBarSize={72} minPointSize={3} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.v === 0 ? 'rgba(223,230,255,.28)' : 'url(#ew-bar-fill)'} />)}
            <LabelList dataKey="v" position="top" formatter={(v: number) => fmt(v)} style={{ fill: '#fff', fontSize: 16, fontWeight: 800 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
