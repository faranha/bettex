/** @jsxImportSource react */
import { Link } from 'wouter';
import type { DemoProfile } from '@workspace/api-client-react';
import { useX } from './ui';
import { demoPath } from './demo-navigation';
import { tokenUnits, usdcUnits } from './personal-native';
import { usePersonalNative } from './use-personal-native';

export function NativeParticipationCard({ profile }: { profile: DemoProfile }) {
  const { x, loc } = useX(); const { j, state, journeyLoading, stale } = usePersonalNative(profile);
  if (state !== 'ready') return null;
  const na = x('indisponível', 'unavailable', 'no disponible');
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const t = (n: number | null) => n === null ? '—' : new Date(n < 1e12 ? n * 1000 : n).toLocaleString(fl, { timeZone: 'America/Sao_Paulo' });
  const p = j?.participation;
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
    {p ? <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">{rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-[#5B6B85]">{k}</dt><dd className="min-w-0 break-all font-bold">{v}</dd></div>)}</dl>
      : <p role="status" className="mt-2 text-sm text-[#5B6B85]">{journeyLoading ? x('Lendo participação…', 'Reading participation…', 'Leyendo participación…') : x('Participação on-chain indisponível agora; nenhum valor é inferido.', 'On-chain participation unavailable right now; no value is inferred.', 'Participación on-chain no disponible ahora; no se infiere ningún valor.')}</p>}
    <Link href={`${demoPath('account', loc)}/wallets`} data-testid="link-native-operations" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Depositar, comprar e retirar', 'Deposit, buy and withdraw', 'Depositar, comprar y retirar')}</Link>
  </section>;
}
