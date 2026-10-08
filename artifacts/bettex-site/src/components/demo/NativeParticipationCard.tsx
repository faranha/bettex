/** @jsxImportSource react */
import { Link } from 'wouter';
import type { DemoProfile } from '@workspace/api-client-react';
import { useX } from './ui';
import { demoPath } from './demo-navigation';
import { tokenUnits, usdcUnits } from './personal-native';
import { usePersonalNative } from './use-personal-native';
import { WalletHelp } from './WalletHelp';

export function NativeParticipationCard({ profile }: { profile: DemoProfile }) {
  const { x, loc } = useX(); const { j, state, journeyLoading, stale } = usePersonalNative(profile);
  if (state !== 'ready') return null;
  const na = x('indisponível', 'unavailable', 'no disponible');
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const t = (n: number | null) => n === null ? '—' : new Date(n < 1e12 ? n * 1000 : n).toLocaleString(fl, { timeZone: 'America/Sao_Paulo' });
  const p = j?.participation;
  const explanations = [
    x('Quantidade total de BETTEX confirmada pelo protocolo, incluindo a parcela que não está elegível nesta rodada.', 'Total BETTEX confirmed by the protocol, including the portion not eligible in this round.', 'Cantidad total de BETTEX confirmada por el protocolo, incluida la parte no elegible en esta ronda.'),
    x('Quantidade que o protocolo reconhece como elegível para participar. Não significa que todo o saldo esteja elegível nem garante pagamento.', 'Amount the protocol recognizes as eligible to participate. It does not mean the whole balance is eligible or guarantee payment.', 'Cantidad que el protocolo reconoce como elegible para participar. No significa que todo el saldo sea elegible ni garantiza un pago.'),
    x('Início da participação registrado pelo protocolo, exibido no horário de São Paulo. Não é a data de criação da conta.', 'Participation start recorded by the protocol, shown in São Paulo time. It is not the account creation date.', 'Inicio de participación registrado por el protocolo, mostrado en horario de São Paulo. No es la fecha de creación de la cuenta.'),
    x('Peso registrado pelo protocolo em tokens multiplicados pelo tempo elegível em segundos. É uma medida de participação, não saldo de tokens ou USDC.', 'Protocol-recorded weight in tokens multiplied by eligible seconds. It measures participation, not a token or USDC balance.', 'Peso registrado por el protocolo en tokens multiplicados por segundos elegibles. Mide la participación, no un saldo de tokens o USDC.'),
    x('Instantes de abertura e encerramento da rodada nativa, no horário de São Paulo. Cada rodada é independente.', 'Opening and closing times of the native round, in São Paulo time. Each round is independent.', 'Instantes de inicio y cierre de la ronda nativa, en horario de São Paulo. Cada ronda es independiente.'),
    x('Valor apurado pelo protocolo nesta rodada. Apuração não é sinônimo de pagamento; confira o valor já pago e o extrato.', 'Amount assessed by the protocol in this round. Assessment is not payment; check the paid amount and statement.', 'Importe calculado por el protocolo en esta ronda. El cálculo no equivale al pago; comprueba el importe pagado y el extracto.'),
    x('Saldo USDC confirmado na carteira, que pode incluir depósitos e outros movimentos. Não é apenas o rendimento desta rodada.', 'Confirmed wallet USDC balance, which may include deposits and other movements. It is not just this round’s earnings.', 'Saldo USDC confirmado en la cartera, que puede incluir depósitos y otros movimientos. No son solo las ganancias de esta ronda.'),
    x('Valor que o protocolo registra como já pago. Não inclui projeções nem valores ainda pendentes.', 'Amount the protocol records as paid. It does not include forecasts or amounts still pending.', 'Importe que el protocolo registra como pagado. No incluye proyecciones ni importes aún pendientes.'),
  ];
  const rows: [string, string][] = p ? [
    [x('Saldo confirmado em BETTEX', 'Confirmed BETTEX balance', 'Saldo confirmado en BETTEX'), `${tokenUnits(p.balance) ?? na} BETTEX`],
    [x('BETTEX elegível', 'Eligible BETTEX', 'BETTEX elegible'), `${tokenUnits(p.eligible) ?? na}`],
    [x('Participando desde', 'Participating since', 'Participando desde'), t(p.startedAt)],
    [x('Peso desta rodada (token × segundo)', 'Round weight (token × second)', 'Peso de esta ronda (token × segundo)'), tokenUnits(p.tokenSeconds) ?? na],
    [x('Rodada atual', 'Current round', 'Ronda actual'), `${t(p.roundStart)} → ${t(p.roundEnd)}`],
    [x('Apurado nesta rodada', 'Assessed this round', 'Calculado en esta ronda'), `${usdcUnits(p.assessedUsdc) ?? na} USDC`],
    [x('Saldo da carteira USDC', 'USDC wallet balance', 'Saldo de la cartera USDC'), `${usdcUnits(p.availableUsdc) ?? na} USDC`],
    [x('Já pago', 'Paid', 'Pagado'), `${usdcUnits(p.paidUsdc) ?? na} USDC`],
  ] : [];
  return <section className="dcard p-4 sm:p-5" data-testid="native-participation-overview">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display text-lg font-extrabold">{x('Minha participação', 'My participation', 'Mi participación')}</h2><span data-testid="label-source-native-participation" className="text-xs text-[#5B6B85]">{x('EVM local · 31337', 'Local EVM · 31337', 'EVM local · 31337')}</span></div>
    {stale && <p role="status" className="mt-2 text-xs font-semibold text-[#8A6A2F]">{x('Participação da última leitura confirmada; atualização indisponível.', 'Participation from the last confirmed reading; refresh unavailable.', 'Participación de la última lectura confirmada; actualización no disponible.')}</p>}
    {p ? <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">{rows.map(([k, v], i) => <div key={k} className="contents"><dt className="min-w-0 text-[#5B6B85]"><WalletHelp id={`native-participation-${i}`} label={k}><p>{explanations[i]}</p></WalletHelp></dt><dd className="min-w-0 break-all font-bold">{v}</dd></div>)}</dl>
      : <p role="status" className="mt-2 text-sm text-[#5B6B85]">{journeyLoading ? x('Lendo participação…', 'Reading participation…', 'Leyendo participación…') : x('Participação on-chain indisponível agora; nenhum valor é inferido.', 'On-chain participation unavailable right now; no value is inferred.', 'Participación on-chain no disponible ahora; no se infiere ningún valor.')}</p>}
    <Link href={demoPath('home', loc)} data-testid="link-native-operations" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Depositar, comprar e retirar', 'Deposit, buy and withdraw', 'Depositar, comprar y retirar')}</Link>
  </section>;
}
