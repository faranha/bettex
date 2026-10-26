import { ArrowRight, Bot, Wallet, Coins, CalendarCheck, ShieldAlert, ReceiptText, ArrowLeftRight, Network } from 'lucide-react';
import { useX } from './pitchCopy';
import { PitchSlider } from './PitchSlider';
import './PitchNarrative.css';

export function PitchContext() {
  const x = useX();
  return <div className="pn pn__context">
      <div>
        <h3 id="pn-context-t" className="display pn__h">{x('Sem reservas, a perda pesa nas contas da casa.', 'Without savings, losses strain household bills.', 'Sin ahorros, las pérdidas afectan las cuentas del hogar.')}</h3>
      </div>
      <div className="pn__prose">
        <p>{x('Quem usa dinheiro essencial para tentar obter renda nas apostas arrisca o orçamento do mês. Apostar não é investir: o resultado depende de um evento, e a perda pode agravar a falta de reserva.', 'Using essential money to seek income from betting puts the monthly budget at risk. Betting is not investing: the outcome depends on an event, and a loss can worsen the lack of savings.', 'Quien usa dinero esencial para intentar obtener ingresos de las apuestas arriesga el presupuesto del mes. Apostar no es invertir: el resultado depende de un evento, y una pérdida puede agravar la falta de ahorros.')}</p>
        <p className="pn__fine">{x('Contexto, não prova de causalidade: a BETTEX não promete recuperar perdas de apostas nem garante renda.', 'Context, not proof of causality: BETTEX does not promise to recover betting losses or guarantee income.', 'Contexto, no prueba de causalidad: BETTEX no promete recuperar pérdidas de apuestas ni garantiza ingresos.')}</p>
        <a href="#publico-pitch" className="pn__link">{x('Ver dados e fontes do público', 'See audience data and sources', 'Ver datos y fuentes del público')}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
  </div>;
}

