/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';

/** Introduces complementary features before the staking rules, without changing them. */
export function DocumentationAppIntroduction() {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  return <div className="whitepaper__prose" data-i18n="translated" data-testid="documentation-app-introduction">
    <p><strong>{x('Carteira e recursos opcionais', 'Wallet and optional features', 'Cartera y recursos opcionales')}</strong></p>
    <p>{x(
      'Na arquitetura do aplicativo, a carteira reúne os saldos e a participação em staking. Burn Lottery e Double 2X são recursos adicionais e opcionais, separados da tese DeFi e trading; não são condição para participar do staking nem alteram a divisão de seus lucros.',
      'In the application architecture, the wallet brings together balances and staking participation. Burn Lottery and Double 2X are additional, optional features, separate from the DeFi and trading thesis; they are not required for staking participation and do not change its profit split.',
      'En la arquitectura del aplicativo, la cartera reúne los saldos y la participación en staking. Burn Lottery y Double 2X son recursos adicionales y opcionales, separados de la tesis DeFi y trading; no son condición para participar en staking ni alteran su división de beneficios.',
    )}</p>
    <ul>
      <li><strong>{x('Carteira do aplicativo:', 'Application wallet:', 'Cartera del aplicativo:')}</strong>{' '}{x(
        'gerada com a conta, organiza os saldos em BETTEX e USDC. A exportação das chaves permite ao titular controlar a carteira fora do aplicativo. As chaves são privadas e não devem ser compartilhadas.',
        'generated with the account, it organizes BETTEX and USDC balances. Exporting the keys lets the holder control the wallet outside the application. Keys are private and must not be shared.',
        'generada con la cuenta, organiza los saldos en BETTEX y USDC. Exportar las claves permite al titular controlar la cartera fuera del aplicativo. Las claves son privadas y no deben compartirse.',
      )}</li>
      <li><strong>{x('Burn Lottery:', 'Burn Lottery:', 'Burn Lottery:')}</strong>{' '}{x(
        'recurso de sorteios com um número gratuito por carteira com BETTEX em staking. Entradas adicionais são pagas em BETTEX, e todo o valor pago é queimado diretamente. Essa compra é uma saída de BETTEX e segue as consequências de saída do staking; não garante prêmio.',
        'a draw feature with one free number per wallet holding staked BETTEX. Additional entries are paid in BETTEX, and the entire payment is burned directly. This purchase is a BETTEX exit and follows the staking exit consequences; it does not guarantee a prize.',
        'recurso de sorteos con un número gratuito por cartera con BETTEX en staking. Las entradas adicionales se pagan en BETTEX y todo el importe pagado se quema directamente. Esta compra es una salida de BETTEX y sigue las consecuencias de salida del staking; no garantiza un premio.',
      )}</li>
      <li><strong>{x('Double 2X:', 'Double 2X:', 'Double 2X:')}</strong>{' '}{x(
        'jogo de vermelho ou preto que usa apenas USDC de rendimentos já recebidos, nunca créditos pendentes. O resultado é 50/50: vitória devolve o dobro do valor jogado no total; derrota perde o valor jogado. Há uma jogada por 24 horas corridas, sem taxa do jogo e sem ganho garantido.',
        'a red-or-black game using only USDC from earnings already received, never pending credits. The outcome is 50/50: a win returns twice the played amount in total; a loss forfeits the played amount. There is one play per rolling 24 hours, with no game fee and no guaranteed gain.',
        'juego de rojo o negro que usa solo USDC de rendimientos ya recibidos, nunca créditos pendientes. El resultado es 50/50: ganar devuelve el doble del importe jugado en total; perder supone perder el importe jugado. Hay una jugada cada 24 horas corridas, sin tarifa del juego ni ganancia garantizada.',
      )}</li>
    </ul>
    <p>{x(
      'O demo é exclusivamente visual e não movimenta dinheiro real. A execução dos recursos depende de implantação, autorizações e condições próprias; as regras detalhadas permanecem na referência do aplicativo.',
      'The demo is visual only and does not move real money. Feature execution depends on deployment, authorizations and specific conditions; detailed rules remain in the application reference.',
      'El demo es exclusivamente visual y no mueve dinero real. La ejecución de los recursos depende de implementación, autorizaciones y condiciones propias; las reglas detalladas permanecen en la referencia del aplicativo.',
    )}</p>
  </div>;
}
