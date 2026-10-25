import { ArrowRight } from 'lucide-react';
import { PitchTokenCharts } from './PitchTokenCharts';
import { PitchProfitSplitChart } from './PitchProfitSplitChart';
import { useX } from './pitchCopy';
import './PitchTokenomics.css';

const DOC = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/documentacao`;

export function PitchTokenomics() {
  const x = useX();
  const split = [
    ['50%', x('Tesouraria', 'Treasury', 'Tesorería'), x('Retenção e reinvestimento.', 'Retention and reinvestment.', 'Retención y reinversión.')],
    ['25%', x('Participantes elegíveis', 'Eligible holders', 'Participantes elegibles'), x('Rateio pelo peso elegível na carteira.', 'Shared by eligible weight in the wallet.', 'Reparto según el peso elegible en la cartera.')],
    ['25%', x('Recompra e queima', 'Buyback and burn', 'Recompra y quema'), x('Compras autorizadas; tokens queimados.', 'Authorized purchases; tokens burned.', 'Compras autorizadas; tokens quemados.')],
  ];
  return <section id="tokenomics" className="ptk" aria-labelledby="economia-t">
    <div className="page-wrap">
      <h2 id="economia-t" className="display ptk__h">{x('1 bilhão de BETTEX.', '1 billion BETTEX.', '1.000 millones de BETTEX.')} <span>{x('Participação nos lucros elegíveis.', 'Sharing in eligible profits.', 'Participación en los beneficios elegibles.')}</span></h2>
      <div id="economia" className="ptk__eco">
        <div className="ptk__cols">
          <div className="ptk__capital">
            <h3 className="display">{x('Capital: mint inicial e vendas da comunidade', 'Capital: initial mint and community sales', 'Capital: mint inicial y ventas de la comunidad')}</h3>
            <p>{x('O mint inicial forma a base da tesouraria; as vendas primárias de tokens da comunidade já liberados a ampliam. Capital captado não é lucro do trading.', 'The initial mint forms the base of the treasury; primary sales of released community tokens add to it. Capital raised is not trading profit.', 'El mint inicial forma la base de la tesorería; las ventas primarias de tokens de la comunidad ya liberados la amplían. El capital captado no es beneficio del trading.')}</p>
          </div>
          <div className="ptk__profit" role="group" aria-label={x('Divisão do lucro elegível', 'Split of eligible profit', 'División del beneficio elegible')}>
            <h3 className="display">{x('Lucro elegível: após custos, obrigações, avaliação das posições abertas, reservas e liquidez', 'Eligible profit: after costs, obligations, valuation of open positions, reserves and liquidity', 'Beneficio elegible: tras costes, obligaciones, valoración de posiciones abiertas, reservas y liquidez')}</h3>
            <div className="ptk__profit-layout">
              <PitchProfitSplitChart rows={split.map(([p, name]) => ({ name, pct: parseFloat(p) }))} />
              <dl>{split.map(([p, n, d], i) => <div key={i}><dt>{n}</dt><dd className="display">{p}</dd><dd>{d}</dd></div>)}</dl>
            </div>
          </div>
        </div>
        <p className="ptk__rule">{x('Todo BETTEX na carteira oficial participa automaticamente, sem chamada manual de staking; tokens bloqueados e estoque de venda ficam fora. A participação nos resultados não vem de emissão de tokens e não garante preço, resgate nem valor patrimonial.', 'All BETTEX in the official wallet participates automatically, with no manual staking call; locked tokens and sale inventory are excluded. Participation in results does not come from token issuance and guarantees no price, redemption or net asset value.', 'Todo BETTEX en la cartera oficial participa automáticamente, sin llamada manual de staking; los tokens bloqueados y el stock de venta quedan fuera. La participación en los resultados no proviene de emisión de tokens y no garantiza precio, rescate ni valor patrimonial.')}</p>
      </div>
      <div id="token" className="ptk__tok" aria-labelledby="token-t">
        <h3 id="token-t" className="sr-only">{x('Oferta fixa e liberação dos tokens', 'Fixed supply and token release', 'Oferta fija y liberación de los tokens')}</h3>
        <PitchTokenCharts />
        <div className="ptk__facts">
          <div><b>{x('Liberação: 24 meses a partir de março de 2027', 'Release: 24 months from March 2027', 'Liberación: 24 meses desde marzo de 2027')}</b><p>{x('Os 90% posteriores liberam em parcelas mensais: comunidade 55%, fundador e equipe 20%, investidores 15%. O mint inicial de 10%, em 10 de dezembro de 2026, é separado. Liberar não comprova venda.', 'The later 90% is released in monthly installments: community 55%, founder and team 20%, investors 15%. The 10% initial mint, on December 10, 2026, is separate. Release does not prove a sale.', 'El 90% posterior se libera en cuotas mensuales: comunidad 55%, fundador y equipo 20%, inversores 15%. El mint inicial del 10%, el 10 de diciembre de 2026, es aparte. Liberar no prueba una venta.')}</p></div>
          <div><b>{x('Direitos: participação, não equity', 'Rights: participation, not equity', 'Derechos: participación, no equity')}</b><p>{x('A destinação de 10% do mint não equivale aos 15% de investidores, a tokens vendidos nem a participação societária. O titular não tem propriedade da tesouraria nem resgate por valor patrimonial, e pode perder na revenda.', 'The 10% mint allotment is not the same as the investors’ 15%, tokens sold or equity. The holder has no ownership of the treasury or redemption at net asset value, and may lose on resale.', 'La asignación del 10% del mint no equivale al 15% de inversores, a tokens vendidos ni a participación societaria. El titular no tiene propiedad de la tesorería ni rescate por valor patrimonial, y puede perder en la reventa.')}</p></div>
        </div>
        <a href={`${DOC}#documentacao-emissao`} className="ptk__doc">{x('Oferta, vesting e regras na documentação', 'Supply, vesting and rules in the documentation', 'Oferta, vesting y reglas en la documentación')}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </div>
  </section>;
}
