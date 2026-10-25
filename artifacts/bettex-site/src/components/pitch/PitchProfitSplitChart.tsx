import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getFormatLocale } from '@/lib/i18n';
import { useX } from './pitchCopy';
import './PitchCharts.css';

const COLORS = ['#2B59FF', '#F2B632', '#F4F1E8'];

/** Exact distribution rule of eligible profit: 50% treasury, 25% eligible holders, 25% buyback and burn. */
export function PitchProfitSplitChart({ rows }: { rows: { name: string; pct: number }[] }) {
  const x = useX();
  const fl = getFormatLocale();
  const pct = (n: number) => `${n.toLocaleString(fl)}%`;
  return <figure className="pcc-profit" data-testid="pitch-profit-split-chart">
    <div className="pcc-profit__plot" role="img" data-i18n="translated" aria-label={rows.map(r => `${r.name}: ${pct(r.pct)}`).join('; ')}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="pct" nameKey="name" outerRadius="90%" startAngle={90} endAngle={-270} stroke="#070B1F" strokeWidth={3} isAnimationActive={false}>
            {rows.map((r, i) => <Cell key={r.name} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip position={{ x: 0, y: 0 }} wrapperStyle={{ maxWidth: '100%', pointerEvents: 'none' }} formatter={(v, name) => [pct(Number(v)), name]} contentStyle={{ backgroundColor: '#070B1F', border: '1px solid #2B59FF', borderRadius: 6, fontSize: 12, color: '#F4F1E8', whiteSpace: 'normal' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <figcaption>{x('% do lucro elegível. Sem lucro elegível, não há distribuição.', '% of eligible profit. Without eligible profit there is no distribution.', '% del beneficio elegible. Sin beneficio elegible no hay distribución.')}</figcaption>
  </figure>;
}
