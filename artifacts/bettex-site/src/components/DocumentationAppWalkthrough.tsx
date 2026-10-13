/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import { DemoAppLink } from './DemoAppLink';

export function DocumentationAppWalkthrough() {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  const steps = [
    [x('1. Entrar e conhecer as carteiras', '1. Enter and explore the wallets', '1. Entrar y conocer las carteras'), x(
      'A pessoa abre o app e consulta seus saldos em BETTEX e USDC. BETTEX identifica sua participação; USDC reúne os valores já recebidos. O demo abre sem cadastro, com saldos fictícios.',
      'The person opens the app and checks BETTEX and USDC balances. BETTEX identifies participation; USDC holds amounts already received. The demo opens without registration, with fictional balances.',
      'La persona abre el app y consulta sus saldos en BETTEX y USDC. BETTEX identifica su participación; USDC reúne los importes ya recibidos. El demo abre sin registro, con saldos ficticios.',
    )],
    [x('2. Participar de uma rodada', '2. Participate in a round', '2. Participar en una ronda'), x(
      'No exemplo, 1.000 BETTEX elegíveis permanecem durante toda a rodada, sem saídas, e representam 1% do peso elegível total. A participação é automática. Entradas durante a rodada esperam a próxima; tokens em vesting não participam.',
      'In the example, 1,000 eligible BETTEX remain throughout the round, without exits, and represent 1% of total eligible weight. Participation is automatic. Entries during the round wait for the next one; vesting tokens do not participate.',
      'En el ejemplo, 1.000 BETTEX elegibles permanecen durante toda la ronda, sin salidas, y representan el 1% del peso elegible total. La participación es automática. Las entradas durante la ronda esperan la siguiente; los tokens en vesting no participan.',
    )],
    [x('3. Acompanhar a Central da IA', '3. Follow the AI Center', '3. Seguir la Central de IA'), x(
      'A pessoa acompanha mercados, análises e relatórios, sem operar manualmente os agentes. Na arquitetura, BETTEX integra propostas dos subagentes com risco e tesouraria. O demo apresenta Cripto; Esportes, Predictions e iGaming ficam em breve, sem ordens reais.',
      'The person follows markets, analyses and reports, without manually operating agents. In the architecture, BETTEX integrates subagent proposals with risk and treasury. The demo presents Crypto; Sports, Predictions and iGaming are coming soon, without real orders.',
      'La persona sigue mercados, análisis e informes, sin operar manualmente los agentes. En la arquitectura, BETTEX integra propuestas de los subagentes con riesgo y tesorería. El demo presenta Cripto; Deportes, Predictions e iGaming están próximamente, sin órdenes reales.',
    )],
    [x('4. Entender o resultado', '4. Understand the result', '4. Entender el resultado'), x(
      'Com condições de distribuição atendidas e lucro elegível hipotético de 10.000 USDC, 5.000 ficam na tesouraria, 2.500 vão aos participantes e 2.500 à recompra. O peso de 1% dá 25 USDC dessa parcela de 2.500, após liquidação conciliada. Sem lucro elegível, não há pagamento.',
      'With distribution conditions met and hypothetical eligible profit of 10,000 USDC, 5,000 remain in treasury, 2,500 go to participants and 2,500 to buybacks. The 1% weight gives 25 USDC from that 2,500 share, after reconciled settlement. Without eligible profit, there is no payment.',
      'Con condiciones de distribución cumplidas y beneficio elegible hipotético de 10.000 USDC, 5.000 quedan en tesorería, 2.500 van a participantes y 2.500 a recompra. El peso del 1% da 25 USDC de esa parte de 2.500, tras liquidación conciliada. Sin beneficio elegible, no hay pago.',
    )],
    [x('5. Consultar e decidir', '5. Review and decide', '5. Consultar y decidir'), x(
      'Carteiras mostra o recebimento; Histórico explica movimentos; Tesouraria separa destinações. USDC recebido permanece pessoal. Saídas de BETTEX cancelam créditos ainda não pagos. Burn Lottery é o sorteio com queima de BETTEX; Double 2X é o jogo de vermelho/preto, com risco de perder rendimentos recebidos. Ambos são opcionais.',
      'Wallets shows receipt; History explains movements; Treasury separates allocations. Received USDC remains personal. BETTEX exits cancel unpaid credits. Burn Lottery is the draw with BETTEX burning; Double 2X is the red/black game, with a risk of losing received earnings. Both are optional.',
      'Carteras muestra la recepción; Historial explica movimientos; Tesorería separa destinos. El USDC recibido sigue siendo personal. Salidas de BETTEX cancelan créditos aún no pagados. Burn Lottery es el sorteo con quema de BETTEX; Double 2X es el juego de rojo/negro, con riesgo de perder rendimientos recibidos. Ambos son opcionales.',
    )],
  ];
  return <section data-i18n="translated" data-testid="documentation-app-walkthrough">
    <h3 className="whitepaper__subhead" id="documentacao-percurso-app">{x(
      'Como funciona no aplicativo', 'How it works in the application', 'Cómo funciona en el aplicativo',
    )}</h3>
    <div className="whitepaper__prose">
      <p>{x(
        'Caso ilustrativo: uma pessoa acompanha uma rodada pelo app. Os números são hipotéticos, não são os saldos do demo nem uma projeção de retorno.',
        'Illustrative case: a person follows a round through the app. Numbers are hypothetical, not demo balances or a return projection.',
        'Caso ilustrativo: una persona sigue una ronda en el app. Los números son hipotéticos, no son los saldos del demo ni una proyección de rentabilidad.',
      )}</p>
      {steps.map(([title, text]) => <p key={title}><strong>{title}</strong><br />{text}</p>)}
      <p><strong>{x(
        'O demo é exclusivamente visual: navegação, gráficos, filtros e abas são exploráveis. Compras, saques e demais ações operacionais abrem um aviso; não movimentam dinheiro real.',
        'The demo is visual only: navigation, charts, filters and tabs can be explored. Purchases, withdrawals and other operational actions open a notice; they do not move real money.',
        'El demo es exclusivamente visual: se pueden explorar navegación, gráficos, filtros y pestañas. Compras, retiros y demás acciones operativas abren un aviso; no mueven dinero real.',
      )}</strong></p>
      <p><DemoAppLink data-i18n="translated" className="inline-flex items-center justify-center rounded-md bg-[#F5B638] px-5 py-3 font-bold text-[#070B1F] no-underline hover:bg-[#ffd369]" aria-label={x('Explorar o demo BETTEX', 'Explore the BETTEX demo', 'Explorar el demo BETTEX')}>
        {x('Explorar o demo BETTEX', 'Explore the BETTEX demo', 'Explorar el demo BETTEX')}
      </DemoAppLink></p>
    </div>
  </section>;
}
