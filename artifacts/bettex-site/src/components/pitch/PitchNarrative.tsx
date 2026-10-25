import { ArrowRight, Bot, Landmark, Wallet, Coins, CalendarCheck, Banknote, ShieldAlert } from 'lucide-react';
import { useX } from './pitchCopy';
import './PitchNarrative.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;

export function PitchContext() {
  const x = useX();
  return <section id="problema" aria-labelledby="pn-context-t" className="pn pn--paper">
    <div className="page-wrap pn__wrap pn__context">
      <div>
        <p className="mono pn__kicker">{x('Por que agora', 'Why now', 'Por qué ahora')}</p>
        <h3 id="pn-context-t" className="display pn__h">{x('Apostar não é renda. Falta uma porta de entrada para investir.', 'Betting is not income. There is no on-ramp to investing.', 'Apostar no es ingreso. Falta una puerta de entrada para invertir.')}</h3>
      </div>
      <div id="ambiente-externo" className="pn__prose">
        <p>{x('O apostador brasileiro muitas vezes trata a aposta como fonte de renda, com dinheiro essencial exposto e sem reservas. A tese do fundador é que a automação e a IA aumentam a insegurança do emprego e a necessidade de ter alguma participação econômica própria.', 'The Brazilian bettor often treats betting as income, exposing essential money without reserves. The founder thesis is that automation and AI increase job insecurity and the need for an economic stake of one’s own.', 'El apostador brasileño suele tratar la apuesta como fuente de ingresos, con dinero esencial expuesto y sin reservas. La tesis del fundador es que la automatización y la IA aumentan la inseguridad laboral y la necesidad de tener una participación económica propia.')}</p>
        <p className="pn__fine">{x('Contexto, não prova de causalidade: a BETTEX não promete recuperar perdas de apostas nem garante renda.', 'Context, not proof of causality: BETTEX does not promise to recover betting losses or guarantee income.', 'Contexto, no prueba de causalidad: BETTEX no promete recuperar pérdidas de apuestas ni garantiza ingresos.')}</p>
        <a href="#publico-pitch" className="pn__link">{x('Ver dados e fontes do público', 'See audience data and sources', 'Ver datos y fuentes del público')}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </div>
  </section>;
}

