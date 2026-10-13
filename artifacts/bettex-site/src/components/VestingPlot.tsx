import { documentationVestingSchedule as schedule } from '@/lib/documentation-vesting';
import { documentationTokenomics as tokenomics, formatTokenCount } from '@/lib/tokenomics';
import { t } from '@/lib/i18n';

const colors = ['#0E9F6E', '#0a256f', '#436dd0', '#e6a920'];
const width = 600, height = 300, left = 84, right = 16, top = 12, bottom = 34;
const plotWidth = width - left - right, plotHeight = height - top - bottom;
const groups = ['community', 'team', 'investors'] as const;

/** A responsive viewBox works before hydration and without ResizeObserver,
 * including chapters initially hidden by the documentation reader. */
export function VestingPlot({ cumulative }: { cumulative: boolean }) {
  const max = cumulative ? tokenomics.maxSupply : 40_000_000;
  const x = (month: number) => left + month / 24 * plotWidth;
  const y = (value: number) => top + plotHeight * (1 - value / max);
  const points = [
    [tokenomics.initialMintAllocation, 0, 0, 0],
    ...schedule.map(row => [tokenomics.initialMintAllocation, row.communityCumulative, row.teamCumulative, row.investorsCumulative]),
  ];
  const area = (part: number) => {
    const lower = points.map(values => values.slice(0, part).reduce((a, b) => a + b, 0));
    const upper = points.map((values, i) => lower[i] + values[part]);
    // Releases jump at each integer month, rather than implying continuous release.
    const forward = upper.flatMap((value, i) => i ? [`L${x(i)},${y(upper[i - 1])}`, `L${x(i)},${y(value)}`] : [`M${x(0)},${y(value)}`]);
    const reverse = [];
    for (let i = 24; i >= 0; i--) {
      reverse.push(`L${x(i)},${y(lower[i])}`);
      if (i) reverse.push(`L${x(i)},${y(lower[i - 1])}`);
    }
    return [...forward, ...reverse, 'Z'].join(' ');
  };
  return <svg className="whitepaper__vesting-plot" viewBox={`0 0 ${width} ${height}`} role="img"
    aria-label={cumulative ? 'Gráfico da alocação máxima com mint inicial separado e vesting de 24 meses' : 'Gráfico de barras empilhadas da liberação mensal'}>
    {[0, 1, 2, 3, 4].map(i => {
      const value = max * i / 4;
      return <g key={i}>
        <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} stroke="#d9d3c0" strokeDasharray="3 3" />
        <text x={left - 8} y={y(value) + 5} textAnchor="end" fill="#13204F" fontSize="20" data-i18n="translated">{value === 0 ? '0' : value === 1_000_000_000 ? t('1 bi') : t(`${value / 1_000_000} mi`)}</text>
      </g>;
    })}
    {cumulative ? colors.map((color, part) => <path key={color} d={area(part)} fill={color} fillOpacity=".85" stroke={color} strokeWidth=".5" data-vesting-series={part} />)
      : schedule.map(row => {
        let base = 0;
        return <g key={row.month} data-vesting-month={row.month}>
          {groups.map((key, i) => {
            const value = row[key], lower = base;
            base += value;
            return <rect key={key} x={x(row.month - .85)} y={y(base)} width={plotWidth / 24 * .7} height={y(lower) - y(base)} fill={colors[i + 1]}>
              <title data-i18n="translated">{`${t('Mês')} ${String(row.month).padStart(2, '0')} · ${t({ community: 'Comunidade · mensal', team: 'Fundador e equipe · mensal', investors: 'Investidores · mensal' }[key])}: ${formatTokenCount(value)} BETTEX`}</title>
            </rect>;
          })}
        </g>;
      })}
    {(cumulative ? [0, 6, 12, 18, 24] : [1, 6, 12, 18, 24]).map(month => <text key={month} x={x(cumulative ? month : month - .5)} y={height - 10} textAnchor="middle" fill="#13204F" fontSize="20">{month}</text>)}
  </svg>;
}
