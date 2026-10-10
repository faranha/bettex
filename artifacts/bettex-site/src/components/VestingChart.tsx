import { useContext, useState, type PointerEvent } from 'react';
import { ChapterVisibility } from './ChapterVisibility';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTokenCount, documentationTokenomics as tokenomics } from '@/lib/tokenomics';
import { documentationVestingSchedule as vestingSchedule } from '@/lib/documentation-vesting';
import { chartTooltipTrigger, type ChartTooltipTrigger } from '@/lib/chart-input';

function useVestingInput() {
  const [trigger, setTrigger] = useState<ChartTooltipTrigger>('hover');
  const onPointerDownCapture = (event: PointerEvent<HTMLDivElement>) => {
    setTrigger(current => chartTooltipTrigger(event.pointerType, current));
  };
  const onPointerMoveCapture = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') setTrigger('hover');
  };
  return { trigger, onPointerDownCapture, onPointerMoveCapture };
}

const series = [
  { key: 'community', label: 'Comunidade · 55%', color: '#0a256f' },
  { key: 'team', label: 'Fundador e equipe · 20%', color: '#436dd0' },
  { key: 'investors', label: 'Investidores · 15%', color: '#e6a920' },
] as const;

const chartData = [
  { month: 0, mint: tokenomics.initialMintAllocation, community: 0, team: 0, investors: 0 },
  ...vestingSchedule.map(row => ({ month: row.month, mint: tokenomics.initialMintAllocation, community: row.communityCumulative, team: row.teamCumulative, investors: row.investorsCumulative })),
];
const cumulativeSeries = [{ key: 'mint', label: 'Mint inicial · teto de 10%', color: '#0E9F6E' }, ...series];

export function VestingChart() {
  const input = useVestingInput();
  const visible = useContext(ChapterVisibility);
  return (
    <figure className="whitepaper__vesting-chart" id="documentacao-grafico-vesting">
      <figcaption>
        <h5>Vesting e liberação acumulada</h5>
        <p>Cenário de alocação máxima: teto de 100 milhões do mint inicial, separado dos 900 milhões liberados em 24 meses. Não representa emissão executada.</p>
      </figcaption>
      <ul className="whitepaper__vesting-legend" aria-label="Destinações do token">
        {cumulativeSeries.map(item => <li key={item.key}><i style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}</li>)}
      </ul>
      <div className="whitepaper__vesting-chart-body" aria-label="Gráfico da alocação máxima com mint inicial separado e vesting de 24 meses" onPointerDownCapture={input.onPointerDownCapture} onPointerMoveCapture={input.onPointerMoveCapture}>
        {visible && <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }} accessibilityLayer>
            <CartesianGrid stroke="#d9d3c0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" type="number" domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} tickFormatter={value => `${value}`} tick={{ fill: '#13204F', fontSize: 12 }} />
            <YAxis type="number" domain={[0, 1_000_000_000]} ticks={[0, 250_000_000, 500_000_000, 750_000_000, 1_000_000_000]} width={66} tickFormatter={value => value === 1_000_000_000 ? '1 bi' : value === 0 ? '0' : `${value / 1_000_000} mi`} tick={{ fill: '#13204F', fontSize: 12 }} />
            <Tooltip
              trigger={input.trigger}
              position={{ x: 0, y: 0 }}
              wrapperStyle={{ maxWidth: '100%', pointerEvents: 'none' }}
              labelFormatter={label => Number(label) === 0 ? 'Antes da primeira liberação do vesting' : `Mês ${label}`}
              formatter={(value, name) => [`${formatTokenCount(Number(value))} BETTEX`, name]}
              contentStyle={{ backgroundColor: '#F4F1E8', border: '1px solid #d9d3c0', borderRadius: 0, fontSize: 12, color: '#13204F', whiteSpace: 'normal', overflowWrap: 'anywhere', maxWidth: '100%', boxSizing: 'border-box' }}
            />
            {cumulativeSeries.map(item => <Area key={item.key} type="stepAfter" dataKey={item.key} name={item.label} stackId="vesting" stroke={item.color} fill={item.color} fillOpacity={0.85} isAnimationActive={false} />)}
          </AreaChart>
        </ResponsiveContainer>}
      </div>
      <p className="whitepaper__vesting-chart-note">Mês 0 antecede o vesting de março de 2027. O gráfico considera o teto integral do mint como cenário, não como venda comprovada. No mês 24, 900 milhões do vesting mais 100 milhões do teto inicial somam a alocação máxima de 1 bilhão. A tabela exclui o mint e fecha em 900 milhões. Liberação não comprova venda, circulação ou saldo pessoal.</p>
    </figure>
  );
}

export function MonthlyVestingChart() {
  const input = useVestingInput();
  const visible = useContext(ChapterVisibility);
  return <figure className="whitepaper__vesting-chart" id="documentacao-grafico-mensal-vesting">
    <figcaption><h5>Liberação mensal por grupo</h5><p>24 parcelas quase uniformes dos 900 milhões em vesting, com ajustes inteiros em grupos de 11:4:3. O mint inicial não entra nas barras mensais.</p></figcaption>
    <ul className="whitepaper__vesting-legend" aria-label="Destinações do token">{series.map(s => <li key={s.key}><i style={{ backgroundColor: s.color }} aria-hidden="true" />{s.label}</li>)}</ul>
    <div className="whitepaper__vesting-chart-body" aria-label="Gráfico de barras empilhadas da liberação mensal" onPointerDownCapture={input.onPointerDownCapture} onPointerMoveCapture={input.onPointerMoveCapture}>
      {visible && <ResponsiveContainer width="100%" height="100%">
        <BarChart data={vestingSchedule} margin={{ top: 12, right: 12, bottom: 8, left: 0 }} accessibilityLayer>
          <CartesianGrid stroke="#d9d3c0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" ticks={[1, 6, 12, 18, 24]} tick={{ fill: '#13204F', fontSize: 12 }} />
          <YAxis domain={[0, 40_000_000]} width={60} tickFormatter={n => `${n / 1_000_000} mi`} tick={{ fill: '#13204F', fontSize: 12 }} />
          <Tooltip trigger={input.trigger} position={{ x: 0, y: 0 }} wrapperStyle={{ maxWidth: '100%', pointerEvents: 'none' }} labelFormatter={n => `Mês ${n}`} formatter={(n, name) => [`${formatTokenCount(Number(n))} BETTEX`, name]} contentStyle={{ backgroundColor: '#F4F1E8', fontSize: 12, color: '#13204F', whiteSpace: 'normal', overflowWrap: 'anywhere', maxWidth: '100%', boxSizing: 'border-box' }} />
          {series.map(s => <Bar key={s.key} dataKey={s.key} name={s.label} stackId="monthly" fill={s.color} isAnimationActive={false} />)}
        </BarChart>
      </ResponsiveContainer>}
    </div>
    <p className="whitepaper__vesting-chart-note">Passe sobre uma barra ou use a tabela para consultar quantidades exatas; liberar não significa vender.</p>
  </figure>;
}