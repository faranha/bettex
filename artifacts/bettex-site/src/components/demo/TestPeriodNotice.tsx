/** @jsxImportSource react */
import { useX } from './ui';

export function TestPeriodNotice() {
  const { x } = useX();
  return <section className="dcard border-[#E7B98A] bg-[#FFF3E3] p-4 sm:p-5" data-testid="test-period-notice">
    <h2 className="display text-base font-extrabold">{x('Período de testes ALFA', 'ALFA testing period', 'Período de pruebas ALFA')}</h2>
    <p className="mt-2 text-sm">{x('Sua conta demo já está com a sessão de teste ativa. Depósitos, compras, conversões, saques e rendimentos nesta demonstração são emulados. Nenhum pagamento, assinatura ou transação blockchain real é realizado.', 'Your demo account already has an active test session. Deposits, purchases, conversions, withdrawals and yield in this demonstration are emulated. No real payment, signing or blockchain transaction is performed.', 'Tu cuenta demo ya tiene una sesión de prueba activa. Depósitos, compras, conversiones, retiros y rendimientos en esta demostración son emulados. No se realiza ningún pago, firma ni transacción blockchain real.')}</p>
  </section>;
}
