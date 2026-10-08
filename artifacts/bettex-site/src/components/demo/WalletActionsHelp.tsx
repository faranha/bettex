/** @jsxImportSource react */
import { useX } from './ui';
import { WalletHelp } from './WalletHelp';
import type { Asset } from './fin';

export function WalletActionsHelp({ asset, exportAvailable }: { asset: Asset; exportAvailable: boolean }) {
  const { x } = useX();
  return <WalletHelp id={`actions-${asset}`} iconOnly label={x('Ações desta carteira', 'Wallet actions', 'Acciones de esta cartera')}>
    <p>{asset === 'USDC'
      ? x('Adicionar: receber USDC no endereço desta carteira. Retirar: enviar USDC para uma carteira cripto externa; não é saque via Pix.', 'Add: receive USDC at this wallet address. Withdraw: send USDC to an external crypto wallet; this is not a Pix withdrawal.', 'Agregar: recibir USDC en la dirección de esta cartera. Retirar: enviar USDC a una cartera cripto externa; no es un retiro por Pix.')
      : x('Adicionar: receber BETTEX no endereço desta carteira. Retirar: enviar BETTEX para outra carteira. Uma saída, mesmo parcial, cancela toda a participação ainda não paga da rodada no demo.', 'Add: receive BETTEX at this wallet address. Withdraw: send BETTEX to another wallet. Any exit, even partial, cancels all unpaid round participation in the demo.', 'Agregar: recibir BETTEX en la dirección de esta cartera. Retirar: enviar BETTEX a otra cartera. Cualquier salida, incluso parcial, cancela toda la participación aún no pagada de la ronda en el demo.')}</p>
    <p>{asset === 'USDC'
      ? x('Converter: trocar USDC por BETTEX. Confira a cotação e o valor a receber antes de confirmar.', 'Convert: swap USDC for BETTEX. Review the quote and amount to receive before confirming.', 'Convertir: cambiar USDC por BETTEX. Revisa la cotización y el importe a recibir antes de confirmar.')
      : x('Converter: trocar BETTEX por USDC. Também é uma saída de BETTEX e segue a mesma regra de cancelamento da rodada no demo.', 'Convert: swap BETTEX for USDC. This is also a BETTEX exit and follows the same round-cancellation rule in the demo.', 'Convertir: cambiar BETTEX por USDC. También es una salida de BETTEX y sigue la misma regla de cancelación de la ronda en el demo.')}</p>
    <p>{x('Histórico: consultar o extrato filtrado por esta carteira, com valores, status e datas. Abrir o histórico não movimenta saldo.', 'History: view this wallet’s filtered statement, including amounts, status and dates. Opening history does not move funds.', 'Historial: consultar el extracto filtrado de esta cartera, con importes, estados y fechas. Abrir el historial no mueve saldo.')}</p>
    {exportAvailable && <p>{x('Chave: abrir os dados de exportação desta carteira; clicar novamente fecha o painel. A chave privada só aparece quando você solicita sua revelação. Nunca a compartilhe: ela permite controlar a carteira.', 'Key: open this wallet’s export data; click again to close the panel. The private key appears only when you request to reveal it. Never share it: it grants control of the wallet.', 'Llave: abrir los datos de exportación de esta cartera; otro clic cierra el panel. La clave privada solo aparece cuando solicitas revelarla. Nunca la compartas: permite controlar la cartera.')}</p>}
    <p>{x('ALFA: use apenas ativos de teste e confira a rede no formulário. Não envie dinheiro real.', 'ALPHA: use test assets only and check the network in the form. Do not send real money.', 'ALFA: utiliza solo activos de prueba y comprueba la red en el formulario. No envíes dinero real.')}</p>
  </WalletHelp>;
}