export function PitchJourney() {
  const x = useX();
  const steps = [
    { Icon: Coins, t: x('Compra BETTEX', 'Buys BETTEX', 'Compra BETTEX') },
    { Icon: Wallet, t: x('Participação automática na carteira', 'Automatic participation in the wallet', 'Participación automática en la cartera') },
    { Icon: Bot, t: x('O agente opera cripto', 'The agent trades crypto', 'El agente opera cripto') },
    { Icon: CalendarCheck, t: x('Apuração e desconto de taxas', 'Calculation and fee deduction', 'Cálculo y descuento de comisiones') },
    { Icon: Banknote, t: x('Recebimento líquido no Pix', 'Net payout via Pix', 'Cobro neto por Pix') },
  ];
  return <div className="pn pn__journey" data-testid="pitch-participation-journey">
    <p className="pn__lead">{x('O usuário participa dos resultados de um único agente de IA em cripto, sem acompanhar operações e sem ativação manual. A participação vem do saldo de BETTEX na carteira oficial.', 'The user participates in the results of a single AI agent in crypto, without following trades and without manual activation. Participation comes from the BETTEX balance in the official wallet.', 'El usuario participa en los resultados de un único agente de IA en cripto, sin seguir operaciones y sin activación manual. La participación proviene del saldo de BETTEX en la cartera oficial.')}</p>
    <ol className="pn__steps">
      {steps.map(({ Icon, t }, i) => <li key={i} className="pn__step"><span className="pn__stepn mono">{String(i + 1).padStart(2, '0')}</span><Icon size={24} aria-hidden="true" /><strong>{t}</strong></li>)}
    </ol>
    <div className="pn__pix" data-testid="pitch-pix-planned">
      <span className="pn__pixtag mono">{x('Recurso previsto', 'Planned feature', 'Recurso previsto')}</span>
      <h4 className="display">{x('Pix para receber em reais', 'Pix to receive reais', 'Pix para recibir reales')}</h4>
      <p>{x('Pix previsto; integração, custos, prazos e disponibilidade sujeitos à validação e adequação jurídica.', 'Pix is planned; integration, costs, timelines and availability are subject to validation and legal compliance.', 'Pix previsto; integración, costes, plazos y disponibilidad sujetos a validación y adecuación jurídica.')}</p>
      <p>{x('A BETTEX faz a compra e a venda de BETTEX para o usuário e a conversão entre cripto e reais. A operação e a contabilidade interna usam cripto e USDC; o participante não precisa operar cripto por conta própria.', 'BETTEX handles BETTEX purchases and sales for the user and conversion between crypto and reais. Operations and internal accounting use crypto and USDC; participants do not need to handle crypto themselves.', 'BETTEX realiza la compra y venta de BETTEX para el usuario y la conversión entre cripto y reales. La operación y la contabilidad interna usan cripto y USDC; el participante no necesita operar cripto por su cuenta.')}</p>
    </div>
    <div className="pn__pix" data-testid="pitch-operation-fees" aria-labelledby="pitch-operation-fees-t">
      <span className="pn__pixtag mono">{x('Custos da operação', 'Transaction costs', 'Costes de la operación')}</span>
      <h4 id="pitch-operation-fees-t" className="display">{x('Recebimento no Pix, após descontar as taxas.', 'Pix payout, after fees are deducted.', 'Cobro por Pix, después de descontar las comisiones.')}</h4>
      <ul className="pn__rules">
        <li>{x('On-ramp: entrada de reais e conversão para cripto para participar.', 'On-ramp: depositing reais and converting to crypto to participate.', 'On-ramp: entrada de reales y conversión a cripto para participar.')}</li>
        <li>{x('Compra e venda de BETTEX: negociação dos tokens para o usuário.', 'BETTEX purchases and sales: trading tokens for the user.', 'Compra y venta de BETTEX: negociación de los tokens para el usuario.')}</li>
        <li>{x('Off-ramp: conversão de cripto para reais para receber no Pix.', 'Off-ramp: converting crypto to reais for payout via Pix.', 'Off-ramp: conversión de cripto a reales para cobrar por Pix.')}</li>
        <li>{x('Taxas de rede e demais custos das operações realizadas também são considerados.', 'Network fees and other costs of completed transactions are also included.', 'También se consideran las comisiones de red y los demás costes de las operaciones realizadas.')}</li>
      </ul>
      <p>{x('Essas operações têm custo. As taxas são debitadas dos ganhos diários do participante; o valor recebido em reais é líquido desses descontos, não o ganho bruto.', 'These transactions have costs. Fees are deducted from the participant’s daily earnings; the amount received in reais is net of these deductions, not gross earnings.', 'Estas operaciones tienen coste. Las comisiones se descuentan de las ganancias diarias del participante; el importe recibido en reales es neto de estos descuentos, no la ganancia bruta.')}</p>
      <p className="font-bold">{x('Ganhos diários − taxas das operações = valor líquido a receber no Pix.', 'Daily earnings − transaction fees = net amount to receive via Pix.', 'Ganancias diarias − comisiones de las operaciones = importe neto a cobrar por Pix.')}</p>
    </div>
    <ul className="pn__rules">
      <li>{x('Compra durante uma rodada qualifica para a próxima rodada.', 'A purchase during a round qualifies for the next round.', 'Una compra durante una ronda califica para la siguiente.')}</li>
      <li>{x('Receber lucro não queima tokens.', 'Receiving profit does not burn tokens.', 'Cobrar beneficio no quema tokens.')}</li>
      <li>{x('Saídas cancelam direitos ainda não pagos, conforme as regras.', 'Exits cancel unpaid rights, per the rules.', 'Las salidas cancelan derechos aún no pagados, según las reglas.')}</li>
      <li>{x('Venda só com liquidez; sem lucro, sem distribuição.', 'Selling only with liquidity; no profit, no distribution.', 'Venta solo con liquidez; sin beneficio, sin distribución.')}</li>
    </ul>
    <p className="pn__fine"><ShieldAlert size={14} aria-hidden="true" /> {x('O token pode perder valor. O demo é apenas visual: sem Pix, trading ou pagamentos reais. Nenhum retorno é garantido.', 'The token can lose value. The demo is visual only: no real Pix, trading or payments. No return is guaranteed.', 'El token puede perder valor. El demo es solo visual: sin Pix, trading ni pagos reales. No se garantiza ningún retorno.')}</p>
    <div id="diferencial" className="pn__diff">
      <strong>{x('Diferença de direito econômico', 'Difference in economic right', 'Diferencia de derecho económico')}</strong>
      <span>{x('Na aposta, o resultado depende do evento; num token centrado no preço, da revenda. Aqui, a proposta é participar do lucro elegível de uma estratégia, nas regras da carteira.', 'In betting, the outcome depends on the event; in a price-centered token, on resale. Here, the proposal is participation in the eligible profit of a strategy, under the wallet rules.', 'En la apuesta, el resultado depende del evento; en un token centrado en el precio, de la reventa. Aquí, la propuesta es participar en el beneficio elegible de una estrategia, según las reglas de la cartera.')}</span>
    </div>
  </div>;
}

