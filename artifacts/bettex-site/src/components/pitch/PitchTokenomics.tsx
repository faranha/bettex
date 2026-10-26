import { ArrowRight, ShieldAlert } from 'lucide-react';
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
      <h2 id="economia-t" className="display ptk__h">{x('1 bilhão de BETTEX.', '1 billion BETTEX.', '1.000 millones de BETTEX.')} <span>{x('Token da comunidade. IA de quem tem BETTEX.', 'The community’s token. AI owned by BETTEX holders.', 'El token de la comunidad. La IA de quienes tienen BETTEX.')}</span></h2>
      <div id="economia" className="ptk__eco">
        <div className="ptk__cols">
          <div className="ptk__profit" role="group" aria-label={x('Divisão do lucro elegível', 'Split of eligible profit', 'División del beneficio elegible')}>
            <h3 className="display">{x('Lucro elegível: após custos, obrigações, avaliação das posições abertas, reservas e liquidez', 'Eligible profit: after costs, obligations, valuation of open positions, reserves and liquidity', 'Beneficio elegible: tras costes, obligaciones, valoración de posiciones abiertas, reservas y liquidez')}</h3>
            <div className="ptk__profit-layout">
              <PitchProfitSplitChart rows={split.map(([p, name]) => ({ name, pct: parseFloat(p) }))} />
              <dl>{split.map(([p, n, d], i) => <div key={i}><dt>{n}</dt><dd className="display">{p}</dd><dd>{d}</dd></div>)}</dl>
            </div>
          </div>
          <div className="ptk__capital">
            <h3 className="display">{x('Capital: mint inicial e vendas da comunidade', 'Capital: initial mint and community sales', 'Capital: mint inicial y ventas de la comunidad')}</h3>
            <p>{x('O mint inicial forma a base da tesouraria; as vendas primárias de tokens da comunidade já liberados a ampliam. Capital captado não é lucro do trading.', 'The initial mint forms the base of the treasury; primary sales of released community tokens add to it. Capital raised is not trading profit.', 'El mint inicial forma la base de la tesorería; las ventas primarias de tokens de la comunidad ya liberados la amplían. El capital captado no es beneficio del trading.')}</p>
          </div>
        </div>
        <aside className="ptk__rule" role="note" aria-labelledby="ptk-rule-title">
          <ShieldAlert aria-hidden="true" />
          <div>
            <strong id="ptk-rule-title">{x('Atenção: regras de participação', 'Important participation rules', 'Atención: reglas de participación')}</strong>
            <p>{x('Todo BETTEX na carteira oficial participa automaticamente, sem chamada manual de staking; tokens bloqueados e estoque de venda ficam fora. A participação nos resultados não vem de emissão de tokens e não garante preço, resgate nem valor patrimonial.', 'All BETTEX in the official wallet participates automatically, with no manual staking call; locked tokens and sale inventory are excluded. Participation in results does not come from token issuance and guarantees no price, redemption or net asset value.', 'Todo BETTEX en la cartera oficial participa automáticamente, sin llamada manual de staking; los tokens bloqueados y el stock de venta quedan fuera. La participación en los resultados no proviene de emisión de tokens y no garantiza precio, rescate ni valor patrimonial.')}</p>
          </div>
        </aside>
      </div>
      <div id="token" className="ptk__tok" aria-labelledby="token-t">
        <h3 id="token-t" className="sr-only">{x('Oferta fixa e liberação dos tokens', 'Fixed supply and token release', 'Oferta fija y liberación de los tokens')}</h3>
        <PitchTokenCharts />
        <div className="ptk__facts">
          <div>
            <b>{x('Liberação: 24 meses a partir de março de 2027', 'Release: 24 months from March 2027', 'Liberación: 24 meses desde marzo de 2027')}</b>
            <p>{x('Os 90% posteriores liberam em parcelas mensais: comunidade 55%, fundador e equipe 20%, investidores 15%. O mint inicial de 10%, em 10 de dezembro de 2026, é separado. Liberar não comprova venda.', 'The later 90% is released in monthly installments: community 55%, founder and team 20%, investors 15%. The 10% initial mint, on December 10, 2026, is separate. Release does not prove a sale.', 'El 90% posterior se libera en cuotas mensuales: comunidad 55%, fundador y equipo 20%, inversores 15%. El mint inicial del 10%, el 10 de diciembre de 2026, es aparte. Liberar no prueba una venta.')}</p>
            <p>{x('A alocação de 10% do mint e os 15% de investidores são destinações distintas de tokens, não ações de uma empresa nem comprovação de tokens vendidos.', 'The 10% mint allotment and the investors’ 15% are distinct token allocations, not company shares or proof of tokens sold.', 'La asignación del 10% del mint y el 15% de inversores son destinos distintos de tokens, no acciones de una empresa ni prueba de tokens vendidos.')}</p>
          </div>
          <div>
            <b>{x('Uma IA da comunidade, em um projeto DeFi', 'The community’s AI, in a DeFi project', 'Una IA de la comunidad, en un proyecto DeFi')}</b>
            <p>{x('A BETTEX é um projeto comunitário de tecnologia e DeFi. Não existe empresa, fundo, fundação ou instituição por trás: a comunidade é o próprio projeto.', 'BETTEX is a community technology and DeFi project. There is no company, fund, foundation or institution behind it: the community is the project itself.', 'BETTEX es un proyecto comunitario de tecnología y DeFi. No hay empresa, fondo, fundación ni institución detrás: la comunidad es el propio proyecto.')}</p>
            <p>{x('Quem compra BETTEX tem seu token e é dono da IA e da tecnologia junto à comunidade. Participa dos lucros elegíveis conforme regras digitais, pode contribuir com o projeto e votar em decisões conforme a governança prevista — não é cliente de uma gestora. Os mecanismos de votação serão disponibilizados por etapas, não no demo atual.', 'Anyone buying BETTEX holds their token and owns the AI and technology together with the community. Holders participate in eligible profits under digital rules, can contribute to the project and vote on decisions under the planned governance — they are not customers of an asset manager. Voting mechanisms will be made available in stages, not in the current demo.', 'Quien compra BETTEX tiene su token y es dueño de la IA y la tecnología junto a la comunidad. Participa en los beneficios elegibles según reglas digitales, puede contribuir al proyecto y votar en decisiones según la gobernanza prevista, no es cliente de una gestora. Los mecanismos de votación se habilitarán por etapas, no en el demo actual.')}</p>
            <p>{x('Na estrutura proposta, o capital permanece em cripto na tesouraria do projeto, com movimentações por contratos e protocolos DeFi, não em um fundo ou conta de empresa. O fundador administra no início; descentralização e autonomia por IA são objetivos construídos por etapas, com controles e validação. Hoje, o demo é apenas visual.', 'In the proposed structure, capital remains in crypto in the project treasury, with transfers through DeFi contracts and protocols, not in a fund or company account. The founder administers at first; decentralization and AI autonomy are goals developed in stages, with controls and validation. Today, the demo is visual only.', 'En la estructura propuesta, el capital permanece en cripto en la tesorería del proyecto, con movimientos mediante contratos y protocolos DeFi, no en un fondo ni en una cuenta de empresa. El fundador administra al inicio; la descentralización y la autonomía de la IA son objetivos construidos por etapas, con controles y validación. Hoy, el demo es solo visual.')}</p>
            <p>{x('O token não é ação de uma empresa nem dá direito de retirar individualmente o capital da tesouraria. Não há resgate por valor patrimonial, lucro ou preço garantido; a revenda pode gerar perdas.', 'The token is not a company share and does not grant the right to withdraw treasury capital individually. There is no redemption at net asset value, guaranteed profit or guaranteed price; resale may result in losses.', 'El token no es una acción de una empresa ni da derecho a retirar individualmente el capital de la tesorería. No hay rescate por valor patrimonial, beneficio ni precio garantizados; la reventa puede generar pérdidas.')}</p>
          </div>
        </div>
        <a href={`${DOC}#documentacao-emissao`} className="ptk__doc">{x('Oferta, vesting e regras na documentação', 'Supply, vesting and rules in the documentation', 'Oferta, vesting y reglas en la documentación')}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </div>
  </section>;
}
