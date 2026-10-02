import { formatTokenCount, tokenomics } from '@/lib/tokenomics';
import { vestingSchedule } from '@/lib/vesting';

export function VestingSchedule() {
  return (
    <section className="whitepaper__vesting" id="documentacao-vesting" aria-labelledby="vesting-title">
      <h4 id="vesting-title">Agenda mensal de liberação · 36 meses</h4>
      <div className="whitepaper__prose">
        <p><strong>O mês 1 começa com a abertura da venda pública e marca o primeiro mês de operação.</strong> A primeira parcela das três destinações é liberada nesse mês. Do mês 2 ao mês 36, uma nova parcela é liberada a cada mês, sempre na proporção de 50% para venda pública, 25% para fundador e time e 25% para investidores e fundo.</p>
        <p>O vesting abrange <strong>toda a emissão de {formatTokenCount(tokenomics.maxSupply)} BETTEX</strong>, sem liberação integral antecipada de nenhuma destinação. No mês 36, os 500 milhões, 250 milhões e 250 milhões estarão integralmente liberados.</p>
        <p>As parcelas são distribuídas de forma uniforme, com pequenos ajustes de arredondamento para manter quantidades inteiras de tokens e a proporção exata de 50% / 25% / 25% em todos os meses. A agenda mostra <strong>tokens liberados, não tokens já vendidos</strong>. A venda pública continua sob gestão centralizada e sua receita em USDC vai para a tesouraria.</p>
      </div>
      <div className="whitepaper__vesting-scroll" role="region" aria-label="Agenda dos 36 meses, com rolagem horizontal e vertical" tabIndex={0}>
        <table className="whitepaper__vesting-table">
          <caption>Quantidades em BETTEX · mês 1 = abertura da venda pública</caption>
          <thead>
            <tr><th scope="col">Mês</th><th scope="col">Venda pública<br />50%</th><th scope="col">Fundador e time<br />25%</th><th scope="col">Investidores e fundo<br />25%</th><th scope="col">Total mensal</th><th scope="col">Total acumulado</th></tr>
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