/** @jsxImportSource react */
import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { getFormatLocale, t, useLocale } from '@/lib/i18n';

export const DAILY_RETURNS = [1, 0.5, 0.2, 0, 1] as const;

export function EarningsReturnChart() {
  useLocale();
  const fmt = (v: number) => `${new Intl.NumberFormat(getFormatLocale(), { maximumFractionDigits: 1 }).format(v)}%`;
  const data = DAILY_RETURNS.map((v, i) => ({ day: `${t('Dia')} ${i + 1}`, v }));
  return (
    <div className="ew-chart" data-testid="chart-earnings-returns" role="img"
      aria-label={`${t('Exemplo ilustrativo de retorno diário')}: ${DAILY_RETURNS.map((v, i) => `${t('Dia')} ${i + 1} ${fmt(v)}`).join(', ')}. ${t('Limite distribuível de 1% ao dia')}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 28, right: 8, bottom: 4, left: 8 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#c9d2ea' }} tick={{ fill: '#183173', fontSize: 12, fontWeight: 700 }} interval={0} />
          <YAxis hide domain={[0, 1.15]} />
          <ReferenceLine y={1} stroke="#F2B632" strokeWidth={2} strokeDasharray="6 4"
            label={{ value: t('Limite 1%'), position: 'top', dy: -18, fill: '#8a6208', fontSize: 12, fontWeight: 800 }} />
          <Bar dataKey="v" radius={[6, 6, 0, 0]} minPointSize={3} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.v === 0 ? '#c9d2ea' : '#2B59FF'} />)}
            <LabelList dataKey="v" position="top" formatter={(v: number) => fmt(v)} style={{ fill: '#070B1F', fontSize: 13, fontWeight: 800 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
