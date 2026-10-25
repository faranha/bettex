import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getFormatLocale } from '@/lib/i18n';
import { marketFlow } from './marketFlow';
import { useX } from './pitchCopy';
import './PitchCharts.css';

export const BETS_URL = 'https://www.gov.br/mj/pt-br/assuntos/noticias-1/governo-federal-amplia-fiscalizacao-contra-bets-ilegais';
const BETS_DAILY_BRL = 600_000_000;

/** Average daily flow, R$ billions: crypto = R$283bn / 181 calendar days; bets = ~R$600m/day historical deposits.
 *  Renders only the plot (dark stage); caption, units and sources live in the carousel panel. */
export function AudienceFlowChart() {
  const x = useX();
  const fl = getFormatLocale();
  const unit = x('bi', 'bn', 'mil M');
  const fmt = (n: number) => `R$ ${n.toLocaleString(fl, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
  const cryptoV = marketFlow.cryptoDailyAverageBrl / 1e9;
  const betsV = BETS_DAILY_BRL / 1e9;
  const data = [
    { key: 'crypto', name: x('Cripto: operações', 'Crypto: operations', 'Cripto: operaciones'), v: cryptoV, label: fmt(cryptoV), color: '#2B59FF' },
    { key: 'bets', name: x('Bets: depósitos', 'Bets: deposits', 'Bets: depósitos'), v: betsV, label: fmt(betsV), color: '#F2B632' },
  ];
  const perDay = x('Por dia', 'Per day', 'Por día');
  const aria = x('Gráfico de barras comparando o volume médio diário de cripto e de depósitos em bets, em R$ bilhões por dia', 'Bar chart comparing average daily crypto volume and bet deposits, in R$ billions per day', 'Gráfico de barras que compara el volumen medio diario de cripto y de depósitos en bets, en miles de millones de R$ por día');
  return <div className="mk-chart" data-testid="audience-flow-chart" role="img" aria-label={aria}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24, right: 8, bottom: 8, left: 0 }}>
        <XAxis type="category" dataKey="name" interval={0} tick={{ fill: '#F4F1E8', fontSize: 11 }} stroke="rgba(197,210,241,.4)" />
        <YAxis type="number" domain={[0, 2]} ticks={[0, 1, 2]} width={28} tick={{ fill: '#c5d2f1', fontSize: 11 }} stroke="rgba(197,210,241,.4)" />
        <Tooltip cursor={{ fill: 'rgba(95,134,255,.12)' }} formatter={(_v, _n, item) => [item.payload.label, perDay]} contentStyle={{ backgroundColor: '#070B1F', border: '1px solid rgba(95,134,255,.5)', borderRadius: 6, fontSize: 12, color: '#F4F1E8' }} />
        <Bar dataKey="v" radius={[6, 6, 0, 0]} barSize={48} isAnimationActive={false}>
          {data.map(d => <Cell key={d.key} fill={d.color} />)}
          <LabelList dataKey="label" position="top" fill="#F4F1E8" fontSize={11} fontWeight={800} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>;
}
