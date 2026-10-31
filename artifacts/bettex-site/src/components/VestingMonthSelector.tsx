import { useState } from 'react';
import { documentationVestingSchedule as schedule } from '@/lib/documentation-vesting';
import { formatTokenCount } from '@/lib/tokenomics';
import { t } from '@/lib/i18n';

export function VestingMonthSelector() {
  const [month, setMonth] = useState(1);
  const row = schedule[month - 1];
  const groups = [
    { label: 'Comunidade · 55%', monthly: row.community, cumulative: row.communityCumulative },
    { label: 'Fundador e equipe · 20%', monthly: row.team, cumulative: row.teamCumulative },
    { label: 'Investidores · 15%', monthly: row.investors, cumulative: row.investorsCumulative },
    { label: 'Total', monthly: row.total, cumulative: row.cumulative },
  ];
  return <div className="whitepaper__vesting-month" data-testid="vesting-month-selector">
    <div className="whitepaper__vesting-month-nav">
      <button type="button" disabled={month === 1} onClick={() => setMonth(month - 1)} aria-label="Mês anterior">‹</button>
      <strong data-i18n="translated" aria-live="polite">{t('Mês')} {String(month).padStart(2, '0')} / 24</strong>
      <button type="button" disabled={month === 24} onClick={() => setMonth(month + 1)} aria-label="Próximo mês">›</button>
    </div>
    <label className="whitepaper__vesting-range">
      <span className="sr-only">Mês</span>
      <input type="range" min={1} max={24} step={1} value={month} onChange={e => setMonth(Number(e.target.value))} aria-label="Mês" />
    </label>
    <div className="whitepaper__vesting-month-columns"><span>BETTEX</span><span>Mensal</span><span>Acumulado</span></div>
    <dl className="whitepaper__vesting-month-values">
      {groups.map(group => <div key={group.label}>
        <dt>{group.label}</dt>
        <dd data-i18n="translated">{formatTokenCount(group.monthly)}</dd>
        <dd data-i18n="translated">{formatTokenCount(group.cumulative)}</dd>
      </div>)}
    </dl>
  </div>;
}
