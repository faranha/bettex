import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { t, useLocale } from '@/lib/i18n';
import './EmploymentLossCharts.css';

const TOTAL_CUTS = 573195;
const AI_CUTS = 120136;
const COLORS = ['#ff7981', '#617298'];
type Slice = { label: string; value: number };

function LossDonut({ rows, label }: { rows: Slice[]; label: string }) {
  const locale = useLocale();
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return <figure className="employment-loss-figure">
    <div className="employment-loss-stage employment-loss-stage--donut" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 190 }}>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="label" innerRadius="48%" outerRadius="82%" startAngle={90} endAngle={-270} paddingAngle={2} stroke="none" isAnimationActive={false}>
            {rows.map((row, i) => <Cell key={row.label} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip wrapperStyle={{ maxWidth: 'calc(100vw - 64px)', pointerEvents: 'none' }} content={({ active, payload }) => {
            const row = payload?.[0]?.payload;
            return active && row ? <div className="us-jobs-tooltip"><strong>{row.label}</strong><p>{number(row.value)} · {new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(row.value / total * 100)}%</p></div> : null;
          }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <figcaption className="employment-loss-legend">{rows.map((row, i) => <div key={row.label}><i style={{ backgroundColor: COLORS[i] }} aria-hidden="true" /><span>{row.label}</span><strong>{number(row.value)}</strong></div>)}</figcaption>
  </figure>;
}

export function FinancialLossChart() {
  return <><LossDonut label={t('Gráfico da composição das 129 mil perdas líquidas de postos no setor financeiro')} rows={[
    { label: t('Seguros e atividades relacionadas'), value: 90000 },
    { label: t('Demais atividades financeiras'), value: 129000 - 90000 },
  ]} /><p className="employment-loss-note">Demais atividades: diferença entre a perda total e a perda em seguros.</p></>;
}

export function AICutsChart() {
  return <><LossDonut label={t('Gráfico da proporção de cortes anunciados com IA citada como motivo')} rows={[
    { label: t('IA citada como motivo'), value: AI_CUTS },
    { label: t('Outros motivos'), value: TOTAL_CUTS - AI_CUTS },
  ]} /><p className="employment-loss-note">Participação nos 573.195 cortes anunciados em janeiro a setembro de 2026.</p></>;
}

export function TechnologyCutsChart() {
  const locale = useLocale();
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const rows = [{ year: '2025', cuts: 107878 }, { year: '2026', cuts: 165925 }];
  const axis = { stroke: '#c5d2f1', fontSize: 11, tickLine: false, axisLine: false };
  return <figure className="employment-loss-figure">
    <div className="employment-loss-stage" role="img" aria-label={t('Gráfico do aumento de 54% nos cortes anunciados em tecnologia entre 2025 e 2026')}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
        <BarChart data={rows} margin={{ top: 25, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#29334e" vertical={false} />
          <XAxis {...axis} dataKey="year" />
          <YAxis {...axis} domain={[0, 'auto']} width={35} tickFormatter={value => number(value / 1000)} />
          <Tooltip wrapperStyle={{ maxWidth: 'calc(100vw - 64px)', pointerEvents: 'none' }} content={({ active, payload }) => {
            const row = payload?.[0]?.payload;
            return active && row ? <div className="us-jobs-tooltip"><strong>{row.year}</strong><p>{number(row.cuts)} {t('cortes anunciados')}</p></div> : null;
          }} />
          <Bar dataKey="cuts" maxBarSize={66} isAnimationActive={false}>
            <Cell fill="#617298" /><Cell fill="#ff7981" />
            <LabelList dataKey="cuts" position="top" fill="#f4f1e8" fontSize={12} formatter={(value: unknown) => number(Number(value))} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <figcaption className="employment-loss-note">Janeiro a setembro em ambos os anos. Eixo em milhares de cortes anunciados, começando em zero.</figcaption>
  </figure>;
}