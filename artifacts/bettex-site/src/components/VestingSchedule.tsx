import { formatTokenCount, documentationTokenomics as tokenomics } from '@/lib/tokenomics';
import { documentationVestingSchedule as vestingSchedule } from '@/lib/documentation-vesting';
import { VestingChart, MonthlyVestingChart } from '@/components/VestingChart';

export function VestingSchedule() {
  return (
    <section className="whitepaper__vesting" id="documentacao-vesting" aria-labelledby="vesting-title">
      <h3 id="vesting-title" className="whitepaper__subhead">Agenda mensal de liberação · 24 meses</h3>
      <div className="whitepaper__prose">
        <p>Os 10% do mint inicial ficam separados: não são uma parcela mensal nem antecipam tokens de fundador/equipe ou investidores. O lançamento do sistema está previsto para essa etapa, sujeito à adequação legal e jurídica.</p>
        <p>Esta agenda abrange <strong>{formatTokenCount(tokenomics.vestingTotal)} BETTEX</strong>: 550 milhões para a comunidade, 200 milhões para fundador/equipe e 150 milhões para investidores. No mês 24, essas três destinações estarão integralmente liberadas. O teto de 100 milhões do mint inicial completa a alocação máxima de 1 bilhão, mas não representa tokens já emitidos ou vendidos.</p>
        <p>As 24 parcelas mantêm a proporção 55:20:15, equivalente a 11:4:3, com pequenos ajustes de arredondamento para tokens inteiros. A agenda mostra <strong>liberação programada, não venda, circulação ou lucro distribuível</strong>. A gestão não altera meses ou quantidades conforme reservas. Preço, janela e destino dos tokens não mintados na oferta inicial permanecem a definir; não são transferidos automaticamente para este vesting.</p>
      </div>
      <MonthlyVestingChart />
      <VestingChart />
      <div className="whitepaper__vesting-scroll" role="region" aria-label="Agenda dos 24 meses, com rolagem horizontal e vertical" tabIndex={0}>
        <table className="whitepaper__vesting-table">
          <caption>Quantidades em BETTEX · vesting a partir de março de 2027 · mint inicial separado</caption>
          <thead>
            <tr><th scope="col">Mês</th><th scope="col">Comunidade · mensal</th><th scope="col">Fundador e equipe · mensal</th><th scope="col">Investidores · mensal</th><th scope="col">Total mensal</th><th scope="col">Comunidade · acumulado</th><th scope="col">Fundador e equipe · acumulado</th><th scope="col">Investidores · acumulado</th><th scope="col">Total acumulado</th></tr>
          </thead>
          <tbody>
            {vestingSchedule.map(row => (
              <tr key={row.month}>
                <th scope="row">{row.month === 1 ? '01 · Início' : String(row.month).padStart(2, '0')}</th>
                <td>{formatTokenCount(row.community)}</td><td>{formatTokenCount(row.team)}</td><td>{formatTokenCount(row.investors)}</td><td>{formatTokenCount(row.total)}</td><td>{formatTokenCount(row.communityCumulative)}</td><td>{formatTokenCount(row.teamCumulative)}</td><td>{formatTokenCount(row.investorsCumulative)}</td><td>{formatTokenCount(row.cumulative)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row">24 meses</th><td>{formatTokenCount(tokenomics.communityAllocation)}</td><td>{formatTokenCount(tokenomics.teamAllocation)}</td><td>{formatTokenCount(tokenomics.investorAllocation)}</td><td>{formatTokenCount(tokenomics.vestingTotal)}</td><td>{formatTokenCount(tokenomics.communityAllocation)}</td><td>{formatTokenCount(tokenomics.teamAllocation)}</td><td>{formatTokenCount(tokenomics.investorAllocation)}</td><td>{formatTokenCount(tokenomics.vestingTotal)}</td></tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}