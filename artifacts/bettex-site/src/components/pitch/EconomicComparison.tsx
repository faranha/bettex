import { t } from '@/lib/i18n';
import './EconomicComparison.css';

export type EconomicComparisonRow = { criterion: string; bet: string; priceToken: string; bettex: string };

export function EconomicComparison({ rows }: { rows: EconomicComparisonRow[] }) {
  return (
    <div className="ecmp-shell">
      <p className="ecmp__hint">{t('Deslize para comparar as colunas.')}</p>
    <div className="ecmp" role="region" aria-label={t('Quadro comparativo das alternativas')} tabIndex={0} data-testid="table-economic-comparison">
      <table className="ecmp__table">
        <caption className="sr-only">{t('Quadro comparativo das alternativas')}</caption>
        <thead>
          <tr>
            <th scope="col" className="ecmp__crit-h">{t('Critério')}</th>
            <th scope="col">{t('Aposta individual')}</th>
            <th scope="col">{t('Token centrado no preço')}</th>
            <th scope="col" className="ecmp__bettex">BETTEX</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.criterion}>
              <th scope="row">{t(r.criterion)}</th>
              <td>{t(r.bet)}</td>
              <td>{t(r.priceToken)}</td>
              <td className="ecmp__bettex">{t(r.bettex)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default EconomicComparison;