export function PitchJourney() {
  const x = useX();
  const steps = [
    { Icon: Coins, t: x('BETTEX: dono da IA', 'BETTEX: an owner of the AI', 'BETTEX: dueño de la IA') },
    { Icon: Wallet, t: x('Participação automática na carteira', 'Automatic participation in the wallet', 'Participación automática en la cartera') },
    { Icon: Bot, t: x('BETTEX coordena os subagentes', 'BETTEX coordinates the subagents', 'BETTEX coordina los subagentes') },
    { Icon: CalendarCheck, t: x('Apuração e desconto de taxas', 'Calculation and fee deduction', 'Cálculo y descuento de comisiones') },
    { Icon: Wallet, t: x('Crédito líquido em USDC', 'Net credit in USDC', 'Abono neto en USDC') },
  ];
  return <div className="pn pn__journey" data-testid="pitch-participation-journey">
    <PitchSlider id="jornada-slider" tone="light" label={['Jornada de participação em blocos', 'Participation journey blocks', 'Jornada de participación por bloques']} slides={[
      { label: ['Compra e participação', 'Purchase and participation', 'Compra y participación'], node: <>
    <p className="pn__lead">{x('Ter BETTEX é ser dono da IA junto à comunidade, com participação nos lucros elegíveis conforme as regras do token, sem precisar operar manualmente. A liquidação é em USDC. Hoje, o demo é apenas visual, sem compras ou pagamentos reais.', 'Holding BETTEX means owning the AI together with the community, with participation in eligible profits under the token rules, without trading manually. Settlement is in USDC. Today, the demo is visual only, with no real purchases or payments.', 'Tener BETTEX es ser dueño de la IA junto a la comunidad, con participación en los beneficios elegibles según las reglas del token, sin operar manualmente. La liquidación es en USDC. Hoy, el demo es solo visual, sin compras ni pagos reales.')}</p>
    <ol className="pn__steps">
      {steps.map(({ Icon, t }, i) => <li key={i} className="pn__step"><span className="pn__stepn mono">{String(i + 1).padStart(2, '0')}</span><Icon size={24} aria-hidden="true" /><strong>{t}</strong></li>)}
    </ol>
    <div id="diferencial" className="pn__diff">
      <strong>{x('Diferença de direito econômico', 'Difference in economic right', 'Diferencia de derecho económico')}</strong>
      <span>{x('Na aposta, o resultado depende do evento; num token centrado no preço, da revenda. Na BETTEX, o token conecta seu titular à IA e à comunidade, com direito à participação nos lucros elegíveis segundo as regras da carteira. Não é uma empresa oferecendo rendimento a clientes.', 'In betting, the outcome depends on the event; in a price-centered token, on resale. In BETTEX, the token connects its holder to the AI and the community, with the right to participate in eligible profits under the wallet rules. This is not a company offering returns to customers.', 'En la apuesta, el resultado depende del evento; en un token centrado en el precio, de la reventa. En BETTEX, el token conecta a su titular con la IA y la comunidad, con derecho a participar en los beneficios elegibles según las reglas de la cartera. No es una empresa ofreciendo rentabilidad a clientes.')}</span>
    </div>
      </> },
      { label: ['Liquidação e custos', 'Settlement and costs', 'Liquidación y costes'], node: <>
    <div className="pn__pix" data-testid="pitch-crypto-settlement">
      <span className="pn__pixtag mono">{x('Operação em cripto', 'Crypto operations', 'Operación en cripto')}</span>
      <h4 className="display pn__icon-heading"><Wallet aria-hidden="true" /><span>{x('Resultados em USDC.', 'Results in USDC.', 'Resultados en USDC.')}</span></h4>
      <p>{x('A apuração é diária, conforme as regras de elegibilidade e o lucro disponível. A liquidação ocorre em USDC, sem vender seus tokens BETTEX.', 'Results are calculated daily, according to eligibility rules and available profit. Settlement takes place in USDC, without selling your BETTEX tokens.', 'El cálculo es diario, según las reglas de elegibilidad y el beneficio disponible. La liquidación se realiza en USDC, sin vender tus tokens BETTEX.')}</p>
    </div>
    <div className="pn__pix" data-testid="pitch-operation-fees" aria-labelledby="pitch-operation-fees-t">
      <span className="pn__pixtag mono">{x('Custos da operação', 'Transaction costs', 'Costes de la operación')}</span>
      <h4 id="pitch-operation-fees-t" className="display pn__icon-heading"><ReceiptText aria-hidden="true" /><span>{x('Resultado líquido, após descontar as taxas.', 'Net result, after fees are deducted.', 'Resultado neto, después de descontar las comisiones.')}</span></h4>
      <details className="pn__cost-details">
      <summary>{x('Ver custos e descontos', 'View costs and deductions', 'Ver costes y deducciones')}</summary>
      <ul className="pn__rules pn__icon-rules">
        <li><ArrowLeftRight aria-hidden="true" /><span>{x('Compra e venda de BETTEX: negociação dos tokens para o usuário.', 'BETTEX purchases and sales: trading tokens for the user.', 'Compra y venta de BETTEX: negociación de los tokens para el usuario.')}</span></li>
        <li><Network aria-hidden="true" /><span>{x('Taxas de rede e demais custos das operações realizadas também são considerados.', 'Network fees and other costs of completed transactions are also included.', 'También se consideran las comisiones de red y los demás costes de las operaciones realizadas.')}</span></li>
      </ul>
      <p>{x('Essas operações têm custo. As taxas são debitadas dos ganhos diários do participante; o valor líquido em USDC considera esses descontos, não apenas o ganho bruto.', 'These transactions have costs. Fees are deducted from the participant’s daily earnings; the net amount in USDC includes these deductions, not just gross earnings.', 'Estas operaciones tienen coste. Las comisiones se descuentan de las ganancias diarias del participante; el importe neto en USDC considera estos descuentos, no solo la ganancia bruta.')}</p>
      </details>
      <p className="font-bold">{x('Ganhos diários − taxas das operações = valor líquido em USDC.', 'Daily earnings − transaction fees = net amount in USDC.', 'Ganancias diarias − comisiones de las operaciones = importe neto en USDC.')}</p>
    </div>
      </> },
      { label: ['Liberdade e regras', 'Freedom and rules', 'Libertad y reglas'], node: <>
    <h4 className="display pn__exit-title">{x('Saia quando quiser.', 'Leave whenever you want.', 'Sal cuando quieras.')}</h4>
    <p>{x('Venda todos os tokens que comprou. A venda depende de compradores e liquidez, sem preço ou recompra garantidos.', 'Sell all the tokens you bought. Sales depend on buyers and liquidity, with no guaranteed price or buyback.', 'Vende todos los tokens que compraste. La venta depende de compradores y liquidez, sin precio ni recompra garantizados.')}</p>
    <ul className="pn__rules">
      <li>{x('Compra durante uma rodada qualifica para a próxima rodada.', 'A purchase during a round qualifies for the next round.', 'Una compra durante una ronda califica para la siguiente.')}</li>
      <li>{x('Receber lucro não queima tokens.', 'Receiving profit does not burn tokens.', 'Cobrar beneficio no quema tokens.')}</li>
      <li>{x('Saídas cancelam direitos ainda não pagos, conforme as regras.', 'Exits cancel unpaid rights, per the rules.', 'Las salidas cancelan derechos aún no pagados, según las reglas.')}</li>
      <li>{x('Venda só com liquidez; sem lucro, sem distribuição.', 'Selling only with liquidity; no profit, no distribution.', 'Venta solo con liquidez; sin beneficio, sin distribución.')}</li>
    </ul>
    <p className="pn__fine"><ShieldAlert size={14} aria-hidden="true" /> {x('O token pode perder valor. O demo é apenas visual: sem trading ou pagamentos reais. Nenhum retorno é garantido.', 'The token can lose value. The demo is visual only: no real trading or payments. No return is guaranteed.', 'El token puede perder valor. El demo es solo visual: sin trading ni pagos reales. No se garantiza ningún retorno.')}</p>
      </> },
    ]} />
  </div>;
}

