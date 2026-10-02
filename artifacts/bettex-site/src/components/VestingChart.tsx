import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTokenCount } from '@/lib/tokenomics';
import { vestingSchedule } from '@/lib/vesting';

const series = [
  { key: 'publicSale', label: 'Venda pública · 50%', color: '#0a256f' },
  { key: 'team', label: 'Fundador e time · 25%', color: '#436dd0' },
  { key: 'investors', label: 'Investidores e fundo · 25%', color: '#e6a920' },
] as const;

const cumulative = { publicSale: 0, team: 0, investors: 0 };
const chartData = [
  { month: 0, ...cumulative },
  ...vestingSchedule.map(row => {
    cumulative.publicSale += row.publicSale;
    cumulative.team += row.team;
    cumulative.investors += row.investors;
    return { month: row.month, ...cumulative };
  }),
];

export function VestingChart() {
  return (
    <figure className="whitepaper__vesting-chart" id="documentacao-grafico-vesting">
      <figcaption>
        <h5>Vesting e liberação acumulada</h5>
        <p>As três destinações são liberadas mensalmente, até completar 1 bilhão de BETTEX no mês 36. Cada degrau representa uma nova parcela.</p>
      </figcaption>
      <ul className="whitepaper__vesting-legend" aria-label="Destinações do token">
        {series.map(item => <li key={item.key}><i style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}</li>)}
      </ul>
      <div className="whitepaper__vesting-chart-body" aria-label="Gráfico de áreas empilhadas da liberação acumulada nos 36 meses">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }} accessibilityLayer>
            <CartesianGrid stroke="#d9d3c0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" type="number" domain={[0, 36]} ticks={[0, 6, 12, 18, 24, 30, 36]} tickFormatter={value => `${value}`} tick={{ fill: '#13204F', fontSize: 12 }} />
            <YAxis type="number" domain={[0, 1_000_000_000]} ticks={[0, 250_000_000, 500_000_000, 750_000_000, 1_000_000_000]} width={66} tickFormatter={value => value === 1_000_000_000 ? '1 bi' : value === 0 ? '0' : `${value / 1_000_000} mi`} tick={{ fill: '#13204F', fontSize: 12 }} />
            <Tooltip
              labelFormatter={label => Number(label) === 0 ? 'Antes da abertura da venda pública' : `Mês ${label}`}
              formatter={(value, name) => [`${formatTokenCount(Number(value))} BETTEX`, name]}
              contentStyle={{ backgroundColor: '#F4F1E8', border: '1px solid #d9d3c0', borderRadius: 0, fontSize: 12, color: '#13204F' }}
            />
            {series.map(item => <Area key={item.key} type="stepAfter" dataKey={item.key} name={item.label} stackId="vesting" stroke={item.color} fill={item.color} fillOpacity={0.85} isAnimationActive={false} />)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="whitepaper__vesting-chart-note">Eixo horizontal: meses desde a abertura da venda pública. Eixo vertical: BETTEX liberados acumulados. Mês 0 = antes da primeira liberação. A tabela abaixo contém as quantidades exatas; liberação não significa venda realizada.</p>
    </figure>
  );
}