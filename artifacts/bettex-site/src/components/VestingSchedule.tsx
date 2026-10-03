import { formatTokenCount, documentationTokenomics as tokenomics } from '@/lib/tokenomics';
import { vestingSchedule } from '@/lib/vesting';
import { VestingChart, MonthlyVestingChart } from '@/components/VestingChart';

export function VestingSchedule() {
  return (
    <section className="whitepaper__vesting" id="documentacao-vesting" aria-labelledby="vesting-title">
      <h3 id="vesting-title" className="whitepaper__subhead">Agenda mensal de liberação · 36 meses</h3>
      <div className="whitepaper__prose">
        <p><strong>O mês 1 começa com a abertura da venda pública.</strong> A primeira parcela dos três grupos é liberada nesse mês; investimentos seguem seu cronograma próprio. Liberação e venda não geram lucro distribuível. Do mês 2 ao 36, uma parcela mensal mantém 65% venda pública, 20% Fundador e equipe e 15% investidores. O fundador destina livremente sua parcela liberada; concessões a terceiros não são automáticas nem criam nova emissão.</p>
        <p>O vesting abrange <strong>toda a emissão autorizada de {formatTokenCount(tokenomics.maxSupply)} BETTEX</strong>, sem liberação integral antecipada de nenhuma destinação. No mês 36, os 650 milhões, 200 milhões e 150 milhões estarão integralmente liberados. As taxas pagas em USDC não transferem ou queimam BETTEX, não reduzem a oferta nem criam uma quarta alocação. Não existe uma destinação inicial de tokens para fundo.</p>
        <p>As parcelas são distribuídas de forma uniforme, com pequenos ajustes de arredondamento para manter quantidades inteiras de tokens e a proporção exata de 65% / 20% / 15% em todos os meses. A agenda mostra <strong>tokens liberados, não tokens já vendidos</strong>. Os meses e as quantidades de liberação seguem o cronograma predefinido, sem decisões discricionárias da gestão nem ajustes conforme as reservas. A venda pública respeita sua parcela liberada e 100% de sua receita em USDC vai diretamente para a tesouraria para financiar o projeto.</p>
      </div>
      <MonthlyVestingChart />
      <VestingChart />
      <div className="whitepaper__vesting-scroll" role="region" aria-label="Agenda dos 36 meses, com rolagem horizontal e vertical" tabIndex={0}>
        <table className="whitepaper__vesting-table">
          <caption>Quantidades em BETTEX · mês 1 = abertura da venda pública</caption>
          <thead>
            <tr><th scope="col">Mês</th><th scope="col">Venda pública · mensal</th><th scope="col">Fundador e equipe · mensal</th><th scope="col">Investidores · mensal</th><th scope="col">Total mensal</th><th scope="col">Venda pública · acumulado</th><th scope="col">Fundador e equipe · acumulado</th><th scope="col">Investidores · acumulado</th><th scope="col">Total acumulado</th></tr>
          </thead>
          <tbody>
            {vestingSchedule.map(row => (
              <tr key={row.month}>
                <th scope="row">{row.month === 1 ? '01 · Início' : String(row.month).padStart(2, '0')}</th>
                <td>{formatTokenCount(row.publicSale)}</td><td>{formatTokenCount(row.team)}</td><td>{formatTokenCount(row.investors)}</td><td>{formatTokenCount(row.total)}</td><td>{formatTokenCount(row.publicSaleCumulative)}</td><td>{formatTokenCount(row.teamCumulative)}</td><td>{formatTokenCount(row.investorsCumulative)}</td><td>{formatTokenCount(row.cumulative)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row">36 meses</th><td>{formatTokenCount(tokenomics.publicSaleAllocation)}</td><td>{formatTokenCount(tokenomics.teamAllocation)}</td><td>{formatTokenCount(tokenomics.investorAllocation)}</td><td>{formatTokenCount(tokenomics.maxSupply)}</td><td>{formatTokenCount(tokenomics.publicSaleAllocation)}</td><td>{formatTokenCount(tokenomics.teamAllocation)}</td><td>{formatTokenCount(tokenomics.investorAllocation)}</td><td>{formatTokenCount(tokenomics.maxSupply)}</td></tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}