export function PitchStrategy() {
  const x = useX();
  return <div className="pn pn__strategy">
    <div className="pn__strategy-cards">
      <article className="pn__strategy-card">
        <p>{x('BETTEX coordena subagentes de análise quantitativa para identificar padrões de manipulação em cripto. Eles orientam a seleção de ativos, entradas e saídas, dentro dos limites de risco e das etapas de validação.', 'BETTEX coordinates quantitative-analysis subagents to identify manipulation patterns in crypto. They guide asset selection, entries and exits within risk limits and validation stages.', 'BETTEX coordina subagentes de análisis cuantitativo para identificar patrones de manipulación en cripto. Orientan la selección de activos, entradas y salidas dentro de los límites de riesgo y las etapas de validación.')}</p>
      </article>
      <article className="pn__strategy-card">
        <p>{x('O agente da comunidade opera com a tesouraria, nunca com os tokens de seus titulares. O fundador e o time administram no início; a descentralização e a autonomia por IA evoluem por etapas, com desempenho validado e controles. BETTEX é um projeto de tecnologia, não um fundo de investimentos.', 'The community’s agent operates with the treasury, never with holders’ tokens. The founder and team administer at first; decentralization and AI autonomy advance in stages, with validated performance and controls. BETTEX is a technology project, not an investment fund.', 'El agente de la comunidad opera con la tesorería, nunca con los tokens de sus titulares. El fundador y el equipo administran al inicio; la descentralización y la autonomía de la IA avanzan por etapas, con desempeño validado y controles. BETTEX es un proyecto de tecnología, no un fondo de inversión.')}</p>
      </article>
    </div>
    <dl className="pn__facts">
      <div><dt><span className="pn__fact-icon" aria-hidden="true"><Network size={20} strokeWidth={2.2} /></span><span>{x('Estrutura de IA', 'AI structure', 'Estructura de IA')}</span></dt><dd>{x('BETTEX + subagentes', 'BETTEX + subagents', 'BETTEX + subagentes')}</dd></div>
      <div><dt><span className="pn__fact-icon" aria-hidden="true"><Wallet size={20} strokeWidth={2.2} /></span><span>{x('Capital operado', 'Operated capital', 'Capital operado')}</span></dt><dd>{x('Tesouraria', 'Treasury', 'Tesorería')}</dd></div>
      <div><dt><span className="pn__fact-icon" aria-hidden="true"><ArrowLeftRight size={20} strokeWidth={2.2} /></span><span>{x('Entradas e saídas das operações', 'Trade entries and exits', 'Entradas y salidas de las operaciones')}</span></dt><dd>{x('Padrões de manipulação', 'Manipulation patterns', 'Patrones de manipulación')}</dd></div>
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
    <div className="pn__prose">
      <article><span className="mono pn__kicker">{x('Capital', 'Capital', 'Capital')}</span><h4 className="display">{x('Mint inicial e vendas da comunidade', 'Initial mint and community sales', 'Mint inicial y ventas de la comunidad')}</h4><p>{x('O mint inicial forma a base da tesouraria; as vendas primárias de tokens da comunidade já liberados a ampliam. Capital captado não é lucro do trading.', 'The initial mint forms the base of the treasury; primary sales of released community tokens add to it. Capital raised is not trading profit.', 'El mint inicial forma la base de la tesorería; las ventas primarias de tokens de la comunidad ya liberados la amplían. El capital captado no es beneficio del trading.')}</p></article>
    </div>
    <div className="pn__split" role="group" aria-label={x('Divisão do lucro elegível', 'Split of eligible profit', 'División del beneficio elegible')}>
      <p className="mono pn__kicker">{x('Lucro elegível após custos, obrigações, avaliação das posições abertas, reservas e liquidez', 'Eligible profit after costs, obligations, valuation of open positions, reserves and liquidity', 'Beneficio elegible tras costes, obligaciones, valoración de posiciones abiertas, reservas y liquidez')}</p>
      <dl>{split.map(([p, n, d]) => <div key={n}><dt>{n}</dt><dd className="display">{p}</dd><dd>{d}</dd></div>)}</dl>
      <p>{x('Todo BETTEX na carteira oficial participa automaticamente, sem chamada manual de staking; tokens bloqueados e estoque de venda ficam fora. A participação nos resultados não vem de emissão de tokens e não garante preço, resgate nem valor patrimonial.', 'All BETTEX in the official wallet participates automatically, with no manual staking call; locked tokens and sale inventory are excluded. Participation in results does not come from token issuance and guarantees no price, redemption or net asset value.', 'Todo BETTEX en la cartera oficial participa automáticamente, sin llamada manual de staking; los tokens bloqueados y el stock de venta quedan fuera. La participación en los resultados no proviene de emisión de tokens y no garantiza precio, rescate ni valor patrimonial.')}</p>
    </div>
  </div>;
}