export function PitchStrategy() {
  const x = useX();
  return <div className="pn pn--ink pn__strategy">
    <div className="pn__prose pn__prose--ink">
      <p>{x('Um único agente de IA em cripto busca identificar possíveis padrões de manipulação de mercado, sob limites de risco. É uma abordagem a ser testada, não alfa comprovado. O ativo inicial está a definir.', 'A single AI agent in crypto seeks to identify possible market-manipulation patterns under risk limits. It is an approach to be tested, not proven alpha. The initial asset is yet to be defined.', 'Un único agente de IA en cripto busca identificar posibles patrones de manipulación de mercado bajo límites de riesgo. Es un enfoque por probar, no alfa demostrado. El activo inicial está por definir.')}</p>
      <p>{x('O agente opera com a tesouraria, nunca com os tokens dos usuários. O fundador e o time administram no início; a autonomia futura depende de desempenho validado e de controles.', 'The agent operates with the treasury, never with users’ tokens. The founder and team administer at first; future autonomy depends on validated performance and controls.', 'El agente opera con la tesorería, nunca con los tokens de los usuarios. El fundador y el equipo administran al inicio; la autonomía futura depende de un desempeño validado y de controles.')}</p>
    </div>
    <dl className="pn__facts">
      <div><dt>{x('Agentes', 'Agents', 'Agentes')}</dt><dd>1</dd></div>
      <div><dt>{x('Capital operado', 'Operated capital', 'Capital operado')}</dt><dd>{x('Tesouraria', 'Treasury', 'Tesorería')}</dd></div>
      <div><dt>{x('Ativo inicial', 'Initial asset', 'Activo inicial')}</dt><dd>{x('A definir', 'TBD', 'Por definir')}</dd></div>
    </dl>
  </div>;
}

