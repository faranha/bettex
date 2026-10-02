import { formatTokenCount, documentationTokenomics as tokenomics } from '@/lib/tokenomics';
import { vestingSchedule } from '@/lib/vesting';
import { VestingChart } from '@/components/VestingChart';

export function VestingSchedule() {
  return (
    <section className="whitepaper__vesting" id="documentacao-vesting" aria-labelledby="vesting-title">
      <h4 id="vesting-title">Agenda mensal de liberação · 36 meses</h4>
      <div className="whitepaper__prose">
        <p><strong>O mês 1 começa com a abertura da venda pública e marca o primeiro mês de operação.</strong> A primeira parcela das três destinações é liberada nesse mês. Do mês 2 ao mês 36, uma nova parcela é liberada a cada mês, sempre na proporção de 65% para venda pública, 20% para o fundador e 15% para investidores. O fundador decide livremente o destino dos tokens de sua parcela após a liberação, inclusive a distribuição ao time.</p>
        <p>O vesting abrange <strong>toda a emissão bruta autorizada de {formatTokenCount(tokenomics.maxSupply)} BETTEX</strong>, sem liberação integral antecipada de nenhuma destinação. No mês 36, os 650 milhões, 200 milhões e 150 milhões estarão integralmente liberados. Esses totais não descontam as queimas de taxas: a oferta líquida depende dos tokens efetivamente emitidos e das queimas confirmadas. Não existe uma destinação de tokens para fundo.</p>
        <p>As parcelas são distribuídas de forma uniforme, com pequenos ajustes de arredondamento para manter quantidades inteiras de tokens e a proporção exata de 65% / 20% / 15% em todos os meses. A agenda mostra <strong>tokens liberados, não tokens já vendidos</strong>. Os meses e as quantidades de liberação seguem o cronograma predefinido, sem decisões discricionárias da gestão nem ajustes conforme as reservas. A venda pública respeita sua parcela liberada e 100% de sua receita em USDC vai diretamente para a tesouraria para financiar o projeto.</p>
      </div>
      <VestingChart />
      <div className="whitepaper__vesting-scroll" role="region" aria-label="Agenda dos 36 meses, com rolagem horizontal e vertical" tabIndex={0}>
        <table className="whitepaper__vesting-table">
          <caption>Quantidades em BETTEX · mês 1 = abertura da venda pública</caption>
          <thead>
            <tr><th scope="col">Mês</th><th scope="col">Venda pública<br />65%</th><th scope="col">Fundador<br />20%</th><th scope="col">Investidores<br />15%</th><th scope="col">Total mensal</th><th scope="col">Total acumulado</th></tr>
          </thead>
          <tbody>
            {vestingSchedule.map(row => (
              <tr key={row.month}>
                <th scope="row">{row.month === 1 ? '01 · Início' : String(row.month).padStart(2, '0')}</th>
                <td>{formatTokenCount(row.publicSale)}</td><td>{formatTokenCount(row.team)}</td><td>{formatTokenCount(row.investors)}</td><td>{formatTokenCount(row.total)}</td><td>{formatTokenCount(row.cumulative)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row">36 meses</th><td>{formatTokenCount(tokenomics.publicSaleAllocation)}</td><td>{formatTokenCount(tokenomics.teamAllocation)}</td><td>{formatTokenCount(tokenomics.investorAllocation)}</td><td>{formatTokenCount(tokenomics.maxSupply)}</td><td>{formatTokenCount(tokenomics.maxSupply)}</td></tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}