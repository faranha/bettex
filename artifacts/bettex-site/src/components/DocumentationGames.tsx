/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import './DocumentationGames.css';

export function DocumentationGames() {
  const lc = useLocale();
  const x = (pt: string, en: string, es: string) => (lc === 'en' ? en : lc === 'es' ? es : pt);
  const step = (key: string, title: string, sub: string, tone?: 'gold' | 'plain') => (
    <li key={key} className={tone ? `is-${tone}` : undefined}><strong>{title}</strong><p>{sub}</p></li>
  );
  const example = (key: string, label: string, ret: string, net: string) => (
    <div key={key}>
      <span>{label}</span>
      <dl>
        <dt>{x('Jogado', 'Played', 'Jugado')}</dt><dd>10 USDC</dd>
        <dt>{x('Devolvido', 'Returned', 'Devuelto')}</dt><dd>{ret} USDC</dd>
        <dt>{x('Lucro líquido', 'Net profit', 'Beneficio neto')}</dt><dd>{net} USDC</dd>
      </dl>
    </div>
  );
  return (
    <section id="documentacao-recursos-carteiras" className="dg" aria-labelledby="dg-title" data-i18n="translated">
      <h3 id="dg-title" className="dg__sub">{x('Recursos das carteiras: Loteria e Double 2X', 'Wallet features: Lottery and Double 2X', 'Recursos de las carteras: Lotería y Double 2X')}</h3>
      <p className="dg__notice"><strong>{x(
        'A execução destes recursos depende de implantação compatível com a rede, autorizações válidas, disponibilidade de gás e liquidação confirmada. As regras e os exemplos não garantem resultado nem pagamento.',
        'Execution of these features depends on network-compatible deployment, valid authorizations, gas availability and confirmed settlement. The rules and examples do not guarantee an outcome or payment.',
        'La ejecución de estos recursos depende de una implementación compatible con la red, autorizaciones válidas, disponibilidad de gas y liquidación confirmada. Las reglas y los ejemplos no garantizan un resultado ni un pago.')}</strong></p>

      <section id="documentacao-loteria" aria-labelledby="dg-lot">
        <h4 id="dg-lot" className="dg__sub">Burn Lottery</h4>
        <ul className="dg__list">
          <li>{x('Cada carteira com BETTEX em staking recebe um número gratuito.', 'Each wallet with staked BETTEX receives one free number.', 'Cada cartera con BETTEX en staking recibe un número gratuito.')}</li>
          <li>{x('Entradas adicionais são pagas em BETTEX, e todo BETTEX pago é queimado de forma permanente e direta. Não é USDC, receita de serviços nem financiamento de prêmio.', 'Additional entries are paid in BETTEX, and all paid BETTEX is permanently and directly burned. It is not USDC, service revenue or prize financing.', 'Las entradas adicionales se pagan en BETTEX y todo el BETTEX pagado se quema de forma permanente y directa. No es USDC, ingreso por servicios ni financiación de premios.')}</li>
          <li>{x('Não há limite de negócio para a quantidade comprada.', 'There is no business cap on the purchased quantity.', 'No hay límite de negocio para la cantidad comprada.')}</li>
          <li>{x('No modelo operacional, os números só são gerados após o pagamento confirmado.', 'In the operational model, numbers are generated only after confirmed payment.', 'En el modelo operativo, los números solo se generan tras el pago confirmado.')}</li>
          <li>{x('Qualquer saída de BETTEX, inclusive o pagamento da loteria, cancela todos os créditos de staking anteriores ainda não pagos da rodada atual e zera todo o peso, inclusive o saldo restante. A participação só recomeça na próxima rodada. USDC já recebido não é recuperado.', 'Any BETTEX exit, including the lottery payment, cancels all prior unpaid staking credits of the current round and resets all weight, including the remaining balance. Participation resumes only in the next round. USDC already received is not reclaimed.', 'Cualquier salida de BETTEX, incluido el pago de la lotería, cancela todos los créditos de staking anteriores aún no pagados de la ronda actual y reinicia todo el peso, incluido el saldo restante. La participación solo se reinicia en la próxima ronda. El USDC ya recibido no se recupera.')}</li>
          <li>{x('O sorteio exige regulamento próprio com preço, prêmio, financiamento, prazo e probabilidades antes de aceitar entradas. Quantidade ilimitada de números não significa chance ou prêmio garantidos.', 'A draw requires its own rules specifying price, prize, funding, timing and odds before accepting entries. Unlimited entry quantity does not mean guaranteed odds or prizes.', 'El sorteo exige reglas propias con precio, premio, financiación, plazo y probabilidades antes de aceptar entradas. Una cantidad ilimitada de números no significa probabilidades ni premios garantizados.')}</li>
        </ul>
        <figure className="dg__fig">
          <figcaption className="dg__cap">{x('Fluxo da Burn Lottery', 'Burn Lottery flow', 'Flujo de Burn Lottery')}</figcaption>
          <ol className="dg__flow" style={{ ['--n' as string]: 4 }}>
            {step('a', x('BETTEX em staking', 'Staked BETTEX', 'BETTEX en staking'), x('1 número gratuito por carteira', '1 free number per wallet', '1 número gratuito por cartera'))}
            {step('b', x('Entrada extra opcional em BETTEX', 'Optional extra entry in BETTEX', 'Entrada extra opcional en BETTEX'), x('Quantidade sem limite de negócio', 'No business cap on quantity', 'Cantidad sin límite de negocio'), 'gold')}
            {step('c', x('Burn permanente', 'Permanent burn', 'Quema permanente'), x('Direto; não vira receita nem prêmio', 'Direct; not revenue or prize', 'Directa; no es ingreso ni premio'), 'gold')}
            {step('d', x('Peso de staking zerado', 'Staking weight reset', 'Peso de staking reiniciado'), x('Créditos cancelados; retorno só na próxima rodada', 'Credits cancelled; participation resumes next round only', 'Créditos cancelados; participación solo en la próxima ronda'), 'plain')}
          </ol>
        </figure>
      </section>

      <section id="documentacao-double-2x" aria-labelledby="dg-dbl">
        <h4 id="dg-dbl" className="dg__sub">Double 2X</h4>
        <ul className="dg__list">
          <li>{x('Jogo opcional vermelho ou preto, usando apenas USDC de rendimentos já recebidos, nunca créditos de staking pendentes.', 'Optional red or black game using only USDC earnings already received, never pending staking credits.', 'Juego opcional rojo o negro que usa solo USDC de rendimientos ya recibidos, nunca créditos de staking pendientes.')}</li>
          <li>{x('Resultado 50/50. Vitória devolve o dobro da aposta combinada no total, com ganho líquido de uma aposta paga pela tesouraria. Derrota transfere a aposta jogada à tesouraria.', '50/50 outcome. A win returns twice the agreed stake in total, a net gain of one stake paid by the treasury. A loss transfers the played stake to the treasury.', 'Resultado 50/50. Ganar devuelve el doble de la apuesta acordada en total, con ganancia neta de una apuesta pagada por la tesorería. Perder transfiere la apuesta jugada a la tesorería.')}</li>
          <li>{x('RTP de 100% é a expectativa teórica de longo prazo, não garantia por jogada nem retorno sem risco.', 'An RTP of 100% is the theoretical long-run expectation, not a guarantee per play or a risk-free return.', 'Un RTP del 100% es la expectativa teórica de largo plazo, no una garantía por jugada ni un retorno sin riesgo.')}</li>
          <li>{x('Uma jogada a cada 24 horas corridas, não por data de calendário.', 'One play per rolling 24 hours, not per calendar date.', 'Una jugada cada 24 horas corridas, no por fecha de calendario.')}</li>
          <li>{x('Sem taxa do jogo; aleatoriedade e gás são financiados separadamente, conforme aprovado.', 'No game fee; randomness and gas costs are funded separately, as approved.', 'Sin tarifa del juego; la aleatoriedad y el gas se financian por separado, según lo aprobado.')}</li>
          <li>{x('O jogo não é estratégia de investimento da tesouraria e não altera a divisão dos lucros do staking.', 'The game is not a treasury investment strategy and does not change the staking profit split.', 'El juego no es una estrategia de inversión de la tesorería y no altera la división de beneficios del staking.')}</li>
        </ul>
        <figure className="dg__fig">
          <figcaption className="dg__cap">{x('Fluxo do Double 2X', 'Double 2X flow', 'Flujo de Double 2X')}</figcaption>
          <ol className="dg__flow" style={{ ['--n' as string]: 4 }}>
            {step('a', x('USDC já recebido', 'USDC already received', 'USDC ya recibido'), x('Não inclui créditos pendentes', 'Excludes pending credits', 'No incluye créditos pendientes'))}
            {step('b', x('Aposta vermelho ou preto', 'Red or black stake', 'Apuesta rojo o negro'), x('Uma jogada por 24h corridas', 'One play per rolling 24h', 'Una jugada por 24h corridas'), 'gold')}
            {step('c', x('Resultado 50/50', '50/50 outcome', 'Resultado 50/50'), x('Sem taxa do jogo', 'No game fee', 'Sin tarifa del juego'), 'gold')}
            {step('d', x('Vitória ou derrota', 'Win or loss', 'Victoria o derrota'), x('Vitória: 2x do total; derrota: aposta à tesouraria', 'Win: 2x total; loss: stake to treasury', 'Victoria: 2x del total; derrota: apuesta a la tesorería'), 'plain')}
          </ol>
        </figure>
        <h5 className="dg__cap">{x('Exemplos com 10 USDC jogados', 'Examples with 10 USDC played', 'Ejemplos con 10 USDC jugados')}</h5>
        <div className="dg__ex">
          {example('w', x('VITÓRIA', 'WIN', 'VICTORIA'), '20', '+10')}
          {example('l', x('DERROTA', 'LOSS', 'DERROTA'), '0', '-10')}
        </div>
      </section>
    </section>
  );
}

export default DocumentationGames;
