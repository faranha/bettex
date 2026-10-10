import { useState, type PointerEvent } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { documentationTokenomics as tokenomics } from '@/lib/tokenomics';
import { documentationVestingSchedule as vestingSchedule } from '@/lib/documentation-vesting';
import { chartTooltipTrigger, type ChartTooltipTrigger } from '@/lib/chart-input';
import { getFormatLocale, t, useLocale } from '@/lib/i18n';
import './PitchTokenCharts.css';

const groups = [
  { key: 'mint', label: 'Mint público inicial', amount: tokenomics.initialMintAllocation, color: '#36E0D0' },
  { key: 'community', label: 'Comunidade', amount: tokenomics.communityAllocation, color: '#5F86FF' },
  { key: 'team', label: 'Fundador e equipe', amount: tokenomics.teamAllocation, color: '#F2B632' },
  { key: 'investors', label: 'Investidores', amount: tokenomics.investorAllocation, color: '#F4F1E8' },
] as const;

const data = [
  { month: 0, mint: tokenomics.initialMintAllocation, community: 0, team: 0, investors: 0 },
  ...vestingSchedule.map(r => ({ month: r.month, mint: tokenomics.initialMintAllocation, community: r.communityCumulative, team: r.teamCumulative, investors: r.investorsCumulative })),
];

export function PitchTokenCharts() {
  useLocale();
  const [trigger, setTrigger] = useState<ChartTooltipTrigger>('hover');
  const fl = getFormatLocale();
  const num = (n: number) => n.toLocaleString(fl);
  const pct = (n: number) => `${((n / tokenomics.maxSupply) * 100).toLocaleString(fl, { maximumFractionDigits: 1 })}%`;
  const mi = (n: number) => `${(n / 1e6).toLocaleString(fl)} ${t('mi')}`;
  const unit = t('BETTEX');
  const pieData = groups.map(g => ({ ...g, name: t(g.label) }));
  const onDown = (e: PointerEvent<HTMLDivElement>) => setTrigger(c => chartTooltipTrigger(e.pointerType, c));
  const onMove = (e: PointerEvent<HTMLDivElement>) => { if (e.pointerType === 'mouse') setTrigger('hover'); };
  const tip = { backgroundColor: '#070B1F', border: '1px solid rgba(95,134,255,.5)', borderRadius: 6, fontSize: 12, color: '#F4F1E8', whiteSpace: 'normal' as const, maxWidth: '100%', boxSizing: 'border-box' as const };
  return <div className="ptc" data-testid="pitch-token-charts">
    <figure className="ptc__panel">
      <figcaption><h3>{t('Composição da oferta fixa')}</h3><p>{t('Total fixo')}: {num(tokenomics.maxSupply)} {unit}</p></figcaption>
      <div className="ptc__pie" role="img" aria-label={t('Gráfico de pizza da oferta fixa por alocação')}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="amount" nameKey="name" innerRadius="58%" outerRadius="92%" startAngle={90} endAngle={-270} stroke="#0d1536" strokeWidth={2} isAnimationActive={false}>
              {pieData.map(g => <Cell key={g.key} fill={g.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="ptc__center"><strong>{t('1 bilhão')}</strong><span>{unit}</span></div>
      </div>
      <ul className="ptc__list">
        {groups.map(g => <li key={g.key}><i style={{ background: g.color }} aria-hidden="true" /><span>{t(g.label)}</span><b>{pct(g.amount)}</b><em>{num(g.amount)} {unit}</em></li>)}
      </ul>
    </figure>
    <figure className="ptc__panel">
      <figcaption><h3>{t('Liberação progressiva acumulada')}</h3><p>{t('Mês 0 a mês 24, em milhões de BETTEX')}</p></figcaption>
      <ul className="ptc__legend">{groups.map(g => <li key={g.key}><i style={{ background: g.color }} aria-hidden="true" />{t(g.label)}</li>)}</ul>
      <div className="ptc__area" role="img" aria-label={t('Gráfico da alocação máxima com mint inicial separado e vesting de 24 meses')} onPointerDownCapture={onDown} onPointerMoveCapture={onMove}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 14, bottom: 22, left: 0 }}>
            <CartesianGrid stroke="rgba(197,210,241,.2)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" type="number" domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} tick={{ fill: '#c5d2f1', fontSize: 12 }} stroke="rgba(197,210,241,.4)" label={{ value: t('Meses'), position: 'insideBottom', offset: -14, fill: '#c5d2f1', fontSize: 12 }} />
            <YAxis type="number" domain={[0, tokenomics.maxSupply]} ticks={[0, 250e6, 500e6, 750e6, 1e9]} width={58} tickFormatter={v => `${(v / 1e6).toLocaleString(fl)}`} tick={{ fill: '#c5d2f1', fontSize: 12 }} stroke="rgba(197,210,241,.4)" />
            <Tooltip trigger={trigger} position={{ x: 0, y: 0 }} wrapperStyle={{ maxWidth: '100%', pointerEvents: 'none' }} contentStyle={tip}
              labelFormatter={l => Number(l) === 0 ? t('Antes da primeira liberação') : `${t('Mês')} ${l}`}
              formatter={(v, n) => [`${mi(Number(v))}`, n]} />
            {groups.map(g => <Area key={g.key} type="stepAfter" dataKey={g.key} name={t(g.label)} stackId="v" stroke={g.color} fill={g.color} fillOpacity={0.8} isAnimationActive={false} />)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="ptc__note">{t('Cenário de alocação máxima: 100 milhões do teto do mint inicial mais 900 milhões em vesting até o mês 24. Não representa emissão executada.')}</p>
    </figure>
    <p className="ptc__disclosure">{t('Mint aberto a preço fixo antes do vesting. Liberação mensal a partir de março de 2027 por 24 meses; não comprova venda, circulação ou saldo pessoal.')}</p>
  </div>;
}
