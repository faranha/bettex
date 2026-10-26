// Static responsive charts remain visible before hydration.
import { VestingPlot } from './VestingPlot';

const series = [
  { key: 'community', label: 'Comunidade · 55%', color: '#0a256f' },
  { key: 'team', label: 'Fundador e equipe · 20%', color: '#436dd0' },
  { key: 'investors', label: 'Investidores · 15%', color: '#e6a920' },
] as const;

const cumulativeSeries = [{ key: 'mint', label: 'Mint inicial · teto de 10%', color: '#0E9F6E' }, ...series];

export function VestingChart() {
  return (
    <figure className="whitepaper__vesting-chart" id="documentacao-grafico-vesting">
      <figcaption>
        <h5>Vesting e liberação acumulada</h5>
        <p>Cenário de alocação máxima: teto de 100 milhões do mint inicial, separado dos 900 milhões liberados em 24 meses. Não representa emissão executada.</p>
      </figcaption>
      <ul className="whitepaper__vesting-legend" aria-label="Destinações do token">
        {cumulativeSeries.map(item => <li key={item.key}><i style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}</li>)}
      </ul>
      <div className="whitepaper__vesting-chart-body" aria-label="Gráfico da alocação máxima com mint inicial separado e vesting de 24 meses">
        <VestingPlot cumulative />
      </div>
      <p className="whitepaper__vesting-chart-note">Mês 0 antecede o vesting de junho de 2027. O gráfico considera o teto integral do mint como cenário, não como venda comprovada. No mês 24, 900 milhões do vesting mais 100 milhões do teto inicial somam a alocação máxima de 1 bilhão. A tabela exclui o mint e fecha em 900 milhões. Liberação não comprova venda, circulação ou saldo pessoal.</p>
    </figure>
  );
}

export function MonthlyVestingChart() {
  return <figure className="whitepaper__vesting-chart" id="documentacao-grafico-mensal-vesting">
    <figcaption><h5>Liberação mensal por grupo</h5><p>24 parcelas quase uniformes dos 900 milhões em vesting, com ajustes inteiros em grupos de 11:4:3. O mint inicial não entra nas barras mensais.</p></figcaption>
    <ul className="whitepaper__vesting-legend" aria-label="Destinações do token">{series.map(s => <li key={s.key}><i style={{ backgroundColor: s.color }} aria-hidden="true" />{s.label}</li>)}</ul>
    <div className="whitepaper__vesting-chart-body" aria-label="Gráfico de barras empilhadas da liberação mensal">
      <VestingPlot cumulative={false} />
    </div>
    <p className="whitepaper__vesting-chart-note">Passe sobre uma barra ou use a tabela para consultar quantidades exatas; liberar não significa vender.</p>
  </figure>;
}