export function PitchFunding() {
  const x = useX();
  const split = [
    ['50%', x('Tesouraria', 'Treasury', 'Tesorería'), x('Retenção e reinvestimento.', 'Retention and reinvestment.', 'Retención y reinversión.')],
    ['25%', x('Participantes elegíveis', 'Eligible holders', 'Participantes elegibles'), x('Rateio pelo peso elegível na carteira.', 'Shared by eligible weight in the wallet.', 'Reparto según el peso elegible en la cartera.')],
    ['25%', x('Recompra e queima', 'Buyback and burn', 'Recompra y quema'), x('Compras autorizadas; tokens queimados.', 'Authorized purchases; tokens burned.', 'Compras autorizadas; tokens quemados.')],
  ];
  return <div className="pn pn__funding">
    <div className="pn__cols">
      <article><span className="mono pn__kicker">{x('Capital', 'Capital', 'Capital')}</span><h4 className="display">{x('Mint inicial e vendas da comunidade', 'Initial mint and community sales', 'Mint inicial y ventas de la comunidad')}</h4><p>{x('O mint inicial forma a base da tesouraria; as vendas primárias de tokens da comunidade já liberados a ampliam. Capital captado não é lucro do trading.', 'The initial mint forms the base of the treasury; primary sales of released community tokens add to it. Capital raised is not trading profit.', 'El mint inicial forma la base de la tesorería; las ventas primarias de tokens de la comunidad ya liberados la amplían. El capital captado no es beneficio del trading.')}</p></article>
      <article><span className="mono pn__kicker">{x('Investidores-anjo', 'Angel investors', 'Inversores ángel')}</span><h4 className="display">{x('100% para produto, tecnologia e marketing', '100% to product, technology and marketing', '100% para producto, tecnología y marketing')}</h4><p>{x('Sem salários nem retiradas do fundador.', 'No salaries or founder withdrawals.', 'Sin salarios ni retiros del fundador.')}</p></article>
    </div>
    <div className="pn__split" role="group" aria-label={x('Divisão do lucro elegível', 'Split of eligible profit', 'División del beneficio elegible')}>
      <p className="mono pn__kicker">{x('Lucro elegível após custos, obrigações, avaliação das posições abertas, reservas e liquidez', 'Eligible profit after costs, obligations, valuation of open positions, reserves and liquidity', 'Beneficio elegible tras costes, obligaciones, valoración de posiciones abiertas, reservas y liquidez')}</p>
      <dl>{split.map(([p, n, d]) => <div key={n}><dt>{n}</dt><dd className="display">{p}</dd><dd>{d}</dd></div>)}</dl>
      <p>{x('Todo BETTEX na carteira oficial participa automaticamente, sem chamada manual de staking; tokens bloqueados e estoque de venda ficam fora. A participação nos resultados não vem de emissão de tokens e não garante preço, resgate nem valor patrimonial.', 'All BETTEX in the official wallet participates automatically, with no manual staking call; locked tokens and sale inventory are excluded. Participation in results does not come from token issuance and guarantees no price, redemption or net asset value.', 'Todo BETTEX en la cartera oficial participa automáticamente, sin llamada manual de staking; los tokens bloqueados y el stock de venta quedan fuera. La participación en los resultados no proviene de emisión de tokens y no garantiza precio, rescate ni valor patrimonial.')}</p>
    </div>
  </div>;
}

export function PitchRisks() {
  const x = useX();
  const risks = [
    x('Mercado e perda: o token e o capital podem perder valor.', 'Market and loss: the token and capital can lose value.', 'Mercado y pérdida: el token y el capital pueden perder valor.'),
    x('Liquidez: a venda depende de haver compradores.', 'Liquidity: selling depends on buyers existing.', 'Liquidez: la venta depende de que haya compradores.'),
    x('Validação da estratégia de IA: desempenho ainda não provado.', 'AI strategy validation: performance is not yet proven.', 'Validación de la estrategia de IA: rendimiento aún no probado.'),
    x('Jurídico e Pix: dependem de adequação e de integração.', 'Legal and Pix: depend on compliance and integration.', 'Jurídico y Pix: dependen de adecuación e integración.'),
  ];
  return <div className="pn pn__risks" data-testid="pitch-risks">
    <p className="mono pn__kicker">{x('Riscos principais', 'Main risks', 'Riesgos principales')}</p>
    <ul>{risks.map(r => <li key={r}>{r}</li>)}</ul>
    <a href={`${DOC}#documentacao-financiamento-fundacao`} className="pn__link"><Landmark size={16} aria-hidden="true" />{x('Financiamento e regras na documentação', 'Funding and rules in the documentation', 'Financiación y reglas en la documentación')}</a>
  </div>;
}
